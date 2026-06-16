# Benchmark de diseño — Blooket

> Fuente principal: https://www.blooket.com/ · Wiki comunitaria (Fandom) · Análisis de patrones, **no** de assets.
> ⚠️ Nota de método: en esta sesión `WebSearch`/`WebFetch` estuvieron deshabilitados, así que este análisis se
> construye desde conocimiento previo del producto + referencias públicas listadas en **Fuentes**. Los HEX/medidas
> marcadas con `≈` son aproximaciones a verificar con el script Playwright (`tools/`) sobre el sitio en vivo.

Blooket es una plataforma de quiz-gamificado (rango competidor de Kahoot/Gimkit/Quizizz) cuyo diferencial **no** es
el quiz en sí, sino una capa de **coleccionismo de personajes ("Blooks")** con rarezas + economía de "cajas", y una
**biblioteca de modos de juego** que reskinean la misma mecánica de responder preguntas. Para Quanta es el referente
#1 en **sistema de avatares coleccionables y psicología de unlock**.

---

## 1. Design tokens (aprox., verificar en vivo)

- **Paleta**: base oscura/neutra para chrome (UI) + acentos muy saturados por modo. Domina un **azul de marca**
  (≈`#0F121B`/`#1E2530` superficies oscuras del dashboard, acento ≈`#4F46E5`–`#5D5FEF` violeta-índigo). Cada
  modo de juego trae su **paleta propia** (Gold Quest dorado/verde, Café cálido pastel, Tower Defense verde-bosque,
  Crypto Hack neón verde sobre negro). Es un sistema de **acentos por contexto** sobre un chrome neutro.
- **Color como señal de rareza** (lo más importante, ver §2): cada tier tiene un color/halo distintivo. Esa
  asociación color→valor es el corazón del sistema.
- **Tipografía**: titulares en una **sans redondeada, pesada, geométrica** (estilo display tipo "Titan One" /
  "Baloo" / "Fredoka"-like, muy bold, con outline en estados de juego) — comunica juego/infantil-friendly.
  Cuerpo en una sans neutra legible. Mucho **peso bold** y poco texto largo.
- **Radios**: generosos y consistentes — botones y tarjetas con `border-radius` alto (≈`12–20px`), pills para
  contadores de moneda. Estética "chunky/gomosa".
- **Sombras / profundidad**: botones con **borde inferior sólido más oscuro** (efecto "juguete 3D"/extrusión, no
  drop-shadow sutil) que se hunde en `:active`. Muy característico del look gamificado.
- **Estados**: hover = leve scale-up + brillo; active = el botón "baja" (se come el borde inferior); disabled =
  desaturado. Feedback inmediato y físico.

## 2. ★★ Sistema de avatares / personajes coleccionables (Blooks) — NÚCLEO

Esto es lo que hay que estudiar a fondo: es directamente trasladable a los avatares de Quanta.

### Anatomía del "Blook"

- Un **Blook** = personaje **mascota cuadrada-redondeada**, ilustración plana, **un solo busto frontal** (cabeza +
  hombros, sin cuerpo completo). Cada uno es un **personaje cerrado** (un gato, un dinosaurio, un astronauta, un
  fantasma…), **NO un avatar modular** por capas. Importante: Blooket apuesta por **cientos de personajes únicos
  pre-diseñados**, no por un constructor de avatar tipo "elegí ojos/boca/ropa". Es el modelo opuesto a
  Mii/Bitmoji.
- Render **estático** en su mayoría: el blook es una **imagen** (ver §3) que se usa idéntica en perfil, in-game,
  leaderboard y "tu mano de blooks" en modos como Gold Quest. La identidad visual es el activo; no necesita
  animación de partes.
- Función dentro del juego: el blook elegido es tu **avatar/representación** en el lobby y en el tablero del
  profesor; en algunos modos (Battle Royale, Gold Quest) aparece como tu "token" en pantalla.

### Rarezas (tiers) — la jerarquía de deseo

Blooket ordena los blooks en tiers con color propio y rareza creciente. El esquema canónico:

| Tier | Señal visual | Rol psicológico |
|------|--------------|-----------------|
| **Common** | gris/neutro | relleno, se obtiene fácil, "casi garantizado" |
| **Uncommon** | verde | primer pequeño logro |
| **Rare** | azul | objetivo de medio plazo |
| **Epic** | morado | aspiracional |
| **Legendary** | dorado/amarillo | "trofeo" visible |
| **Chroma** | con efecto **animado/holográfico** (shimmer) | ultra-raro, el único tier con movimiento |
| **Mystical** (y blooks especiales/limitados de evento) | tope, a veces no-comprable | exclusividad temporal/FOMO |

Claves de diseño de las rarezas:
- **Drop-rate inverso a la rareza**: las cajas dan Common con altísima probabilidad y Legendary con probabilidad
  baja (estructura gacha). La rareza se *siente* por la frecuencia con que aparece, no solo por una etiqueta.
- **El tier raro es el único que se anima** (Chroma con shimmer/holo). El movimiento se reserva como recompensa
  premium — patrón muy reutilizable: animá poco, y solo lo valioso.
- Blooks de **evento/temporada** (Halloween, Navidad, etc.) salen por tiempo limitado → coleccionismo con FOMO.

### Economía de unlock (la psicología)

Bucle central, totalmente desacoplado del acierto académico individual:

1. **Jugás cualquier modo** respondiendo preguntas → ganás **Tokens** (la moneda blanda) al final de la partida,
   con tope diario (anti-farmeo y para estirar la progresión).
2. Con Tokens **comprás "Boxes"/packs** en el **Market** (cada set/tema tiene su caja, p. ej. "Spooky Box",
   "Medieval Box"…), cada una con su **tabla de loot** (qué blooks contiene y con qué probabilidad).
3. **Abrir la caja** = animación de suspenso (la caja se sacude/abre, redoble visual) → **revelación del blook**
   con color de su tier. El **momento de apertura** es el pico emocional (variable-ratio reward, igual que loot
   boxes). Si ya lo tenés repetido, se convierte en Tokens (mecánica anti-frustración / "dust").
4. Los blooks desbloqueados llenan tu **colección** (grid con huecos "?" para los que faltan) → la **incompletitud
   visible** es el motor que te trae de vuelta (efecto "colección incompleta" / endowment + completionism).

Otros refuerzos: **Daily Rewards** (login diario da Tokens), eventos de temporada, y blooks que solo se consiguen
en periodos concretos. La progresión es **cosmética pura** (los blooks no dan ventaja competitiva real): unlock por
estatus/colección, no por power-creep — sano para un producto educativo.

### Por qué funciona (resumen accionable)

- **Personajes cerrados, no avatar modular** → producción más simple (no hay que garantizar que toda combinación
  de piezas se vea bien) y cada unlock es un "personaje" memorable, no una pieza.
- **Tiers con color = lenguaje universal de valor** instantáneo.
- **Caja + revelación = el gancho**; la colección incompleta = la retención.

## 3. Lenguaje de ilustración (estilo de los blooks)

- **Flat / vector, formas simples y redondeadas**, paleta acotada por personaje, **outline** definido, **cero o
  mínima textura/sombreado** (sombras planas a lo sumo). Caras expresivas mínimas (2 ojos + boca simple) → enorme
  legibilidad incluso a 32–48px.
- Silueta **contenida en un cuadrado de esquinas redondeadas** → consistencia de grid perfecta en la colección.
- Render técnico: se sirven como **imágenes** (PNG/sprite); algunos (Chroma) llevan capa de **animación/holo**
  encima. No es un sistema SVG-por-capas componible — es arte bitmap/vector pre-renderizado por personaje.
- Lección de producción: **un molde fijo** (mismo encuadre, mismo tamaño de cara, misma paleta-base de fondo por
  tier) permite que artistas distintos produzcan cientos de personajes coherentes. La **consistencia del molde**
  es lo que hace escalable el catálogo.

## 4. Motion & micro-interacciones

- Reservado y puntual: **scale/pop en botones**, botones "físicos" que se hunden, contadores de Tokens que
  **incrementan animados** (tick-up), y sobre todo la **animación de apertura de caja** (suspenso → reveal).
- El **shimmer/holo de los Chroma** es el único motion "constante", precisamente para señalar rareza.
- En modos de juego, motion funcional ligado a la mecánica (la barra de oro en Gold Quest, torres disparando en
  Tower Defense), no decorativo.

## 5. Sonido & feedback

- SFX cortos y "arcade": click de botón, **jingle de acierto vs. buzz de error**, y un **sonido especial de
  apertura/reveal de caja** que sube con la rareza (el reveal raro suena "más épico"). El audio refuerza la
  jerarquía de rareza igual que el color. Música de fondo ligera por modo.

## 6. Gamificación (modos, monedas, cajas, coleccionismo)

### Modos de juego (misma mecánica de quiz, distinto "skin"/meta)

Blooket separa **responder preguntas** (constante) de la **meta-mecánica** (cambia por modo). Los más conocidos:

- **Gold Quest** — respondés bien → elegís cofres → ganás/robás oro a rivales. Azar + interacción social
  (robar/swap) genera tensión y remontadas. El más popular.
- **Tower Defense / Tower Defense 2** — respuestas correctas dan dinero para comprar/mejorar torres y defender
  oleadas. Estrategia individual a tu ritmo.
- **Café** — atendés clientes; responder bien sirve platos/ingredientes y subís de nivel el café (gestión/idle).
- **Crypto Hack** — ganás "crypto" y podés **hackear** a otros para robarles; mecánica de ataque/defensa PvP.
- **Fishing Frenzy** — pescás según aciertos, colección de peces por rareza (mini-coleccionismo dentro del modo).
- **Racing**, **Battle Royale** (PvP 1v1 por velocidad/precisión), **Factory** (los blooks producen dinero ≈
  idle/incremental), **Deceptive Dinos**, **Monster Brawl**, etc.
- **Modos solo/host vs. asignados** (homework / tarea async) → se juega sin profesor en vivo.

**Patrón clave**: una sola pregunta-engine + **N metas-juegos reskineados** = variedad enorme con poco costo de
contenido. El profesor sube un set de preguntas y lo juega en cualquier modo. **Altísima reutilización de
contenido educativo.**

### Monedas, cajas y coleccionismo
- **Tokens** (moneda blanda, tope diario) → **Boxes/packs** (gacha temático) → **Blooks** (colección).
- **Market** central donde se ven todas las cajas y su loot.
- Daily rewards + eventos de temporada + blooks limitados = ciclo de retorno.
- Progresión **100% cosmética** (no pay-to-win en gameplay), lo que la hace apta para entorno educativo.

## 7. Onboarding

- **Sin fricción de alumno**: el estudiante entra con un **Game ID/PIN** + nombre, sin cuenta obligatoria para
  jugar una sesión hosteada (igual que Kahoot). La cuenta (y por tanto la colección persistente de blooks) es el
  incentivo para registrarse. Profesor crea cuenta para hostear/crear sets.
- El "tutorial" es el propio primer modo: las reglas se entienden jugando 30s.

## 8. Layout / IA / responsividad

- **Dashboard** oscuro tipo tarjetas: crear set, descubrir, market, colección, stats. Navegación por **cards
  grandes con icono + label**.
- **In-game** mobile-first, una columna, **respuestas como 4 botones grandes** (target táctil amplio), HUD mínimo
  (moneda/posición). Diseñado para teléfono de alumno + proyector del profesor a la vez.
- **Colección** = grid responsive de blooks con slots vacíos visibles.

## 9. Accesibilidad

- Targets táctiles grandes y texto bold de alto contraste sobre fondos saturados (en general bien).
- Riesgos a no copiar: **color como único canal** para la rareza (un daltónico no distingue tiers solo por color →
  añadir **etiqueta de tier + ícono/forma**, no solo color/halo); fondos muy saturados que bajan contraste de
  texto en algunos modos; motion del shimmer debe respetar `prefers-reduced-motion`.

---

## Qué tomar para Quanta

- **Avatares = personajes cerrados con tiers de rareza por color** (Common→Legendary + un tier "especial"
  animado), no un avatar-builder modular. Más barato de producir y cada unlock es memorable. Temática natural para
  Quanta: mascotas de elementos químicos / partículas / científicos.
- **Bucle de unlock cosmético desacoplado del acierto individual**: jugar → ganar moneda blanda (con tope diario)
  → comprar "caja" temática → **animación de apertura + reveal con color de tier** → colección con huecos
  visibles. El reveal es el pico emocional; la colección incompleta es la retención. **Sin pay-to-win** (apto para
  educación).
- **Una engine de preguntas + varios "modos/skins" reusando el mismo set** multiplica variedad sin multiplicar
  contenido. Y: reservá el **motion y el SFX épico solo para lo raro** (señal de valor), y **no codifiques la
  rareza solo en color** — sumá etiqueta + forma/ícono por accesibilidad.

## Fuentes

- Sitio oficial: https://www.blooket.com/
- Market / cajas: https://www.blooket.com/market
- Wiki comunitaria — Blooks y rarezas: https://blooket.fandom.com/wiki/Blooks
- Wiki comunitaria — Rarities: https://blooket.fandom.com/wiki/Rarity
- Wiki comunitaria — Game Modes: https://blooket.fandom.com/wiki/Game_Modes
- Wiki comunitaria — Tokens / Market: https://blooket.fandom.com/wiki/Tokens
- (Verificar tokens visuales en vivo con el script Playwright en `../tools/` cuando `WebFetch` esté disponible.)
