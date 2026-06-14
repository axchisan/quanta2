# Runbook — Cerrar un sprint (Coordinador)

> Viernes. Última tarea de la semana. El objetivo: que el repo cuente una historia clara de lo logrado y que el próximo sprint arranque con claridad.

## Paso 1 — Revisar estado actual

```bash
git log --oneline --since="1 week ago"
gh pr list --state closed --search "merged:>=<fecha-inicio-sprint>"
```

Comparar con `state/SPRINT.md`:
- ¿Se cumplió el objetivo del sprint?
- ¿Qué tasks quedaron sin cerrar? ¿Por qué?
- ¿Aparecieron blockers no previstos?

## Paso 2 — Actualizar CHANGELOG

Editá `state/CHANGELOG.md`, sección del sprint actual:

- Mové contenido de `[Unreleased]` a `### Sprint <n> — <nombre> (fechas)` definitivo.
- Categorizá: Added / Changed / Fixed / Removed.
- Cada entrada = 1 línea con link al PR o task.

## Paso 3 — Escribir retro en DECISIONS.md

Agregá al final de `state/DECISIONS.md`:

```markdown
### Retro Sprint <n> — <fecha>

**Qué funcionó:**
- <observación>

**Qué no funcionó:**
- <observación>

**Qué cambiar para Sprint <n+1>:**
- <acción concreta>

**Lessons learned:**
- <si hay>
```

Sea honesto. La retro es para aprender, no para cheerleading.

## Paso 4 — Limpiar BLOCKERS.md

- Mové blockers `RESUELTO` a "Resueltos recientes".
- Limpiá resueltos que tengan >2 sprints.
- Dejá solo activos de verdad.

## Paso 5 — Archivar tasks cerradas

En `state/TASKS.md`:

- Mové tasks `done` a sección "Done" (al final del archivo).
- Si "Done" creció mucho (>50 tasks), mové tasks viejas a `state/archive/TASKS-sprint-<n>.md` y limpiá.

## Paso 6 — Planificar próximo sprint

Editá `state/SPRINT.md`:

- Preserva la sección "Sprint history" (agregá una línea del sprint que cerrás).
- Reemplazá el bloque de sprint actual con el nuevo:
  - Número, nombre, fechas.
  - Fase del roadmap (cortejalo con `docs/02-roadmap.md`).
  - Objetivo del sprint (una frase concreta).
  - Definition of Done (checklist).
  - Tasks asignadas (tabla).

Crea nuevas tasks en `state/TASKS.md` siguiendo `templates/task.md`. Tomá del backlog las que correspondan. Si faltan, creá nuevas.

**Priorización:**
1. Bugs de producción (si los hay).
2. Desbloqueos críticos.
3. Progreso de la fase actual del roadmap.
4. Deuda técnica razonable (no acumular).

## Paso 7 — Demo (si aplica)

Si el sprint cierra una fase del roadmap:

- Grabá demo de ≤2 min (screen capture con voz narrando).
- Subí a `docs/demos/sprint-<n>.mp4` o linkealo (Drive, Loom).
- Anotá link en `state/CHANGELOG.md`.

## Paso 8 — Comunicar al humano

Editá brevemente `state/SPRINT.md` sección "Updates":

```markdown
- <fecha> — coordinator: Sprint <n> cerrado. <resumen de 1 línea>. Próximo sprint arranca lunes con foco en <X>.
```

Si hay algo que el humano DEBE decidir antes de que arranque el próximo sprint, marcarlo con `[ESCALATION]` en `state/BLOCKERS.md`.

## Paso 9 — Merge cleanup

```bash
git branch -a | grep 'feat/' | xargs -n1 git branch -D   # borrar ramas locales mergeadas (si quedan)
gh pr list --state merged | head -10  # verificación
```

## Paso 10 — Último commit del sprint

Commiteá los cambios en `docs/state/` directo a main:

```bash
git add docs/state/
git commit -m "docs(sprint): close sprint <n>, plan sprint <n+1>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

## Checklist final

- [ ] CHANGELOG actualizado.
- [ ] Retro escrita en DECISIONS.
- [ ] BLOCKERS limpio.
- [ ] TASKS con sección done archivada si es grande.
- [ ] SPRINT.md refleja nuevo sprint con objetivo y tasks.
- [ ] Demo (si aplica) grabada y linkeada.
- [ ] Escalaciones al humano marcadas claramente.
- [ ] Ramas obsoletas limpiadas.

## Anti-patrones

- ❌ Saltarse la retro ("no pasó nada notable"). Siempre hay algo.
- ❌ Mover tasks `in_progress` sin cerrar como si hubieran terminado.
- ❌ Planificar el próximo sprint con el mismo objetivo si este no se cumplió — analizá por qué.
- ❌ Dejar el CHANGELOG desordenado "para después".
- ❌ Inventar tasks para rellenar el próximo sprint. Priorizá el backlog real.
