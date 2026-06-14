# Template — ADR (Architectural Decision Record)

> Usá este template cuando tomás una decisión de arquitectura, stack o convención que afecte a más de un paquete o que sea difícil de revertir. Las ADRs se acumulan en `docs/04-tech-decisions.md` (una sección por ADR).

## Formato

```markdown
## ADR-<nnn> — <título corto>

- **Fecha:** YYYY-MM-DD
- **Estado:** propuesta | aceptada | rechazada | reemplazada por ADR-<m> | obsoleta
- **Autor:** <rol>
- **Revisores:** <roles afectados>

### Contexto

<2-5 frases que expliquen el problema, qué está en juego, qué restricciones tenemos (tiempo, costo, skills, infra). Sin contexto, una decisión futura no sabe si esta sigue siendo válida.>

### Decisión

<Lo que decidimos hacer. Sé concreto: nombres de librerías/versiones, patrones, límites.>

### Alternativas consideradas

1. **<opción A>** — <pros> / <contras> / por qué no.
2. **<opción B>** — <pros> / <contras> / por qué no.
3. **<opción elegida>** — <pros> / <contras> / por qué sí.

### Consecuencias

**Positivas:**
- <consecuencia 1>

**Negativas / trade-offs:**
- <consecuencia 1>

**Neutras:**
- <consecuencia 1>

### Acciones derivadas

- [ ] <task que esta decisión habilita/requiere>
- [ ] Actualizar `docs/01-architecture.md` si aplica
- [ ] Actualizar CLAUDE.md del paquete afectado

### Referencias

- Links a docs, benchmarks, issues, discusiones previas.
```

## Reglas

- Una ADR por decisión. No combines decisiones ortogonales.
- ADRs son **inmutables en su contenido original**. Si cambiás de idea, escribí una ADR nueva que reemplace a la anterior y cambiá el estado de la vieja a `reemplazada por ADR-<m>`.
- Las decisiones triviales (naming de una variable, refactor local) **no necesitan ADR**. Usá `state/DECISIONS.md` para decisiones in-flight de menor impacto.
- Si estás en duda: si la decisión afectara la vida de otro agente en 3 meses cuando vos ya no estés mirando ese código, escribí ADR.

## Ejemplo resumido

```markdown
## ADR-004 — Colyseus para multiplayer authoritative, Supabase Realtime para presencia

- **Fecha:** 2026-04-18
- **Estado:** aceptada
- **Autor:** coordinator

### Contexto

Necesitamos multiplayer para salas Kahoot (40 jugadores) y duelos 1v1. Opciones en free tier: Supabase Realtime solo, Colyseus self-hosted, PartyKit, Liveblocks.

### Decisión

Híbrido: Supabase Realtime para presencia/broadcast/ranking en vivo; Colyseus self-hosted para retos competitivos con validación authoritative.

### Alternativas consideradas

1. **Solo Supabase Realtime** — simple, pero no authoritative: cliente podría hacer trampa en duelos.
2. **Solo Colyseus** — authoritative, pero sobrecostos para presencia y rankings que no requieren state machine.
3. **Híbrido (elegida)** — cada herramienta hace lo que hace bien; mayor complejidad pero mejor fit funcional.

### Consecuencias

**Positivas:** anti-cheat robusto, latencia baja en presencia.
**Negativas:** dos protocolos para integrar, más infra para mantener (Colyseus en Coolify).

### Acciones derivadas

- [ ] T005 — scaffold Colyseus server
- [ ] T006 — integración cliente Supabase Realtime para rooms
```

## Anti-patrones

- ❌ ADR sin contexto (solo la decisión). Un lector futuro no puede evaluarla.
- ❌ ADR sin alternativas. Si no pensaste alternativas, no tomaste una decisión: elegiste lo primero que se te ocurrió.
- ❌ Editar una ADR aceptada. Escribí una nueva que la reemplace.
- ❌ ADR para cada PR. Reservalas para decisiones con alcance arquitectónico.
