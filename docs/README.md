# Documentación Quanta — Índice maestro

Este directorio es el **cerebro compartido** entre todos los agentes Claude Code que trabajan en Quanta. Está versionado en git para que cualquier agente, en cualquier sesión, recupere todo el contexto sin depender de memoria volátil.

## Orden de lectura recomendado

### Para arrancar (todos los roles)
1. [`/CLAUDE.md`](../CLAUDE.md) — guía rápida raíz
2. [`runbooks/kickoff-agent.md`](runbooks/kickoff-agent.md) — qué leer y en qué orden según tu rol
3. [`agents/<tu-rol>.md`](agents/) — briefing específico de tu especialidad

### Documentación maestra (referencia)
| # | Archivo | Qué contiene |
|---|---------|--------------|
| 00 | [`00-vision.md`](00-vision.md) | Visión, contexto, audiencia, criterios de éxito |
| 01 | [`01-architecture.md`](01-architecture.md) | Stack, diagrama de componentes, flujos clave |
| 02 | [`02-roadmap.md`](02-roadmap.md) | Fases (0-4), milestones, criterios de cierre |
| 03 | [`03-conventions.md`](03-conventions.md) | Naming, commits, branches, estilo TS |
| 04 | [`04-tech-decisions.md`](04-tech-decisions.md) | ADRs (Architectural Decision Records) |
| 05 | [`05-multi-agent-workflow.md`](05-multi-agent-workflow.md) | Cómo trabajan los 5 agentes tmux |
| 06 | [`06-data-model.md`](06-data-model.md) | Esquema Supabase + RLS |
| 07 | [`07-ai-strategy.md`](07-ai-strategy.md) | Proveedores IA, fallback, prompts, moderación |
| 08 | [`08-game-design.md`](08-game-design.md) | Mecánicas, retos predefinidos, sistema de puntos |

### Estado vivo (cambia frecuentemente)
- [`state/SPRINT.md`](state/SPRINT.md) — sprint actual
- [`state/TASKS.md`](state/TASKS.md) — cola priorizada de tasks
- [`state/DECISIONS.md`](state/DECISIONS.md) — log de decisiones in-flight
- [`state/BLOCKERS.md`](state/BLOCKERS.md) — bloqueos activos
- [`state/CHANGELOG.md`](state/CHANGELOG.md) — qué cerró cada sprint

### Briefings de agentes
- [`agents/coordinator.md`](agents/coordinator.md)
- [`agents/game-engine.md`](agents/game-engine.md)
- [`agents/ai-gateway.md`](agents/ai-gateway.md)
- [`agents/backend-realtime.md`](agents/backend-realtime.md)
- [`agents/ui-web.md`](agents/ui-web.md)

### Runbooks (procedimientos operativos)
- [`runbooks/kickoff-agent.md`](runbooks/kickoff-agent.md)
- [`runbooks/open-pr.md`](runbooks/open-pr.md)
- [`runbooks/review-pr.md`](runbooks/review-pr.md)
- [`runbooks/close-sprint.md`](runbooks/close-sprint.md)
- [`runbooks/incident.md`](runbooks/incident.md)

### Templates reutilizables
- [`templates/task.md`](templates/task.md)
- [`templates/adr.md`](templates/adr.md)
- [`templates/challenge.md`](templates/challenge.md)
- [`templates/pr.md`](templates/pr.md)

## Reglas de oro de la documentación

1. **`state/*` es del Coordinador.** Otros agentes solo cambian el `status` de su propia task en `TASKS.md`.
2. **Decisiones nuevas → ADR en `04-tech-decisions.md`.** No se decide nada importante sin dejar rastro.
3. **Si una doc se contradice con el código actual**, abrí task de actualización antes de avanzar.
4. **No agregues docs sin actualizar este índice.**
