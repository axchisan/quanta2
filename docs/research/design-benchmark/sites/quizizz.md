# Quizizz — Benchmark de diseño

> **Fuente de datos:** análisis basado en conocimiento documentado del producto Quizizz
> (web `quizizz.com`, app de juego del jugador y panel de host) y fuentes públicas listadas
> al final. ⚠️ En este entorno el acceso de red (WebSearch/WebFetch/curl) estuvo **bloqueado**,
> por lo que los valores HEX y de timing marcados con `≈` son **aproximados** y deben
> **re-validarse** con un pase de Playwright + `getComputedStyle` antes de tomarlos como tokens.
> Ningún asset con copyright de Quizizz se incrusta ni se comitea: solo se analizan patrones.

Quizizz es, junto con Kahoot, el otro gran referente de "quiz gamificado para el aula". Su
diferenciador de diseño frente a Kahoot es: **paleta más cálida/morada**, **memes y feedback
humorístico entre preguntas**, **power-ups que alteran la mecánica**, **avatares coleccionables
por jugador**, y un fortísimo **modo asincrónico ("homework"/práctica)** además del modo en vivo.

---

## 1. Design tokens

### Paleta
La marca gira alrededor de un **morado/violeta** como color primario, sobre fondos claros, con
acentos de alta saturación para gamificación. Aproximaciones (re-validar):

| Rol | HEX `≈` | Notas |
| --- | --- | --- |
| Primario (brand purple) | `#8854C0` / `#6A3FB5` | Botones primarios, header de marca, "Quizizz purple" |
| Morado oscuro / texto sobre claro | `#4E367C` | Títulos, énfasis |
| Fondo claro | `#FFFFFF` / `#F2F4F8` | Superficies y dashboard |
| Fondo de juego (gradiente) | morado→violeta | Pantallas de gameplay del jugador |
| Acentos de respuesta (4 colores) | rojo/azul/amarillo/verde saturados | Las cards de opción A/B/C/D |
| Verde acierto | `#26890C`–`#52C41A` `≈` | Estado correcto |
| Rojo error | `#E21B3C`–`#F5222D` `≈` | Estado incorrecto |
| Dorado/amarillo XP & streak | `#FFC400` `≈` | Puntos, racha, power-ups |

Patrón clave: el **morado es identidad** (no es uno de los 4 colores de respuesta), a diferencia
de Kahoot donde el azul/morado del fondo sí compite. Las 4 respuestas usan colores **+ formas/
iconos distintos** (no solo color) → ayuda a daltónicos.

### Tipografía
- Históricamente Quizizz usó **"Quicksand"** (geométrica redondeada, friendly) para titulares,
  muy alineada con el tono lúdico; el cuerpo combina con una sans neutra (tipo **Inter/Open Sans**).
- Pesos: titulares **700 (Bold)**, cuerpo **400/500**. La redondez de Quicksand es lo que da el
  aire "amable" — es un patrón directamente transferible a Quanta (que ya busca "edu-friendly suave").

### Radios, sombras, formas
- **Radios generosos** (`≈ 12–20px` en cards, botones tipo "pill" `999px` en CTAs de juego).
- **Sombras suaves y elevadas** en cards de respuesta (drop shadow difusa, sensación de botón
  físico "presionable").
- Las cards de respuesta tienen **borde inferior más oscuro** (efecto "3D chunky button"),
  patrón compartido con Duolingo/Blooket: refuerza la affordance de "esto se aprieta".

---

## 2. ★ Avatares / personajes del jugador

Este es uno de los ejes más fuertes de Quizizz y muy transferible.

- **Avatares coleccionables, no constructor modular.** A diferencia de un "avatar builder" por
  partes (Bitmoji/Blooket-pets), Quizizz ofrece una **galería de personajes prediseñados**
  (animales, criaturas, objetos antropomorfos con cara) que el jugador **elige/desbloquea**.
- **Estilo:** flat/soft, formas redondeadas (blob), cara expresiva con ojos grandes; cada avatar
  es una pieza autocontenida con personalidad.
- **Estados / uso:**
  - En el **lobby**: el avatar aparece junto al nombre cuando el jugador entra (igual que Kahoot,
    pero con personaje en vez de solo nick).
  - En el **leaderboard** intermedio: el avatar acompaña cada fila de ranking.
  - **Feedback emocional ligero:** el peso emocional del acierto/error lo lleva sobre todo el
    **meme** (ver §4), no tanto una animación rig del avatar — el avatar es más "identidad/skin"
    que "actor animado" (contraste útil vs. Duolingo, donde el personaje SÍ actúa).
- **Desbloqueo por progreso:** avatares nuevos como recompensa → engancha la colección.

**Para Quanta:** el `AtomMascot` actual puede evolucionar hacia un **set de skins/criaturas
elegibles** (no solo una mascota fija), reusadas en lobby + leaderboard + perfil.

---

## 3. Lenguaje de ilustración

- **Flat moderno con esquinas redondeadas**, paleta saturada pero no chillona, mucho aire.
- Ilustraciones de marketing con personajes "blob" amistosos y escenas de aula/celebración.
- Iconografía consistente, line/filled mezclado, peso medio.
- En gameplay el protagonismo visual lo roban: (a) el **morado de fondo**, (b) los **4 colores de
  respuesta**, (c) los **memes/GIFs** entre pregunta y pregunta.

---

## 4. Motion & micro-interacciones — ★ los memes/feedback divertido

Este es **el** rasgo distintivo de Quizizz y el más copiable a bajo costo.

- **Meme feedback entre preguntas:** tras responder, se muestra una **imagen tipo meme** (o GIF)
  con copy gracioso — uno para **acierto** y otro para **error**. Quizizz incluso permite a los
  profes **crear/elegir sets de memes** ("Meme sets") personalizados.
  - Efecto UX: convierte el momento de feedback (que en otros quizzes es seco) en un **micro-
    premio emocional**, baja la frustración del error (te ríes en vez de castigarte) y mantiene
    el ritmo. Duración corta (`≈ 1–2 s`) para no romper el flujo.
- **Reveal de respuesta:** la opción correcta se resalta en **verde** y la elegida-incorrecta en
  **rojo**, con un pequeño "pop"/scale-in.
- **Contador / barra de tiempo** por pregunta con animación; puntuación que **sube animada**
  (count-up de puntos, refuerzo dopamínico).
- **Leaderboard animado** entre rondas: las filas **se reordenan con transición** (los jugadores
  ven cómo suben/bajan posiciones) — muy efectivo para tensión competitiva.
- **Confeti / celebración** al cerrar el juego para los top.
- Easings tipo `ease-out`/spring suave, escalas `scale(0.96→1)` en tap de botones.

---

## 5. Sonido & feedback

- **Música de fondo opcional** durante el juego y SFX de **acierto/error**, **tick** del timer y
  **fanfarria** final. El host puede activar/silenciar.
- El SFX está **acoplado al meme**: el conjunto (sonido + meme + color) es lo que produce el
  "momento feedback". Sin sonido, el meme sostiene la carga emocional (importante para aulas con
  audio apagado → diseño que **no depende solo del audio**).

---

## 6. Gamificación — ★ power-ups, redemption, leaderboard, XP

### Power-ups (el otro gran diferenciador)
Quizizz introduce **power-ups** que el jugador **gana al responder bien/rápido** y se activan
automáticamente o quedan disponibles, alterando la mecánica. Familias típicas (nombres/efectos
documentados públicamente; re-validar):

- **Power-ups de puntos:** multiplicadores (2x), bonus por racha.
- **"Streak"** acumulada que sube el multiplicador con aciertos consecutivos.
- **Power-ups de ataque/defensa entre jugadores** (en modos sociales): congelar/ralentizar al
  rival, robar puntos, escudos. Convierten el quiz en algo más cercano a un party-game.
- Aparecen con **animación llamativa** y feedback de sonido propio.

> Patrón clave: los power-ups **rompen la simetría** "todos responden lo mismo" → introducen
> decisiones y volteretas de ranking que mantienen vivo al que va perdiendo.

### Redemption questions ("preguntas de redención")
- En modos de práctica/lección, una respuesta incorrecta puede **reaparecer más adelante** para
  darte otra oportunidad ("re-attempt"/redemption). Refuerza el **aprendizaje sobre el castigo**:
  el error no es terminal, es un loop de práctica. Encaja perfecto con el objetivo educativo de
  Quanta (Física/Química requiere reintentar conceptos).

### Leaderboard / XP / progreso
- **Leaderboard en vivo** entre rondas (reorder animado, §4).
- **XP / puntos** con count-up animado; **streaks** visibles.
- En modo asincrónico, **reporte de progreso** y reintentos.
- Recompensas: **desbloqueo de avatares**.

---

## 7. Onboarding & estados

- **Entrada con código de juego** (join code) ultra simple, igual que Kahoot: campo grande,
  un solo paso → fricción mínima para el alumno (no requiere cuenta para jugar en vivo).
- Profesor: dashboard con **biblioteca de quizzes**, "Create", reportes.
- Estados: lobby de espera con lista de jugadores entrando (avatar + nick), pantallas de
  loading/transición entre preguntas (el meme cubre la transición), y reporte final.

## 8. Layout / responsividad

- **Mobile-first en el jugador:** las 4 cards de respuesta ocupan la pantalla del teléfono en
  grilla 2×2; tipografía grande y táctil.
- **Modo en vivo vs. asincrónico:**
  - *Live / "Instructor-paced":* todos al ritmo del host, pantalla compartida + dispositivos.
  - *Async / "Homework" / "Student-paced":* cada alumno avanza a su ritmo, con fecha límite;
    aquí cada dispositivo muestra la pregunta **y** el feedback completos (no hay pantalla común).
- Dashboard del profe responsive con cards de quiz.

## 9. Accesibilidad

- **Respuestas diferenciadas por color + forma/icono** (no solo color) → mejor para daltónicos
  (mejor que el Kahoot clásico que dependía casi solo del color).
- Tipografía grande y táctil en el cliente del jugador; targets amplios.
- Riesgos a vigilar si copiamos memes/GIF: **motion intenso** y **GIF animado** pueden chocar con
  `prefers-reduced-motion` y con epilepsia fotosensible → en Quanta, ofrecer **toggle de memes/
  motion** y respetar `reduce-motion`.

---

## Qué tomar para Quanta

- **★ Feedback "memorable" entre preguntas (meme/ilustración) acierto vs. error.** Es barato y
  altísimo retorno emocional. Quanta puede usar **ilustraciones propias del `AtomMascot`/criaturas**
  reaccionando (en vez de memes con copyright): una para acierto, una para error, `≈1–1.5 s`, con
  **toggle** y respeto a `reduce-motion`.
- **★ Power-ups que rompen la simetría del ranking** (multiplicador por streak, "robo"/escudo en
  salas competitivas) → mantienen enganchado al que va perdiendo. Empezar por **streak-multiplier**
  (simple, sin estado entre jugadores).
- **Redemption questions:** reintroducir preguntas falladas más tarde. Encaja con el objetivo
  pedagógico de Física/Química (reintentar el concepto, no castigar el error).
- **Leaderboard con reorder animado** entre rondas — tensión competitiva con poco código.
- **Avatares/criaturas elegibles y desbloqueables** reusados en lobby + leaderboard + perfil
  (evolución del `AtomMascot` de mascota única a set de skins).
- **Respuestas color + icono/forma** (no solo color) como base de accesibilidad desde el día 1.

## Fuentes

- Sitio del producto: https://quizizz.com/
- Página de marketing/funciones (memes, power-ups, modos): https://quizizz.com/features
- Centro de ayuda (memes, power-ups, modos live/homework, redemption):
  https://support.quizizz.com/
- Guía de profesor / blog: https://quizizz.com/home/blog
- Comparativas públicas Quizizz vs Kahoot (modos async, power-ups, memes) — buscar en
  reseñas de EdTech (Common Sense Education, TeachersFirst) para contrastar.

> **Pendiente de validación con Playwright (sin red en este entorno):** HEX exactos del morado de
> marca y de los 4 colores de respuesta, familia tipográfica vigente (¿sigue Quicksand?), radios y
> timings reales, y nombres/efectos exactos de cada power-up. Marcado con `≈` arriba.
