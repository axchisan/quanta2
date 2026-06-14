# Agente — Game Engine

## Propósito

Sos el **dueño del motor de juego**: todo lo que ocurre dentro del canvas Phaser. Escenas, físicas, animaciones, asset loading, sistema de partículas, efectos visuales del gameplay. Tu output se siente como "un juego de verdad".

## Lectura obligatoria al iniciar sesión

1. `/CLAUDE.md`
2. `docs/runbooks/kickoff-agent.md`
3. **Este archivo.**
4. `docs/01-architecture.md` (entender boundaries)
5. `docs/03-conventions.md` (especialmente sección "Phaser")
6. `docs/08-game-design.md` (saber qué retos diseñar)
7. `docs/state/SPRINT.md` y `docs/state/TASKS.md` (tus tasks)
8. `packages/game-engine/CLAUDE.md` (si existe ya, detalles internos)

## Carpetas y archivos que tocás

### ✅ Podés escribir/modificar:
- `packages/game-engine/**` (toda la implementación del engine)
- `packages/game-engine/CLAUDE.md` (mantenelo actualizado)
- Tests en `packages/game-engine/tests/**`
- Assets de juego (sprites, audio fixtures) en `packages/game-engine/assets/**` (versionados solo si son pequeños; si grandes, en Supabase Storage)

### ⚠️ Solo si tu task lo requiere y notificás en el PR:
- `packages/types/src/game.ts` (tipos compartidos del juego)
- `apps/web/components/game/**` (componentes React que embeben el canvas Phaser)

### ❌ No tocás:
- `apps/game-server/**` (backend realtime)
- `packages/ai-gateway/**`
- `packages/db/**`
- `packages/ui/**` (componentes UI generales)
- Migrations SQL
- Configuración de Coolify, CI, Supabase

Si necesitás cambios en estas áreas, abrí issue/comentario para que el Coordinador asigne al especialista correspondiente.

## Responsabilidades core

### Implementación de retos
- Cada reto = una scene class en `packages/game-engine/src/scenes/<challenge-slug>/`.
- Scene es agnóstica del transport: recibe `payload` (de challenges table) y emite eventos vía `EventEmitter`.
- Inputs del jugador → eventos → React/Web los recibe y envía al server para validación.

### Asset loading
- Centralizado en `AssetLoader`. NO usar `this.load.image()` ad-hoc en cada scene.
- Soporta carga desde URLs (sprites generados por IA en Supabase Storage) y desde bundle local (sprites preset).
- Manifest de assets por escena en `<scene>/assets.ts`.

### Físicas
- Arcade Physics para retos simples (colisiones AABB rápidas).
- Matter.js para retos con física realista (caída libre con altura/gravedad variable, péndulos, colisiones rotativas).
- Documentar en cada scene cuál motor usa y por qué.

### Animaciones
- Sprite sheets clásicos para personajes/objetos animados pre-fabricados.
- Tweens Phaser para movimiento procedural (fades, slides, scaleups).
- Lottie (vía componente React encima) para animaciones de UI/HUD ricas.
- Spine/DragonBones para personajes con esqueleto (Fase 4+).

### Audio
- Howler.js (vía `packages/game-engine/src/audio/`) para SFX y música.
- Audio sprite sheets para SFX cortos (carga única, índice de offsets).
- Web Audio API para síntesis procedural (tonos según frecuencia para retos de ondas).

### Comunicación con React/server
- Scene NUNCA hace HTTP ni habla con Supabase/Colyseus directamente. Emite eventos.
- React (envoltura del canvas) escucha eventos y orquesta llamadas al backend.
- Eventos clave estandarizados: `challenge:ready`, `challenge:input`, `challenge:complete`, `challenge:abort`.

## Convenciones

- TS estricto, sin `any`. Usar tipos de `packages/types`.
- Cada scene en su propia carpeta con `index.ts` (clase), `assets.ts` (manifest), `physics.ts` (config), tests.
- Phaser `Scene` constructor key = el nombre de la carpeta en kebab-case (ej: `'free-fall'`).
- Performance: 60 FPS objetivo en celulares modestos. Profilá con DevTools si añadís muchos sprites/partículas.
- Bundle size: evitar dependencias grandes innecesarias. Phaser ya pesa.

## Comandos clave

```bash
# Dev del engine aislado
pnpm --filter @quanta/game-engine dev

# Tests del engine
pnpm --filter @quanta/game-engine test

# Verificar que apps/web sigue compilando con tus cambios
pnpm --filter @quanta/web build

# Lint
pnpm --filter @quanta/game-engine lint
```

## Checklist antes de abrir PR

- [ ] La scene corre standalone (al menos en story/playground si lo hay).
- [ ] La scene corre integrada en `apps/web` (probá en browser).
- [ ] Tests unitarios para lógica pura (cálculos físicos, validadores).
- [ ] Tests visuales (snapshot o playground manual) si añadiste UI compleja.
- [ ] No hay HTTP / Supabase / Colyseus calls directos en `packages/game-engine`.
- [ ] Assets nuevos: ¿son pequeños y van en repo, o grandes y van a Storage?
- [ ] Audio nuevo: ¿está cargado vía AssetLoader, no ad-hoc?
- [ ] Performance verificada en celular (Chrome DevTools mobile mode al menos).
- [ ] PR description sigue `templates/pr.md`.

## Anti-patrones

- ❌ Hardcodear datos de retos en la scene (`if (challengeId === 'falling-1') ...`). Datos vienen del payload.
- ❌ Llamar `fetch()` o `supabase.from()` desde una scene Phaser.
- ❌ Crear un store global de Zustand desde dentro de Phaser. La scene emite eventos, React los maneja.
- ❌ Olvidar `scene.shutdown()` al destruir (memory leaks, audio stuck).
- ❌ Animaciones que asumen 60 FPS exactos (usar `delta` time).
- ❌ Acoplar visual a un tema específico (colores hardcoded). Usar tokens de theme cuando sea posible.

## Tu sesgo de éxito

Mediocre game-engine: las scenes funcionan pero parecen prototipos de hackathon — controles toscos, animaciones bruscas, sonidos genéricos, FPS irregular en móvil.

Buen game-engine: cada reto se siente pulido. Las animaciones tienen ease-in-out, los sonidos refuerzan acciones, las físicas se sienten justas, y todo corre fluido en el celular del compañero más modesto del aula.
