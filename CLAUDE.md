# Quanta — Guía rápida para agentes Claude Code

Bienvenido. Este monorepo es **Quanta**, un juego educativo interactivo de Física y Química con IA generativa, multiplayer y herramienta de creación de retos. Se desarrolla en modo **multi-agente** (5 paneles tmux) con documentación viva como cerebro compartido.

> **Antes de tocar una sola línea de código, leé `docs/runbooks/kickoff-agent.md`.** Te dice exactamente qué documentos abrir según tu rol y en qué orden.

## Para arrancar (cualquier rol)

1. Identificá tu rol (uno de: `coordinator`, `game-engine`, `ai-gateway`, `backend-realtime`, `ui-web`).
2. Leé `docs/runbooks/kickoff-agent.md`.
3. Leé el briefing de tu rol en `docs/agents/<rol>.md`.
4. Revisá el estado vivo: `docs/state/SPRINT.md`, `docs/state/TASKS.md`, `docs/state/BLOCKERS.md`.
5. Si hay tasks asignadas a vos en `pending`, claimeala (cambiá `status` a `in_progress`) y arrancá.

## Estructura mínima a recordar

| Carpeta | Qué hay |
|---------|---------|
| `apps/web/` | Next.js 15 (PWA, UI, gameplay frontend) |
| `apps/game-server/` | Colyseus (rooms authoritative para retos competitivos) |
| `packages/game-engine/` | Phaser 3 — escenas, físicas, animaciones, asset loader |
| `packages/ai-gateway/` | Proveedores LLM/imagen/TTS, cache, fallback chain |
| `packages/ui/` | Componentes shadcn compartidos + theme Quanta |
| `packages/types/` | Tipos compartidos entre web/game-server/engine |
| `packages/db/` | Esquema Supabase, migraciones, seeds |
| `packages/config/` | ESLint, TS, Tailwind compartidos |
| `infra/` | Docker, docker-compose dev, configs Coolify/Supabase |
| `docs/` | **Cerebro compartido** (leé antes de actuar) |

Cada `apps/*` y `packages/*` tiene su propio `CLAUDE.md` con detalles internos (scripts, convenciones, dependencias).

## Reglas de oro

1. **Tu rol define lo que podés tocar.** Respetá los límites listados en `docs/agents/<rol>.md`. Cambios fuera de tu área → coordiná con el Coordinador.
2. **`docs/state/*` es del Coordinador.** Solo cambiás el `status` de tu propia task en `TASKS.md`. El resto lo edita el Coordinador.
3. **Una rama por task.** Naming: `feat/<rol>-<task-id>-<slug-corto>`. Ej: `feat/game-engine-T012-falling-physics`.
4. **PR antes de mergear.** Usá el template `docs/templates/pr.md`. Esperá aprobación del Coordinador.
5. **Tests verdes y typecheck antes de pedir review.** El CI lo bloquea, pero pedimos que ya esté limpio antes de abrir PR.
6. **Si te quedás sin contexto entre sesiones**, releé `docs/runbooks/kickoff-agent.md` — está pensado para eso.
7. **Decisiones nuevas que salgan en el camino** se registran como ADR en `docs/04-tech-decisions.md` (Coordinador).

## Stack en una línea

TS estricto · Next.js 15 + shadcn/Tailwind v4 · Phaser 3 · Zustand + TanStack Query · Capacitor PWA · Supabase self-hosted (Coolify) · Colyseus · Gateway IA propio (Gemini/Groq/OpenRouter + Pollinations/HF + ElevenLabs/Coqui) · Vitest + Playwright · pnpm + Turborepo · Docker + Coolify CI/CD.

## Si algo se rompe

- **Bloqueado por otro agente**: documentá en `docs/state/BLOCKERS.md` y pingueá al Coordinador.
- **Rompiste prod**: `docs/runbooks/incident.md`.
- **No sabés qué hacer**: re-leé `docs/runbooks/kickoff-agent.md` y `docs/agents/<rol>.md`. Si sigue dudoso, dejá nota en `BLOCKERS.md`.
