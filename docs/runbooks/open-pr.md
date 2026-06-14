# Runbook — Abrir un PR

> Aplicás este procedimiento cuando terminás una task y estás listo para que el Coordinador revise.

## Pre-flight checks

Antes de abrir el PR, verificá:

- [ ] Todos los cambios están commiteados (`git status` limpio).
- [ ] Commits siguen Conventional Commits (`feat(scope): ...`).
- [ ] `pnpm lint` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa (al menos para tu paquete).
- [ ] Si tocaste UI: probaste manualmente en browser.
- [ ] Si tocaste DB: migración aplica limpio en DB fresca (`pnpm db:reset && pnpm db:migrate`).
- [ ] Actualizaste docs si el cambio afecta arquitectura/contrato público.
- [ ] CLAUDE.md del paquete refleja los cambios (si aplica).

## Paso 1 — Push de la rama

```bash
git push -u origin feat/<rol>-<task-id>-<slug>
```

## Paso 2 — Crear el PR

Usá `gh pr create` con el template de `docs/templates/pr.md`:

```bash
gh pr create \
  --base main \
  --head feat/<rol>-<task-id>-<slug> \
  --title "<type>(<scope>): <subject>" \
  --body "$(cat <<'EOF'
## Summary
<1-3 bullets concisos de qué hace este PR>

## Task
Closes T<id> — ver `docs/state/TASKS.md`.

## Changes
- <paquete/área>: <qué>
- ...

## Testing
- [ ] Unit tests añadidos/actualizados
- [ ] Integration tests (si aplica)
- [ ] E2E (si aplica)
- [ ] Probado manualmente en <dispositivo/entorno>

## Screenshots / Videos
<si aplica — UI o animaciones>

## Docs
- [ ] docs/* actualizado si el cambio afecta arquitectura/contrato
- [ ] CLAUDE.md del paquete actualizado si aplica
- [ ] state/DECISIONS.md si tomé decisiones in-flight

## Checklist
- [ ] Tests verdes localmente
- [ ] typecheck y lint OK
- [ ] No toqué áreas fuera de mi rol (o lo notifico acá)
- [ ] No hay secrets/API keys en el diff

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --label "rol:<rol>" \
  --label "task:T<id>"
```

**Título del PR** = subject del commit principal. Corto, imperativo, con scope:

- `feat(game-engine): add falling-body physics scene`
- `fix(ai-gateway): retry on Gemini 429 responses`
- `chore(ci): cache pnpm store between runs`

## Paso 3 — Actualizar la task

Editá `docs/state/TASKS.md`:

```diff
- **Status:** in_progress
+ **Status:** review
+ **PR:** <link al PR>
```

Commit esa actualización en `main` directo (es doc, no código):

```bash
git checkout main && git pull
# editar state/TASKS.md
git add docs/state/TASKS.md
git commit -m "docs(tasks): T<id> → review"
git push
```

*(Nota: si el Coordinador prefiere que TASKS.md solo se edite vía PR, preguntale — la convención puede ajustarse.)*

## Paso 4 — Esperar review

- El Coordinador recibirá notificación (si tiene `gh` configurado).
- Timeout típico: mismo día o siguiente.
- Si pasa >24h sin respuesta: ping en `state/BLOCKERS.md`.

## Paso 5 — Atender cambios solicitados

Si el Coordinador deja `request changes`:

1. Leé todos los comentarios.
2. Aplicá los cambios en la misma rama.
3. `git push` — el PR se actualiza automáticamente.
4. Respondé a cada comentario explicando qué cambiaste.
5. Re-requestá review (`gh pr review --request <coordinador>` si existe).

## Paso 6 — PR mergeado

- Coordinador mergea (squash) y borra la rama.
- Tu task pasa a `done`.
- Empezá la siguiente (volvé al Paso 5 del runbook `kickoff-agent.md`).

## Anti-patrones

- ❌ PR con título genérico (`"Fix stuff"`).
- ❌ PR sin link a la task.
- ❌ PR >500 líneas diff (split en sub-PRs).
- ❌ Mezclar feat + fix + refactor en un solo PR.
- ❌ Commits "WIP" sin squash (aunque el merge es squash, igual limpiá antes).
- ❌ Bypassear checks con `--no-verify`.
- ❌ Pushear secrets/keys (usá `gitleaks` local si podés).
