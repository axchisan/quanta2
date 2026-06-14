# @quanta/game-engine — Guía interna

Motor de juego basado en **Phaser 3**. Todo lo que ocurre dentro del canvas vive acá: scenes, físicas, animaciones, asset loading, audio. Antes de tocar nada, leé `docs/agents/game-engine.md` y la sección "Phaser" de `docs/03-conventions.md`.

## API pública (`src/index.ts`)

- `createGameConfig(parent: string): Phaser.Types.Core.GameConfig` — factory pura que devuelve la config del juego (no instancia `Phaser.Game`; eso lo hace la capa React con el `parent` del DOM).
- `BootScene` + `BOOT_SCENE_KEY` — escena inicial.

La instanciación de `new Phaser.Game(config)` ocurre en el wrapper React de `apps/web`, no acá. Este paquete es agnóstico de transport y de DOM real.

## Estructura

```
src/
├─ index.ts                 # API pública del paquete
├─ scenes/<challenge-slug>/ # una carpeta por escena/reto
│  └─ index.ts              # la clase Scene (key = nombre carpeta kebab-case)
└─ ...
tests/                      # mismo árbol que src/, environment jsdom
```

### Patrón de scenes

- Cada reto = una scene class en `src/scenes/<challenge-slug>/`.
- `constructor` pasa la key = slug de la carpeta en kebab-case (ej. `'free-fall'`). `BootScene` usa `'boot'`.
- La scene es **agnóstica del transport**: recibe `payload` (datos del reto desde la tabla `challenges`) y NO hardcodea datos del reto.
- Cuando una scene crezca, añadir junto al `index.ts`: `assets.ts` (manifest), `physics.ts` (config de física), y sus tests.

### AssetLoader (convención a venir)

- Carga de assets centralizada en un `AssetLoader`, **no** `this.load.image()` ad-hoc en cada scene.
- Manifest por escena en `<scene>/assets.ts`.
- Soporta URLs (sprites generados por IA en Supabase Storage) y bundle local.

### Físicas

- Arcade Physics para retos simples (AABB rápido) — es el default de `createGameConfig`.
- Matter.js para física realista (caída libre, péndulos, colisiones rotativas).
- Documentar en cada scene qué motor usa y por qué.
- Animaciones usan `delta` time, nunca asumir 60 FPS exactos.

## Eventos hacia React

La scene **NUNCA** hace HTTP ni habla con Supabase/Colyseus directamente. Emite eventos vía `this.events.emit(...)` y React (el wrapper del canvas) los escucha y orquesta el backend.

Eventos estandarizados (tipados en `@quanta/types` → `GameEventMap`):

- `engine:ready` — `{ sceneKey }` (lo emite `BootScene` al terminar `create()`).
- `challenge:ready` — `{ challenge }`
- `challenge:input` — `{ value }`
- `challenge:complete` — `{ value, clientTimeMs }`
- `challenge:abort` — `{ reason }`

Tipar siempre el payload con `GameEventMap['<evento>']` antes de emitir.

## Reglas

- TS estricto, sin `any`, sin `as` (salvo boundaries externos). Base con `verbatimModuleSyntax` + `isolatedModules`: usar `import type {...}` para imports de solo-tipos (`GameEventMap`, tipos de Phaser) y `.js` en imports relativos internos.
- Archivos kebab-case; clases/tipos PascalCase.
- Phaser es externo en el bundle (`external: ['phaser']` en `tsup.config.ts`); `@quanta/*` se inlinea (`noExternal`).
- Tests corren en jsdom: **nunca** instanciar `new Phaser.Game(...)` en tests (no hay WebGL). Probar solo forma de config, constantes y lógica pura.

## Scripts

```bash
pnpm --filter @quanta/game-engine build      # tsup → dist (esm + cjs + dts)
pnpm --filter @quanta/game-engine dev        # tsup --watch
pnpm --filter @quanta/game-engine test       # vitest run
pnpm --filter @quanta/game-engine lint
pnpm --filter @quanta/game-engine typecheck
pnpm --filter @quanta/game-engine clean
```

## Anti-patrones

- Hardcodear datos de retos en la scene. Vienen del `payload`.
- `fetch()` / `supabase.from()` / Colyseus dentro de una scene.
- Crear stores Zustand desde Phaser. La scene emite eventos; React maneja estado.
- Olvidar `scene.shutdown()` al destruir (memory leaks / audio colgado).
- Colores hardcodeados acoplados a un tema; usar tokens cuando sea posible.
