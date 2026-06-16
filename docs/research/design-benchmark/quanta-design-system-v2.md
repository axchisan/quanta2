# Quanta Design System v2 — Propuesta accionable (T017)

> Propuesta concreta derivada del benchmark, **contrastada contra el theme actual**
> (`packages/ui/src/tokens.css`). No se implementa acá (eso es Fase B / tasks T018+);
> esto define **qué cambia y qué se agrega**, con valores listos para copiar.
>
> **Principio rector:** conservar la identidad **"Edu-friendly suave"** (pastel cálido,
> esquinas muy redondeadas) como ADN de marca, y subir el nivel agregando **semántica de
> gamificación, tacto físico y motion con intención** — sin volverse estridente.

---

## 1. Estado actual (resumen de `tokens.css`)

| Token | Valor actual (HSL) | Rol |
| --- | --- | --- |
| `--primary` | `252 84% 71%` | Lavanda (CTA, marca) |
| `--secondary` | `25 100% 84%` | Durazno |
| `--accent` | `162 60% 60%` | Menta |
| `--destructive` | `357 95% 73%` | Coral (error) |
| `--muted` | `252 50% 96%` | Fondos suaves |
| `--radius` | `1.25rem` | Radio base |
| `--shadow-soft/-card` | sombras lavanda difusas | Elevación |

**Diagnóstico:** base sólida y cálida, pero **le falta semántica de gamificación** (no hay
tokens de acierto/racha/XP), **no hay sistema de motion** (timings/easings), el botón es
plano (sin tacto), y no hay tokens de tier de rareza para coleccionables.

---

## 2. Lo que se AGREGA (no rompe lo existente)

### 2.1 Tokens semánticos de gamificación
Un acento por significado (patrón Duolingo/Kahoot). Pastel pero saturable para momentos
clave. Agregar a `:root` (formato triplete HSL, igual que el resto):

```css
/* Semántica de juego */
--success: 152 62% 52%;        /* verde "acierto" (más legible que la menta para feedback) */
--success-foreground: 0 0% 100%;
--streak: 28 95% 62%;          /* naranja "racha/fuego" (aversión a la pérdida) */
--xp: 43 96% 60%;              /* ámbar "XP/recompensa/monedas" */
--info: 205 90% 60%;           /* azul "información/pista" */
--correct: var(--success);     /* alias semántico para respuestas */
--wrong: var(--destructive);   /* el coral actual ya sirve de "error" */
```

> Nota: hoy `--accent` (menta) se usa como genérico; introducir `--success` dedicado evita
> sobrecargar la menta y mejora el contraste del feedback de acierto. La menta queda para
> acento decorativo.

### 2.2 Colores de respuesta (modo salas, estilo Kahoot) — **color + forma**
Cuatro respuestas con color **y forma** (accesibilidad redundante). Derivados pastel:

| Opción | Color (HSL) | Forma |
| --- | --- | --- |
| A | `252 84% 71%` (lavanda) | ▲ triángulo |
| B | `205 90% 64%` (azul) | ◆ rombo |
| C | `28 95% 64%` (naranja) | ● círculo |
| D | `152 60% 55%` (verde) | ■ cuadrado |

La forma viaja **siempre** junto al color (íconos en `@quanta/ui`), nunca color solo.

### 2.3 Tiers de rareza (coleccionables — modelo Blooket/Khan)
Para halos/bordes de avatares desbloqueables (ver `avatar-system-spec.md`):

```css
--tier-common: 220 12% 70%;     /* gris */
--tier-rare: 205 90% 60%;       /* azul */
--tier-epic: 270 80% 68%;       /* morado */
--tier-legendary: 43 96% 58%;   /* dorado */
--tier-chroma: linear-gradient(...) /* animado, solo para el tier máximo */
```

### 2.4 Botón 3D "press-down" (firma táctil, adaptada al pastel)
Patrón Duolingo, con la paleta suave de Quanta. Tokens + comportamiento:

```css
--btn-depth: 4px;                         /* grosor de la "tecla" */
/* sombra sólida (sin blur) del color oscurecido del botón */
/* idle:  box-shadow: 0 var(--btn-depth) 0 0 hsl(<primary> oscurecido); */
/* :active: translateY(var(--btn-depth)); box-shadow: 0 0 0 0; */
```

Aplicar al `Button` de `@quanta/ui` como variante `solid-3d` (no reemplaza la actual;
se usa en CTAs de juego). `disabled` = plano gris (sin la cara 3D).

### 2.5 Sistema de motion (hoy inexistente como tokens)
```css
--motion-fast: 140ms;     /* hover, toques */
--motion-base: 240ms;     /* transiciones de UI */
--motion-slow: 400ms;     /* entradas de pantalla */
--motion-celebrate: 900ms;/* podio, subir de nivel (el "premio") */
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* UI calmada */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);/* rebote en aciertos/celebración */
```
Reglas: UI = `--ease-out`; aciertos/celebración = `--ease-spring` (overshoot). Todo
`<400ms` salvo celebraciones. **Respetar `prefers-reduced-motion`**: degradar a fades.

---

## 3. Tipografía (refinar, no reemplazar)

Hoy: Baloo 2 (display) + Nunito (texto) — ya redondeadas y on-brand (alineadas con
Duolingo/Kahoot "soft geometric"). Propuesta:
- **Mantener** las familias (son correctas y OFL, ver `references.md`).
- **Escala con números protagonistas** (XP, score, racha, timer): definir `--text-numeric`
  (tabular-nums, peso 800) para cifras grandes, como hacen Duolingo/Kahoot.
- Jerarquía con **pocos tamaños y peso alto** (display 800, headings 700, body 500).

| Token nuevo | Uso |
| --- | --- |
| `font-variant-numeric: tabular-nums` en score/timer | evita "salto" al contar |
| `--text-display: 800` | títulos de pantalla, puntaje final |

---

## 4. Elevación & superficies
- Mantener `--shadow-soft/-card` (identidad).
- Agregar `--shadow-pop` (más marcada) para cards de celebración/reveal de coleccionable.
- Cards de juego: borde 2px del color semántico en estados (correcto = `--success`,
  error = `--wrong`), ya parcialmente hecho en `/sala`.

---

## 5. Sonido (formalizar lo de T014)
Quanta ya tiene SFX Web Audio sintetizado (éxito/error/click). Elevar a **librería de
feedback** alineada al benchmark:
- `success` (ding ascendente), `error` (grave suave, **no** agresivo), `click`, `whoosh`
  (avance), `celebrate` (sparkle, más largo), `coin`/`xp` (recompensa), `tick` (timer < 5s).
- **Siempre opcional/silenciable** y nunca el único canal (el visual ya comunica).
- Háptica en mobile (Capacitor, Fase 4) en acierto/error/celebración.

---

## 6. Tabla "qué cambia"

| Área | Hoy | v2 |
| --- | --- | --- |
| Tokens semánticos | solo primary/accent/destructive | + success/streak/xp/info/tiers |
| Respuestas (salas) | color | **color + forma** (a11y) |
| Botón | plano | + variante **3D press-down** para CTAs de juego |
| Motion | ad-hoc, sin tokens | **sistema** (durations/easings + reduce-motion) |
| Personaje | SVG estático | **Rive con estados** (ver avatar-spec) |
| Números | normales | tabular-nums, peso 800, protagonistas |
| Sonido | 3 SFX | librería de feedback (7+), opcional |
| Coleccionables | — | tiers de rareza |

**Nada de lo anterior rompe el theme actual**: son adiciones a `tokens.css` + variantes
nuevas en `@quanta/ui`. La identidad pastel cálida se conserva.
