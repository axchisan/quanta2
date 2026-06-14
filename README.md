# Quanta

Juego educativo interactivo de Física y Química con IA generativa, multiplayer y herramienta de creación de retos.

Monorepo pnpm + Turborepo. Stack: TypeScript estricto · Next.js 15 · Phaser 3 · Supabase self-hosted · Colyseus · Gateway IA propio.

## Requisitos

- Node.js `>=22.11` (LTS recomendado; ver `.nvmrc`)
- pnpm `>=10`
- Docker (para Supabase local y `apps/game-server`)

## Arranque rápido

```bash
pnpm install
cp .env.example .env   # rellenar valores
pnpm dev               # arranca todo (turbo)
```

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `apps/web/` | Next.js 15 (PWA) |
| `apps/game-server/` | Colyseus (rooms authoritative) |
| `packages/game-engine/` | Phaser 3 |
| `packages/ai-gateway/` | Proveedores LLM / imagen / TTS |
| `packages/ui/` | Componentes shadcn compartidos |
| `packages/types/` | Tipos compartidos |
| `packages/db/` | Supabase schema + migraciones |
| `packages/config/` | ESLint / TS / Prettier compartidos |

Ver `docs/` para arquitectura, roadmap, convenciones y briefings por agente.

## Workflow

Trabajo multi-agente. Antes de cualquier cambio leé `CLAUDE.md` y `docs/runbooks/kickoff-agent.md`.
