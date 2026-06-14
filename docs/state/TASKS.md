# Tasks — Cola priorizada

> **Cómo se usa:**
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
- **Status:** in_progress (pausada por B001: falta Node + pnpm)
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
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** Workflow `.github/workflows/ci.yml` que en cada push/PR ejecuta: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Cache de pnpm store y Turborepo remoto (opcional).
- **Acceptance:** PR de prueba pasa por los 4 checks.

### T003 — Skeleton apps/web (Next.js 15)
- **Owner:** ui-web
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/web` con Next.js 15 (App Router), TypeScript estricto, Tailwind v4 configurado, shadcn/ui inicializado, una landing trivial (`<h1>Quanta</h1>`). `apps/web/CLAUDE.md` con detalles internos.
- **Acceptance:**
  - `pnpm --filter @quanta/web dev` levanta en localhost:3000 mostrando la landing.
  - `pnpm --filter @quanta/web build` produce build estática sin errores.

### T004 — Skeleton apps/game-server (Colyseus)
- **Owner:** backend-realtime
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/game-server` con Colyseus + Node 22 + TypeScript estricto. Una room placeholder `LobbyRoom` que acepta conexiones y broadcasts un mensaje cada 5s. Dockerfile listo. `apps/game-server/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-server dev` levanta en localhost:2567.
  - Cliente test (script en `tests/`) se conecta y recibe broadcast.

### T005 — Skeleton packages/game-engine (Phaser)
- **Owner:** game-engine
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/game-engine` con Phaser 3, TypeScript estricto. Una scene placeholder `BootScene` que muestra texto "Quanta Game Engine" y emite evento `engine:ready`. Export desde `index.ts`. `packages/game-engine/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-engine build` produce bundle.
  - Tests vacíos corren (`pnpm --filter @quanta/game-engine test`).

### T006 — Skeleton packages/ai-gateway
- **Owner:** ai-gateway
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/ai-gateway` con TypeScript estricto, Zod, fetch nativo. Estructura de carpetas: `providers/`, `cache/`, `prompts/`, `chain.ts`, `config.ts`. Interfaz pública `AIGateway` definida (sin implementación real todavía, retorna stub). Tests con un mock provider que verifica fallback chain. `packages/ai-gateway/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/ai-gateway test` pasa con test de fallback.
  - Build sin errores.

### T007 — Skeleton packages/db (esquema + migración inicial)
- **Owner:** backend-realtime
- **Status:** pending
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/db` con Supabase CLI configurado, primera migración `0001_initial_schema.sql` que crea las 8 tablas core (`profiles`, `guest_sessions`, `rooms`, `room_memberships`, `challenges`, `challenge_attempts`, `ai_cache`, `challenge_assets`) según `docs/06-data-model.md`. RLS policies básicas. Seeds vacíos.
- **Acceptance:**
  - `pnpm db:start && pnpm db:migrate` levanta Supabase local con esquema.
  - `pnpm db:gen-types` produce tipos TS válidos en `packages/types/src/db.ts`.

---

## Done

(Vacío — el sprint apenas arranca.)

---

## Backlog (sin sprint asignado)

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
