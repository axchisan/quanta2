# Sprint actual

> **Cómo se usa este archivo:**
> - Editado solo por el **Coordinador** al inicio (lunes) y cierre (viernes) del sprint.
> - Si necesitás registrar progreso intra-sprint, usá la sección "Updates" abajo.
> - Estados de tasks en `state/TASKS.md`. Bloqueos en `state/BLOCKERS.md`.

---

## Sprint 0 — Foundations & Documentación maestra

**Fechas:** 2026-04-18 → 2026-04-25 (1 semana)
**Fase:** 0 — Foundations
**Objetivo del sprint:** dejar lista la documentación completa del proyecto y arrancar con scaffolding del monorepo. Al cierre del sprint, cualquier agente puede leer los docs y entender qué tiene que hacer.

### Definition of Done del sprint
- [x] `/docs` completa (sección 4 del plan de trabajo): vision, architecture, roadmap, conventions, tech-decisions, multi-agent-workflow, data-model, ai-strategy, game-design, briefings agentes, state skeletons, runbooks, templates.
- [ ] Repo git inicializado, `.gitignore`, README raíz mínimo, primer commit.
- [ ] Monorepo scaffolding: pnpm workspaces, Turborepo, paquetes vacíos con `package.json` + `tsconfig.json` + `CLAUDE.md`.
- [ ] CI básica funcionando (lint + typecheck + tests vacíos).
- [ ] `pnpm install` y `pnpm dev` arrancan sin errores (aunque las apps no hagan mucho).

### Tasks asignadas

Ver `state/TASKS.md` para detalles. Resumen:

| Task | Owner | Status |
|------|-------|--------|
| T001 — Scaffolding monorepo (pnpm + Turborepo) | coordinator | pending |
| T002 — CI inicial (GitHub Actions: lint, typecheck) | coordinator | pending |
| T003 — Skeleton apps/web (Next.js 15) | ui-web | pending |
| T004 — Skeleton apps/game-server (Colyseus) | backend-realtime | pending |
| T005 — Skeleton packages/game-engine (Phaser) | game-engine | pending |
| T006 — Skeleton packages/ai-gateway | ai-gateway | pending |
| T007 — Skeleton packages/db (Supabase config + migración inicial) | backend-realtime | pending |

### Updates (anyone can append)

> Formato: `YYYY-MM-DD HH:MM — <rol>: nota corta`

- 2026-04-18 — coordinator: docs maestra completa (vision, architecture, roadmap, conventions, ADRs, workflow, data-model, ai-strategy, game-design, briefings agentes, state, runbooks, templates). Próximo: scaffolding monorepo.
- 2026-04-19 — coordinator: equipo multi-agente levantado (4 especialistas + coordinator). Los 4 especialistas hicieron check-in y quedan draftando previews de T003/T004+T007/T005/T006 mientras arranco T001. T001 pausada por B001 (Node+pnpm no instalados, esperando humano).

### Blockers activos
Ver `state/BLOCKERS.md`. **B001 [ESCALATION]** — Node + pnpm no instalados; bloquea cierre de T001 y toda la cadena P0.

---

## Sprint history (resumen)

> Después de cerrar un sprint, mover el contenido completo a `state/CHANGELOG.md` y dejar acá solo una línea de resumen.

(Vacío — Sprint 0 es el primero.)
