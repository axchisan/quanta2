# Khan Academy — análisis de diseño (benchmark T017)

> Referente de **aprendizaje accesible y a escala**: maestría/progreso a largo plazo,
> avatares desbloqueables por puntos, claridad pedagógica y accesibilidad fuerte.
> Fuente principal: `https://www.khanacademy.org/`
>
> ⚠️ **Nota de método:** en esta sesión el acceso de red (WebSearch/WebFetch/curl) estuvo
> bloqueado por permisos, así que este análisis se basa en conocimiento público y estable
> del producto de Khan Academy (design system documentado, mecánicas de puntos/maestría y
> prácticas de accesibilidad publicadas). Los HEX/tipografías marcados como *aprox.* deben
> re-verificarse con un pase de Playwright + `getComputedStyle` (ver `tools/`). URLs para
> verificación al pie.

---

## 1. Design tokens

Khan Academy mantiene un design system propio (**Wonder Blocks**, open-source) y una marca
muy reconocible centrada en su **verde**.

- **Paleta (aprox., verificar):**
  - Verde marca / acción primaria: `#14BF96` (Khan green / "default5") y un verde más
    oscuro de marca `#0A8060` / `#1865F2` para foco. El verde es el color de "progreso/CTA".
  - Texto principal: gris muy oscuro casi negro `#21242C`; texto secundario `#3B3E40`–`#616770`.
  - Fondos: blanco `#FFFFFF` y grises de superficie `#F7F8FA` / `#E7EBF2` (separadores).
  - Acentos por dominio/maestría: **azul** (familiarizado), **morado/púrpura** (proficiente),
    **dorado/amarillo** (dominado) — los colores codifican el nivel de maestría, no solo decoran.
  - Estados: rojo de error `#E84B59` aprox.; foco azul `#1865F2`.
- **Tipografía:** sistema propio. Históricamente **Proxima Nova** para UI/marca; en producto
  modernо tiende a *system font stack* (`Lato`/`-apple-system, Helvetica Neue, sans-serif`)
  por rendimiento. Jerarquía sobria: pocos pesos (regular/semibold/bold), tamaños grandes
  para encabezados de lección, line-height generoso para lectura larga.
- **Radios:** suaves pero contenidos (~`4px` inputs, ~`6–8px` botones/cards). Menos
  "burbujeante" que Duolingo; estética **limpia y académica**, no infantil.
- **Sombras/elevación:** discretas; bordes sutiles `1px` + sombras suaves en cards y popovers.
- **Wonder Blocks** expone los tokens como librería React versionada (color, spacing,
  tipografía, motion) — es su fuente de verdad y por eso el producto se ve consistente a escala.

## 2. ★ Sistema de avatares desbloqueables (PRIORITARIO)

El patrón más transferible de Khan: **avatares que se ganan acumulando energy points**,
no que se compran. Es una economía de progreso, no de dinero.

- **Catálogo por niveles ("tiers"):** los avatares están agrupados en familias temáticas
  (las clásicas criaturas/personajes de Khan: *Leaf*, *Leafers*, *Marcimus*, *Aqualine*,
  *Primosaur*, *Piceratops*, *Robo Avatars*, *Hopper*, *Duskpin*, *Mr. Pink*, etc.). Cada
  familia tiene varias **evoluciones/seedlings → sapling → tree → ultimate** que escalan en
  "rareza" visual.
- **Desbloqueo por umbral de puntos:** cada avatar exige un **mínimo de energy points**
  acumulados de por vida. Tiers bajos se abren con pocos puntos; los "ultimate" piden cientos
  de miles → recompensa de **largo plazo** que sostiene el hábito durante meses, no días.
- **Modular dentro de una familia:** las evoluciones reusan la misma silueta/identidad pero
  suben de fidelidad (más detalle, color, accesorios) al evolucionar — lección de **sistema
  modular**: una identidad base con estados/niveles, no N personajes sueltos.
- **Uso transversal:** el avatar elegido aparece en el perfil, junto al nombre en listas de
  clase, y como identidad del estudiante — refuerza pertenencia e identidad personal.
- **Sin pago / sin gacha:** clave ética para contexto educativo — todo se gana estudiando.
  Esto encaja perfecto con Quanta (público escolar, sin monetización agresiva).
- **Tecnología probable:** ilustración estática **SVG/PNG** por avatar (no animación pesada
  tipo Lottie en cada uno). El "wow" viene de la **colección y la rareza**, no del motion.

> Para Quanta: replicar el **mecanismo** (avatares ganados por puntos, con tiers y umbrales
> crecientes y evoluciones modulares) con **arte 100% original** (átomos/moléculas/partículas
> que evolucionan), nunca las criaturas de Khan.

## 3. Lenguaje de ilustración

- Estilo **flat con personalidad amable**: criaturas redondeadas, expresivas, paleta saturada
  pero no estridente; trazo limpio, formas simples reconocibles a tamaño pequeño (24–64px).
- Ilustraciones de sección/encabezado tipo *spot illustration* educativa: claras, temáticas
  por materia, sin ruido visual. Prioriza **comprensión sobre espectáculo**.
- Consistencia: todo el catálogo de avatares comparte un "ADN" de diseño (proporción cabeza,
  ojos, paleta) aunque sean familias distintas.

## 4. Motion & micro-interacciones

- Motion **funcional y sobrio**: transiciones suaves de página/panel, barras de progreso que
  se llenan, check de "completado", pequeñas celebraciones al subir de nivel de maestría.
- Nada de animación constante en pantalla (a diferencia de apps muy gamificadas): respeta la
  concentración en lectura/ejercicio largo. El motion **marca progreso y feedback**, no entretiene.
- Confeti/destello discreto al completar una unidad o ganar una insignia.

## 5. Sonido & feedback

- Experiencia **mayormente silenciosa por defecto** — apropiado para aula/biblioteca.
- El feedback es visual: verde de acierto, marca de correcto/incorrecto en ejercicios,
  pistas escalonadas (hint → step → solución). Video con audio solo en lecciones.
- Lección transferible: en entorno educativo el **sonido es opcional y no intrusivo**.

## 6. UX de gamificación (maestría, energy points, badges)

Sistema de progreso de **dos capas** que es su mayor activo:

- **Energy points:** moneda de esfuerzo acumulativa de por vida. Se ganan viendo videos,
  haciendo ejercicios y completando tareas. **No se gastan** — solo crecen y desbloquean
  avatares e insignias. Motor de constancia a largo plazo.
- **Mastery levels (maestría):** por cada habilidad/skill el estado progresa
  **Attempted → Familiar → Proficient → Mastered**, codificado por color. El "course mastery"
  es un **% agregado** del curso → da una meta clara y medible. La maestría puede **bajar** si
  no se repasa (decay), incentivando repaso espaciado.
- **Badges/insignias** en tiers de rareza (de menor a mayor): **Meteorite, Moon, Earth, Sun,
  Black Hole**, más **Challenge Patches**. Mezclan logros fáciles frecuentes con logros raros
  aspiracionales (modelo de recompensa variable sano).
- **Dashboard de progreso** muy legible: anillos/barras por curso, racha de actividad,
  "próximo paso" sugerido. Orientado a **dominio del contenido**, no a competir con otros.

> Diferencia clave vs Kahoot/Duolingo: Khan premia **profundidad y constancia** (maestría
> persistente) más que velocidad o rachas diarias. Para Quanta conviene combinar ambos:
> energía de la sesión (Kahoot) + progreso de maestría a largo plazo (Khan).

## 7. Onboarding & estados

- Onboarding por **rol** (estudiante / profesor / padre) y por **objetivo/curso**: te lleva
  rápido a "elegí qué aprender" sin fricción.
- Estados de progreso siempre visibles (qué hiciste, qué sigue). Empty states con CTA claro
  ("Empezá tu primer curso").
- Skeletons/loading sobrios; recuperación de error suave.

## 8. Layout / IA / responsividad

- IA fuerte: **curso → unidad → lección → ejercicio**, con barra de progreso persistente y
  navegación lateral clara. El estudiante siempre sabe dónde está y cuánto falta.
- **Responsive real**, mobile-first en producto y app nativa; contenido de lectura con medidas
  de línea cómodas. Layout centrado en contenido, sin densidad excesiva.

## 9. ★ Accesibilidad (fortaleza de Khan)

Khan es referente reconocido en a11y educativa:

- **WCAG 2.x AA** como objetivo declarado; contraste de texto cuidado (texto casi-negro sobre
  blanco) y foco visible azul.
- **No depende solo del color:** los niveles de maestría se distinguen por etiqueta/forma además
  del color → daltónico-friendly. (Patrón a copiar: nunca color como único canal.)
- **Navegación por teclado** y compatibilidad con lectores de pantalla en el flujo de ejercicios;
  uso de roles/labels ARIA en su design system Wonder Blocks.
- **Transcripciones/subtítulos** en videos; contenido traducido a muchos idiomas (incluye
  español) → diseño que tolera longitudes de texto variables.
- **Targets táctiles** amplios y tipografía legible para lectura prolongada.
- Wonder Blocks incorpora accesibilidad en los componentes base, así que la a11y es **default**
  y no un parche por pantalla — el patrón clave: **accesibilidad en la capa de tokens/componentes**.

---

## Qué tomar para Quanta

- **Avatares ganados por energy points con tiers + evoluciones modulares** (no compra, no gacha):
  arte original de partículas/átomos que evolucionan; umbrales crecientes para enganche a meses.
- **Doble capa de progreso:** energía de sesión (estilo Kahoot) **+ maestría persistente por tema**
  (Familiar→Competente→Dominado, codificada por color **y** etiqueta) con % de curso agregado.
- **Badges en tiers de rareza** (frecuentes fáciles + raros aspiracionales) para recompensa variable sana.
- **Accesibilidad en la capa de tokens/componentes de `packages/ui`**, no por pantalla: contraste
  AA, foco visible, y **nunca el color como único canal** (siempre forma/etiqueta de respaldo).
- **Sonido opcional y no intrusivo** y motion **funcional** (marca progreso/feedback), respetando
  contexto escolar y `prefers-reduced-motion`.
- Estética **limpia y académica** (radios suaves contenidos, jerarquía tipográfica sobria) como
  contrapeso al pastel actual: legible y "en serio", sin perder calidez.

## Fuentes

- Khan Academy (producto): https://www.khanacademy.org/
- Wonder Blocks (design system open-source): https://khan.github.io/wonder-blocks/ · https://github.com/Khan/wonder-blocks
- Energy points, avatares y badges (centro de ayuda): https://support.khanacademy.org/hc/en-us/articles/202489058
- Sistema de maestría (Mastery): https://support.khanacademy.org/hc/en-us/articles/115002479991
- Accesibilidad de Khan Academy: https://support.khanacademy.org/hc/en-us/articles/360056647072
- Khan Academy Engineering / diseño (blog): https://blog.khanacademy.org/engineering/

> Pendiente de verificación con Playwright + `getComputedStyle` (ver `tools/`): HEX exactos del
> verde de marca y grises, familia tipográfica real en producción, radios y umbrales de puntos
> vigentes de cada tier de avatar/badge.
