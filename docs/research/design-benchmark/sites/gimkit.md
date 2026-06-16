# Gimkit — Análisis de diseño (benchmark T017)

> Sitio: https://www.gimkit.com/ · Categoría: quiz educativo gamificado con **economía in-game**.
> **Nota de método:** en este entorno no hubo acceso de red (WebSearch/WebFetch/curl deshabilitados),
> por lo que los HEX y métricas marcados con `~` son **valores observados/aproximados** de la marca,
> no extraídos por `getComputedStyle`. Antes de cerrar el dossier, verificar con el script Playwright
> de `tools/` corriendo contra el sitio real. Las fuentes están al pie.
> **Principio T017:** solo se analizan técnicas/patrones; **ningún asset con copyright** se importa.

Gimkit nació de un proyecto de secundaria (Josh Feinsilber, 2017) y su diferencial es que **convierte
el quiz en un juego de economía/estrategia**: respondés preguntas para **ganar dinero in-game** y lo
**reinvertís en upgrades** que multiplican tus ganancias. El quiz deja de ser "carrera de velocidad"
(Kahoot) y pasa a ser **gestión de recursos**. Eso es lo más transferible a Quanta.

---

## 1. Design tokens

| Token | Valor observado (~) | Nota |
| --- | --- | --- |
| Verde de marca (primario) | `~#1FCC8B` / `~#2BD9A0` | Verde "menta/dinero" — coherente con la metáfora económica |
| Verde oscuro / acento | `~#0E8A63` | Bordes, hover, texto sobre claro |
| Fondo claro | `~#F7F9FB` / blanco | Marketing site limpio, mucho aire |
| Fondo oscuro de juego | `~#10131A` / azul-noche | El **gameplay** corre sobre fondos oscuros saturados (lobby, mapas) |
| Texto | `~#1A1F2B` sobre claro / blanco sobre oscuro | |
| Acentos secundarios | amarillo dinero, rosa, morado, azul | Paleta amplia y **saturada** dentro de cada modo de juego |
| Tipografía display | sans **redondeada, geométrica, peso bold** (estilo Poppins/Nunito/propia) | Headers grandes, friendly, alto contraste de peso |
| Tipografía UI/cuerpo | sans humanista legible | |
| Radios | **muy redondeados**: botones/cards `~16–24px`, pills totalmente redondeadas | Lenguaje "soft", infantil-amable |
| Sombras | suaves y difusas en marketing; en juego, **bordes gruesos + sombra dura** estilo cartoon | |
| Botones | grandes, full-radius o `~16px`, color sólido, label bold, estados hover con leve scale | CTA verde dominante ("Sign up free") |

Lectura: **dos sistemas visuales conviven**. (a) El **sitio/marketing y el dashboard de profe** son
claros, limpios, corporativos-amables. (b) El **juego en sí** es oscuro, saturado, "arcade", con
estética de videojuego casual. Quanta hoy es pastel-claro en todo; Gimkit muestra que el **gameplay
puede subir saturación y contraste** sin romper la marca.

## 2. Avatares / personajes ("Gims")

- Los personajes se llaman **Gims**: criaturas/avatares **simples, redondeados, expresivos**, en
  estilo **flat-cartoon** con ojos grandes y silueta clara (lectura instantánea a tamaño chico).
- **Se desbloquean/coleccionan**: los Gims funcionan como **cosmético-recompensa** (motivación de
  colección a largo plazo, fuera de la partida). Hay decenas de skins temáticas.
- En modos con mapa (Fishtopia, Trust No One) el Gim es un **sprite que camina por un mundo 2D**,
  no solo un avatar de lobby — el mismo personaje sirve de **token de identidad en el mapa**.
- Estados: principalmente **idle + movimiento**; la expresividad vive más en el **diseño de silueta
  y color** que en animación facial compleja. Tecnología probable: **sprite sheets / SVG** ligeros
  (deben renderizar muchos a la vez en pantalla).

## 3. Lenguaje de ilustración

- **Flat-cartoon saturado**, formas redondeadas, contornos definidos, paleta alegre.
- Cada **modo de juego tiene su propio mundo ilustrado** (un océano para Fishtopia, una nave/base
  para Trust No One, etc.): la ilustración es **temática por modo**, no un solo estilo uniforme.
- Iconografía de economía muy legible: **billetes/monedas, flechas de upgrade, multiplicadores** —
  el dinero es un personaje visual de primera clase.
- Sensación general: **videojuego casual / mobile arcade**, no "app educativa seria".

## 4. Motion & micro-interacciones

- **Feedback económico inmediato:** al acertar, sube un **"+$X" flotante** (number pop) y el contador
  de dinero **se anima/cuenta hacia arriba** (count-up). Es el corazón del feedback — ver el dinero
  crecer es la recompensa.
- Comprar un upgrade da **feedback satisfactorio** (pop/cambio de estado, el multiplicador sube).
- Transiciones de pantalla rápidas, con **scale/bounce** suave en botones (easing tipo ease-out con
  ligero overshoot).
- En modos con mapa, movimiento **fluido del sprite** + cámaras que siguen al jugador.
- El **loop de "responder → cobrar → mejorar → responder"** está diseñado para ser cortísimo y
  adictivo (segundos por ciclo).

## 5. Sonido & feedback

- SFX de **"cha-ching"/monedas** al cobrar, sonidos de **compra/upgrade**, y feedback distinto para
  acierto vs error. El audio refuerza la **metáfora de dinero** (el sonido vende la recompensa).
- Música de fondo ligera por modo. El sonido es parte del "juice" — pequeño pero constante.

## 6. ★ Gamificación: economía in-game, upgrades, estrategia y modos (lo central)

### El loop económico (modo clásico "Gimkit")
1. Respondés una pregunta → **ganás $ (dinero in-game)**.
2. El dinero se acumula y podés **comprar upgrades** en una tienda durante la partida:
   - **Money per question** — cuánto cobrás por respuesta correcta.
   - **Streak bonus** — bonus por respuestas consecutivas correctas.
   - **Multiplier** — multiplica todas tus ganancias.
   - **Insurance** — reduce lo que perdés al fallar.
3. Reinvertir mejora la tasa de ganancia → **interés compuesto**: el dinero genera más dinero.
4. **Decisión estratégica:** ¿reinvertir temprano (crece exponencial pero lento al inicio) o
   acumular? Esto introduce **estrategia económica real**, no solo saber la respuesta.

> Clave de diseño: **el conocimiento es el "trabajo" y la economía es el juego**. Dos jugadores que
> saben lo mismo pueden terminar muy distinto según **cómo invirtieron**. Esto premia la constancia
> (responder mucho) y la estrategia, no solo la velocidad — más inclusivo que el quiz puro de rapidez.

### Progresión DENTRO de una partida
- Hay una **curva de poder visible**: empezás cobrando centavos y terminás cobrando miles por
  pregunta. El jugador **siente que se vuelve fuerte** en minutos.
- La tienda de upgrades es un **árbol de decisiones** que da agencia y rejugabilidad (cada partida
  podés probar otra "build").
- Objetivos por modo (llegar a una meta de $, ser el último, completar el mapa) dan **cierre**.

### Modos de juego (variedad = rejugabilidad)
- **Classic / Gimkit** — el loop económico puro, individual o por equipos.
- **Trust No One** — social-deduction estilo *Among Us*: hay impostores; respondés preguntas para
  completar tareas, hay reuniones y votaciones. Mezcla quiz + deducción social + traición.
- **Fishtopia** — modo de **exploración/colección** tipo RPG: te movés por un mapa-océano,
  respondés para pescar/coleccionar, progresión de mundo.
- **Otros** (Tag, Snowbrawl, Don't Look Down, Capture the Flag, Floor is Lava, etc.) — reskins del
  mismo motor de quiz envueltos en **mecánicas de videojuego distintas** (persecución, plataformas,
  captura). Mismo conocimiento, **fantasía de juego diferente**.
- **KitCollab / Creative** — los modos son contenedores; el profe trae las preguntas ("kit") y elige
  el modo. Hay un editor creativo para construir mapas propios.

> Patrón maestro: **separar el "contenido" (preguntas) del "modo" (la fantasía de juego)**. Un mismo
> set de preguntas se juega de N formas → enorme variedad con poco contenido nuevo.

### Recompensas meta (fuera de la partida)
- Coleccionar **Gims** (skins), monedas/XP de cuenta, desbloqueos. Da progresión de largo plazo
  además de la progresión intra-partida.

## 7. Onboarding

- **Unirse a una partida**: ir a `gimkit.com/join` o `gimkit.com/play` e ingresar un **código de
  juego** + nombre (sin login obligatorio para el alumno). Fricción mínima — igual que Kahoot/Blooket.
- El **profe/host** crea desde el dashboard, elige kit + modo, y comparte el código.
- Las reglas de cada modo se aprenden **jugando** (el loop económico es auto-explicativo: respondés,
  ves dinero, ves la tienda).

## 8. Layout / IA / responsividad

- **Marketing site:** hero claro con CTA verde dominante, secciones grandes, mobile-first, mucho aire.
- **Pantalla de unión:** minimalista — input de código gigante centrado.
- **In-game:** HUD con **dinero siempre visible** (esquina), acceso a la **tienda de upgrades**,
  el área de pregunta, y (en modos con mapa) la vista de mundo. La jerarquía pone **el dinero y la
  acción al frente**.
- Responsive y pensado para **tablet/Chromebook** (mercado escolar) y móvil.

## 9. Accesibilidad

- **Pros:** tipografía grande y redondeada, botones enormes con buen target táctil, contraste alto en
  el HUD oscuro, feedback redundante (color + número + sonido).
- **A vigilar (lección para Quanta):** la presión de **velocidad + estímulo constante** puede saturar;
  los fondos muy saturados y el motion permanente exigen un **modo reduce-motion** y cuidado de
  contraste de texto sobre fondos coloridos. El acierto/error no debe depender solo del color.

---

## Qué tomar para Quanta

- **Economía in-game con upgrades como capa estratégica.** Más allá del "punto por acierto", dar
  **dinero/recurso que se reinvierte** (multiplicador, bonus de racha, "seguro") convierte el quiz en
  estrategia y **premia constancia, no solo velocidad** — encaja con física/química donde pensar > correr.
- **Separar contenido de modo de juego.** Diseñar el motor de preguntas para que **el mismo set** se
  juegue en varios "modos" (clásico, colección tipo Fishtopia, deducción tipo Trust No One). Multiplica
  rejugabilidad con poco contenido nuevo — guía clave para la arquitectura de salas/Colyseus.
- **Feedback económico jugoso:** número flotante "+$X" + **count-up animado** del contador + SFX de
  recompensa al acertar. Barato de implementar, altísimo retorno de "juice".
- **Doble registro visual:** marketing/dashboard claro y pastel (lo que Quanta ya tiene) **+ un
  gameplay más oscuro y saturado** estilo arcade, sin romper la marca.
- **Avatares coleccionables ("Gims" → átomos/elementos):** silueta simple y legible que sirva como
  **token en el mapa** y como cosmético-recompensa de largo plazo; evolución natural del `AtomMascot`.
- **Progresión visible dentro de la partida:** que el jugador **sienta que se vuelve fuerte** en
  minutos (de cobrar poco a cobrar mucho). Curva de poder explícita = enganche.

## Fuentes

- Sitio oficial: https://www.gimkit.com/
- Unirse a partida: https://www.gimkit.com/join — https://www.gimkit.com/play
- Centro de ayuda / documentación de modos: https://help.gimkit.com/
- Modos de juego (overview oficial): https://www.gimkit.com/modes
- Wikipedia — Gimkit (historia, mecánica económica, modos): https://en.wikipedia.org/wiki/Gimkit
- Trust No One (modo social-deduction): https://blog.gimkit.com/ (anuncios de modos)
- Fishtopia (modo exploración/colección): https://blog.gimkit.com/

> Pendiente de verificación con red disponible: extraer HEX/tipografía reales vía Playwright
> (`getComputedStyle`) y confirmar enlaces de blog/modos. Los `~HEX` son aproximaciones de marca.
