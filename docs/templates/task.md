# Template — Task

> Usá este template al crear una nueva task en `docs/state/TASKS.md`. Cada task vive como bloque markdown en esa cola.

## Formato

```markdown
### T<nnn> — <título corto imperativo>

- **Owner:** <rol | humano>
- **Status:** pending | in_progress | review | blocked | done | cancelled
- **Priority:** P0 (bloqueante) | P1 (alta) | P2 (media) | P3 (nice-to-have)
- **Sprint:** <n>
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD
- **BlockedBy:** T<x>, T<y> | (ninguno)
- **PR:** <link cuando exista>

**Descripción**

<2-5 frases que expliquen qué hay que hacer y por qué. Enfocate en el "qué" y el "para qué". El "cómo" queda a criterio del agente salvo que haya decisiones de arquitectura que fijar.>

**Criterio de aceptación**

- [ ] <condición objetiva 1>
- [ ] <condición objetiva 2>
- [ ] Tests verdes (unit / integration según aplique)
- [ ] Docs actualizadas si el contrato público cambió
- [ ] CLAUDE.md del paquete actualizado si aplica

**Archivos esperados (orientativo)**

- `packages/<x>/src/<archivo>.ts`
- `apps/web/app/<ruta>/page.tsx`
- ...

**Notas**

<enlaces, referencias, gotchas conocidos, decisiones previas relevantes>
```

## Reglas de ID

- `T<nnn>` = task de sprint activo (ej: `T042`).
- `B<nnn>` = backlog (aún no priorizada en sprint).
- `I<YYYYMMDD>-<slug>` = incidente (ver `runbooks/incident.md`).
- Los IDs **no se reciclan**. Si cancelás una task, su número queda marcado `cancelled` y ya.

## Ejemplo completo

```markdown
### T012 — Escena Phaser: caída libre interactiva

- **Owner:** game-engine
- **Status:** pending
- **Priority:** P1
- **Sprint:** 2
- **Created:** 2026-04-22
- **Updated:** 2026-04-22
- **BlockedBy:** T008 (asset loader base)
- **PR:** —

**Descripción**

Primer reto jugable del MVP. El usuario ajusta altura/gravedad con sliders, dispara la simulación y ve el cuerpo caer con trail visual. El motor calcula tiempo de caída y velocidad final; el jugador debe adivinar uno de los dos valores antes de que termine la animación.

**Criterio de aceptación**

- [ ] Escena `FallingBodyScene` bootea desde `<GameCanvas challengeId="kin-free-fall-01" />`.
- [ ] Sliders de altura (1–100 m) y gravedad (1.6 / 9.8 / 24.8 m/s²) funcionan en mobile y desktop.
- [ ] Trail renderiza a 60fps en un iPhone SE 2020.
- [ ] Resultado (tiempo, velocidad final) se emite vía evento `challenge:resolved` para que UI-Web lo postee al backend.
- [ ] Tests unitarios de la fórmula física + test visual snapshot de la escena.

**Archivos esperados**

- `packages/game-engine/src/scenes/FallingBodyScene.ts`
- `packages/game-engine/src/physics/kinematics.ts`
- `packages/game-engine/src/scenes/__tests__/FallingBodyScene.test.ts`

**Notas**

Ver `docs/08-game-design.md` §"Falling Body" para fórmulas y payload.
```

## Anti-patrones

- ❌ Tasks vagas ("mejorar rendimiento"). Hacé que el criterio de aceptación sea chequeable.
- ❌ Tasks gigantes (>1 semana). Split en sub-tasks con `BlockedBy`.
- ❌ Mezclar roles en una misma task. Una task = un rol = una rama = un PR.
- ❌ Cambiar el owner sin avisar al Coordinador.
