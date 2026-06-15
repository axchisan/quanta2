# 02 — Roadmap

## Filosofía

- **Sprints semanales.** Lunes plan, viernes demo + retro.
- **Cada fase termina con algo demostrable.** No avanzamos a la siguiente sin demo grabada.
- **Riesgos primero.** Las piezas más nuevas/complejas (IA gateway, anti-cheat server-side) se atacan temprano para descubrir problemas a tiempo.

## Fase 0 — Foundations (1-2 sprints)

**Objetivo:** infraestructura completa y minimalista, sobre la que las siguientes fases construyen sin fricción.

### Entregables

- [x] Monorepo pnpm + Turborepo configurado, los 8 paquetes/apps creados con stub mínimo
- [~] TS estricto, ESLint, Prettier funcionando — **Husky pre-commit pendiente** (B001)
- [x] Supabase self-hosted desplegado en Coolify (`db.quanta.axchisan.com`)
- [x] Esquema base + migraciones (`packages/db`): users, guest_sessions, rooms, challenges, attempts, rankings
- [x] Auth básica funcional: invitado (nickname + código de sala) end-to-end
- [x] Next.js apps/web desplegada en Coolify (`quanta.axchisan.com`) con landing + login invitado
- [x] Colyseus apps/game-server desplegado (`api.quanta.axchisan.com`) con room placeholder
- [x] AI Gateway con un proveedor LLM (Gemini) funcional + cache trivial en memoria
- [x] CI: lint + typecheck + tests unitarios bloquean PRs
- [x] `/docs` completa (este sprint la genera el coordinador-humano de arranque)

### Criterio de cierre

`pnpm install && pnpm dev` levanta todo localmente. Push a `main` despliega a `quanta.axchisan.com`. Un visitante puede abrir la URL, ingresar nickname, ver una landing y "entrar" a una sala dummy.

---

## Fase 1 — MVP jugable solo (2-3 sprints)

**Objetivo:** primera demo que tu hermana puede mostrarle al profesor.

### Entregables

- [x] Reto **Caída Libre** (Física): simulación con Phaser. Estudiante ajusta altura/gravedad, predice tiempo de caída, juego valida server-side.
- [x] Reto **Balanceo de Ecuaciones** (Química): coeficientes por especie con feedback de átomos en vivo. Validación química server-side.
- [x] Reto **Trivia Mixta** (F+Q): pregunta de opción múltiple generada por IA (Gemini) con feedback explicativo.
- [x] Sistema de puntaje (server-side): tiempo + dificultad (+ racha pendiente).
- [x] Persistencia: cada `attempt` se guarda en Supabase con resultado.
- [x] Pantalla de resultados con feedback IA y opción de reintentar.
- [x] Audio: efectos de éxito/error (Web Audio, T014) — narración TTS pendiente (falta provider).
- [ ] Sprites bajo demanda (IA) — pendiente (uso emojis/formas por ahora).
- [x] _(extra)_ Cuenta Google (OAuth) + puntaje persistente por usuario.
- [~] _(extra)_ Pulido visual "Edu-friendly" — fundación hecha (T013) + cierre (T014).

### Criterio de cierre

URL pública (`quanta.axchisan.com`) que una persona externa puede usar en celular y PC. Juega los 3 retos, recibe feedback de IA, ve su puntaje guardado al volver a entrar (si tiene cuenta) o solo en la sesión (si invitado). Demo grabada de 2 min.

---

## Fase 2 — Multiplayer en vivo (2-3 sprints)

**Objetivo:** componente social funcional. Compañeros pueden competir en vivo.

### Entregables

- [ ] Modo **Sala Kahoot**: anfitrión crea sala, comparte código, hasta 40 jugadores responden simultáneamente. Ranking en vivo entre preguntas.
- [ ] Modo **Duelo 1v1**: matchmaking simple (código directo) o invitación. Mejor de 5 retos.
- [ ] Presencia en tiempo real (quién está conectado, indicadores visuales).
- [ ] Anti-cheat server-side validado (intento de manipular puntaje desde devtools = rechazo).
- [ ] Reconexión robusta (estudiante pierde conexión 10s, vuelve a la sala).
- [ ] Lobbies y chat de sala (texto simple, moderado).

### Criterio de cierre

10 jugadores reales (probado en clase) compiten en una sala Kahoot. Ranking actualiza <500ms. Demo grabada con varios dispositivos.

---

## Fase 3 — Creador de retos con IA (2-3 sprints)

**Objetivo:** la herramienta de expansión que diferencia a Quanta de cualquier juego de trivia.

### Entregables

- [ ] UI del Creador (en `apps/web/creator`): wizard de 3-4 pasos.
- [ ] Endpoint `POST /api/ai/generate-challenge`: LLM produce reto estructurado + assets bajo demanda.
- [ ] Preview interactivo del reto antes de publicar (jugarlo como prueba).
- [ ] Edición manual post-IA (cambiar enunciado, opciones, dificultad).
- [ ] Sistema de drafts y publicaciones.
- [ ] Catálogo de retos creados por la comunidad (filtros por tema/dificultad/autor).
- [ ] Sistema de reportes (otro usuario marca un reto como inapropiado → cola de revisión).
- [ ] Generación de sprites/diagramas IA integrada al wizard.

### Criterio de cierre

Tu hermana crea un reto nuevo desde cero en menos de 5 min, lo publica, lo juega con sus amigos esa misma tarde. Demo grabada del flujo completo.

---

## Fase 4 — Cooperativo + Torneo + Pulido (3-4 sprints)

**Objetivo:** completar los modos de juego y elevar la calidad de producto.

### Entregables

- [ ] Modo **Misiones cooperativas**: 2-4 jugadores resuelven juntos retos compuestos (ej: armar un circuito por partes, balancear ecuación entre todos).
- [ ] Modo **Torneo / Liga asincrónica**: ranking semanal/mensual, badges, perfiles públicos.
- [ ] Dashboard de estadísticas personales (retos jugados, tasa de acierto por tema, evolución).
- [ ] Empaquetado APK funcional (Capacitor) + APK distribuible por WhatsApp.
- [ ] PWA instalable con manifest + service worker (juego offline para retos sin IA en runtime).
- [ ] Polish visual: transiciones, micro-animaciones (Lottie), tema oscuro.
- [ ] Polish sonoro: música adaptativa generada por IA + biblioteca de SFX consistente.
- [ ] Documentación pública (README del repo, guía para profesores).

### Criterio de cierre

Curso entero (40 alumnos) participa en torneo semanal con ranking persistente. PWA instalable funcionando. APK distribuible. Demo grabada del estado completo.

---

## Después de Fase 4 (backlog futuro, no comprometido)

- Integración con Google Classroom (sync de cursos, reportes a docentes).
- Modo "experimento virtual" con simulaciones físicas más complejas (ondas, ondas estacionarias, electromagnetismo).
- IA generativa de música procedural por tema (ej: jazz para química orgánica, electrónica para electricidad).
- Soporte para otros idiomas.
- Modo profesor con bandeja de aprobación de retos generados por estudiantes.
- Validación cruzada con segundo LLM (LLM-as-judge) para feedback educativo más profundo.
- Modo accesible: subtítulos, alto contraste, lector de pantalla.

## Tracking

- Cada fase se planifica en `state/SPRINT.md` al inicio del sprint.
- Tasks granulares en `state/TASKS.md` con owner y deps.
- Demos y retros se anotan en `state/CHANGELOG.md` y `state/DECISIONS.md`.
