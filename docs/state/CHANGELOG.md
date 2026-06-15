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

#### Added (cierre)

- 🏗️ Scaffolding completo del monorepo (T001–T007): `apps/{web,game-server}`, `packages/{ui,types,game-engine,ai-gateway,db,config}`, CI (lint·typecheck·test·build), esquema Supabase (8 tablas + RLS) y tipos generados.

---

### Sprint 1 — Infra + MVP Fase 1 (2026-06-14 → 2026-06-15)

#### Added

- ☁️ **Infra desplegada en Coolify** (VPS Contabo): web (`quanta.axchisan.com`), game-server (`api.quanta.axchisan.com`), Supabase self-hosted (`db.quanta.axchisan.com`). Dockerfiles verificados; runbook en `infra/coolify.md`.
- 🚪 **T008 — Entrada invitado + Lobby**: crear/unirse a sala (nickname + código) + presencia en vivo (Supabase Realtime).
- 🪂 **T009 — Reto Caída Libre** (Física): escena Phaser + scoring server-side (`t=√(2h/g)`, tol 10%).
- 🧠 **T010 — Reto Trivia IA** (F+Q): provider Gemini real (`gemini-2.5-flash`) + generación/validación con anti-cheat.
- ⚗️ **T011 — Reto Balanceo de Ecuaciones** (Química): validación química server-side (balance + forma reducida).
- 🔐 **T012 — Cuenta Google (OAuth) + puntaje persistente**: atribución de intentos por JWT + página "Mis puntajes".
- 🎨 **T013 — Rediseño "Edu-friendly suave"**: theme pastel, componentes (Card/Badge), fuentes redondeadas, mascota átomo, hub `/jugar`.
- 🔊 **T014 — Cierre Fase 1**: audio SFX (Web Audio) + pulido fino por página + responsive mobile.

#### Changed

- AI Gateway: provider Gemini real reemplaza los stubs (T010).
- `@quanta/game-engine` + `@quanta/ai-gateway`: imports relativos sin extensión (compat webpack/Next).

#### Fixed

- Limpieza de datos de prueba en prod (conservando la cuenta del usuario).

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
