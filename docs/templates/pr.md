# Template — Pull Request

> Copiá este bloque como body de tu PR (lo usa `gh pr create --body`, ver `runbooks/open-pr.md`). Adaptalo a tu cambio — no dejes secciones vacías con placeholders: si no aplica, borrala.

## Formato

```markdown
## Summary

<1-3 bullets concisos de QUÉ hace este PR y POR QUÉ (no el cómo técnico, eso está en el diff).>

- <bullet 1>
- <bullet 2>

## Task

Closes T<id> — ver `docs/state/TASKS.md`.

<Si el PR cierra más de una task, listalas todas. Si no cierra ninguna (ej: hotfix), explicá por qué.>

## Changes

<Lista por paquete/área. Un bullet por cambio lógico, no por archivo.>

- `packages/game-engine`: <qué cambió>
- `apps/web`: <qué cambió>
- `docs/`: <qué cambió>

## Testing

- [ ] Unit tests añadidos/actualizados (`<paquete>/src/**/*.test.ts`)
- [ ] Integration tests (si aplica)
- [ ] E2E (si aplica)
- [ ] Probado manualmente en: <dispositivo/entorno, ej: iPhone SE 2020 Safari, Chrome desktop>

## Screenshots / Videos

<Si tocaste UI o animaciones: capturas antes/después o un GIF corto. Si no aplica, borrá esta sección.>

## Docs

- [ ] `docs/*` actualizado si el cambio afecta arquitectura/contrato público
- [ ] `CLAUDE.md` del paquete actualizado si aplica
- [ ] `state/DECISIONS.md` si tomé decisiones in-flight
- [ ] ADR en `docs/04-tech-decisions.md` si fue decisión arquitectónica

## Breaking changes

<Lista todo lo que rompe compatibilidad. Si no hay, escribí "Ninguno".>

- <API cambió de X a Y>
- <Campo removido de tabla Z>

## Migration notes

<Si hay cambios de schema o config que otros agentes/entornos necesitan aplicar.>

- Correr `pnpm db:migrate` después del merge.
- Agregar `FOO_API_KEY` a secretos de Coolify.

## Checklist

- [ ] `pnpm lint` verde localmente
- [ ] `pnpm typecheck` verde localmente
- [ ] `pnpm test` verde en mi paquete
- [ ] No toqué áreas fuera de mi rol (o lo notifico acá abajo)
- [ ] No hay secrets / API keys en el diff
- [ ] Conventional Commits en todos los commits
- [ ] Diff < 500 líneas (si no, justificar abajo)

## Notes para el reviewer

<Heads-ups: partes del diff que querés que mire con atención, decisiones que dudaste, tradeoffs aceptados conscientemente. Hacele la vida fácil al Coordinador.>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Reglas de título (subject del PR)

Formato: `<type>(<scope>): <subject>` — Conventional Commits.

- `type`: feat | fix | chore | docs | refactor | test | perf | build | ci | style
- `scope`: paquete o área (`game-engine`, `ai-gateway`, `web`, `db`, `ci`, `docs`)
- `subject`: imperativo, minúscula inicial, sin punto final, <70 chars

### Ejemplos buenos

- `feat(game-engine): add falling-body physics scene`
- `fix(ai-gateway): retry on Gemini 429 responses`
- `chore(ci): cache pnpm store between runs`
- `docs(architecture): document hybrid realtime stack`
- `refactor(db): extract rankings query into materialized view`

### Ejemplos malos

- ❌ `Fix stuff` (vago, sin scope, sin type)
- ❌ `feat: massive update to game engine and ai gateway and ui` (multi-scope = split)
- ❌ `WIP` (no mergeable; si es draft, abrilo como draft PR)
- ❌ `Fixed the bug.` (pasado + punto final)

## Anti-patrones generales

- ❌ PR sin link a task.
- ❌ PR > 500 líneas diff sin justificación (split).
- ❌ Mezclar feat + fix + refactor en un solo PR.
- ❌ Secciones del template con placeholders sin llenar (`<qué cambió>` publicado como está).
- ❌ Checklist con todo tildado sin haber corrido los checks.
- ❌ "LGTM" auto-approve sin revisar diff completo.
