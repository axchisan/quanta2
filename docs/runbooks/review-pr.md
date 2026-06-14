# Runbook — Revisar un PR (Coordinador)

> Este runbook es **exclusivo del Coordinador**. Define cómo se revisan y mergean PRs.

## Paso 1 — Triage inicial

```bash
gh pr list --state open
gh pr view <number>
```

Verificá rápido:

- ¿Está asociado a una task en `state/TASKS.md`?
- ¿El title sigue Conventional Commits?
- ¿Tiene descripción no-trivial?

Si algo de esto falta: dejá comentario pidiendo ajuste, sin profundizar.

## Paso 2 — CI status

```bash
gh pr checks <number>
```

- **CI rojo:** no revisás todavía. Comentá pidiendo que lo arregle primero.
- **CI verde:** proceder.

## Paso 3 — Scope

Verificá que el PR modifica solo archivos permitidos para el rol:

- `rol:game-engine` → `packages/game-engine/**` principalmente.
- `rol:ai-gateway` → `packages/ai-gateway/**` y `apps/web/app/api/ai/**`.
- `rol:backend-realtime` → `apps/game-server/**`, `packages/db/**`, Edge Functions.
- `rol:ui-web` → `apps/web/**` (excepto `api/ai/**`), `packages/ui/**`.
- `rol:coordinator` → `docs/**`, CI, infra, cross-package refactors.

**Archivos cross-cutting permitidos si el PR los justifica:**
- `packages/types/**` (cualquier rol puede modificar si su task lo requiere, debe mencionarlo).
- `packages/config/**` (solo coordinator o con PR explícito).

Si hay cambios fuera del scope: comentá pidiendo split o justificación.

## Paso 4 — Code review

### Checklist técnico
- [ ] **TS estricto:** sin `any`, sin `as` injustificado.
- [ ] **Zod:** input externo validado.
- [ ] **Tests:** unit tests añadidos para lógica nueva; integration para endpoints/queries.
- [ ] **Naming:** consistente con `docs/03-conventions.md`.
- [ ] **Comentarios:** ausentes o solo para WHY no-obvio.
- [ ] **Imports:** ordenados, sin no usados.
- [ ] **Performance:** no hay loops N+1 obvios, no hay queries sin límite, no hay re-renders evitables.
- [ ] **Seguridad:**
  - No secrets en código/docs.
  - No SQL injection (queries parametrizadas).
  - No XSS (sanitización/escape en JSX).
  - RLS policies correctas si tocó DB.
  - Cliente no recibe `solution` de challenges.

### Checklist funcional
- [ ] **Criterio de aceptación de la task** se cumple (leé la task en `state/TASKS.md`).
- [ ] **Breaking changes** no introducidos sin ADR.
- [ ] **Backwards compatibility** si aplica (ej: migración DB reversible).
- [ ] **Docs:** actualizadas si el contrato público cambió.
- [ ] **CLAUDE.md** del paquete actualizado si aplica.

### Checklist UX (si PR toca UI)
- [ ] Loading states.
- [ ] Error states.
- [ ] Empty states.
- [ ] Accesible (focus visible, aria labels).
- [ ] Mobile-friendly.

## Paso 5 — Tipos de review

### Aprobar (LGTM)
Todo bien, mergeable.

```bash
gh pr review <number> --approve --body "LGTM. Ver Paso 6."
```

### Pedir cambios
Hay issues bloqueantes.

```bash
gh pr review <number> --request-changes --body "$(cat <<'EOF'
Pedidos bloqueantes:
- <comentario 1>
- <comentario 2>

Nice-to-have (no bloquea):
- <comentario>
EOF
)"
```

### Solo comentar
Tenés observaciones pero no bloquean (ej: dudas, sugerencias menores).

```bash
gh pr review <number> --comment --body "..."
```

## Paso 6 — Merge

Solo mergeás si:

- CI verde.
- Al menos tu approval.
- Sin comentarios `unresolved` críticos.

```bash
gh pr merge <number> --squash --delete-branch
```

**Subject del commit squash** = title del PR. Body del commit = descripción resumida.

## Paso 7 — Post-merge

Actualizá `state/TASKS.md`:
```diff
- **Status:** review
- **PR:** <link>
+ **Status:** done
+ **Merged:** YYYY-MM-DD
```

Si el PR desbloqueó otras tasks (`blockedBy: T<x>`):
- Cambialas de `blocked` a `pending`.
- Opcional: comentá en el PR original: "Desbloquea T<y>, T<z>".

Si el PR cerró un hito importante, anotá en `state/CHANGELOG.md` bajo el sprint actual.

## Rejection templates

### Scope inapropiado
> Este PR cambia archivos fuera de tu rol (`packages/X/`). Split por favor: un PR para tu rol y otro asignado a `<otro-rol>` vía task nueva.

### CI rojo
> CI falla en `<check>`. Revisá logs (`gh pr checks`) y arreglá antes de que lo mire.

### Sin tests
> No veo tests para la lógica nueva en `<archivo>`. Agregá al menos casos del happy path y un edge case obvio.

### Decisión no documentada
> Cambio de arquitectura/stack requiere ADR en `docs/04-tech-decisions.md`. Agregala antes de mergear.

## Anti-patrones del Coordinador

- ❌ Mergear PRs sin revisar "porque urge".
- ❌ Aprobar sin leer el diff completo.
- ❌ No chequear CI.
- ❌ Dejar PRs abiertos >3 días sin triage.
- ❌ Mergear cambios que rompen otros paquetes (sabelo por `pnpm build` local si el CI no lo cubre).
- ❌ Tolerar secrets/keys en código (rechazo inmediato + rotación).
