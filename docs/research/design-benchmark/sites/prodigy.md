# Prodigy Math — Análisis de diseño (benchmark T017)

> Fuentes: `https://www.prodigygame.com/` (marketing + producto) y `https://play.prodigygame.com/` (cliente de juego).
> ⚠️ Solo análisis de **técnicas y patrones**. Cero assets incrustados/descargados.
>
> **Nota de método:** en esta sesión `WebSearch`/`WebFetch` estaban deshabilitados (permission
> denied), así que los valores numéricos (HEX, timings) provienen de **conocimiento documentado
> público** del producto Prodigy (web de marketing, wiki de la comunidad, reviews de docentes y
> material de prensa) y deben **re-verificarse con Playwright + getComputedStyle** sobre
> prodigygame.com antes de canonizarse. Los marco como `≈` cuando son aproximados. La
> metodología/patrón sí es fiable.

---

## 0. Qué es Prodigy (el modelo que nos interesa)

Prodigy Math es un **RPG educativo estilo Pokémon/JRPG** dirigido a 1.º–8.º grado. El alumno
crea un **mago/hechicero personalizable** que recorre un **mundo de fantasía** (islas, mazmorras,
pueblos), **explora un mapa**, conoce NPCs, **captura criaturas** y libra **batallas por turnos**.
La clave de diseño: **el contenido matemático es el "ataque"** — para lanzar un hechizo el alumno
**resuelve un problema**; acertar = el hechizo conecta. Así el aprendizaje queda **envuelto en la
mecánica RPG**, no presentado como ejercicio. Es el patrón más transferible para Quanta: usar
Física/Química como el "verbo" de la mecánica de juego, no como un quiz adyacente.

---

## 1. Design tokens

### Paleta
Prodigy NO es pastel: es una paleta de **fantasía saturada, cálida y mágica** — verdes de pradera,
azules de cielo/agua, morados/rosas de magia, dorados de recompensa. Mundo "soleado y acogedor"
tipo cuento, alto color pero no estridente (más naturalista que el flat de Kahoot).

| Rol | HEX ≈ | Notas |
|---|---|---|
| Verde marca / mundo | `≈#5FBF5F` / `≈#3FA34D` | praderas, UI de "vivo/correcto", marca histórica |
| Azul cielo / agua / UI | `≈#3FA9F5` / `≈#2E86DE` | cielos, mar entre islas, paneles |
| Morado mágico | `≈#7B5EA7` / `≈#9B59B6` | hechizos, encantamiento, acento "wizard" |
| Dorado / recompensa | `≈#F5C518` / `≈#FFC93C` | monedas, estrellas, loot, XP |
| Rosa / coral acento | `≈#FF6B9D` | criaturas, botones secundarios, energía amigable |
| Crema / pergamino UI | `≈#FFF6E6` | fondos de panel, "scroll" de diálogo |

> Patrón de color: **mundo naturalista cálido** + **acentos mágicos saturados** para lo
> interactivo (hechizo morado, loot dorado). El color codifica *función* (verde=naturaleza/ok,
> morado=magia/acción, dorado=premio).

### Tipografía
- Titulares en **sans redondeada, robusta y "amigable de fantasía"** (estilo display rounded,
  pesos bold) — legible para lectores jóvenes, con sensación de juego, no de hoja de cálculo.
- Cuerpo en **sans humanista legible** (alto x-height) para enunciados de problema y diálogo.
- Números **grandes y claros** en los problemas matemáticos: la legibilidad del contenido manda
  sobre la decoración.

### Radios, sombras, estilo de superficie
- **Radios grandes** y botones tipo "gota"/redondeados; paneles con **borde grueso** y a veces
  estética de **pergamino/madera/UI de fantasía** (marcos ornamentados ligeros).
- **Sombras suaves** y resaltes (highlights) que dan volumen tipo "soft 3D" a botones e íconos.
- Iconografía **soft-3D / semi-realista cartoon** (gemas, monedas, pociones con brillo).

---

## 2. ★★ Sistema de avatar personalizable (el wizard) — PRIORITARIO

Este es el núcleo del benchmark para Quanta. El avatar de Prodigy es un **personaje humano
estilo cartoon (mago)** que el alumno **construye y re-equipa constantemente**, y que es **el
mismo sprite** que aparece en mundo, batalla, perfil y social. Anatomía del sistema:

### Composición modular por capas (paper-doll)
El avatar se arma como un **muñeco recortable (paper-doll) por capas (slots)**, no como un sprite
monolítico. Cada capa es intercambiable, lo que genera enormes combinaciones desde pocos assets:

| Slot | Qué incluye | Notas |
|---|---|---|
| **Base / género / tono de piel** | cuerpo base, género (chico/chica/neutro), tono de piel | elección inicial en onboarding, editable después |
| **Pelo** | estilo + color de cabello | gran eje de identidad |
| **Cara / ojos** | forma de ojos, color, expresión base | |
| **Sombrero / casco** | gorros de mago, coronas, cascos | slot muy visible, lleno de loot |
| **Ropa / outfit** | túnicas, armaduras, trajes temáticos | el slot "cuerpo" principal |
| **Botas / calzado** | | |
| **Varita / arma (wand)** | define el **elemento del hechizo** (fuego, agua, etc.) | ★ aquí el equipamiento toca la *mecánica*, no solo lo estético |
| **Mascota / pet acompañante** | criatura que sigue al avatar | overlap con el sistema de criaturas |

### El equipamiento es estético **y** mecánico (clave de diseño)
- La **varita (wand)** no es decorativa: **determina el tipo de hechizo/elemento** que lanzás en
  batalla. Equipar = cambiar tu kit de combate. Esto **funde la personalización con la estrategia**:
  vestirte importa para jugar, no solo para verte bien.
- Otras piezas (botas, sombrero, túnica) son mayormente **cosméticas**, pero entran al mismo
  bucle de "loot → equipar → presumir".
- Las prendas se obtienen como **loot/recompensa** (al ganar batallas, completar zonas, abrir
  cofres) o en **tienda** con la moneda del juego → motor de progresión cosmética constante.

### Editor / wardrobe
- Hay un **vestidor (closet/wardrobe)** con vista previa en vivo del avatar; cambiás un slot y el
  muñeco se actualiza al instante (feedback inmediato).
- Sistema de **inventario** que separa lo equipado de lo poseído; ítems agrupados por slot.
- La personalización es **reversible y de bajo coste** (jugar a vestir es parte de la diversión,
  no una decisión única) → fomenta volver al menú y re-engagement.

### Reuso del mismo avatar en todo el funnel
El mismo personaje viaja por **mundo (overworld sprite)** → **batalla (pose de combate +
animación de hechizo)** → **perfil/menú** → **social (otros ven tu avatar)**. Un solo sistema de
assets, coherencia total, sensación fuerte de "**es *mi* mago**". Patrón idéntico al que el brief
de Quanta pide para sus avatares.

> **Takeaway de anatomía:** avatar = **paper-doll por slots** (base + pelo + cara + sombrero +
> ropa + calzado + **arma con efecto mecánico** + mascota), alimentado por **loot/tienda**,
> editable en un **wardrobe con preview en vivo**, y **reusado** idéntico en mundo/batalla/perfil/social.

---

## 3. Lenguaje de ilustración

- Estilo **cartoon de fantasía "soft"**: personajes con cabezas grandes, proporciones amigables
  (chibi-ish sin ser bebé), líneas limpias y **sombreado suave con volumen** (no flat puro: hay
  gradientes y highlights que dan sensación **soft-3D / pintado digital**).
- **Mundo isométrico/2.5D** tipo JRPG: tiles de pradera, agua, pueblos, mazmorras, con
  profundidad por capas y parallax leve.
- **Criaturas (los "pets"/monstruos)** muy variadas y coleccionables, cada una con silueta y
  paleta propia, diseñadas para ser **reconocibles y "atrapables"** (gancho Pokémon). Tienen
  **etapas de evolución** (cambian de forma al subir de nivel) — refuerzo visual de progreso.
- Consistencia alta: todo (avatar, criaturas, props, UI) comparte el mismo lenguaje cartoon-mágico
  cálido. La cohesión es lo que hace que el mundo "se sienta un lugar".

---

## 4. Motion & micro-interacciones

- **Overworld:** el avatar camina con animación de ciclo de pasos; cámara que sigue; transiciones
  suaves entre zonas (fade / wipe).
- **Batalla por turnos:** el momento estrella. Resolver el problema → **animación del hechizo**
  (proyectil elemental con partículas: fuego, hielo, rayo) → impacto en el enemigo → daño en
  números flotantes → barra de vida que baja con tween. Acertar se **celebra visualmente**; el
  hechizo *es* la recompensa de haber resuelto.
- **Recompensa / loot:** cofres que se abren, ítems que "saltan" con brillo/sparkle, monedas
  volando al contador, XP con count-up y "level up" con fanfarria visual.
- **Captura de criatura:** secuencia de captura con tensión + celebración al lograrlo (bucle
  coleccionista).
- Easings **bouncy / con overshoot** (sensación juguetona), partículas y destellos en casi toda
  interacción de recompensa → el feedback positivo es generoso y constante.

---

## 5. Sonido & feedback

- **Música de mundo** ambiental tipo aventura/fantasía por zona (pradera vs mazmorra suenan
  distinto) → da identidad a cada región.
- **Música de batalla** más enérgica que marca el cambio de modo.
- **SFX** ricos: lanzar hechizo, impacto, acierto vs error del problema, recoger loot/moneda,
  subir de nivel, capturar criatura. El audio **premia** cada microacción.
- El sonido refuerza la **fantasía de poder**: resolver mates → sonido de hechizo épico = el
  cálculo se siente poderoso, no tedioso.

---

## 6. UX de gamificación (el RPG como envoltorio del contenido)

★ Este es el corazón del diseño: **toda la progresión educativa está disfrazada de progresión RPG.**

- **Combate = contenido.** Cada turno de batalla **es** un problema de matemáticas. Resolver bien =
  el hechizo conecta / más daño; fallar = el hechizo falla o el enemigo ataca. **El problema no es
  un "examen", es tu acción de combate.** Esta es la idea central a robar.
- **Dificultad adaptativa invisible:** el motor ajusta el nivel de los problemas al grado/skill del
  alumno (alineado a currículo/estándares). El alumno percibe "enemigos más fuertes", no "ejercicios
  más difíciles".
- **Progresión por niveles (XP):** ganar batallas da XP → el mago **sube de nivel** → desbloquea
  zonas, hechizos, equipamiento. Curva de progreso clásica de RPG aplicada al aprendizaje.
- **Coleccionismo (criaturas/pets):** capturar, coleccionar y **evolucionar** criaturas es un bucle
  paralelo de "gotta catch 'em all" que sostiene el engagement entre lecciones.
- **Loot & economía cosmética:** monedas, cofres, tienda, prendas raras → motor de "una batalla más"
  para conseguir el siguiente ítem. La cosmética es la zanahoria.
- **Mundo abierto explorable:** mapa con zonas/islas que se desbloquean → sensación de aventura y
  metas espaciales ("quiero llegar a esa isla").
- **Social ligero:** ver/visitar avatares de compañeros, batallas PvP amistosas → presión social
  positiva y presumir el avatar/loot.
- **Modelo freemium:** mecánicas core gratis; **Membership** desbloquea más equipamiento, zonas,
  mascotas y poderes (cosmético/progresión, no el contenido educativo). El paywall es la fantasía,
  no el aprendizaje.
- **Dashboard docente/parental separado:** los adultos ven progreso/currículo en una UI sobria
  aparte; el alumno solo ve el juego. **Dos productos en uno** (juego para el niño, datos para el
  adulto).

> Patrón maestro: **mapear cada elemento pedagógico a un elemento RPG** — ejercicio→ataque,
> dificultad→fuerza del enemigo, dominio del tema→nivel/zona, motivación→loot/criaturas.

---

## 7. Onboarding

- **Onboarding = creación del personaje.** El primer contacto NO es un tutorial de mates: es
  **"crea tu mago"** (elegí nombre, género, look). El alumno invierte en identidad antes de tocar
  contenido → enganche emocional desde el segundo 1.
- Seguido de un **tutorial diegético**: la primera batalla enseña la mecánica (resolvé para atacar)
  dentro de la historia, sin pantallas de instrucciones secas.
- **Onboarding por código de aula / login simple** para el contexto escolar (el docente reparte un
  código), bajando fricción de entrada como Kahoot.
- Progreso temprano muy gratificante (loot y level-ups rápidos al inicio) para asegurar el "hook".

---

## 8. Layout / responsividad

- **Pensado para pantalla de juego** (web en navegador + apps iOS/Android/tablet). El layout es el
  de un **juego**, no de un sitio: viewport de mundo + HUD superpuesto (vida, monedas, nivel,
  minimapa/menús como botones flotantes).
- **Targets grandes** y navegación por iconos para manos infantiles; poco texto, mucho ícono.
- Adaptado a **tablet/touch** (mercado escolar): controles táctiles, teclado numérico grande para
  responder problemas.

---

## 9. Accesibilidad

- **Texto mínimo / iconografía fuerte** ayuda a lectores jóvenes o con dificultad lectora; los
  problemas se apoyan en números grandes y a veces apoyos visuales.
- **Dificultad adaptativa** = una forma de accesibilidad cognitiva: nadie queda fuera por nivel.
- **Sin presión de timer agresivo** en el core (a diferencia de Kahoot): el ritmo lo marca el
  alumno en su turno → mejor para ansiedad y para quien procesa más lento.
- Puntos a vigilar (lecciones para Quanta): **alto color/partículas** puede ser mucho para
  sensibilidad visual → prever **modo de motion-reduce**; la economía cosmética/freemium puede
  presionar → en Quanta mantener cosmética **no monetizada** o de bajo coste.

---

## Qué tomar para Quanta

- **★★ Envolver el contenido en la mecánica, no adyacente a ella.** El mayor aprendizaje de
  Prodigy: el problema de Física/Química debe ser **la acción de juego misma** (lanzar el
  experimento/hechizo, "estabilizar el átomo", "balancear la reacción para atacar"), no un quiz
  pegado al lado. Mapear: ejercicio→acción, dificultad→fuerza del rival, dominio→nivel/zona.
- **★★ Avatar paper-doll por slots reutilizado en todo el funnel.** Evolucionar el `AtomMascot`
  a un **personaje personalizable por capas** (base/género/piel + pelo + cara + sombrero + outfit +
  accesorio + "herramienta/elemento"), editable en un **wardrobe con preview en vivo**, y usado
  idéntico en lobby/juego/perfil/social. SVG por capas encaja perfecto (ligero, recombinable).
- **★ Que al menos UNA pieza de equipamiento tenga efecto mecánico** (como la varita = elemento):
  p. ej. elegir "elemento/disciplina" (Física vs Química) o una herramienta que cambie el tipo de
  reto. Funde personalización con estrategia → la cosmética importa para jugar.
- **Loot cosmético como motor de re-engagement** (gana retos → desbloquea prendas/accesorios pastel
  → presumí tu avatar). En Quanta mantenerlo **sin paywall** o de bajo coste para no presionar.
- **Coleccionismo paralelo (criaturas/mascotas que evolucionan)** como bucle secundario: criaturas
  "quantum" coleccionables que evolucionan al dominar temas → sostiene engagement entre sesiones.
- **Onboarding = crear tu personaje primero, contenido después.** Empezar por "creá tu avatar"
  genera inversión emocional antes del primer reto; tutorial diegético dentro de la historia.

## Fuentes

- `https://www.prodigygame.com/` — marketing, características del juego, membership, avatar/criaturas. *(No fetchada en esta sesión: WebFetch/WebSearch deshabilitados — re-capturar con Playwright.)*
- `https://play.prodigygame.com/` — cliente de juego (mundo, batalla, wardrobe, captura).
- `https://www.prodigygame.com/main-en/parents/` y `/teachers/` — dashboards de adulto, modelo freemium.
- Wiki de la comunidad de Prodigy (Fandom) — taxonomía de slots de equipamiento, varitas/elementos, criaturas y evoluciones (verificar nombres/mecánica exactos).
- Reviews públicas de docentes (Common Sense Education y similares) — integración currículo/dificultad adaptativa.
- Conocimiento documentado público del producto (paleta, estilo soft-3D cartoon, mecánica combate=problema) — **valores `≈` a re-verificar** con `tools/` (Playwright + getComputedStyle) antes de canonizar.

> **Pendiente de verificación (siguiente pasada con web/Playwright):** HEX exactos de la paleta;
> familia tipográfica vigente; lista canónica de **slots de equipamiento** y cuáles son cosméticos
> vs mecánicos; tecnología de animación del sprite/hechizos (sprite-sheet vs Spine/Lottie —
> inspeccionar requests en play.prodigygame.com); timings reales de transiciones de batalla.
