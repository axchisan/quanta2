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

### Retro Sprint 0

> A completar al cierre del sprint.

- Qué funcionó:
- Qué no funcionó:
- Qué cambiar para Sprint 1:
