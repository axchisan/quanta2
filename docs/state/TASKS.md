# Tasks — Cola priorizada

> **Cómo se usa:**
>
> - Cada task sigue el formato de `templates/task.md`.
> - Solo el **Coordinador** crea, prioriza, asigna y borra tasks.
> - Especialistas SOLO cambian el campo `status` de su propia task (`pending` → `in_progress` → `done`).
> - Tasks ordenadas por prioridad de ejecución (las primeras se trabajan primero).
> - `id` formato: `T<número>` zero-padded a 3 dígitos.
> - `blockedBy`: lista de task IDs que deben cerrarse antes.

---

## Pendientes / En progreso

### T001 — Scaffolding monorepo (pnpm + Turborepo)

- **Owner:** coordinator
- **Status:** done (2026-04-19) — `pnpm install/lint/typecheck/test/build` verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** —
- **Description:** Inicializar repo git, crear estructura de carpetas del plan, `pnpm-workspace.yaml`, `turbo.json`, `package.json` raíz con scripts (`dev`, `build`, `test`, `lint`, `typecheck`). `.gitignore` apropiado para Node + Next + Phaser.
- **Acceptance:**
  - `pnpm install` ejecuta sin errores.
  - `pnpm typecheck` corre (aunque no haya código).
  - Repo subido a GitHub (`github.com/<user>/quanta`).
- **Notes:** Coordinator hace este por bootstrapping; después de T001 los especialistas arrancan.

### T002 — CI básica en GitHub Actions

- **Owner:** coordinator
- **Status:** done (2026-04-19) — `.github/workflows/ci.yml`: install --frozen-lockfile → lint → typecheck → test → build
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** Workflow `.github/workflows/ci.yml` que en cada push/PR ejecuta: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Cache de pnpm store y Turborepo remoto (opcional).
- **Acceptance:** PR de prueba pasa por los 4 checks.

### T003 — Skeleton apps/web (Next.js 15)

- **Owner:** ui-web
- **Status:** done (2026-04-19) — dev sirve la landing `<h1>Quanta</h1>` en :3000, `build` genera estáticos OK
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/web` con Next.js 15 (App Router), TypeScript estricto, Tailwind v4 configurado, shadcn/ui inicializado, una landing trivial (`<h1>Quanta</h1>`). `apps/web/CLAUDE.md` con detalles internos.
- **Acceptance:**
  - `pnpm --filter @quanta/web dev` levanta en localhost:3000 mostrando la landing.
  - `pnpm --filter @quanta/web build` produce build estática sin errores.

### T004 — Skeleton apps/game-server (Colyseus)

- **Owner:** backend-realtime
- **Status:** done (2026-04-19) — `LobbyRoom` con heartbeat; test de integración conecta vía WS y recibe broadcast
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/game-server` con Colyseus + Node 22 + TypeScript estricto. Una room placeholder `LobbyRoom` que acepta conexiones y broadcasts un mensaje cada 5s. Dockerfile listo. `apps/game-server/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-server dev` levanta en localhost:2567.
  - Cliente test (script en `tests/`) se conecta y recibe broadcast.

### T005 — Skeleton packages/game-engine (Phaser)

- **Owner:** game-engine
- **Status:** done (2026-04-19) — `BootScene` + `createGameConfig`; build genera bundle (esm+cjs+dts); tests verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/game-engine` con Phaser 3, TypeScript estricto. Una scene placeholder `BootScene` que muestra texto "Quanta Game Engine" y emite evento `engine:ready`. Export desde `index.ts`. `packages/game-engine/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-engine build` produce bundle.
  - Tests vacíos corren (`pnpm --filter @quanta/game-engine test`).

### T006 — Skeleton packages/ai-gateway

- **Owner:** ai-gateway
- **Status:** done (2026-04-19) — estructura providers/cache/prompts/chain/config; tests de fallback y cache verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/ai-gateway` con TypeScript estricto, Zod, fetch nativo. Estructura de carpetas: `providers/`, `cache/`, `prompts/`, `chain.ts`, `config.ts`. Interfaz pública `AIGateway` definida (sin implementación real todavía, retorna stub). Tests con un mock provider que verifica fallback chain. `packages/ai-gateway/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/ai-gateway test` pasa con test de fallback.
  - Build sin errores.

### T007 — Skeleton packages/db (esquema + migración inicial)

- **Owner:** backend-realtime
- **Status:** done (2026-04-19) — `db:start` levanta Supabase local, `db:migrate` aplica `0001_initial_schema.sql` (8 tablas, RLS habilitado en todas), `db:gen-types` regenera `packages/types/src/db.ts` (510 líneas); typecheck/lint verdes contra el esquema real
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/db` con Supabase CLI configurado, primera migración `0001_initial_schema.sql` que crea las 8 tablas core (`profiles`, `guest_sessions`, `rooms`, `room_memberships`, `challenges`, `challenge_attempts`, `ai_cache`, `challenge_assets`) según `docs/06-data-model.md`. RLS policies básicas. Seeds vacíos.
- **Acceptance:**
  - `pnpm db:start && pnpm db:migrate` levanta Supabase local con esquema.
  - `pnpm db:gen-types` produce tipos TS válidos en `packages/types/src/db.ts`.

---

## Done

### T008 — Entrada de invitado + Lobby (Fase 1)

- **Owner:** ui-web
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Vertical slice de entrada: crear sala (código) / unirse con nickname+código → lobby con presencia en vivo. API routes `app/api/rooms/{create,join,[code]}` (service role, Zod), clientes Supabase (reusa `@quanta/db`), store zustand persistido, `useRoomPresence` (Supabase Realtime), componente `Input` en `@quanta/ui`, páginas landing + `/room/[code]`.
- **Acceptance:**
  - Crear→unirse→snapshot verificado **contra el Supabase de producción** (`db.quanta.axchisan.com`): filas en `rooms`/`guest_sessions`/`room_memberships`, nickname repetido→409, código inexistente→404.
  - `lint/typecheck/test/build` verdes; landing y lobby renderizan.

### T009 — Reto Caída Libre (Fase 1, solo jugable)

- **Owner:** game-engine / ui-web / backend-realtime
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Reto de Física (cinemática) jugable solo end-to-end: escena Phaser `FreeFallScene` + `createFreeFallGame` + `freeFallTime` (motor), `GameCanvas` (import dinámico de Phaser, sin SSR), página `/jugar/[slug]` con sliders de altura/gravedad + presets + predicción. Validación y **scoring server-side** (`/api/attempts/submit`): `t = √(2h/g)`, tolerancia 10%, fórmula de puntaje de `docs/08`. Reto sembrado en `challenges` (migración `0002`).
- **Acceptance:**
  - Seed aplicado a prod; `GET /api/challenges/caida-libre` devuelve el reto **sin `solution`** (anti-cheat).
  - `POST /api/attempts/submit` verificado contra prod: predicción correcta → `score 187`, incorrecta → `score 0`, `correctValue` server-side; intento persistido en `challenge_attempts`.
  - Página `/jugar/caida-libre` SSR 200 con controles; `lint/typecheck/test/build` verdes.

### T010 — Reto Trivia IA (Fase 1) + AI Gateway/Gemini

- **Owner:** ai-gateway / ui-web
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Trivia de opción múltiple generada por IA. `ai-gateway`: provider **Gemini real** (`gemini-2.5-flash`, safety máximo, timeout/429/bloqueos), `parseTriviaQuestion` (Zod, out_of_scope), `generateTrivia` sin cache (variedad). `web`: `/api/ai/generate-trivia` (Gemini → valida → guarda reto `multiple_choice` con `solution` server-only → devuelve sin `correctIndex`), `submitAttempt` extendido para `multiple_choice`, página `/jugar/trivia` (picker tema/dificultad → generar → responder → feedback IA).
- **Acceptance:**
  - Verificado contra **Gemini real**: `generate-trivia` produce pregunta válida sin `correctIndex` (anti-cheat); responder correcto → `score 190`, incorrecto → `score 0` + explicación de la IA; intentos persistidos.
  - `lint/typecheck/test (ai-gateway 8) /build` verdes.
- **Notes:** Requiere `GEMINI_API_KEY` en el entorno (Coolify web env para prod).

### T011 — Reto Balanceo de Ecuaciones (Fase 1)

- **Owner:** ui-web / backend-realtime
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Reto de Química (`equation_balance`): el jugador ajusta coeficientes por especie con feedback de átomos en vivo (verde/rojo por elemento). Validación **server-side** genérica (`validateEquationBalance`): balancea todos los elementos Y forma reducida (gcd=1). `/jugar/[slug]` despacha por `payload.type` (free_fall vs equation_balance). Retos sembrados (migración `0003`: síntesis del agua, combustión del metano).
- **Acceptance:**
  - Seed aplicado a prod; `GET` del reto **sin `solution`** (anti-cheat).
  - Verificado contra prod: `[1,2,1,2]` → correcto `score 370`; `[1,1,1,1]` → incorrecto; `[2,4,2,4]` (no reducido) → incorrecto; intentos persistidos.
  - Tests del validador + `lint/typecheck/test/build` verdes.

### T012 — Cuenta con Google + puntaje persistente (Fase 1)

- **Owner:** ui-web / backend-realtime
- **Status:** done (2026-06-15)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Auth real con Supabase (Google OAuth). `useAuth` (sesión browser, signIn/signOut), `AuthNav` en el layout. Los intentos se atribuyen al usuario logueado: el cliente envía el JWT, la ruta `submit` lo verifica server-side y guarda `user_id`. Página `/mis-puntajes` (lee los intentos del dueño vía RLS `auth.uid()`).
- **Config (vía MCP en Supabase):** `GOTRUE_EXTERNAL_GOOGLE_ENABLED/CLIENT_ID/SECRET/REDIRECT_URI`, `ADDITIONAL_REDIRECT_URLS` (allow-list), `API_EXTERNAL_URL`. Redeploy del servicio.
- **Acceptance:**
  - `/auth/v1/settings` → `google: true`; `authorize?provider=google` redirige a Google con el client_id y callback correctos.
  - RLS `challenge_attempts_select_own = (user_id = auth.uid())` verificada; `/mis-puntajes` SSR 200; build/typecheck/test/lint verdes.
  - **Pendiente de prueba humana:** el clic final de login en el consent de Google (interactivo).
- **Notes:** El cliente OAuth de Google lo creó el usuario (creds en env del servicio Supabase, no en el repo).

### T013 — Rediseño "Edu-friendly suave" (pulido, fundación)

- **Owner:** ui-web
- **Status:** done (2026-06-15) — fundación; iteración por página continúa
- **Priority:** P1
- **Sprint:** 1
- **Description:** Pulido visual/UX. Theme pastel (lavanda/menta/durazno, esquinas redondeadas, sombras suaves) en `@quanta/ui/tokens.css`; componentes `Card`/`Badge` + `Button`/`Input` ablandados (pill, soft). Fuentes redondeadas (Baloo 2 display + Nunito) vía next/font. Mascota átomo sonriente. Header con marca + nav. IA reorganizada: landing (hero + CTA "Jugar" + salas en beta) y nuevo hub `/jugar` (catálogo de retos). Las páginas de retos heredan el theme por tokens.
- **Acceptance:** landing + `/jugar` renderizan con el nuevo look; `lint/typecheck/test/build` verdes. Limpieza de datos de prueba en prod (conservando la cuenta del usuario).
- **Notes:** Dirección elegida por el usuario. Pendiente: pulido fino por página (retos), audio (SFX/TTS), y revisión visual en prod.

### T014 — Cierre de Fase 1 (audio + pulido + mobile)

- **Owner:** ui-web
- **Status:** done (2026-06-15)
- **Priority:** P1
- **Sprint:** 1
- **Description:** Cierre del MVP. **Audio SFX** sintetizado con Web Audio (éxito/error/click, sin assets). `ResultPanel` compartido por los 3 retos: mascota átomo que reacciona (rebota al acertar) + sonido + feedback consistente. Pulido por página (Card/Badge, theme pastel heredado) y revisión responsive.
- **Acceptance:** las 6 rutas renderizan 200; `ResultPanel` suena y muestra la mascota; `lint/typecheck/test/build` verdes. Docs de estado actualizados.
- **Notes:** Narración TTS y sprites IA quedan diferidos (faltan providers). Cierra Fase 1 ~95%.

> Tasks identificadas pero no priorizadas todavía. El Coordinador las mueve a sprint cuando corresponda.

- **B001** — Configurar Husky + lint-staged en pre-commit.
- **B002** — Configurar deploy en Coolify para apps/web (auto-deploy on push to main).
- **B003** — Configurar deploy en Coolify para apps/game-server.
- **B004** — Configurar Supabase self-hosted en Coolify.
- **B005** — Implementar auth invitado end-to-end (UI + Edge Function `join-room`).
- **B006** — Implementar `LobbyPage` (entrar a sala con código).
- **B007** — Implementar reto Caída Libre (Fase 1).
- **B008** — Implementar reto Balanceo de Ecuaciones (Fase 1).
- **B009** — Implementar reto Trivia Mixta IA (Fase 1).
- **B010** — Configurar Pollinations.ai provider en ai-gateway.
- **B011** — Configurar Gemini provider en ai-gateway.
- **B012** — Configurar ElevenLabs / Coqui TTS provider en ai-gateway.
- **B013** — Implementar cache Supabase para ai-gateway.
- **B014** — Implementar Edge Function `validate-attempt`.
- **B015** — Implementar `KahootRoom` Colyseus (Fase 2).
- **B016** — Implementar `DuelRoom` Colyseus (Fase 2).
- **B017** — Implementar UI de creador de retos (Fase 3).
- **B018** — Implementar PWA manifest + service worker (Fase 4).
- **B019** — Configurar Capacitor para Android (Fase 4).
