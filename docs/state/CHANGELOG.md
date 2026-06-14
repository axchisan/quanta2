# Changelog

> Bitácora cronológica de qué se cerró por sprint. Mantiene la historia visible para quien llega al proyecto y para retros.
>
> **Coordinador** lo actualiza al cierre de cada sprint o al mergear features grandes.
> Versionado semántico cuando se llegue a publicar releases.

---

## [Unreleased]

### Sprint 0 — Foundations & Documentación maestra (2026-04-18 → 2026-04-25)

#### Added
- 📚 Documentación maestra completa del proyecto en `docs/`:
  - `00-vision.md` — visión, audiencia, criterios de éxito
  - `01-architecture.md` — stack, diagramas, flujos
  - `02-roadmap.md` — fases 0-4 con criterios de cierre
  - `03-conventions.md` — naming, commits, branches, estilo
  - `04-tech-decisions.md` — 10 ADRs iniciales
  - `05-multi-agent-workflow.md` — workflow tmux + git
  - `06-data-model.md` — esquema Supabase + RLS
  - `07-ai-strategy.md` — proveedores IA, fallback, moderación
  - `08-game-design.md` — mecánicas, retos MVP, scoring
  - `agents/{coordinator,game-engine,ai-gateway,backend-realtime,ui-web}.md`
  - `state/{SPRINT,TASKS,DECISIONS,BLOCKERS,CHANGELOG}.md`
  - `runbooks/{kickoff-agent,open-pr,review-pr,close-sprint,incident}.md`
  - `templates/{task,adr,challenge,pr}.md`
- 🏗️ CLAUDE.md raíz con guía rápida.

#### Changed
- (En progreso) Scaffolding del monorepo.

#### Fixed
- (Nada todavía.)

---

## Plantilla por sprint

```markdown
### Sprint <n> — <nombre> (YYYY-MM-DD → YYYY-MM-DD)

#### Added
- ...

#### Changed
- ...

#### Fixed
- ...

#### Removed
- ...
```
