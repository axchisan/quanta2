-- ============================================================================
-- Quanta — Initial schema (0001)
-- ============================================================================
-- Forward-only migration. Implements the 8 core tables per docs/06-data-model.md:
--   profiles, guest_sessions, rooms, room_memberships, challenges,
--   challenge_attempts, challenge_assets, ai_cache.
--
-- Conventions (docs/03-conventions.md, docs/06-data-model.md):
--   * UUID PKs via gen_random_uuid(). No exposed autoincrement.
--   * created_at / updated_at timestamptz default now(). updated_at via trigger.
--   * Foreign keys with explicit ON DELETE.
--   * RLS ENABLED on every table. No table readable without an explicit policy.
--   * `solution` on challenges is never selectable client-side (service role only).
--   * ai_cache is service-role only (service role bypasses RLS entirely).
--
-- Runs inside Supabase, which provides the `auth` schema (auth.users, auth.uid()).
-- Postgres 15.
-- ============================================================================

-- gen_random_uuid() lives in pgcrypto on PG15.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Reusable trigger function: keep updated_at fresh on UPDATE.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — extends auth.users with game data.
-- ============================================================================
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nickname   text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Nickname unique, case-insensitive.
create unique index profiles_nickname_lower_key on public.profiles (lower(nickname));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Any authenticated user can read profiles (rankings, room rosters).
create policy profiles_select_authenticated
  on public.profiles for select
  to authenticated
  using (true);

-- A user may insert only their own row (signup flow / on_user_created).
create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- A user may update only their own row.
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================================
-- rooms — game rooms (kahoot, duel, coop, tournament).
-- (Declared before guest_sessions / room_memberships which FK it.)
-- ============================================================================
create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  mode        text not null,
  host_id     uuid references auth.users (id) on delete set null,
  status      text not null default 'waiting',
  max_players int not null default 40,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  finished_at timestamptz,
  constraint rooms_mode_check check (mode in ('kahoot', 'duel', 'coop', 'tournament')),
  constraint rooms_status_check check (status in ('waiting', 'in_progress', 'finished'))
);

alter table public.rooms enable row level security;

-- Anyone may read joinable rooms (waiting / in_progress).
create policy rooms_select_joinable
  on public.rooms for select
  to anon, authenticated
  using (status in ('waiting', 'in_progress'));

-- The host can always read their own rooms (incl. finished).
create policy rooms_select_host
  on public.rooms for select
  to authenticated
  using (host_id = auth.uid());

-- Authenticated users may create rooms they host. Guests create via Edge Function.
create policy rooms_insert_host
  on public.rooms for insert
  to authenticated
  with check (host_id = auth.uid());

-- Only the host may update a room (service role bypasses RLS).
create policy rooms_update_host
  on public.rooms for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

-- ============================================================================
-- guest_sessions — invited users (no auth.users row).
-- ============================================================================
create table public.guest_sessions (
  id             uuid primary key default gen_random_uuid(),
  nickname       text not null,
  room_id        uuid not null references public.rooms (id) on delete cascade,
  linked_user_id uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  -- Nickname unique per room (not global).
  constraint guest_sessions_room_nickname_key unique (room_id, nickname)
);

alter table public.guest_sessions enable row level security;

-- A guest session links itself to an account. Reads/writes are otherwise done
-- via Edge Functions (service role, which bypasses RLS). Authenticated users
-- may see guest sessions they have linked to their own account.
create policy guest_sessions_select_linked
  on public.guest_sessions for select
  to authenticated
  using (linked_user_id = auth.uid());

-- ============================================================================
-- room_memberships — who is in a room.
-- ============================================================================
create table public.room_memberships (
  room_id          uuid not null references public.rooms (id) on delete cascade,
  user_id          uuid references auth.users (id) on delete cascade,
  guest_session_id uuid references public.guest_sessions (id) on delete cascade,
  role             text not null default 'player',
  joined_at        timestamptz not null default now(),
  left_at          timestamptz,
  -- A PK cannot sit on an expression in Postgres, so we materialize the
  -- collapsed identity (user OR guest) into a generated column and key on it.
  -- This enforces the documented "one membership per person per room".
  member_key       uuid generated always as (coalesce(user_id, guest_session_id)) stored,
  constraint room_memberships_role_check check (role in ('host', 'player', 'spectator')),
  constraint room_memberships_member_present_check
    check ((user_id is not null) or (guest_session_id is not null)),
  constraint room_memberships_pkey primary key (room_id, member_key)
);

-- Documented index: fast lookup of a user's rooms.
create index room_memberships_user_id_idx on public.room_memberships (user_id);

alter table public.room_memberships enable row level security;

-- SECURITY DEFINER helper: is the current user a member of the given room?
-- Needed because an RLS policy on room_memberships that queries
-- room_memberships would recurse infinitely. This function runs as owner,
-- bypassing RLS, so the membership check is safe to call from policies.
create or replace function public.is_room_member(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_memberships m
    where m.room_id = target_room_id
      and m.user_id = auth.uid()
  );
$$;

-- Members of a room may see the other members (rosters, rankings).
create policy room_memberships_select_co_members
  on public.room_memberships for select
  to authenticated
  using (public.is_room_member(room_id));

-- INSERT / DELETE go through Edge Functions (service role) which validate room
-- state and capacity. No client-facing write policy on purpose.

-- ============================================================================
-- challenges — catalog of challenges (predefined and user-created).
-- ============================================================================
create table public.challenges (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique,
  title                text not null,
  subject              text not null,
  topic                text not null,
  difficulty           text not null,
  kind                 text not null,
  statement            text not null,
  payload              jsonb not null,
  solution             jsonb not null,
  explanation_template text,
  creator_id           uuid references auth.users (id) on delete set null,
  is_predefined        boolean not null default false,
  status               text not null default 'draft',
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint challenges_subject_check check (subject in ('physics', 'chemistry', 'mixed')),
  constraint challenges_difficulty_check check (difficulty in ('easy', 'medium', 'hard')),
  constraint challenges_kind_check
    check (kind in ('simulation', 'drag_drop', 'multiple_choice', 'numeric_input')),
  constraint challenges_status_check
    check (status in ('draft', 'published', 'flagged', 'removed'))
);

-- Documented index: catalog filtering.
create index challenges_status_subject_topic_idx
  on public.challenges (status, subject, topic);

create trigger challenges_set_updated_at
  before update on public.challenges
  for each row execute function public.set_updated_at();

alter table public.challenges enable row level security;

-- ANYONE may read published challenges. IMPORTANT: the `solution` column must
-- never reach the client. RLS is row-level only, so we revoke column access on
-- `solution` from the client roles below; only service role (which bypasses RLS
-- and ignores grants) reads it.
create policy challenges_select_published
  on public.challenges for select
  to anon, authenticated
  using (status = 'published');

-- Creators may read their own challenges in any status (incl. drafts).
create policy challenges_select_own
  on public.challenges for select
  to authenticated
  using (creator_id = auth.uid());

-- Authenticated users create challenges they own.
create policy challenges_insert_own
  on public.challenges for insert
  to authenticated
  with check (creator_id = auth.uid());

-- Only the creator may update. DELETE is service-role only (reports flag, not delete).
create policy challenges_update_own
  on public.challenges for update
  to authenticated
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- Anti-cheat: block `solution` from ever being selectable by client roles.
-- Re-grant explicit columns instead of the whole table for SELECT.
revoke select on public.challenges from anon, authenticated;
grant select (
  id, slug, title, subject, topic, difficulty, kind, statement, payload,
  explanation_template, creator_id, is_predefined, status, published_at,
  created_at, updated_at
) on public.challenges to anon, authenticated;

-- ============================================================================
-- challenge_attempts — each attempt by a user/guest on a challenge.
-- ============================================================================
create table public.challenge_attempts (
  id               uuid primary key default gen_random_uuid(),
  challenge_id     uuid not null references public.challenges (id) on delete cascade,
  user_id          uuid references auth.users (id) on delete set null,
  guest_session_id uuid references public.guest_sessions (id) on delete set null,
  room_id          uuid references public.rooms (id) on delete set null,
  submitted_answer jsonb not null,
  is_correct       boolean not null,
  score            int not null,
  time_taken_ms    int not null,
  feedback         text,
  created_at       timestamptz not null default now()
);

-- Documented index: leaderboards / recent attempts per challenge.
create index challenge_attempts_challenge_id_created_at_idx
  on public.challenge_attempts (challenge_id, created_at desc);

alter table public.challenge_attempts enable row level security;

-- Owner reads their own attempts; co-members of the same room read attempts
-- recorded in that room (for in-room rankings).
create policy challenge_attempts_select_own
  on public.challenge_attempts for select
  to authenticated
  using (user_id = auth.uid());

create policy challenge_attempts_select_room_co_members
  on public.challenge_attempts for select
  to authenticated
  using (room_id is not null and public.is_room_member(room_id));

-- INSERT only via Edge Function / Colyseus (service role) — it validates the
-- answer against `solution` and computes score server-side. No client policy.

-- ============================================================================
-- challenge_assets — AI-generated assets tied to a challenge.
-- ============================================================================
create table public.challenge_assets (
  id           uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  kind         text not null,
  storage_path text not null,
  provider     text,
  prompt_hash  text,
  created_at   timestamptz not null default now(),
  constraint challenge_assets_kind_check
    check (kind in ('sprite', 'background', 'audio_narration', 'audio_sfx'))
);

create index challenge_assets_challenge_id_idx
  on public.challenge_assets (challenge_id);

alter table public.challenge_assets enable row level security;

-- Assets are readable when their parent challenge is readable by the caller
-- (i.e. published, or owned by the creator).
create policy challenge_assets_select_visible
  on public.challenge_assets for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.challenges c
      where c.id = challenge_assets.challenge_id
        and (c.status = 'published' or c.creator_id = auth.uid())
    )
  );

-- INSERT/UPDATE/DELETE via service role (AI Gateway). No client write policy.

-- ============================================================================
-- ai_cache — global cache of deterministic AI responses. Service role only.
-- ============================================================================
create table public.ai_cache (
  key        text primary key,
  kind       text not null,
  value      jsonb,
  provider   text not null,
  created_at timestamptz not null default now(),
  hit_count  int not null default 0,
  constraint ai_cache_kind_check check (kind in ('text', 'image', 'audio'))
);

alter table public.ai_cache enable row level security;

-- ai_cache is exclusively the AI Gateway's (service role, which bypasses RLS).
-- No policy is granted to anon/authenticated, so RLS denies them by default.
-- This restrictive (deny-all) posture is intentional.
