# Sprint actual

> **Cómo se usa este archivo:**
>
> - Editado solo por el **Coordinador** al inicio y cierre del sprint.
> - Si necesitás registrar progreso intra-sprint, usá la sección "Updates" abajo.
> - Estados de tasks en `state/TASKS.md`. Bloqueos en `state/BLOCKERS.md`.

---

## Sprint 1 — Infra + MVP Fase 1

**Fechas:** 2026-06-14 → 2026-06-15
**Fase:** 1 — MVP jugable solo (+ deploy de infra)
**Objetivo del sprint:** desplegar la base funcional y dejar el **MVP jugable solo** completo y presentable: 3 retos con scoring server-side, cuenta opcional con puntaje persistente, y un look cuidado.

### Definition of Done del sprint

- [x] Infra desplegada en Coolify (web + game-server + Supabase self-hosted), 3 dominios con TLS.
- [x] Entrada de invitado + lobby (T008).
- [x] Los 3 retos del MVP jugables con scoring/anti-cheat server-side: Caída Libre (T009), Trivia IA (T010), Balanceo (T011).
- [x] Cuenta Google + puntaje persistente (T012).
- [x] Rediseño visual "Edu-friendly suave" (T013).
- [x] **Cierre de Fase 1**: audio SFX (Web Audio) + panel de resultado con mascota + pulido por página (T014). TTS narración y sprites IA diferidos (faltan providers).

### Tasks (resumen)

| Task                                           | Owner       | Status |
| ---------------------------------------------- | ----------- | ------ |
| T008 — Entrada invitado + Lobby                | ui-web      | done   |
| T009 — Reto Caída Libre                        | game-engine | done   |
| T010 — Reto Trivia IA + Gemini                 | ai-gateway  | done   |
| T011 — Reto Balanceo de Ecuaciones             | ui-web      | done   |
| T012 — Cuenta Google + puntajes                | ui-web      | done   |
| T013 — Rediseño Edu-friendly                   | ui-web      | done   |
| T014 — Cierre Fase 1 (audio + pulido + mobile) | ui-web      | done   |

### Avance vs roadmap

- **Fase 0** ~95% (falta Husky pre-commit). **Fase 1** ~95% — **cerrada** (TTS/sprites IA diferidos).
- **Fase 2** (multiplayer Kahoot) ~10% (lobby shell). **Fase 3** (creador IA) ~5%. **Fase 4** ~5% (solo pulido visual).
- Próximo gran hito tras Fase 1: elegir entre **Fase 2 (Kahoot real)** y **Fase 3 (creador de retos)**.

### Deuda técnica abierta

- Bloat de `challenges` por trivia (1 fila/generación); identidad de invitado para solo-play; AI gateway solo Gemini (sin fallback/rate-limit/cache Supabase); sin E2E (Playwright); Husky pre-commit.

### Updates (anyone can append)

- 2026-06-15 — coordinator: Fase 0 + infra + 5 features de Fase 1 (T008–T013) cerradas y en prod. Docs de estado actualizados. Arranca T014 (cierre Fase 1: audio + pulido + mobile).
- 2026-06-15 — coordinator: T014 cierra Fase 1 (~95%). **Arranca Fase 2** con T015 — Sala Kahoot multiplayer en Colyseus (estado authoritative + preguntas IA + anti-cheat), verificada end-to-end con cliente Node contra Gemini real.

### Blockers activos

Ver `state/BLOCKERS.md`. **(Ninguno.)**

---

## Sprint history (resumen)

- **Sprint 0 — Foundations & Documentación maestra** (2026-04-18 → 2026-04-25): docs maestra completa + scaffolding del monorepo (T001–T007) + CI + esquema Supabase. Detalle en `state/CHANGELOG.md`.
