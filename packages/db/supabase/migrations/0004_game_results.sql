-- ============================================================================
-- Quanta — game_results (0004)
-- ============================================================================
-- Forward-only migration. Persists the per-player outcome of a multiplayer
-- match (Kahoot today; duel/coop later) so it can be attributed to a Google
-- account and shown in "Mis puntajes".
--
-- Why a dedicated table instead of reusing challenge_attempts:
--   * Kahoot questions are ephemeral, AI-generated in-memory by the game-server
--     and are NOT rows in `challenges`. challenge_attempts.challenge_id is NOT
--     NULL with an FK to challenges, so reusing it would force persisting every
--     generated question as a challenge (catalog pollution) or an artificial id.
--   * A Kahoot is a *match*, not an *attempt on a catalog challenge*.
--
-- The match identity is the Colyseus roomId (`room_code`), a plain string. We do
-- NOT FK to public.rooms: the T008 Supabase rooms are legacy and Kahoot rooms
-- live only in Colyseus (ADR 2026-06-15).
--
-- Only logged-in players are persisted (user_id NOT NULL): anonymous players
-- have no account to attribute the score to. Inserts are service-role only
-- (the game-server writes after verifying the player's JWT).
--
-- Postgres 15.
-- ============================================================================

create table public.game_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  room_code       text not null,
  mode            text not null default 'kahoot',
  topic           text not null,
  nickname        text not null,
  score           int not null,
  rank            int not null,
  total_players   int not null,
  correct_count   int not null,
  total_questions int not null,
  created_at      timestamptz not null default now(),
  constraint game_results_mode_check check (mode in ('kahoot', 'duel', 'coop', 'tournament')),
  -- One persisted result per player per match.
  constraint game_results_user_room_key unique (user_id, room_code)
);

-- A user's recent matches, newest first ("Mis puntajes").
create index game_results_user_id_created_at_idx
  on public.game_results (user_id, created_at desc);

alter table public.game_results enable row level security;

-- Owner reads their own match results.
create policy game_results_select_own
  on public.game_results for select
  to authenticated
  using (user_id = auth.uid());

-- INSERT only via the game-server (service role, which bypasses RLS). It verifies
-- the player's JWT and computes score/rank server-side. No client write policy.
