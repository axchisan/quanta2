# Decisiones in-flight

> **Cómo se usa:**
>
> - Log cronológico de decisiones tomadas durante el desarrollo (no incluidas en `04-tech-decisions.md`).
> - Cualquier agente puede anotar; el **Coordinador** cura periódicamente.
> - Si una decisión afecta arquitectura/stack, debería terminar como ADR en `04-tech-decisions.md`.
> - Útil para retro y para que un agente futuro entienda "por qué se hizo así".
> - Formato: `YYYY-MM-DD HH:MM — <rol>: decisión + breve rationale.`

---

## 2026

### 2026-04-18

- **2026-04-18 — coordinator (humano):** Plan de trabajo aprobado. Stack y arquitectura cerrados (ver ADR-0001 a ADR-0010). Generación de docs maestra arranca de inmediato. Multi-agente con tmux será el modo de trabajo desde el primer sprint de implementación (Sprint 0).

### 2026-04-19

- **2026-04-19 — coordinator:** Scaffolding del monorepo completado (T001–T007) en una pasada de bootstrapping. `pnpm install · lint · typecheck · test · build` verdes en los 9 proyectos del workspace.
- **2026-04-19 — coordinator:** Paquetes internos (`@quanta/types`, `@quanta/ui`, `@quanta/config`) se consumen como **código fuente TS** (`exports` → `src/*.ts`); `apps/web` los transpila vía `transpilePackages`. `game-engine`/`ai-gateway`/`game-server` además emiten `dist/` con tsup. Evita una capa de build intermedia para libs puras de tipos/UI.
- **2026-04-19 — coordinator:** Quité `incremental` de `tsconfig.base.json`: rompía la generación de `.d.ts` de tsup (TS5074). El typecheck sigue corriendo igual; se pierde solo el cacheo incremental de tsc (turbo ya cachea).
- **2026-04-19 — coordinator:** `game-engine` testea con `phaser` **mockeado** (env node). El import real de Phaser ejecuta detección de canvas/WebGL que no existe headless; los tests cubren lógica pura (config/constantes/clase). Instanciar `new Phaser.Game` es manual/E2E, nunca unit.
- **2026-04-19 — coordinator:** `game-server` usa vitest `pool: 'threads'` (el pool `forks` rompe la IPC de vitest con los mensajes binarios de Colyseus/msgpackr) y `gameServer.gracefullyShutdown(false)` en el handle de tests para no matar el worker con `process.exit`.
- **2026-04-19 — coordinator (db):** La migración inicial vive en `packages/db/supabase/migrations/` (default del Supabase CLI) y no en `packages/db/migrations/` como decía `docs/06-data-model.md`; documentado en `packages/db/CLAUDE.md`. PK de `room_memberships` materializada con columna generada (`member_key`) porque Postgres no permite PK sobre la expresión `COALESCE(...)` del doc.
- **2026-04-19 — coordinator (db):** `db:gen-types` adaptado al CLI 2.106: sintaxis nueva `gen types --local` (sin positional `typescript`) + `SUPABASE_ACCESS_TOKEN` dummy inline (regresión que exige token aun en local). `packages/types/src/db.ts` ya es el `Database` real generado (no el placeholder). `onlyBuiltDependencies` (esbuild/sharp) movido de `package.json` a `pnpm-workspace.yaml` (nuevo home en pnpm 10).

### 2026-06-14

- **2026-06-14 — coordinator:** Infra desplegada en Coolify (web/game-server/Supabase self-hosted). Fase 0 cerrada. Ver [[quanta-deploy-infra]] / `infra/coolify.md`.
- **2026-06-14 — ui-web (T008):** Operaciones de sala (create/join/snapshot) vía **Next.js API routes con service role** (`app/api/rooms/*`) en vez de Edge Functions de Supabase. Razón: simplicidad para el MVP, evita el ciclo de deploy de Edge Functions, y coincide con el flujo F1 del doc ("Next.js valida código contra Supabase"). Las Edge Functions quedan para lógica que deba correr fuera de Next (cron, webhooks). Reversible.
- **2026-06-14 — ui-web (T008):** Presencia del lobby vía **Supabase Realtime presence** (canal `room:<id>`, anon key), no por lecturas de tabla con RLS de invitado (que es compleja: el invitado es el rol `anon`). Lecturas de datos de sala van por API routes (service role). Colyseus entra en Fase 2 para retos competitivos.
- **2026-06-14 — game-engine (T009):** `@quanta/game-engine` usa imports relativos **sin extensión** (no `.js`): el `.js` rompe la resolución de webpack cuando Next lo consume vía dynamic import (tsc/tsup sí resuelven, webpack no). El `GameCanvas` importa Phaser y el motor **dinámicamente** (sin SSR).
- **2026-06-14 — ui-web (T009):** Phaser 3.90 expone su build ESM (`module`) **sin `export default`**, rompiendo `import Phaser from 'phaser'` bajo webpack. Fix en `next.config.ts`: alias `phaser$ → phaser/dist/phaser.js` (UMD, interopera el default). `phaser` declarado como dep directa de `apps/web`.
- **2026-06-14 — backend (T009):** Tiempo del intento (`time_taken_ms`) es **client-reported** en modo solo (clamp server-side). El timing authoritative server-side llega con Colyseus/Edge Functions en Fase 2; documentado como simplificación de MVP. Intentos solo se persisten anónimos (sin `guest_session`, que requiere sala).
- **2026-06-14 — ai-gateway (T010):** Modelo Gemini por defecto = **`gemini-2.5-flash`** (configurable con `GEMINI_MODEL`). El key del usuario tiene cuota 0 en free-tier para `gemini-2.0-flash` (429 `limit: 0`) pero acceso tier estándar a `2.5-flash`. Provider `createGeminiProvider` con `responseMimeType: application/json` + safety `BLOCK_LOW_AND_ABOVE`. Imports relativos de `ai-gateway` pasados a **sin extensión** (compat webpack, igual que game-engine).
- **2026-06-14 — ai-gateway (T010):** Trivia generada se persiste como reto `multiple_choice` en `challenges` (una fila por generación) con `solution` server-only `{correct_index, explanation}`. La respuesta de `generate-trivia` NO incluye `correctIndex` (anti-cheat); se revela solo en el resultado del intento. `generateTrivia` no cachea por default (variedad).
- **2026-06-14 — web (T011):** Balanceo de ecuaciones se valida **genéricamente** desde el `payload.species` (átomos por lado + forma reducida gcd=1), sin depender de `solution` para decidir correctitud (la `solution.coefficients` es solo para feedback). Acepta cualquier respuesta balanceada+reducida (única). `AttemptResult.correctValue/submittedValue` se dejan en 0 para este tipo (no aplican valores numéricos; el feedback va en `explanation`). `/jugar/[slug]` despacha el componente por `payload.type`.
- **2026-06-15 — infra/web (T012):** Auth con **Google OAuth** (no Magic Link: el Supabase no tiene SMTP; no email+password: ADR-0005). Habilitado en el Supabase self-hosted agregando `GOTRUE_EXTERNAL_GOOGLE_*` como env vars del servicio (el `auth` usa `env_file: .env`, así que se inyectan al contenedor) + `ADDITIONAL_REDIRECT_URLS` → `GOTRUE_URI_ALLOW_LIST` para permitir el redirect a la app. Atribución de intentos: el cliente manda el JWT en `Authorization`, la ruta lo verifica con `auth.getUser(token)` (service role) y guarda `user_id`. "Mis puntajes" lee directo con el cliente browser + RLS `auth.uid()` (no API route). Sesión client-side en localStorage (`@supabase/supabase-js`, sin `@supabase/ssr` para MVP).

### Retro Sprint 0

> A completar al cierre del sprint.

- Qué funcionó:
- Qué no funcionó:
- Qué cambiar para Sprint 1:
