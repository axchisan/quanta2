# Duolingo — Análisis de diseño (benchmark T017)

> **Sitio:** https://www.duolingo.com/ · Design system público: https://design.duolingo.com/
> **Por qué es el sitio #1 del benchmark:** su sistema de **personajes animados** (los
> "World Characters") es exactamente el patrón que Quanta quiere replicar con su
> `AtomMascot`. Acá se estudia el **método/tecnología**, no los assets (los personajes de
> Duolingo son IP de Duolingo y **no** se descargan ni se incrustan).
>
> ⚠️ Cero assets con copyright a este repo. Solo técnicas, patrones y links con su fuente.
> _Nota de método: este análisis se basa en la documentación pública de Duolingo Design,
> sus posts de ingeniería sobre Rive y charlas públicas; verificar los HEX/timing exactos
> contra el inspector cuando haya acceso de red (ver `tools/`)._

---

## 1. Design tokens

### Paleta (marca "Feather")
La paleta es de **acentos muy saturados sobre fondo blanco/casi-blanco**, con un único
verde dominante de marca y un set de colores funcionales muy reconocibles.

| Rol | Nombre Duolingo | HEX aprox. | Uso |
| --- | --- | --- | --- |
| Primario / marca | **Feather Green** (Duo) | `#58CC02` | CTA principal, Duo, "correcto" |
| Verde sombra (3D) | — | `#58A700` | borde inferior del botón verde |
| Azul | **Macaw** | `#1CB0F6` | links, info, racha activa |
| Azul sombra | — | `#1899D6` | borde inferior botón azul |
| Rojo / error | **Cardinal** | `#FF4B4B` | "incorrecto", vidas/corazones |
| Amarillo | **Bee** | `#FFC800` | XP, coronas, destellos |
| Naranja / racha | **Fox / Fire** | `#FF9600` | streak/racha (la llama) |
| Morado | **Beetle** | `#CE82FF` | Super Duolingo, premium |
| Texto principal | **Eel** | `#4B4B4B` | tipografía |
| Texto secundario | **Wolf / Hare** | `#777777` / `#AFAFAF` | subtítulos, deshabilitado |
| Bordes / superficies | **Swan / Polar** | `#E5E5E5` / `#F7F7F7` | divisores, cards |

Regla mental: **un acento saturado por significado** (verde = avanzar/acierto, rojo =
fallo/vidas, naranja = racha, amarillo = recompensa, azul = info). El color **codifica
semántica de gamificación**, no es decorativo.

### Tipografía
- Fuente propia **`din-round` / "Feather Bold"** (basada en DIN Round): geométrica,
  redondeada, muy legible a tamaños grandes, con un peso bold dominante.
- Jerarquía con **muy pocos tamaños** y **peso alto** (casi todo bold/semibold). Los
  números (XP, racha, gemas) son protagonistas → tipografía pensada para cifras grandes.
- Sensación: amistosa pero con autoridad; redondez = "cálido", geometría = "claro".

### Spacing, radios y el **botón 3D** (firma de marca)
- **Radios generosos** (~12–16px en botones/cards) → familia visual "soft".
- **El botón con borde inferior 3D** es el componente más imitado de Duolingo:
  - Cara superior con color de marca + un **bloque inferior más oscuro** (sombra sólida,
    no blur) que simula grosor/profundidad de tecla física.
  - Implementación típica: `box-shadow: 0 4px 0 0 <colorSombra>` (sombra sólida sin blur)
    o un pseudo-elemento; al `:active` el botón **baja** (`translateY(4px)`) y la sombra
    se reduce a 0 → sensación táctil de "tecla presionada".
  - Esquinas muy redondeadas + sin gradientes → look "juguete físico".
- Estados: `hover` aclara levemente; `active` = press-down; `disabled` = gris `Swan` plano
  (sin la cara 3D, comunica "no presionable").

---

## 2. ★★ Sistema de personajes animados (eje prioritario)

### 2.1 Los "World Characters"
Duolingo pasó de **solo Duo** (el búho) a un **elenco** ("World Characters", rediseño
~2021–2023) precisamente para dar más oportunidades de personalidad, diálogo y emoción.
Reparto y arquetipos:

| Personaje | Quién es | Rol emocional |
| --- | --- | --- |
| **Duo** | búho verde, mascota | guía, presión amable por la racha, celebración |
| **Lily** | adolescente gótica, pelo morado | sarcasmo/desinterés (humor) |
| **Zari** | adolescente con hijab | entusiasta, optimista |
| **Eddy** | atleta rubio | enérgico, despistado |
| **Junior** | niño, hijo de Bea | inocente, curioso |
| **Bea** | adulta de pelo afro | confiable, líder |
| **Lin** | abuela | sabia, directa |
| **Vikram** | dueño de cafetería | cálido, paternal |
| **Oscar** | elegante, formal | dramático |
| **Falstaff** | oso (bear) | comic relief |

Diseñados como **elenco diverso** (edad, etnia, estilo) → más identificación + más
"escenas" posibles en lecciones, no solo un narrador.

### 2.2 Anatomía / construcción (¿modular?)
- Estilo **vectorial, flat, geométrico**, construido con formas simples y un set de
  proporciones compartido (cabezas grandes, cuerpos pequeños → "cute").
- **Rigging modular**: los personajes se animan a partir de un **esqueleto/bones** con
  partes separadas (ojos, cejas, boca, brazos, cuerpo). Esto permite **reusar el mismo
  rig** para producir muchos estados emocionales sin redibujar al personaje.
- **Mouth shapes / face swaps**: ojos y bocas son piezas intercambiables (estilo "sticker
  set"), lo que hace barato generar feliz/triste/sorpresa/pensativo a partir de un mismo
  cuerpo. Esta **modularidad por partes** es justo lo que Quanta busca para el AtomMascot.

### 2.3 Estados emocionales (la clave del enganche)
El personaje **reacciona al evento del usuario** — no es un loop decorativo:
- **Idle / breathing**: micro-movimiento sutil (respiración, parpadeo) para que se sienta
  "vivo" sin distraer.
- **Acierto**: salto, brazos arriba, ojos brillantes, a veces confeti.
- **Error**: encogerse, ceja caída, "ouch" — empático, **no castigador** (clave: el fallo
  da pena por el personaje, no humilla al usuario).
- **Celebración** (fin de lección / racha): baile, fuegos artificiales, Duo eufórico.
- **"Pensando"**: pose de espera mientras el usuario responde.
- **Racha en peligro / racha perdida**: el famoso **Duo triste/llorando** que apela a la
  culpa (ver §6, psicología). Es un **estado emocional con intención de retención**.

### 2.4 ★ Tecnología: **Rive** vs **Lottie** (y por qué Rive)
Esto es lo más transferible a Quanta. Duolingo es **caso público de adopción de Rive**
para sus personajes (su equipo lo documentó en charlas/posts de ingeniería):

- **Lottie** (Airbnb): exporta animaciones **After Effects** a JSON y las **reproduce**.
  Excelente para animaciones **lineales/prerenderizadas** (loaders, confeti, transiciones
  cortas). Limitación: es esencialmente **playback de timeline** — para lógica/estados
  ("si acierta → A, si falla → B"), interactividad o **state machines** hay que orquestar
  desde código y/o tener un JSON por estado → no escala bien con muchos personajes ×
  muchos estados.
- **Rive** (`.riv`): herramienta de animación **interactiva** con **State Machines**
  nativas. Una sola pieza `.riv` contiene el rig + las animaciones + una **máquina de
  estados con inputs** (booleans/triggers/números). El runtime (web/iOS/Android via
  WASM/canvas) recibe inputs (`isCorrect = true`, `streakLost = true`) y **el propio
  archivo decide** la transición/animación. Ventajas para Duolingo:
  - **Un solo archivo por personaje** cubre todos los estados → menos peso, menos archivos.
  - **Tiempo de ejecución pequeño** y vectorial → nítido en cualquier densidad de pantalla.
  - **Estados manejados por diseñadores** (en el editor de Rive), no hardcodeados por devs
    → iteración rápida del "juice" sin tocar código.
  - **Interactividad/mezcla** de animaciones (blend) y respuesta a entrada en tiempo real.
- **Veredicto del patrón:** **Rive para el personaje protagonista con estados**
  (idle/acierto/error/celebración manejados por una State Machine), **Lottie para efectos
  de un solo disparo** (confeti, badges, micro-celebraciones) donde no hay lógica de
  estado. No es Rive *o* Lottie: es **Rive para el cerebro del personaje, Lottie para
  fuegos artificiales**.

### 2.5 Reuso
El mismo personaje/rig aparece en **onboarding, lecciones, feedback de respuesta, pantalla
de fin de lección, notificaciones y la home** — todo desde el mismo asset Rive con
distintos inputs. **Construir una vez, reutilizar en todos los contextos.**

---

## 3. Lenguaje de ilustración
- **Flat / soft vector**: formas geométricas simples, sin gradientes complejos, contornos
  limpios, paleta acotada por personaje (cada uno tiene su color identitario).
- **Expresividad sobre realismo**: cabezas grandes, ojos grandes, bocas muy expresivas →
  emoción legible **a tamaño pequeño** (importa en mobile).
- **Consistencia** vía guía de proporciones y paleta compartida → todos "viven en el mismo
  mundo" aunque sean distintos.
- Escenas/props (fondos, objetos) siguen el mismo lenguaje → mundo cohesivo, no solo
  personajes flotando.

---

## 4. Motion & micro-interacciones (el "juice")
- **Todo da feedback**: tocar una opción, acertar, avanzar, todo tiene una micro-reacción.
- **Easings con rebote/overshoot** (spring) en aciertos y celebraciones → energía;
  easings suaves (ease-out) en transiciones de UI → calma.
- **Confeti / partículas** al completar lección o subir de liga — momento de recompensa
  visual fuerte. (Patrón: usar Lottie o canvas-confetti como capa de un disparo.)
- **Barra de progreso** que avanza con animación + el personaje reaccionando = doble
  refuerzo del avance.
- **Timing corto** (la mayoría < 300–400ms) salvo las celebraciones, que se permiten ser
  más largas porque son el "premio".
- Principio: **el motion comunica estado y recompensa**, no es decoración.

---

## 5. Sonido & feedback
- **SFX cortos y muy reconocibles**: un "ding" ascendente al acierto, un sonido suave/grave
  al error (nunca agresivo), un "whoosh"/sparkle en celebraciones.
- El **"Duolingo sound"** (jingle de marca) refuerza identidad sonora.
- **Háptica** en momentos clave (acierto/error/celebración) en mobile → feedback
  multisensorial.
- Sonido **opcional/silenciable** y nunca imprescindible para entender el estado (el visual
  ya lo comunica) → buena práctica de accesibilidad.

---

## 6. UX de gamificación (y la psicología)
Duolingo es prácticamente el manual de gamificación de retención:
- **Racha (streak)** + **llama naranja**: cuenta días consecutivos. Apela a la **aversión a
  la pérdida** ("no rompas tu racha de N días"). **Streak Freeze** (congelar racha) como
  red de seguridad/ítem comprable. El **Duo triste/llorón** cuando estás por perderla =
  presión emocional vía el personaje.
- **XP**: puntos por lección → progreso medible inmediato (refuerzo).
- **Ligas / leaderboards** (Bronce→Diamante): competencia social semanal, asciendes/
  desciendes → motivación por estatus + FOMO.
- **Gemas / lingotes** (moneda): se ganan jugando y se gastan en ítems (streak freeze,
  intentos) → economía que da valor al esfuerzo.
- **Corazones / vidas**: limitan errores (en algunos modos) → tensión + monetización
  (Super = vidas infinitas). Cada error "duele" porque cuesta una vida.
- **Coronas / niveles de skill**: progresión por habilidad.
- **Refuerzo de acierto/error**: inmediato, visual + sonoro + personaje → bucle dopamina.
- **Psicología clave para Quanta**: (a) **aversión a la pérdida** (racha) > recompensa
  pura; (b) **el personaje encarna las consecuencias** (no un número frío); (c) **recompensa
  variable** (celebraciones de distinta intensidad); (d) errores empáticos, no punitivos.

---

## 7. Onboarding
- **Empieza por hacer, no por configurar**: te mete en una mini-lección antes de pedir
  registro ("aprende primero, regístrate después").
- **Personaje como guía** desde la pantalla 1 (Duo presenta, anima, reacciona).
- Pasos cortos, una pregunta por pantalla, progreso visible → fricción mínima.
- Pide objetivo/motivación al inicio (personalización percibida) y configura recordatorios
  (engancha la racha desde el día 1).

---

## 8. Layout / responsividad
- **Mobile-first**: una columna, un foco por pantalla, **un CTA dominante** (el botón
  verde) siempre visible abajo.
- Web replica el patrón mobile centrado, con mucho aire.
- Navegación inferior simple (aprender, ligas, perfil, tienda).
- Jerarquía clarísima: el usuario nunca duda de cuál es la siguiente acción.

---

## 9. Accesibilidad
- **Contraste alto** del texto Eel (`#4B4B4B`) y de los acentos sobre blanco.
- **Targets táctiles grandes** (botones generosos, pensados para el pulgar).
- **Color nunca es el único canal**: acierto/error también con ícono, copy, sonido y
  personaje → no depende de ver verde vs rojo (ayuda a daltónicos).
- **Sonido opcional**; debería respetar `prefers-reduced-motion` para las celebraciones
  (verificar en su build actual).
- Tipografía grande y redondeada = legible.

---

## Qué tomar para Quanta
- **Animar el `AtomMascot` con Rive + una State Machine, no con N animaciones sueltas.** Hoy
  `apps/web/components/atom-mascot.tsx` es un SVG estático con `currentColor`. El salto es:
  riggear el átomo (núcleo + electrones + cara modular) en Rive con inputs
  `state = idle|correct|wrong|celebrate|thinking` y un solo `.riv` que el web runtime
  controla. **Rive para el cerebro del personaje; Lottie/canvas-confetti solo para el
  confeti de un disparo.** Es el patrón #1 transferible.
- **Cara modular (ojos/boca intercambiables)** para multiplicar estados emocionales sin
  redibujar — el SVG actual ya separa ojos y boca, queda a un paso de ser modular.
- **Codificar semántica con un acento por significado** (verde=acierto, coral=error,
  ámbar=XP/recompensa, naranja=racha) sobre el fondo pastel actual — mapear contra los
  tokens `--accent` (menta), `--destructive` (coral) y agregar tokens de racha/XP.
- **Botón 3D "press-down"** (`box-shadow: 0 4px 0 colorSombra` + `translateY` en `:active`)
  adaptado a la paleta pastel: da tacto y "juguete" sin romper el estilo suave.
- **Racha con aversión a la pérdida + mascota emocional**: el átomo "triste" cuando estás
  por perder la racha es más potente que un número. Estado `wrong`/`streak-lost` del rig.
- **Feedback multicanal y errores empáticos**: acierto/error con color + ícono + sonido
  corto + reacción de la mascota; el fallo da pena por el átomo, no humilla al estudiante.

## Fuentes
- Duolingo Design system — https://design.duolingo.com/
- Duolingo Blog (World Characters / rediseño) — https://blog.duolingo.com/world-character-redesign/
- Duolingo Blog (gamificación / rachas) — https://blog.duolingo.com/
- Rive — State Machines y runtimes — https://rive.app/ · https://help.rive.app/runtimes/state-machines
- Rive (caso/uso de personajes interactivos) — https://rive.app/use-cases
- Lottie / LottieFiles — https://lottiefiles.com/ · https://airbnb.io/lottie/
- DIN Round (base tipográfica de "Feather Bold") — referencia de fuente geométrica redondeada
- _Pendiente de verificar con render real + `getComputedStyle` (Playwright en `tools/`):
  HEX exactos del build actual, timings de motion y soporte `prefers-reduced-motion`._
