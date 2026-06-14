# Runbook — Kickoff de un agente

> Cada vez que un agente Claude Code abre sesión en un panel tmux de Quanta (al arrancar el proyecto o después de reabrir la consola), seguí este runbook. Es tu fuente única de verdad para arrancar sin perder contexto.

## Paso 0 — Identificá tu rol

El primer mensaje del humano en la sesión te debería decir quién sos, por ejemplo:

> *"Soy el agente UI-WEB. Leé el kickoff y empezá."*

Si no está claro, preguntale al humano. Los roles válidos son:

- `coordinator`
- `game-engine`
- `ai-gateway`
- `backend-realtime`
- `ui-web`

## Paso 1 — Lectura base (todos los roles)

Leé en este orden:

1. [`/CLAUDE.md`](../../CLAUDE.md) — guía rápida raíz.
2. [`docs/README.md`](../README.md) — índice de documentación.
3. **Este archivo** (ya lo estás leyendo).

## Paso 2 — Lectura específica de tu rol

Leé tu briefing:

- [`docs/agents/coordinator.md`](../agents/coordinator.md)
- [`docs/agents/game-engine.md`](../agents/game-engine.md)
- [`docs/agents/ai-gateway.md`](../agents/ai-gateway.md)
- [`docs/agents/backend-realtime.md`](../agents/backend-realtime.md)
- [`docs/agents/ui-web.md`](../agents/ui-web.md)

El briefing de tu rol indica qué otros documentos son obligatorios para vos. Leelos.

## Paso 3 — Estado vivo

Revisá en orden:

1. [`docs/state/SPRINT.md`](../state/SPRINT.md) — ¿cuál es el sprint actual, cuál el objetivo, qué tasks te tocan?
2. [`docs/state/TASKS.md`](../state/TASKS.md) — tu próxima task. Ordenadas por prioridad.
3. [`docs/state/BLOCKERS.md`](../state/BLOCKERS.md) — ¿hay algo que te afecta?
4. [`docs/state/DECISIONS.md`](../state/DECISIONS.md) — ¿hubo decisiones recientes que debés conocer? (últimos 7 días).

## Paso 4 — Contexto del repo

Corré:

```bash
git status
git log --oneline -10
git branch -a
gh pr list --state open    # si gh está autenticado
```

Esto te da la foto de lo que está en vuelo ahora.

## Paso 5 — Claim de task

Si hay una task `pending` asignada a vos en `state/TASKS.md` y sin `blockedBy` abierto:

1. Editá `state/TASKS.md` y cambiá su `status` de `pending` a `in_progress`. Anotá fecha/hora.
2. Creá rama: `git checkout -b feat/<rol>-<task-id>-<slug>` (ej: `feat/ui-web-T003-next-skeleton`).
3. Arrancá a implementar.

Si no hay task `pending` para vos:
- Miré si tu rol tiene tasks `blocked` esperando otras. Si la dep cerró recién, avisá al Coordinador.
- Si no hay trabajo y sos especialista: ping al Coordinador en `state/BLOCKERS.md` marcado `[ESCALATION]`.
- Si sos Coordinador: plantea nuevas tasks según roadmap (ver `docs/02-roadmap.md`).

## Paso 6 — Durante el trabajo

- Commits convencionales (`feat:`, `fix:`, `chore:`, etc.). Scope = paquete.
- Tests verdes antes de push.
- Si descubrís algo que tomás sin consultar: anotalo en `state/DECISIONS.md` con tu rol.
- Si te bloqueás: anotalo en `state/BLOCKERS.md` y cambiá tu task a `blocked`.
- Si ves un bug menor fuera de tu área: **no lo arregles**. Anotalo en `state/TASKS.md` como Backlog (`B<nn>`) y seguí.

## Paso 7 — Terminé la task

1. Abrí PR siguiendo [`docs/runbooks/open-pr.md`](open-pr.md).
2. Marcá en `state/TASKS.md` tu task como `in_progress → review` con link al PR.
3. Esperá revisión del Coordinador. Si pide cambios, atendé. Si aprueba, él mergea.
4. Después del merge: cambiá `status` de la task a `done` (o lo hace el Coordinador al cerrar).
5. Volvé a Paso 5: próxima task.

## Paso 8 — Cierre de sesión

Antes de cerrar tu panel tmux:

- [ ] ¿Tu task actual quedó en estado consistente? (commit + push aunque sea WIP).
- [ ] ¿Actualizaste `status` en `state/TASKS.md`?
- [ ] ¿Dejaste algún blocker o decisión sin anotar?
- [ ] ¿Hay cambios en `docs/` que debiste hacer y no hiciste? (ej: actualizar CLAUDE.md del paquete que tocaste).

## Preguntas frecuentes

**¿Qué hago si los docs están desactualizados vs el código?**
> Abrí task para actualizarlos. No tomes decisiones basándote en docs rotas — leé el código y anotá en `DECISIONS.md` lo que encontraste.

**¿Qué hago si mi task me lleva fuera de mi área?**
> Paralo. Anotá en el PR por qué. Pedí al Coordinador que re-divida la task o asigne el cross-cut a otro agente.

**¿Y si el Coordinador no responde?**
> Anotá `[ESCALATION]` en `state/BLOCKERS.md`. El humano revisa periódicamente.

**¿Puedo trabajar en múltiples tasks en paralelo?**
> Solo si tienen ramas separadas y son ortogonales. Prefero: una a la vez bien hecha.

**Perdí contexto entre sesiones, ¿qué hago?**
> Este runbook es la respuesta. Empezá de cero en el Paso 1. Los docs están para eso.
