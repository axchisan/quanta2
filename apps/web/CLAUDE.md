# `@quanta/web` — App Next.js 15 (UI Web)

Frontend de Quanta: páginas, gameplay UI, dashboard, creador de retos, integración Phaser y Realtime. Dueño: agente **UI Web** (`docs/agents/ui-web.md`).

## Stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · TS estricto. Zustand + TanStack Query (a futuro) · Capacitor PWA (Fase 4).

## Reglas clave

- **Server Components por defecto.** `'use client'` solo en el componente que necesita interactividad/state, nunca una página entera.
- TS estricto, sin `any`. Type-imports (`import type`) obligatorio (verbatimModuleSyntax).
- Componentes ≤150 líneas; si crece, split.
- CSS solo Tailwind. Theme vía tokens de `@quanta/ui`.
- Imports ordenados: react → externos → `@/` internos → relativos.
- Forms: react-hook-form + zod. Datos servidor: TanStack Query (no Zustand para estado de servidor).
- A11y WCAG AA mínimo.

## Estructura

| Ruta                 | Qué hay                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| `app/`               | App Router (layouts, páginas, route handlers).                                  |
| `app/lib/`           | Helpers puros de la app (ej. `site.ts`).                                        |
| `app/api/ai/**`      | ❌ NO tocar — es de AI-Gateway.                                                 |
| `components/`        | Componentes específicos de la app (los reutilizables van a `@quanta/ui`).       |
| `components/game/**` | Envoltorio React del canvas Phaser (a futuro).                                  |
| `lib/realtime/**`    | Cliente Colyseus + Supabase Realtime (a futuro, coordiná con Backend-Realtime). |
| `lib/auth/**`        | `useAuth()`, Magic Link / Google OAuth (a futuro).                              |
| `lib/native/**`      | Wrappers Capacitor (Fase 4).                                                    |
| `stores/`            | Zustand por feature (a futuro).                                                 |
| `public/`            | Estáticos; `manifest.webmanifest` para PWA (a futuro).                          |
| `tests/`             | Vitest (node env por defecto; jsdom solo cuando haga falta).                    |

## Integraciones de paquetes

- `@quanta/ui` y `@quanta/types` son **paquetes fuente TS** → listados en `transpilePackages` de `next.config.ts`. Importás: `import { Button } from '@quanta/ui'`, `import type { Challenge } from '@quanta/types'`.
- El theme se carga en `app/globals.css`: `@import "tailwindcss";` + `@import "@quanta/ui/tokens.css";`.

## Config

- `next.config.ts` (TS; no usamos `"type":"module"` en package.json para evitar fricción de carga de config). Usa `output: 'standalone'` + `outputFileTracingRoot` (raíz del monorepo) para la imagen Docker.
- `Dockerfile` multi-stage (build context = raíz del monorepo) **verificado** (build + run sirve la landing). Deploy en `quanta.axchisan.com` vía Coolify — ver `infra/coolify.md`.
- `eslint.config.mjs` reexporta `@quanta/config/eslint/react` (no usamos `eslint-config-next`).
- `tsconfig.json` extiende `../../tsconfig.base.json`; `jsx: preserve`, plugin `next`, alias `@/* → ./*`.
- `next-env.d.ts` lo genera Next (gitignored, no commitear).

## Comandos

```bash
pnpm --filter @quanta/web dev        # dev server :3000
pnpm --filter @quanta/web build      # build de producción
pnpm --filter @quanta/web lint
pnpm --filter @quanta/web typecheck
pnpm --filter @quanta/web test       # vitest
```

## Anti-patrones

- ❌ Llamar `supabase.from()` directo en un componente → wrappear en hook.
- ❌ `'use client'` en una página entera por una interacción.
- ❌ Estado de servidor en Zustand → usar TanStack Query.
- ❌ Importar Phaser directo → usar `@quanta/game-engine`.
- ❌ Clases Tailwind dinámicas (`bg-${x}-500`) → `clsx` con clases completas.
