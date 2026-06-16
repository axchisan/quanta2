# Asset Production Plan (T017)

> Backlog de assets a producir para el pulido (Fase B), con **origen** (original vs licencia
> libre), herramienta, orden y estimación. Listo para convertirse en tasks T-pulido.
>
> **Regla:** todo asset que llegue a la app es **original** o de **licencia explícitamente
> libre** (CC0/CC-BY con atribución, MIT, OFL). Cero IP de terceros. Licencias en
> `references.md`.

---

## 1. Prioridad por impacto/esfuerzo

| # | Asset / entregable | Origen | Herramienta | Esfuerzo | Bloquea |
| --- | --- | --- | --- | --- | --- |
| 1 | **Quark animado (SVG/CSS, Fase 0)** — idle/correct/wrong + face-swap | Original (evoluciona `atom-mascot.tsx`) | SVG + Framer Motion/CSS | S | — |
| 2 | **SFX library** (success/error/click/whoosh/celebrate/coin/tick) | Original (Web Audio, ya hay base T014) o CC0 | Web Audio API / SFXR | S | — |
| 3 | **Confeti de celebración** | Lib MIT (`canvas-confetti`) o Lottie CC0 | canvas-confetti | XS | — |
| 4 | **Tokens v2 + botón 3D + motion** | Original (CSS) | `@quanta/ui` | S | — |
| 5 | **Íconos de respuesta (4 formas)** | Original / Lucide (ISC) | SVG | XS | — |
| 6 | **`quark.riv` (Rive State Machine)** — todos los estados | Original | Rive editor | M | #1 valida estados |
| 7 | **Roster de partículas coleccionables** (electrón, protón, fotón, H, O, He, …) | Original | SVG/Rive | M–L | #6 (estilo) |
| 8 | **Halos/marcos de tier** (common→legendary→chroma) | Original (CSS/SVG) | CSS/SVG | S | tokens v2 |
| 9 | **Ilustraciones de concepto STEM** (manipulables Brilliant-style) | Original | Phaser/canvas/SVG | L | por reto |
| 10 | **Accesorios de personalización** (gorros/lentes) | Original | SVG/Rive | M | #6 |

> Esfuerzo: XS < S < M < L. El orden 1–5 son **quick wins** sin deps nuevas (envían ya);
> 6+ requieren producir el `.riv` y/o assets nuevos.

---

## 2. Herramientas recomendadas (todas gratis / licencia libre)

- **Rive** (editor gratis) — personaje con State Machine. Runtime `@rive-app/react-canvas`.
- **canvas-confetti** (MIT) — celebración one-shot.
- **Framer Motion** (MIT) — animación de la Fase 0 en React (o CSS keyframes puros).
- **Lucide** (ISC) — ya en el stack; íconos de respuesta/feedback.
- **SVG a mano / Figma** — partículas y accesorios originales.
- **Web Audio API** — SFX sintetizados (ya hay base en T014); alternativa CC0: Kenney SFX.
- **Fuentes**: Baloo 2 + Nunito (OFL, ya en uso) — no cambian.
- **Inspiración de método (NO copiar assets):** DiceBear (avatares procedurales open),
  Open Peeps (CC0), LottieFiles (filtrar por licencia). Ver `references.md`.

---

## 3. Mapa a tasks de Fase B (sugerido para el Coordinador)

- **T-pulido-A — Design system v2 en `@quanta/ui`**: tokens semánticos, botón 3D, sistema
  de motion, números tabulares, `prefers-reduced-motion`. (Assets #2,#3,#4,#5)
- **T-pulido-B — Quark vivo (Fase 0)**: SVG/CSS, integrado en `ResultPanel` + `/sala`.
  (Asset #1)
- **T-pulido-C — Quark en Rive**: `quark.riv` + runtime + confeti, reemplaza en el funnel.
  (Assets #6,#3)
- **T-pulido-D — Coleccionables**: roster + unlock por puntos + tiers + selección.
  (Assets #7,#8 + datos del avatar-spec §6)
- **T-pulido-E — Manipulables STEM**: ampliar retos interactivos estilo Brilliant.
  (Asset #9)
- **T-pulido-F — Personalización ligera**: color de núcleo + accesorios. (Asset #10)

---

## 4. Estimación gruesa

- **Quick wins (A + B):** alto impacto percibido, bajo riesgo, sin deps mayores → primero.
- **Rive (C):** el salto de calidad grande; requiere producir el `.riv` y medir el peso del
  runtime en el bundle de `/sala`.
- **Coleccionables (D):** mayor esfuerzo de arte (roster) + datos; hacer después de C para
  reusar el estilo del personaje.
- STEM (E) y personalización (F): incrementales, por demanda.

---

## 5. Checklist de licencias (antes de comitear cualquier asset)

- [ ] ¿Es **original** de Quanta? → OK.
- [ ] ¿Es de **licencia libre**? → registrar en `references.md` con licencia + atribución.
- [ ] ¿Tiene IP de terceros (Kahoot/Duolingo/etc.)? → **NO entra**. Solo refs de estudio en
      `assets/refs/` (nunca importado por la app).
