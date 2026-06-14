# 06 — Modelo de datos (Supabase / Postgres)

## Filosofía

- **Postgres con RLS estricto.** Cada tabla tiene políticas. Nada se lee sin política explícita.
- **UUIDs (`gen_random_uuid()`)** para todos los IDs públicos. Nada autoincremental expuesto.
- **`created_at` y `updated_at`** en toda tabla con trigger automático.
- **Nombres en `snake_case`**, plural para tablas.
- **Soft delete** solo si hay caso de uso real (`deleted_at`). Hard delete por defecto.
- **Foreign keys con `ON DELETE` explícito** (no asumir CASCADE por defecto).
- **Migraciones versionadas** en `packages/db/migrations/<timestamp>_<name>.sql`.

## Diagrama (alto nivel)

```
users (auth.users de Supabase + perfil)
  ├─< guest_sessions  (sesiones invitado vinculables)
  ├─< rooms (anfitrión)
  ├─< challenges (creador)
  ├─< challenge_attempts
  └─< room_memberships

rooms ─< room_memberships >─ users (o guest)
rooms ─< room_challenge_instances >─ challenges

challenges ─< challenge_attempts >─ users (o guest)
challenges ─< challenge_assets (sprites, audio cacheados)
challenges ─< challenge_reports (moderación)

ai_cache (k-v de respuestas IA cacheadas, no por usuario)
```

## Tablas

### `profiles`
Extiende `auth.users` con datos del juego.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | FK a `auth.users.id` |
| `nickname` | `text NOT NULL` | Único insensible a mayúsculas |
| `avatar_url` | `text` | Opcional |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | trigger |

**RLS:**
- SELECT: cualquier usuario autenticado puede ver `nickname` y `avatar_url` de cualquiera (para rankings, salas).
- UPDATE: solo el dueño de la fila.
- INSERT: solo el dueño en signup (Edge Function `on_user_created`).

### `guest_sessions`
Para usuarios invitados (sin auth.users).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | Generado en cliente, validado server-side |
| `nickname` | `text NOT NULL` | Único por sala (no global) |
| `room_id` | `uuid FK rooms(id) ON DELETE CASCADE` | Sala donde el invitado entró |
| `linked_user_id` | `uuid FK auth.users(id)` | Si el invitado se vincula a una cuenta |
| `created_at` | `timestamptz` | |
| `last_seen_at` | `timestamptz` | Para limpiar sesiones zombies |

**RLS:**
- SELECT: solo a sí mismo (con header `x-guest-session-id` validado en Edge Function).
- INSERT: público (al unirse a sala, vía Edge Function que valida `room_code`).
- UPDATE/DELETE: solo Edge Functions service role.

### `rooms`
Salas de juego (Kahoot, Duelo, Cooperativo, Torneo).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `code` | `text NOT NULL UNIQUE` | Código humano (ej: `FIS-3B-7K2`) |
| `mode` | `text NOT NULL` | Enum: `kahoot`, `duel`, `coop`, `tournament` |
| `host_id` | `uuid FK auth.users(id)` | Anfitrión, NULL si invitado anónimo creó la sala |
| `status` | `text NOT NULL` | Enum: `waiting`, `in_progress`, `finished` |
| `max_players` | `int NOT NULL DEFAULT 40` | |
| `settings` | `jsonb DEFAULT '{}'::jsonb` | Config específica del modo |
| `created_at` | `timestamptz` | |
| `started_at` | `timestamptz` | NULL hasta que el anfitrión inicia |
| `finished_at` | `timestamptz` | NULL hasta cierre |

**RLS:**
- SELECT: cualquiera puede leer salas con `status IN ('waiting','in_progress')` que tienen capacidad.
- INSERT: usuarios autenticados; invitados vía Edge Function.
- UPDATE: solo `host_id` o service role.

### `room_memberships`
Quiénes están en una sala.

| Columna | Tipo | Notas |
|---------|------|-------|
| `room_id` | `uuid FK rooms(id) ON DELETE CASCADE` | |
| `user_id` | `uuid FK auth.users(id)` | NULL si es invitado |
| `guest_session_id` | `uuid FK guest_sessions(id)` | NULL si es usuario |
| `role` | `text NOT NULL DEFAULT 'player'` | Enum: `host`, `player`, `spectator` |
| `joined_at` | `timestamptz` | |
| `left_at` | `timestamptz` | NULL si sigue dentro |

`PRIMARY KEY (room_id, COALESCE(user_id, guest_session_id))` — un membresía única por persona.
`CHECK ((user_id IS NOT NULL) OR (guest_session_id IS NOT NULL))`

**RLS:**
- SELECT: miembros de la sala pueden ver otros miembros.
- INSERT/DELETE: vía Edge Function (validates room state, capacidad).

### `challenges`
Catálogo de retos (predefinidos y creados por usuarios).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `slug` | `text UNIQUE` | URL-friendly, NULL para retos generados por IA |
| `title` | `text NOT NULL` | |
| `subject` | `text NOT NULL` | Enum: `physics`, `chemistry`, `mixed` |
| `topic` | `text NOT NULL` | Sub-tema (ej: `kinematics`, `equation_balance`) |
| `difficulty` | `text NOT NULL` | Enum: `easy`, `medium`, `hard` |
| `kind` | `text NOT NULL` | Enum: `simulation`, `drag_drop`, `multiple_choice`, `numeric_input` |
| `statement` | `text NOT NULL` | Enunciado mostrado al jugador |
| `payload` | `jsonb NOT NULL` | Estructura específica del kind (opciones, params físicas, etc.) |
| `solution` | `jsonb NOT NULL` | **Server-only.** RLS bloquea SELECT del lado cliente |
| `explanation_template` | `text` | Plantilla para feedback IA (puede ser NULL si IA genera ad-hoc) |
| `creator_id` | `uuid FK auth.users(id)` | NULL si es predefinido (seed) |
| `is_predefined` | `boolean NOT NULL DEFAULT false` | True para los retos del MVP |
| `status` | `text NOT NULL DEFAULT 'draft'` | Enum: `draft`, `published`, `flagged`, `removed` |
| `published_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**RLS:**
- SELECT: cualquiera puede ver `status='published'`. Creator ve sus propios drafts.
- SELECT de columna `solution`: bloqueada para todos en el cliente. Solo accesible desde Edge Functions / Colyseus (service role).
- INSERT: usuarios autenticados (creator_id = auth.uid()).
- UPDATE: solo creator.
- DELETE: solo service role (los reportes flag, no borran).

### `challenge_attempts`
Cada intento de un usuario sobre un reto.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `challenge_id` | `uuid FK challenges(id) ON DELETE CASCADE` | |
| `user_id` | `uuid FK auth.users(id)` | NULL si invitado |
| `guest_session_id` | `uuid FK guest_sessions(id)` | NULL si usuario |
| `room_id` | `uuid FK rooms(id) ON DELETE SET NULL` | NULL si no fue en sala |
| `submitted_answer` | `jsonb NOT NULL` | Respuesta tal como la envió el cliente |
| `is_correct` | `boolean NOT NULL` | Calculado server-side |
| `score` | `int NOT NULL` | Calculado server-side (tiempo + dificultad + racha) |
| `time_taken_ms` | `int NOT NULL` | |
| `feedback` | `text` | Texto generado por IA, persistido para no regenerar |
| `created_at` | `timestamptz` | |

**RLS:**
- SELECT: dueño de attempt (auth.uid()) o miembros de la misma sala (para rankings).
- INSERT: solo via Edge Function / Colyseus (service role) que valida y calcula score.

### `challenge_assets`
Assets generados por IA ligados a un reto (sprites, audio narración).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `challenge_id` | `uuid FK challenges(id) ON DELETE CASCADE` | |
| `kind` | `text NOT NULL` | Enum: `sprite`, `background`, `audio_narration`, `audio_sfx` |
| `storage_path` | `text NOT NULL` | Ruta en Supabase Storage |
| `provider` | `text` | Quién lo generó: `pollinations`, `gemini`, `elevenlabs`, etc. |
| `prompt_hash` | `text` | Para cache cross-challenge |
| `created_at` | `timestamptz` | |

### `ai_cache`
Cache global de respuestas IA determinísticas.

| Columna | Tipo | Notas |
|---------|------|-------|
| `key` | `text PK` | `hash(provider + model + prompt + params)` |
| `kind` | `text NOT NULL` | Enum: `text`, `image`, `audio` |
| `value` | `jsonb` | Respuesta completa (texto) o ref a Storage (image/audio) |
| `provider` | `text NOT NULL` | |
| `created_at` | `timestamptz` | |
| `hit_count` | `int DEFAULT 0` | Telemetría de cache efficiency |

**RLS:**
- SELECT/INSERT/UPDATE: solo service role (el AI Gateway).

### `challenge_reports`
Moderación: usuarios reportan retos inapropiados.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | `uuid PK` | |
| `challenge_id` | `uuid FK challenges(id) ON DELETE CASCADE` | |
| `reporter_user_id` | `uuid FK auth.users(id)` | |
| `reason` | `text NOT NULL` | Enum corto: `inappropriate`, `incorrect`, `duplicate`, `other` |
| `details` | `text` | Texto libre |
| `status` | `text DEFAULT 'open'` | Enum: `open`, `resolved`, `dismissed` |
| `created_at` | `timestamptz` | |

### `rankings_weekly` (vista materializada)
Pre-computa ranking semanal para no calcular en cada request.

```sql
CREATE MATERIALIZED VIEW rankings_weekly AS
SELECT
  user_id,
  date_trunc('week', created_at) AS week,
  SUM(score) AS total_score,
  COUNT(*) AS attempts_count,
  COUNT(*) FILTER (WHERE is_correct) AS correct_count
FROM challenge_attempts
WHERE user_id IS NOT NULL
GROUP BY user_id, week;
```
Refresh con cron de Coolify cada 5 min, o on-demand al cierre de torneo.

## Convenciones SQL

- Triggers `updated_at` en cada tabla con `updated_at`.
- Naming de constraints: `<table>_<column>_check`, `<table>_<col>_fkey`.
- Indexes solo cuando hay query confirmada que los necesita (no spec sin medir).
- Indexes obvios desde el inicio: `room_memberships(user_id)`, `challenge_attempts(challenge_id, created_at DESC)`, `challenges(status, subject, topic)`.
- Sin stored procedures grandes; lógica en Edge Functions TypeScript.

## Migraciones

- Cada migración en `packages/db/migrations/<unix-ts>_<descripcion>.sql`.
- Up + down (down opcional pero recomendado).
- Convención: una migración por feature/cambio. No "mega-migración".
- Aplicación en CI vía `supabase migration up` antes del build.
- Para datos seed (retos predefinidos del MVP), `packages/db/seeds/*.sql`.

## Cambios futuros

Cualquier cambio de esquema → migración nueva (forward-only). No editar migraciones ya mergeadas. Si rompimos algo, revertimos con migración nueva.
