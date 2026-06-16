# SYNTHESIS — Patrones transversales del benchmark (T017)

> Síntesis accionable de los 8 análisis en `sites/`. Qué hacen **todos** bien, qué
> adoptar **primero** en Quanta y por qué. Alimenta `quanta-design-system-v2.md`,
> `avatar-system-spec.md` y `asset-production-plan.md`.
>
> ⚠️ **Nota de método.** En esta sesión `WebSearch`/`WebFetch`/red estuvieron **denegados
> por permisos**, así que los análisis se basan en conocimiento público documentado de cada
> producto, con HEX/timings marcados como aproximados (`≈`/`~`). Para un pase con **datos en
> vivo** (HEX exactos, screenshots, `getComputedStyle`) está listo `tools/extract-design-tokens.mjs`
> (requiere `pnpm add -D playwright && npx playwright install`). Esto no afecta el valor del
> dossier: la investigación es de **método y patrones**, no de valores exactos.

---

## 1. Sitios analizados

| Sitio | Lo que mejor resuelve (para Quanta) |
| --- | --- |
| **Kahoot** | Color **+ forma** redundante en respuestas; puntaje por velocidad; podio/leaderboard en vivo. Es nuestro modo de salas. |
| **Duolingo** | **★ Personajes animados con Rive + State Machine**; racha con aversión a la pérdida; botón 3D; errores empáticos. |
| **Blooket** | Personajes **coleccionables por tiers de rareza** (no builder); unlock cosmético sin pay-to-win; 1 engine + N modos. |
| **Prodigy** | **Avatar paper-doll por slots** reusado en todo el funnel; contenido **como mecánica**, no quiz adyacente. |
| **Khan Academy** | Avatares **ganados por puntos** (ético, no gacha); doble progreso (sesión + maestría); a11y en la capa de tokens. |
| **Brilliant** | **Manipulables interactivos** por concepto STEM; color semántico en la ilustración; UI editorial sobria. |
| **Quizizz** | Feedback **memorable entre preguntas** (reacción de mascota); power-ups; redemption questions. |
| **Gimkit** | **Economía in-game** con upgrades (premia pensar, no solo velocidad); feedback económico "jugoso". |

---

## 2. Patrones transversales (lo que hacen casi TODOS)

1. **Un personaje/mascota con estados emocionales es el corazón de la marca.** Duolingo,
   Kahoot, Prodigy, Blooket, Khan: todos tienen identidad encarnada en personajes que
   **reaccionan al evento** del usuario (acierto/error/celebración). Quanta tiene el
   `AtomMascot` pero **estático** → la mayor oportunidad.
2. **Color con semántica, no decorativo.** Un acento por significado (acierto, error,
   racha, recompensa, info). Y **el color nunca es el único canal** (Kahoot: formas;
   Duolingo/Khan: ícono+copy+sonido) → accesibilidad de base.
3. **Feedback multicanal e inmediato ("juice").** Acierto/error = visual + ícono + sonido
   corto + reacción del personaje + (háptica en mobile). Timing corto (<300–400ms) salvo
   celebraciones, que se permiten ser el "premio".
4. **Progresión en dos capas:** ritmo rápido por partida (puntaje/velocidad, economía) +
   progreso persistente a largo plazo (maestría, colección, racha). Engancha en la sesión
   y entre sesiones.
5. **Coleccionismo cosmético desacoplado del acierto individual** (Blooket/Khan/Prodigy):
   jugar → moneda blanda → unlock con **reveal** → colección con huecos visibles. Motor de
   retención **ético** cuando es 100% cosmético y sin pay-to-win.
6. **1 engine de contenido + N modos/skins** (Gimkit/Blooket): multiplica rejugabilidad sin
   multiplicar contenido. Relevante para la arquitectura de salas Colyseus.
7. **Botón/tacto "físico"** (Duolingo 3D press-down): esquinas redondeadas + sombra sólida
   + press-down al `:active` = sensación de juguete.
8. **Mobile-first, un foco por pantalla, un CTA dominante.** Jerarquía sin ambigüedad.

---

## 3. Lo PRIORITARIO para Quanta (orden de adopción)

> Quanta ya tiene: fundación pastel ("Edu-friendly suave"), `AtomMascot` SVG estático,
> SFX Web Audio (T014), salas Kahoot con puntaje por velocidad (T015–T020). El benchmark
> dice **dónde subir el nivel**.

### P0 — Personaje vivo (el mayor salto percibido)
Evolucionar el `AtomMascot` de SVG estático a **personaje con estados** (idle, acierto,
error, celebración, "pensando", racha-perdida), reusado en lobby/juego/resultados/landing.
**Tecnología recomendada: Rive (State Machine) para el personaje + Lottie/canvas-confetti
para efectos de un disparo.** Detalle en `avatar-system-spec.md`. → tasks de pulido (Fase B).

### P1 — Lenguaje de gamificación con semántica + juice
Tokens semánticos (acierto/error/racha/XP/recompensa), botón 3D press-down, celebración
de podio (confeti + count-up del score), reorder animado del leaderboard, feedback
multicanal. Detalle en `quanta-design-system-v2.md`.

### P2 — Accesibilidad redundante (barata y de alto impacto)
**Color + forma/ícono** en las 4 respuestas Kahoot (como Kahoot), `prefers-reduced-motion`
en celebraciones, modo sin-timer, targets táctiles ≥44px, contraste AA verificado.

### P3 — Coleccionismo cosmético ético (retención a largo plazo)
Avatares/partículas **ganados por puntos** (modelo Khan, no gacha de pago), por tiers de
rareza (modelo Blooket), opcionalmente con slots ligeros (modelo Prodigy). Detalle en
`avatar-system-spec.md` §5 y `asset-production-plan.md`.

### P4 — Profundidad de contenido STEM (diferenciador del rubro)
Manipulables interactivos por concepto de Física/Química (modelo Brilliant) en Phaser/canvas
— "el diagrama es la pregunta". Ya parcialmente presente (Caída Libre, Balanceo); ampliarlo.

---

## 4. Qué NO copiar (anti-patrones para Quanta)

- **Gacha de pago / loot boxes monetizadas** (riesgo ético con público escolar/menores) →
  coleccionismo **solo por mérito** (puntos), nunca por dinero.
- **Vidas/corazones que bloquean el aprendizaje** (Duolingo) → en educación, fallar debe
  enseñar (redemption questions de Quizizz), no castigar con un muro.
- **Sobrecarga de moneda/economía** (Gimkit) si confunde al público joven → empezar simple.
- **Timer obligatorio como único modo** → ofrecer modo sin-timer por accesibilidad.
- **Personajes con IP de terceros** → todo asset original o de licencia libre (ver
  `references.md`).

---

## 5. Tensión de diseño a resolver

Quanta convive en **dos registros**: **salas en vivo** (energía Kahoot: color, velocidad,
celebración) y **estudio en solitario** (sobriedad Brilliant: foco, claridad, manipulables).
La recomendación: **mantener la base pastel cálida como identidad**, subir la energía
(juice/personaje/celebración) en el modo salas, y bajar el "chrome" (más whitespace,
ilustración protagonista) en el modo estudio. Un mismo design system con dos densidades.
