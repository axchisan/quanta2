# 03 — Convenciones

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` en `tsconfig.base.json`.
- Sin `any`. Si es inevitable, `// eslint-disable-next-line` con comentario explicando por qué.
- Sin `as Foo` salvo en boundaries de input externo (parsers Zod son la opción preferida).
- **Zod** para validar todo input externo (HTTP body, env vars, datos de Supabase, respuestas de IA).
- Tipos compartidos entre apps van en `packages/types`. Si un tipo lo usa solo un paquete, vive ahí.
- Functions exportadas: docstring de **una línea** solo si el WHY no es obvio. Sin docs JSDoc inflados.

## Naming

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos TS/TSX | `kebab-case.ts(x)` | `challenge-generator.ts`, `room-card.tsx` |
| Componentes React | `PascalCase` | `RoomCard`, `ChallengePreview` |
| Funciones / variables | `camelCase` | `generateChallenge`, `roomCode` |
| Tipos / interfaces | `PascalCase` | `Challenge`, `RoomMember` |
| Constantes módulo | `SCREAMING_SNAKE_CASE` | `MAX_PLAYERS_PER_ROOM` |
| Tablas Postgres | `snake_case` plural | `users`, `challenge_attempts` |
| Columnas Postgres | `snake_case` | `created_at`, `room_code` |
| Enum values DB | `snake_case` | `'in_progress'`, `'kahoot_room'` |
| Carpetas paquetes | `kebab-case` | `game-engine`, `ai-gateway` |
| Branches | `feat/<rol>-<task-id>-<slug>` | `feat/game-engine-T012-falling-physics` |

## Commits (Conventional Commits)

Formato: `<type>(<scope>): <subject>` — minúscula, imperativo, sin punto final.

| Type | Cuándo |
|------|--------|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de bug |
| `chore` | Mantenimiento (deps, configs) |
| `docs` | Cambios solo en `docs/` o READMEs |
| `test` | Tests añadidos/cambiados sin cambio de comportamiento |
| `refactor` | Reorganización sin cambio de comportamiento |
| `perf` | Mejora de performance |
| `style` | Formato/whitespace (raro, lo hace el linter) |

**Scope** es el paquete o área: `web`, `game-engine`, `ai-gateway`, `game-server`, `db`, `ui`, `docs`, `ci`, `infra`.

Ejemplos:
- `feat(game-engine): add falling-body physics scene`
- `fix(ai-gateway): retry on Gemini 429`
- `docs(roadmap): mark fase 1 complete`

## Branches y PRs

- Una task = una rama = un PR. Si una task se vuelve grande, split en sub-tasks (Coordinador decide).
- Naming: `feat/<rol>-<task-id>-<slug-corto>`. `task-id` viene de `state/TASKS.md`.
- PR description usa `docs/templates/pr.md`. Sin template = el Coordinador lo rechaza.
- Squash merge a `main`. Sin merge commits.
- Tests verdes y typecheck OK antes de pedir review (CI lo bloquea de todos modos).
- Coordinador es el único que mergea (excepción: hotfixes que el coordinador delega explícitamente).

## Estructura de carpetas dentro de cada paquete

```
packages/<nombre>/
├─ src/
│  ├─ index.ts             # API pública del paquete
│  ├─ <feature>/           # Subcarpeta por feature
│  └─ ...
├─ tests/                  # Tests con mismo árbol que src/
├─ CLAUDE.md               # Guía específica del paquete
├─ package.json
├─ tsconfig.json
└─ README.md (opcional)
```

## React (apps/web, packages/ui)

- **Server Components por defecto.** `'use client'` solo cuando hay interactividad/state.
- Componentes pequeños (≤150 líneas). Si crece, split en sub-componentes.
- Sin estado global compartido entre features. Zustand stores por feature.
- Forms: react-hook-form + zod resolver.
- Datos del servidor: TanStack Query con `queryKey` consistente por feature (`['rooms', roomId]`).
- Toasts/notifications: sonner.

## Phaser (packages/game-engine)

- Cada reto = una scene class en `src/scenes/<challenge-slug>/`.
- Assets se cargan desde `AssetLoader` (no `this.load.image` directo en cada scene).
- Físicas: Arcade para retos simples, Matter.js para retos con colisiones complejas.
- Eventos hacia React via EventEmitter del juego (no acoplar a un store específico).

## Tests

- Unit tests para lógica pura en `packages/*` y para reducers/utilities.
- Integration tests para endpoints API y para flujos de Supabase.
- E2E (Playwright) solo para flujos críticos: login invitado → jugar reto → ver puntaje. Sala Kahoot 2-jugadores.
- Cobertura objetivo: 70% en `packages/ai-gateway` y `apps/game-server` (lógica server-side crítica). 50% en el resto. No es métrica obsesiva, sí guía.
- Mocks de proveedores IA: `packages/ai-gateway/tests/mocks/` con respuestas fixture.

## Linting / formatting

- Prettier (formato).
- ESLint con config compartida en `packages/config`.
- Tailwind classes ordenadas por `prettier-plugin-tailwindcss`.
- Husky pre-commit: lint-staged (eslint --fix + prettier sobre archivos modificados).

## Comentarios en código

- **Default: cero comentarios.** Nombres descriptivos > comentarios.
- Excepción: cuando el WHY no es obvio (workaround de bug, decisión no intuitiva, restricción de un proveedor IA, invariante crítico).
- Nunca comentarios que explican QUÉ hace el código.
- Nunca referencias a tasks/PRs en comentarios (`// added for #234`).

## Variables de entorno

- `.env.example` actualizado en cada cambio. Ningún secreto real en el repo.
- Validación con Zod al cargar (`packages/config/env.ts`). App falla rápido si falta una var.
- Naming: `NEXT_PUBLIC_*` para client-side, sin prefijo para server-only.

## Estilo de PR description

Resumen 2-3 líneas + checklist + link a la task. Ver `docs/templates/pr.md`.

## Comunicación entre agentes

- Vía git: PRs con descripción clara.
- Vía `state/BLOCKERS.md` cuando hay dependencia entre agentes.
- Vía `state/DECISIONS.md` si tomás una decisión no documentada (anotarla con timestamp y rol).
- Nunca pedir favores fuera del repo. Todo trazable.
