# Kahoot! — Análisis de diseño (benchmark T017)

> Fuentes: `https://kahoot.it/` (cliente jugador) y `https://kahoot.com/` (marketing + brand).
> ⚠️ Solo análisis de **técnicas y patrones**. Cero assets incrustados/descargados.
>
> **Nota de método:** en esta sesión `WebSearch`/`WebFetch` estaban deshabilitados, así que
> los valores numéricos (HEX, timings) provienen de conocimiento documentado público del
> sistema de Kahoot (brand guidelines y case studies conocidos) y deben **re-verificarse con
> Playstation/Playwright + getComputedStyle** sobre kahoot.it antes de usarse como canon.
> Los marco como `≈` cuando son aproximados. La metodología/patrón sí es fiable.

---

## 1. Design tokens

### Paleta de marca
Kahoot usa un **morado profundo** como color de marca primario, sobre el que flotan colores
saturados y de alto contraste. No es pastel: es **vibrante, alegre, alto-contraste** — lo
opuesto al "Edu-friendly suave" de Quanta. Esa diferencia es deliberada: Kahoot busca energía
de game-show, no calma de estudio.

| Rol | HEX ≈ | Notas |
|---|---|---|
| Brand purple (fondo dominante) | `#46178F` | Morado oscuro, fondo de lobby y pantallas de host |
| Purple secundario / gradiente | `#3A0D7A` → `#864CBF` | Fondos con degradado vertical sutil |
| Blanco UI | `#FFFFFF` | Tarjetas, texto sobre morado |
| Texto oscuro | `#333333` / `#1E1E1E` | Sobre superficies claras |
| Acción / CTA | rosa-magenta `≈#E21B3C` y verdes según contexto | botones de "Start", "Next" |

### ★ Los 4 colores + formas de respuesta (el patrón más icónico)
La pantalla de respuesta divide el área en **4 cuadrantes a pantalla completa**, cada uno con
un **color + una forma** asociada de forma fija. Esta dualidad color↔forma es la pieza de
accesibilidad clave de Kahoot.

| Posición | Color | HEX ≈ | Forma |
|---|---|---|---|
| Superior-izq | Rojo | `#E21B3C` | **Triángulo** |
| Superior-der | Azul | `#1368CE` | **Rombo/diamante** |
| Inferior-izq | Amarillo | `#D89E00` (a veces `#FFA602`) | **Círculo** |
| Inferior-der | Verde | `#26890C` | **Cuadrado** |

Notas de implementación:
- La forma es **redundante con el color** (no decorativa): permite responder a daltónicos y
  refuerza la memoria muscular ("yo siempre voy al triángulo rojo").
- En el **teléfono del jugador** suele mostrarse **solo color+forma grandes, sin texto** — el
  enunciado y las opciones de texto van en la **pantalla compartida del host**. El móvil es un
  mando, no la pantalla principal. (En modos solo-móvil sí se muestra el texto en el botón.)
- Con <4 opciones, Kahoot oculta cuadrantes pero **mantiene la asociación color↔forma**
  (no reasigna), preservando consistencia.

### Tipografía
- **Montserrat** es la familia histórica de la marca (geométrica sans, alto x-height, muy
  legible a distancia en proyección). Se reporta también el uso de **Poppins** en piezas más
  recientes; ambas son geométricas redondeadas, intercambiables en sensación.
- Pesos: títulos en **Bold/ExtraBold (700–800)**, cuerpo en Regular/Medium. Mucho peso fuerte
  porque la UI se ve **proyectada en un aula a distancia**: la legibilidad manda.
- Escala grande y números prominentes (PIN, puntajes, countdown) — la tipografía hace de
  "scoreboard" de game-show.

### Radios, sombras, spacing
- **Radios medianos** en tarjetas/botones (≈8–16px) — redondeado amigable, no pill total.
- **Sombras suaves** y a veces un **borde inferior más oscuro** en botones (estilo "botón
  físico" / neumorfismo plano) que da sensación de pulsable.
- Spacing generoso; los 4 botones de respuesta llenan el viewport sin huecos (grid 2×2).

---

## 2. ★ Sistema de personajes / avatares ("Kahoot characters")

Kahoot tiene una familia de **muñecos** (los "Kahoots") con personalidad — caras redondas,
expresivas, estilo flat con cuerpos simples. Cómo está construido el sistema:

- **Composición modular por capas.** El avatar se arma combinando partes intercambiables:
  cuerpo/forma base, cara/expresión, accesorios (sombreros, gafas, props). Esto permite un
  **avatar builder** (los jugadores personalizan su Kahoot) generando miles de combinaciones
  desde pocos assets — exactamente el patrón "modular por partes" que el brief de Quanta busca.
- **Estados / expresiones:** idle/neutro, feliz (acierto), sorprendido, "pensando" durante el
  countdown, celebración en el podio. La expresión cambia según el momento del juego, dando
  **feedback emocional** sin texto.
- **Tecnología probable:** mezcla de **SVG/sprite-sheets para el builder** (partes
  recomponibles, ligeras, escalables) y **animaciones tipo Lottie/CSS** para los estados
  animados (idle bobbing, salto de celebración). El builder modular encaja mejor con SVG por
  capas que con un Lottie monolítico; las celebraciones puntuales sí son buen caso Lottie.
- **Dónde se reusan:** lobby (mientras esperan jugadores, los avatares "aterrizan" en pantalla),
  identidad del jugador durante el juego, **podio final** (los 3 muñecos top animados), perfil.
  El mismo asset viaja por todo el funnel → coherencia y sensación de "es *mi* personaje".

**Takeaway de anatomía:** un buen sistema = pocas *partes* base × muchas *combinaciones* ×
un set acotado de *estados* emocionales reutilizados en lobby/juego/podio.

---

## 3. Lenguaje de ilustración

- **Flat con personalidad**, formas redondeadas, trazo grueso o sin trazo, colores planos
  saturados. Caras grandes y expresivas (estilo "blobby"/amigable).
- Iconografía simple y consistente con las 4 formas de respuesta como motivo gráfico recurrente
  (triángulo/rombo/círculo/cuadrado aparecen como patrón de marca, no solo en respuestas).
- Ilustración **alegre, no infantil-bobo**: funciona de K-12 a corporate.

---

## 4. Motion & micro-interacciones

- **Countdown timer:** anillo/barra que se vacía con tic-tac; tensión creciente. Es el corazón
  del ritmo del juego.
- **Entrada de respuestas:** los cuadrantes hacen pequeño "pop"/escala al aparecer; el botón
  tocado da feedback de presión inmediato.
- **Reveal de respuesta:** la correcta se marca y las incorrectas se atenúan; transición rápida
  (≈300–500ms) hacia el scoreboard.
- **Podio / celebración:** **confeti**, los muñecos top saltan/animan, conteo de puntaje que
  **incrementa numéricamente** (count-up) para drama. Transiciones con easing "bouncy"
  (overshoot) que dan sensación juguetona — no lineales.
- **Lobby:** avatares y nombres aparecen con animación de entrada conforme se unen jugadores;
  da vida a la espera.

---

## 5. Sonido & feedback (icónico)

El **sound design es parte central de la marca Kahoot** — posiblemente su activo más
reconocible junto a los colores.

- **Música de lobby:** loop instrumental enérgico, distinto, que se ha vuelto meme cultural
  ("the Kahoot lobby music"). Construye anticipación mientras se llena la sala.
- **Música de pregunta / countdown:** track con **tensión creciente** sincronizado al timer;
  acelera la percepción de urgencia.
- **SFX de respuesta:** sonido al enviar respuesta; jingles distintos para **acierto vs error**;
  fanfarria en el podio.
- **Patrón clave:** el audio **marca el ritmo del juego** y sincroniza a toda el aula (todos
  oyen lo mismo desde la pantalla del host). El sonido no es decoración: es el metrónomo.

---

## 6. UX de gamificación

- **★ Puntaje por velocidad (el motor):** los puntos no son binarios. Una respuesta correcta da
  hasta ~**1000 puntos** base por pregunta, **escalando con la rapidez**: responder al instante
  ≈ puntaje completo; cerca del límite del timer ≈ ~la mitad. Fórmula reportada del estilo:
  `puntos ≈ (1 − (tiempo_respuesta / tiempo_límite) / 2) × 1000` (correctas), 0 si incorrecta.
  Esto premia **saber + reaccionar rápido**, crea tensión y evita empates planos.
- **Streak bonus:** rachas de respuestas correctas seguidas dan **puntos extra crecientes**,
  premiando la consistencia (no solo aciertos sueltos).
- **Leaderboard en vivo:** entre preguntas se muestra el **top 5** con animación de
  reordenamiento (las barras/nombres se reacomodan) — drama de "quién subió/bajó".
- **Podio final:** top 3 en pedestales con sus muñecos, confeti, posiciones 1-2-3. Cierre
  memorable y compartible.
- **Nicknames / identidad:** entrar con apodo (a veces sugeridos) baja la fricción y añade humor.

---

## 7. Onboarding & estados

- **Game PIN como onboarding cero-fricción:** el jugador entra a kahoot.it, teclea un **PIN
  numérico** grande + apodo. Sin cuenta, sin app obligatoria, sin login. Esa simplicidad es la
  razón de la adopción masiva en aulas.
- **Lobby como sala de espera con feedback:** mientras esperás, ves tu avatar y los nombres ir
  apareciendo → confirma "estás dentro, va a empezar".
- Estados claros: "esperando que empiece", "preparate" (pre-pregunta), "respondé", "esperando a
  los demás", "resultado", "scoreboard". Cada estado tiene su pantalla full-screen sin ambigüedad.

---

## 8. Layout / responsividad

- **Mobile-first en el jugador, big-screen en el host.** Arquitectura de **doble pantalla**:
  el host proyecta (pregunta + opciones + timer), el jugador usa el móvil como **mando**
  (4 botones grandes color+forma). Esto define toda la responsividad.
- Los **4 botones llenan el viewport del móvil** en grid 2×2: máximos targets táctiles, cero
  scroll, imposible fallar el tap.
- Tipografía y números grandes para **legibilidad de proyección** a varios metros.

---

## 9. Accesibilidad

- **★ Forma + color redundantes:** el aporte de accesibilidad estrella. Las 4 formas
  (triángulo/rombo/círculo/cuadrado) hacen que el sistema funcione para **daltónicos** y para
  quien no distingue bien los colores en un proyector lavado. Nunca se depende solo del color.
- **Targets táctiles enormes** (cuadrantes a pantalla completa) — excelente para motricidad.
- **Alto contraste** (blanco/colores saturados sobre morado oscuro) — bueno a distancia.
- Puntos débiles típicos del género: la **música/tensión y el timer** presionan a usuarios con
  ansiedad; el **puntaje por velocidad penaliza** a quien procesa más lento o usa lector de
  pantalla. Algo a mitigar en Quanta (modo sin-timer / sin-presión).

---

## Qué tomar para Quanta

(Quanta ya tiene salas tipo Kahoot, así que esto es **mejora**, no copia.)

- **Adoptar color+forma redundante en las 4 respuestas.** Mapear los cuadrantes a las formas
  geométricas (triángulo/rombo/círculo/cuadrado) además del color pastel — gana accesibilidad
  real para daltónicos y memoria muscular, sin renunciar a la paleta lavanda/menta/durazno.
  Las formas se pueden pintar en pastel: el patrón es la dualidad, no el HEX.
- **Puntaje por velocidad + streaks.** Si Quanta hoy puntúa binario, mover a
  `puntos = base × (1 − retraso_normalizado/2)` con **bonus de racha**. Es el motor de tensión y
  de re-jugabilidad; barato de implementar en el game-server Colyseus y transforma la sensación.
  Ofrecer un **modo sin presión** (sin timer) para accesibilidad/aprendizaje.
- **Avatar modular reutilizado en todo el funnel.** Evolucionar el `AtomMascot` a un sistema de
  **partes intercambiables (SVG por capas)** con un set de **estados emocionales** (idle,
  acierto, error, pensando, celebración) que se reusen en lobby, durante el juego y en el podio.
- **Leaderboard en vivo con reordenamiento animado + podio top-3 con confeti y count-up.** El
  cierre memorable es lo que se comparte; es alto ROI de motion sobre lo que ya existe.
- **Capa de sonido como metrónomo del juego** (loop de lobby, tensión de countdown, SFX
  acierto/error, fanfarria de podio) — originales o CC0, sincronizados desde la pantalla host.
- **Conservar el alma "suave" de Quanta donde Kahoot es estridente:** tomar la *estructura*
  (doble pantalla, PIN cero-fricción, 4 cuadrantes color+forma, velocidad) pero mantener la
  paleta pastel y un tono menos game-show — diferenciador de marca frente a Kahoot.

## Fuentes

- `https://kahoot.it/` — cliente jugador (lobby, PIN, pantalla de respuesta color+forma). *(No fetchada en esta sesión: WebFetch/WebSearch deshabilitados — re-capturar con Playwright.)*
- `https://kahoot.com/` — marketing, características, muñecos/characters.
- `https://kahoot.com/brand-guidelines/` — paleta de marca, tipografía, logo (verificar HEX exactos aquí).
- Conocimiento documentado público del sistema Kahoot (colores/formas de respuesta, fórmula de puntaje por velocidad, sound design de lobby) — **valores `≈` a re-verificar** con `tools/` (Playwright + getComputedStyle) antes de canonizar.

> **Pendiente de verificación (siguiente pasada con web/Playwright):** HEX exactos del brand
> purple y los 4 colores; fuente vigente (Montserrat vs Poppins); fórmula de puntaje y techo de
> puntos exactos; timings reales de transiciones; tecnología de animación de los muñecos
> (inspeccionar requests `.json`/`.riv` en kahoot.it).
</content>
</invoke>
