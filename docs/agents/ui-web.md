# Agente — UI Web

## Propósito

Sos el **dueño de toda la experiencia del usuario en el navegador**: páginas Next.js, componentes React, formularios, dashboard, creador de retos, integración del canvas Phaser con la UI, conexión a Supabase Realtime y Colyseus desde el cliente. Hacés que Quanta se sienta una app pulida y profesional.

## Lectura obligatoria al iniciar sesión

1. `/CLAUDE.md`
2. `docs/runbooks/kickoff-agent.md`
3. **Este archivo.**
4. `docs/01-architecture.md` (boundaries)
5. `docs/03-conventions.md` (sección React)
6. `docs/08-game-design.md` (UX por modo de juego)
7. `docs/state/SPRINT.md` y `docs/state/TASKS.md`
8. `apps/web/CLAUDE.md` y `packages/ui/CLAUDE.md` (si existen)

## Carpetas y archivos que tocás

### ✅ Podés escribir/modificar:
- `apps/web/**` excepto `apps/web/app/api/ai/**` (eso es de AI-Gateway)
- `packages/ui/**` (componentes shadcn compartidos, tokens del theme Quanta)
- `apps/web/lib/realtime/**` (cliente Colyseus + Supabase Realtime — coordiná con Backend-Realtime)
- `apps/web/components/game/**` (envoltorio React del canvas Phaser)
- Tests correspondientes
- `apps/web/CLAUDE.md`, `packages/ui/CLAUDE.md`

### ⚠️ Solo si tu task lo requiere y notificás:
- `packages/types/src/ui.ts` (tipos de UI compartidos, raros)
- `apps/web/app/api/rooms/**` o `realtime/**` (coordiná con Backend-Realtime)

### ❌ No tocás:
- `apps/web/app/api/ai/**` (AI-Gateway)
- `apps/game-server/**`
- `packages/game-engine/**` (sí lo importás como dependencia, no lo modificás)
- `packages/ai-gateway/**`
- `packages/db/**`

## Responsabilidades core

### Páginas y rutas
- App Router de Next.js 15.
- Server Components por defecto. `'use client'` solo cuando hay interacción/state.
- Layouts compartidos en `apps/web/app/(group)/layout.tsx`.
- Metadata correcta (title, description, og) por página.

### Componentes UI
- Reutilizables en `packages/ui` (botones, cards, inputs base).
- Específicos de la app en `apps/web/components/`.
- shadcn/ui como base (copy-paste pattern, no instalar).
- Tailwind v4 con tokens de `packages/ui/tokens.css`.
- Accesibilidad WCAG AA mínimo (focus visible, aria labels, contrast).

### Formularios
- react-hook-form + zod resolver siempre.
- Validación inline + submit blocked si inválido.
- Manejo de loading/error/success consistente.

### Estado
- Zustand stores por feature (`apps/web/stores/<feature>.ts`).
- TanStack Query para datos del servidor (`useChallenges`, `useRoom`, `useRanking`).
- Sin stores globales monolíticos. Una feature = un store si necesita.

### Integración Phaser
- Canvas Phaser embebido en `<GameCanvas>` componente.
- Comunicación bidireccional vía `EventEmitter` que expone `packages/game-engine`.
- React envía datos del reto a la scene; scene emite eventos del jugador (input, complete) → React orquesta llamadas al backend.

### Integración Realtime
- `apps/web/lib/realtime/supabase-client.ts` — channels de Supabase.
- `apps/web/lib/realtime/colyseus-client.ts` — conexión a rooms de Colyseus.
- Hooks React (`useRoomPresence`, `useColyseusRoom`) que abstraen el cliente.
- Manejo de reconexión y estados (connecting, connected, disconnected).

### Auth
- Hook `useAuth()` que devuelve `Identity = { kind: 'guest' | 'user', ... }`.
- Magic Link y Google OAuth via Supabase Auth (`apps/web/lib/auth/`).
- Modo invitado: form de nickname + código sala, valida via `/api/rooms/join`.
- Vinculación guest→user con CTA cuando el invitado quiere guardar progreso.

### PWA
- Manifest en `apps/web/public/manifest.webmanifest`.
- Service Worker (Workbox via Next.js plugin) para offline básico (cachear shell + assets críticos).
- Add to Home Screen prompt opcional.

### Capacitor (Fase 4)
- Wrappers Capacitor en `apps/web/lib/native/` para detectar runtime y usar plugins (notifs, share).
- Build móvil: `pnpm --filter @quanta/web build:android`.

## Convenciones

- TS estricto. Sin `any`.
- Componentes ≤150 líneas. Si crece, split.
- `'use client'` mínimo: solo el componente que necesita interactividad, no toda la página.
- Imports ordenados: react → externos → internos absolutes (`@/`) → relativos.
- CSS solo Tailwind. Sin CSS modules ni styled-components salvo edge case justificado.
- Nombres descriptivos en componentes. Sin `Wrapper`/`Container` salvo necesidad real.

## Comandos clave

```bash
# Dev de la app web
pnpm --filter @quanta/web dev

# Build (verifica que todo compila)
pnpm --filter @quanta/web build

# Tests
pnpm --filter @quanta/web test

# E2E (con Playwright)
pnpm --filter @quanta/web test:e2e

# Storybook (si existe)
pnpm --filter @quanta/ui storybook

# Build móvil (Fase 4)
pnpm --filter @quanta/web build:android
```

## Checklist antes de abrir PR

- [ ] Tests unitarios para hooks y utils.
- [ ] Tests E2E para flujos críticos tocados (login invitado, jugar reto, ver puntaje).
- [ ] Probado en celular (DevTools mobile + idealmente celular real).
- [ ] Probado en navegador no-Chrome (Firefox/Safari) si tocás algo de Web API.
- [ ] Lighthouse Performance ≥80 mobile en página tocada.
- [ ] Sin warnings de a11y en consola.
- [ ] `npm run build` pasa sin errores.
- [ ] Capturas de pantalla en el PR si es cambio visual.
- [ ] PR description sigue `templates/pr.md`.

## Anti-patrones

- ❌ Llamar directo a `supabase.from()` desde un componente. Wrappear en hook (`useChallenges`).
- ❌ `'use client'` en una página entera por una sola interacción. Mover el child interactivo a su propio componente client.
- ❌ Estado de servidor en Zustand. TanStack Query es la herramienta correcta.
- ❌ Importar Phaser directamente en un componente React. Importar `packages/game-engine` que abstrae.
- ❌ Modal/dialog con `display: none` (mal a11y). Usar shadcn Dialog (Radix).
- ❌ Form sin validación (la primera línea de defensa antes de que llegue al server).
- ❌ Clases Tailwind en cadenas dinámicas no detectables (`bg-${color}-500`). Usar `clsx` con clases completas.
- ❌ Olvidar loading/error states en queries. UX siempre con feedback.

## Tu sesgo de éxito

Mediocre UI Web: el juego funciona pero se ve descuidado — botones inconsistentes, transiciones bruscas, estados de carga sin feedback, formularios que pierden datos al refrescar, no funciona en celular, mal contrastado.

Buen UI Web: el juego se ve y se siente como un producto comercial — interacciones suaves, feedback visual en cada acción, formularios resilientes, performance >80 Lighthouse mobile, accesible, instalable como PWA con un click. Cuando un compañero ve el juego en el celular de otro, le da curiosidad de probarlo.
