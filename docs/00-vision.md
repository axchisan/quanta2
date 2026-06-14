# 00 — Visión

## Quanta en una frase

**Un juego web/móvil interactivo y social para que estudiantes de colegio aprendan Física y Química resolviendo retos visuales, con IA generativa que personaliza la experiencia y permite crear nuevos retos sin tocar código.**

## Origen

El profesor de la hermana del usuario (que termina colegio este año, planea estudiar Psicología) le pidió crear un "juego" para aprender Física y Química, sin más especificaciones. El usuario es desarrollador profesional y va a construirlo por ella, aprovechando para entregar algo significativamente superior a un trabajo escolar promedio.

## Problemas que resuelve

| Problema | Cómo lo aborda Quanta |
|----------|-----------------------|
| Aprender Física/Química desde libros es árido y abstracto | Retos interactivos con simulaciones visuales (caída libre, balanceo de ecuaciones, vectores) |
| Los juegos educativos típicos se vuelven monótonos | Herramienta integrada para crear retos nuevos con IA, sin programación |
| Estudiar solo es desmotivante | Salas multijugador, ranking, duelos, modos cooperativos y torneos asincrónicos |
| Las plataformas comerciales son de pago o limitadas | 100% gratis, self-hosted, sin trackers, datos en VPS propio |
| Feedback "respuesta correcta/incorrecta" no enseña | LLM analiza la respuesta y explica el error reforzando el concepto |

## Audiencia

- **Primaria:** estudiantes de colegio (14-18 años) en Colombia/LATAM. Idioma: español neutro.
- **Secundaria:** profesores que quieran usar el juego como herramienta de clase (proyectar sala estilo Kahoot).
- **Creadora de retos:** la hermana del usuario y compañeros que quieran extender el juego con sus propios retos.

## Diferenciadores clave

1. **IA generativa de primer nivel** — no es un juego de trivia con preguntas hardcodeadas. La IA genera retos, valida respuestas, crea sprites/diagramas y narra audio según el contexto del estudiante.
2. **Doble fase: pre-definido + extensible** — viene jugable desde el día 1 y crece infinitamente con la herramienta de creación.
3. **Multiplayer real con anti-cheat server-side** — los rankings significan algo porque no se pueden falsificar desde devtools.
4. **Cero costo recurrente** — todo el stack vive en VPS propio + free tiers de IA. Sin lock-in con SaaS.
5. **Calidad de producto** — animaciones, sonido, polish visual. Se siente como un juego, no como una tarea.

## Criterios de éxito

### Mínimo (Fase 1 / MVP)
- [ ] La hermana puede compartir una URL con su profesor y demostrarle 3 retos jugables en celular o PC.
- [ ] Los retos tienen feedback de IA (no solo "correcto/incorrecto").
- [ ] La experiencia visual y sonora se siente cuidada (no parece un prototipo de hackathon).

### Medio (Fase 2-3)
- [ ] Compañeros de clase entran a una sala y compiten en vivo (≥10 jugadores estables).
- [ ] La hermana crea un reto nuevo con la herramienta de IA en menos de 5 minutos y lo juega con sus amigos esa misma tarde.

### Ambicioso (Fase 4)
- [ ] Curso entero (40 alumnos) participa en un torneo semanal con ranking persistente.
- [ ] Otro profesor ve el juego y pide usarlo en su clase.
- [ ] Quanta sigue funcionando 6 meses después sin intervención técnica del usuario.

## Lo que NO es Quanta

- **No es un curso completo de Física/Química.** Es complemento práctico, no reemplazo del libro/profesor.
- **No es un juego AAA.** Estética 2D limpia, no fotorrealismo 3D.
- **No es una plataforma comercial.** No habrá modelo freemium, suscripciones ni anuncios.
- **No es solo móvil ni solo desktop.** Funciona en cualquier navegador moderno e instalable como PWA/APK.
- **No reemplaza al profesor.** La IA da feedback, pero el rol pedagógico humano sigue siendo central.

## Restricciones explícitas

- **Privacidad:** estudiantes son menores. Cero PII obligatoria, telemetría anónima, datos en VPS propio (`coolify.axchisan.com`).
- **Costo:** $0 recurrentes. Todo en free tiers o self-hosted.
- **Tiempo:** desarrollo a lo largo de varias semanas, en sprints semanales. La hermana termina colegio este año, idealmente la herramienta está lista durante el período activo de clases.
- **Idioma:** todo en español neutro. La IA genera contenido en español.
