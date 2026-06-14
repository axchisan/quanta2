# 05 — Workflow Multi-Agente

## El modelo: 5 paneles tmux

```
┌──────────────────────────────────────────────────────────────┐
│ tmux session: quanta                                         │
├────────────────────────────┬─────────────────────────────────┤
│  COORDINADOR               │  GAME-ENGINE                    │
│  (revisa estado, asigna,   │  (Phaser scenes, físicas,       │
│   revisa PRs, mergea)      │   animaciones, retos)           │
│                            │                                 │
├────────────────────────────┼─────────────────────────────────┤
│  AI-GATEWAY                │  BACKEND-REALTIME               │
│  (LLMs, imagen, TTS,       │  (Colyseus, Supabase schema,    │
│   cache, fallback)         │   Edge Functions, anti-cheat)   │
├────────────────────────────┴─────────────────────────────────┤
│  UI-WEB                                                      │
│  (Next.js routes, layouts, formularios, dashboard,           │
│   creador de retos, integración con Phaser y Realtime)       │
└──────────────────────────────────────────────────────────────┘
```

Cada panel = un proceso `claude` (CLI) con cwd en el repo y rol identificado por la primera línea que escribe el usuario humano al iniciar la sesión:

```
Soy el agente UI-WEB. Leé el kickoff y empezá.
```

El agente lee `docs/runbooks/kickoff-agent.md`, identifica su briefing en `docs/agents/ui-web.md`, revisa `state/SPRINT.md` y `state/TASKS.md`, claimea su próxima task y arranca.

## Flujo end-to-end de una task

```
1. Coordinador planifica el sprint
   └─► Crea tasks en docs/state/TASKS.md con owner asignado, descripción, deps

2. Especialista (ej: GAME-ENGINE) abre su sesión
   └─► Lee runbooks/kickoff-agent.md
   └─► Lee agents/game-engine.md
   └─► Lee state/SPRINT.md y state/TASKS.md
   └─► Encuentra task T012 asignada a "game-engine", status pending

3. Especialista claimea la task
   └─► Edita state/TASKS.md: T012 status: pending → in_progress
   └─► Crea rama: git checkout -b feat/game-engine-T012-falling-physics

4. Especialista trabaja
   └─► Implementa, escribe tests, corre pnpm test --filter=@quanta/game-engine
   └─► Commits convencionales (feat: ..., test: ...)
   └─► Push branch al remote

5. Especialista abre PR
   └─► gh pr create con template docs/templates/pr.md rellenado
   └─► Asigna label "rol:game-engine", "task:T012"
   └─► Edita state/TASKS.md: T012 marca PR opened (link)

6. Coordinador revisa
   └─► Lee runbooks/review-pr.md
   └─► Verifica: CI verde, scope correcto, doc actualizada si aplica
   └─► Aprueba y mergea (squash)

7. Coordinador cierra task
   └─► Edita state/TASKS.md: T012 status: in_progress → done
   └─► Si la task desbloquea otras, las pasa de blocked → pending
   └─► Anota en state/CHANGELOG.md si es un cierre de feature

8. Si surge algo nuevo
   └─► Bloqueo: especialista escribe en state/BLOCKERS.md
   └─► Decisión no documentada: cualquiera anota en state/DECISIONS.md
   └─► Idea para backlog: coordinador la agrega como task pending sin owner
```

## Reglas de coordinación

### El Coordinador es el único que toca:
- `docs/state/SPRINT.md` (planificación)
- `docs/state/TASKS.md` (excepto el campo `status` de tu propia task)
- `docs/state/CHANGELOG.md`
- `docs/state/DECISIONS.md` (todos pueden anotar; coordinador cura)
- `docs/02-roadmap.md`
- Merges a `main`

### Los Especialistas pueden:
- Crear/editar archivos dentro de su carpeta principal (ver `docs/agents/<rol>.md`)
- Editar el `status` de su propia task en `state/TASKS.md` (pending → in_progress → done)
- Anotar en `state/BLOCKERS.md` y `state/DECISIONS.md`
- Modificar `packages/types` solo si su task lo requiere y notifica al Coordinador en el PR

### Nadie hace sin permiso explícito:
- Modificar el stack tecnológico (cambiar de DB, de framework, etc.)
- Agregar dependencias externas grandes (>500KB o críticas para seguridad)
- Refactorizar paquetes ajenos
- Modificar CI/CD
- Tocar configuraciones de Coolify

## Manejo de dependencias entre agentes

Si tu task depende de algo que otro agente está haciendo:

1. **Antes de empezar:** revisá si la dep ya está cerrada en `state/TASKS.md`. Si no, marcá tu task como `blocked` y anotá en `state/BLOCKERS.md`:
   ```
   - T013 (game-engine) blocked by T020 (backend-realtime: API de challenges).
     Owner game-engine. ETA: depende de cuándo cierre T020.
   ```
2. **El Coordinador re-prioriza** si el bloqueo es crítico.
3. **Cuando se desbloquea**, el Coordinador te avisa en el PR de la dep o te re-asigna.

## Manejo de conflictos cross-package

Si dos agentes necesitan modificar el mismo archivo (típicamente `packages/types`):

1. El que llega primero abre PR.
2. El segundo espera al merge, hace `git pull` y rebasea su rama.
3. Si hay conflicto inevitable (ambos cambian el mismo símbolo), el Coordinador media: decide qué shape gana, abre task de adaptación para el otro agente.

## Cadencia de sincronización

- **Inicio de sprint (lunes):** Coordinador publica `SPRINT.md` con objetivo + tasks priorizadas.
- **Daily standup asincrónico (opcional):** cada agente escribe 2 líneas en `state/SPRINT.md` sección "Updates" si hay cambios significativos.
- **Cierre de sprint (viernes):** Coordinador corre `runbooks/close-sprint.md`: actualiza CHANGELOG, escribe retro corta en DECISIONS, plantea sprint siguiente.

## Cuándo escalar al humano

- Decisión de producto que cambia alcance/timeline (ej: "este reto es muy ambicioso, lo recortamos?").
- Bug en producción visible para usuarios.
- Dependencia externa caída sin solución obvia (ej: Gemini bloqueado en Colombia).
- Conflicto cross-agente irresoluble.
- Cualquier acción destructiva (drop tabla, force push, downgrade dep crítica).

El humano (usuario) lee el repo igual que cualquier agente, así que con anotación clara en `state/BLOCKERS.md` se entera.

## Identidad y trazabilidad

- Cada agente firma sus commits con `--author="Quanta <rol>@quanta.local <noreply@anthropic.com>"` (configurable).
- PRs etiquetados con `rol:<rol>` para filtrar.
- Cualquiera puede leer `git log` y entender quién hizo qué.

## Resumen de archivos clave (cheat sheet)

| Si querés... | Mirá... |
|--------------|---------|
| Empezar | `runbooks/kickoff-agent.md` |
| Saber qué hacer | `state/TASKS.md` (tus tasks asignadas) |
| Saber el sprint actual | `state/SPRINT.md` |
| Ver qué está bloqueando algo | `state/BLOCKERS.md` |
| Ver decisiones recientes | `state/DECISIONS.md` |
| Ver historia de releases | `state/CHANGELOG.md` |
| Abrir un PR | `runbooks/open-pr.md` + `templates/pr.md` |
| (Coordinador) revisar un PR | `runbooks/review-pr.md` |
| (Coordinador) cerrar sprint | `runbooks/close-sprint.md` |
| Si rompiste algo | `runbooks/incident.md` |
