# T017 — Investigación de diseño & assets (benchmark de productos similares)

> **Brief completo de la task T017.** El agente que la tome lee esto primero.
> Esta es una task de **investigación** cuyo entregable es un **dossier** que después
> alimenta el pulido de diseño (tasks T018+). **No se rediseña nada en esta task** —
> solo se investiga, se sintetiza y se propone. Owner: `ui-web`. Prioridad: P1.

---

## 1. Objetivo

Hacer una investigación profunda de cómo construyen su experiencia visual y de marca
los productos educativos/gamificados líderes (Kahoot, Duolingo y similares variados),
para **subir exponencialmente el nivel de diseño de Quanta**: estilo gráfico, sistema
de **avatares/personajes animados**, micro-interacciones, sonido, y UX de gamificación.

El resultado es un **dossier estructurado** (carpeta `docs/research/design-benchmark/`)
con análisis por sitio + una **síntesis accionable** + una **propuesta de design system
v2 para Quanta** + un **spec de sistema de avatares** + un **plan de producción de assets**.

## 2. Por qué (rationale)

Quanta ya tiene una fundación de diseño ("Edu-friendly suave": pastel, `AtomMascot`,
tokens en `packages/ui/src/tokens.css`), pero es básica. Los referentes del rubro
resuelven muy bien cosas que hoy nos faltan: personajes con personalidad y estados
animados, feedback de acierto/error memorable, progresión que engancha, e ilustración
coherente. Estudiar **cómo** lo hacen (patrones, técnicas, sistemas) nos deja copiar el
**método**, no el contenido, y producir assets propios mucho mejores.

## 3. ⚠️ Principio innegociable: derivados originales, NO piratería de assets

- **NO** descargar/redistribuir/comitear assets con copyright (avatares, ilustraciones,
  fuentes de pago, sonidos, mascotas de Kahoot/Duolingo, etc.). Eso es infracción y queda
  fuera del repo.
- **SÍ** analizar **técnicas y patrones**: paletas, ritmo de animación, anatomía de un
  sistema de avatares modular, jerarquía visual, estructura de tokens, etc., y a partir de
  eso **producir assets ORIGINALES** de Quanta (propios o con licencia libre/CC).
- Las capturas de pantalla de referencia se guardan **solo para estudio interno** (carpeta
  `assets/refs/`, documentadas con su fuente), nunca se usan en la app.
- Todo asset que termine en la app debe ser **original** o de **licencia explícitamente
  libre** (CC0/CC-BY con atribución, MIT, fuentes con OFL, etc.), registrado en
  `references.md` con su licencia.

## 4. Sitios a escanear

**Núcleo (obligatorios):**
- **Kahoot** — `https://kahoot.it/` y `https://kahoot.com/` (★ avatares/muñecos animados, lobby, feedback de quiz)
- **Duolingo** — `https://www.duolingo.com/` (★ personajes animados/Lottie/Rive, gamificación, streaks, estados emocionales del personaje)

**Variados (elegir al menos 6–8 más, mezclando educativo y gamificado):**
- Quizizz, Blooket, Gimkit, Prodigy Math, Khan Academy, Brilliant, Sololearn,
  Photomath, Mathletics, Memrise, Busuu, ABCmouse, Sololearn, Quizlet, Toca Boca,
  Classcraft, Minecraft Education.

**Galerías de inspiración / design systems (para técnica, no scraping de producto):**
- Mobbin, Land-book, Godly, Dribbble, Behance (búsquedas: "educational app", "quiz app
  UI", "mascot animation", "avatar builder", "gamification UI").
- Figma Community (design systems y avatar kits open/free).
- Charlas/case studies publicados de Duolingo Design (motion, personajes, sound design)
  y del equipo de Kahoot.

> El agente puede ampliar la lista; documentá cada sitio elegido y por qué.

## 5. Ejes de análisis (workstreams)

Para cada sitio relevante, analizar lo que aplique:

1. **Design tokens** — paleta (con HEX/HSL), tipografía (familias, escalas, pesos),
   spacing, radios, sombras, gradientes, estados (hover/active/disabled).
2. **★ Sistema de avatares / personajes animados** (PRIORITARIO) — cómo se componen
   (¿modular por partes? ¿personalizables?), estados animados (idle, acierto, error,
   celebración, "pensando"), tecnología probable (Lottie, Rive, sprite sheets, SVG+CSS),
   cómo se reusan en lobby/perfil/feedback.
3. **Lenguaje de ilustración** — estilo (flat, soft 3D, line, blob), grosor de trazo,
   formas, expresividad, consistencia.
4. **Motion & micro-interacciones** — transiciones, easings, timing, feedback táctil,
   confeti/celebración, animación de entrada de pantallas.
5. **Sonido & feedback** — SFX de acierto/error/avance, música, háptica (cuándo y cómo).
6. **UX de gamificación** — XP, niveles, streaks, ligas/leaderboards, recompensas,
   monedas, badges, progreso, "vidas", refuerzo de acierto/error.
7. **Onboarding & estados** — primer uso, vacíos, loading/skeletons, error, éxito.
8. **Layout / IA / responsividad** — estructura de pantallas, navegación, mobile-first.
9. **Accesibilidad** — contraste, tamaños táctiles, motion-reduce, foco.

## 6. Metodología y herramientas

- **Render real + extracción de estilos:** las páginas son SPAs con mucho JS — `WebFetch`
  solo suele traer poco. Usar **Playwright** (ya está en el repo para E2E) en un script
  headless para: navegar, tomar **screenshots** de pantallas clave, y **extraer CSS
  computado** (colores, fuentes, spacing, radios) de elementos representativos vía
  `getComputedStyle`. Guardá el script en `docs/research/design-benchmark/tools/`.
- **Búsqueda dirigida:** `WebSearch` + `WebFetch` para case studies, charlas de diseño,
  documentación de design systems, shots de Dribbble/Behance/Mobbin, y kits open/CC.
- **Animación:** identificar si usan **Lottie**/**Rive** (inspeccionar requests `.json`/
  `.riv`, o el DOM/`canvas`) — define la tecnología que evaluaremos para Quanta.
- **Fuentes de assets libres** (para producción propia): repos open-source de avatares
  (p. ej. estilo "DiceBear", "Open Peeps", "Notion-style"), LottieFiles (filtrando por
  licencia), Iconos (Lucide ya está en el stack), fuentes OFL (Google Fonts).
- Respetá `robots.txt` y términos; el scraping es para **análisis de estructura/estilo**,
  no para extraer ni redistribuir contenido protegido.

## 7. Entregables (estructura de la carpeta)

```
docs/research/design-benchmark/
├─ README.md                  # este brief (no se toca, es la instrucción)
├─ sites/
│  ├─ kahoot.md               # análisis por sitio (workstreams 1–9 que apliquen)
│  ├─ duolingo.md
│  └─ <otros>.md
├─ SYNTHESIS.md               # patrones transversales: qué hacen TODOS bien, qué tomar
├─ quanta-design-system-v2.md # PROPUESTA accionable: tokens nuevos, escala tipográfica,
│                             #   estilo de ilustración, motion guidelines, sonido —
│                             #   contrastado contra packages/ui/src/tokens.css actual
├─ avatar-system-spec.md      # ★ spec del sistema de avatares/personajes animados de
│                             #   Quanta (anatomía modular, estados, tecnología elegida
│                             #   con recomendación: Lottie vs Rive vs SVG/CSS, cómo
│                             #   evoluciona el AtomMascot actual), con bocetos/refs
├─ asset-production-plan.md   # qué assets producir, en qué orden, con qué herramienta,
│                             #   estimación, y cuáles son originales vs licencia libre
├─ references.md              # todos los links + licencia de cada recurso reutilizable
├─ tools/                     # scripts Playwright/extracción usados (reproducibles)
└─ assets/refs/               # SOLO capturas de referencia para estudio (con fuente);
                              #   NUNCA se importan en la app
```

## 8. Definición de "hecho" (acceptance)

- [ ] Kahoot + Duolingo + **≥6** sitios más analizados en `sites/*.md` (workstreams cubiertos).
- [ ] `SYNTHESIS.md` con patrones transversales priorizados (qué adoptar primero y por qué).
- [ ] `quanta-design-system-v2.md` con tokens/escala/motion **concretos** y contrastados
      contra `packages/ui/src/tokens.css` actual (qué cambia, qué se agrega).
- [ ] `avatar-system-spec.md` con la **anatomía del sistema de avatares animados**, estados
      definidos, y una **recomendación de tecnología** justificada (Lottie/Rive/SVG).
- [ ] `asset-production-plan.md` con backlog de assets (original vs licencia libre) listo
      para convertirse en tasks T018+.
- [ ] `references.md` con licencias de todo lo reutilizable. **Cero assets con copyright
      comiteados** a la app.
- [ ] Script(s) de extracción reproducibles en `tools/`.

## 9. Fase B — cómo se consume esto

Cuando el dossier esté cerrado, el Coordinador deriva tasks de **pulido** que lo
implementan, por ejemplo:
- **T018** — Aplicar design system v2 a `packages/ui` (tokens, tipografía, motion).
- **T019** — Implementar el sistema de avatares animados (perfil + lobby Kahoot + feedback).
- **T020** — Rework de pantallas clave (landing, `/jugar`, `/sala`, resultados) con el
  nuevo lenguaje visual.
- **T021** — Capa de sonido/celebración y micro-interacciones.

> El orden y alcance de T018+ los define la síntesis. **No empezar a codear el pulido
> dentro de T017** — primero el dossier, después las tasks de implementación.

## 10. Checklist de arranque para el agente

1. Leé `docs/state/HANDOFF.md`, `docs/agents/ui-web.md` y `packages/ui/src/tokens.css`
   (estado de diseño actual) + `apps/web/components/atom-mascot.tsx` (mascota actual).
2. Cambiá el `status` de T017 a `in_progress` en `docs/state/TASKS.md`.
3. Rama: `feat/ui-T017-design-benchmark`.
4. Investigá → escribí el dossier (sección 7). Commits incrementales por sitio están bien.
5. Cuando cumplas la acceptance (sección 8), abrí PR y avisá al Coordinador.
