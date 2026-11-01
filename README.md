# Quanta

Juego web y móvil para que estudiantes de colegio aprendan **Física y Química** resolviendo retos
visuales, compitiendo en vivo con su curso y recibiendo explicaciones de una IA cuando se
equivocan. Gratis, sin anuncios y pensado para clases en Colombia y Latinoamérica.

Nació de un encargo sencillo: el profesor de mi hermana le pidió "un juego" para aprender Física y
Química. Quanta es la versión en serio de esa idea.

## Qué se puede jugar hoy

| | |
|---|---|
| **Caída libre** | Simulación física en Phaser 3: predices cuánto tarda en caer un objeto según la altura y la gravedad, y lo ves caer |
| **Balanceo de ecuaciones** | Ajustas coeficientes de una reacción química hasta que los átomos cuadran |
| **Trivia con IA** | Preguntas generadas por un modelo (Gemini/Groq) con explicación del error, no solo "incorrecto" |
| **Salas en vivo estilo Kahoot** | El profesor proyecta la sala, el curso entra con un código de 6 caracteres y compite en tiempo real; resiste reconexiones y cambio de anfitrión |
| **Cuentas o invitado** | Entra con Google para guardar puntajes, o como invitado con historial local |

En camino: el creador de retos con IA (que cualquiera pueda inventar un reto nuevo en minutos sin
programar), modos cooperativos y torneos. Ver [`docs/02-roadmap.md`](docs/02-roadmap.md).

## Cómo está hecho

```
                 ┌──────────────────────────┐
  navegador ───▶ │ apps/web  · Next.js 15   │──┐   Phaser 3 (packages/game-engine)
   / PWA         │ UI, retos y lobby        │  │
                 └────────────┬─────────────┘  │
                              │ WebSocket      │ HTTP
                 ┌────────────▼─────────────┐  │   ┌─────────────────────────────┐
                 │ apps/game-server         │  └──▶│ packages/ai-gateway         │
                 │ Colyseus · salas con     │─────▶│ Gemini · Groq · OpenRouter  │
                 │ autoridad en el servidor │      │ caché y cadena de respaldo  │
                 └────────────┬─────────────┘      └─────────────────────────────┘
                              │
                 ┌────────────▼─────────────┐
                 │ Supabase (self-hosted)   │  Postgres, auth y resultados
                 └──────────────────────────┘
```

- **Las salas tienen autoridad en el servidor**: el puntaje lo calcula Colyseus, así que un ranking
  no se puede falsificar desde las devtools.
- **Gateway de IA propio** con varios proveedores y respaldo, para no depender de uno solo y vivir
  dentro de los planes gratuitos.
- **Monorepo pnpm + Turborepo** con TypeScript estricto, tipos compartidos y CI con lint, tipos y
  pruebas. Desplegable con Docker en Coolify.
- Se construyó en modo multiagente: cada área (motor, tiempo real, IA, UI) tiene su briefing en
  [`docs/agents/`](docs/agents) y cada tarea entró por su propio PR.

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

| Carpeta                 | Contenido                          |
| ----------------------- | ---------------------------------- |
| `apps/web/`             | Next.js 15 (PWA)                   |
| `apps/game-server/`     | Colyseus (rooms authoritative)     |
| `packages/game-engine/` | Phaser 3                           |
| `packages/ai-gateway/`  | Proveedores LLM / imagen / TTS     |
| `packages/ui/`          | Componentes shadcn compartidos     |
| `packages/types/`       | Tipos compartidos                  |
| `packages/db/`          | Supabase schema + migraciones      |
| `packages/config/`      | ESLint / TS / Prettier compartidos |

Ver `docs/` para arquitectura, roadmap, convenciones y briefings por agente.

## Comandos

```bash
pnpm dev          # arranca todo en paralelo (turbo)
pnpm build        # build de todos los paquetes y apps
pnpm test         # tests (vitest) de todo el workspace
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm format       # prettier --write

# Por paquete
pnpm --filter @quanta/web dev           # Next.js en :3000
pnpm --filter @quanta/game-server dev   # Colyseus en :2567
pnpm --filter @quanta/db db:start       # Supabase local (requiere Docker)
```

## Workflow

Trabajo multi-agente. Antes de cualquier cambio leé `CLAUDE.md` y `docs/runbooks/kickoff-agent.md`.
