# Avatar System Spec — Personajes animados de Quanta (T017) ★

> Especificación del sistema de avatares/personajes animados de Quanta, derivada del
> benchmark (Duolingo = tecnología de personaje; Blooket/Khan = coleccionismo ético;
> Prodigy = personalización por slots). Define **anatomía, estados, tecnología recomendada
> y plan por fases**. La implementación es Fase B (tasks T-pulido), no esta task.

---

## 1. Visión

Hoy `apps/web/components/atom-mascot.tsx` es un **SVG estático**: un átomo sonriente
(núcleo + 3 órbitas de electrones + cara). Es buena base de marca pero no reacciona.

**Objetivo:** convertirlo en un **personaje vivo** que reacciona a los eventos del juego
(acierto, error, celebración, racha) y se reutiliza en **todo el funnel** (landing, lobby,
pregunta, reveal, podio, perfil). Es el cambio que **más sube la calidad percibida** según
el benchmark (todos los líderes lo tienen; Quanta no, todavía).

Nombre propuesto para la mascota protagonista: **"Quark"** (el átomo de Quanta). Marca
propia, sin IP de terceros.

---

## 2. Anatomía (modular, para escalar estados sin redibujar)

Patrón Duolingo: **un rig con partes intercambiables**. El SVG actual ya separa los rasgos
→ está a un paso de ser modular.

```
Quark
├─ núcleo (cuerpo/cara base)         ← color identitario (hereda token de elemento)
│  ├─ ojos (swap: normal/feliz/cerrados/sorpresa/X-X)
│  ├─ boca (swap: sonrisa/abierta/triste/“o”/plana)
│  └─ cejas (swap: neutra/alegre/caída)        [opcional]
├─ órbitas de electrones (3)         ← rotación continua (idle), aceleran en celebración
├─ electrones (3 puntos)             ← brillan/saltan en acierto
└─ accesorio (slot opcional)         ← gorro/lentes/etc. (personalización, fase posterior)
```

**Caras modulares = barato:** con ~5 ojos × ~5 bocas se cubren todos los estados
emocionales sin redibujar el cuerpo (técnica "mouth/eye swap" de Duolingo).

---

## 3. Estados (la clave del enganche)

El personaje **reacciona al evento**, no es un loop decorativo. Estados mínimos:

| Estado | Disparador (en `/sala` y retos) | Animación |
| --- | --- | --- |
| `idle` | en reposo (lobby, esperando) | respiración sutil + parpadeo + órbitas girando lento |
| `thinking` | pregunta activa, sin responder aún | mirar opciones, leve balanceo |
| `correct` | respuesta correcta / reveal acierto | salto, brazos/electrones arriba, ojos brillantes |
| `wrong` | respuesta incorrecta | encogerse, ceja caída, "ouch" **empático** (no humilla) |
| `celebrate` | fin de partida / podio / subir de nivel | baile, órbitas rápidas, + confeti (capa aparte) |
| `streak-lost` | racha en peligro/perdida (cuando exista racha) | "átomo triste" (aversión a la pérdida) |

**Regla de oro de feedback (de Duolingo/Quizizz):** el error **da pena por el personaje**,
no castiga al estudiante. Acierto/error siempre **multicanal**: color + ícono + sonido +
reacción de Quark.

---

## 4. ★ Tecnología recomendada

> Pregunta central del brief. Veredicto: **Rive para el personaje con estados + Lottie/
> canvas-confetti para efectos de un disparo + SVG/CSS como fase 0 puente.**

### Comparativa

| Opción | Fuerte en | Débil en | Rol en Quanta |
| --- | --- | --- | --- |
| **SVG + CSS/Framer Motion** | cero deps nuevas, ya tenemos el SVG, control fino, liviano | estados complejos se vuelven mucho código; sin "máquina de estados" real | **Fase 0** (puente, envío rápido) |
| **Lottie** (`lottie-web`) | playback de animaciones AE prerenderizadas, ideal confeti/loaders | es **timeline playback**: lógica de estados hay que orquestar desde código, 1 JSON por estado → no escala con muchos estados | **Efectos one-shot** (confeti, badges, sparkles) |
| **Rive** (`@rive-app/react-canvas`) | **State Machine nativa**: 1 `.riv` con rig + estados + inputs; el archivo decide la transición; vectorial/nítido; iterable por diseño sin tocar código | curva de aprendizaje del editor; runtime WASM (~peso a medir) | **★ Cerebro del personaje** (idle/correct/wrong/celebrate/thinking/streak) |

### Recomendación final
- **Quark (protagonista) → Rive.** Un solo `quark.riv` con una **State Machine** y un input
  `state` (enum: `idle|thinking|correct|wrong|celebrate|streakLost`). El runtime web
  (`@rive-app/react-canvas`) solo setea el input según el evento de Colyseus/UI; la
  transición/animación la maneja el archivo. Esto es exactamente lo que hace Duolingo.
  - Ventajas: **un archivo** cubre todos los estados (menos peso/archivos), nítido en
    cualquier densidad, **estados editables por diseño** (iterar el "juice" sin redeploy de
    lógica), interactividad/blend en tiempo real.
- **Confeti/celebración → `canvas-confetti`** (MIT, sin assets) o un **Lottie** CC0; capa de
  un disparo, no lógica de estado.
- **Fase 0 (puente, sin esperar a producir el `.riv`):** animar el `AtomMascot` SVG actual
  con **CSS keyframes / Framer Motion** (idle + correct + wrong básicos, face-swap). Permite
  enviar mejoras ya y validar los estados antes de invertir en Rive.

### Costo/dependencias
- Rive: `@rive-app/react-canvas` (runtime). Producir `quark.riv` en el editor Rive (gratis).
- Confetti: `canvas-confetti` (~3kb, MIT).
- Medir el peso del runtime Rive en el bundle de `/sala` antes de generalizar.

---

## 5. Personajes coleccionables (retención ética — Fase posterior)

Combina lo mejor de Blooket (tiers) + Khan (ganados por mérito) + Prodigy (reuso):

- **Roster original de partículas/elementos:** electrón, protón, fotón, H, O, He… (assets
  **propios**, alineados al tema Física/Química). NO IP de terceros.
- **Se ganan por PUNTOS acumulados, no por dinero** (modelo Khan, ético para menores).
  Sin gacha de pago, sin pay-to-win — 100% cosmético.
- **Tiers de rareza** (modelo Blooket) con halo/borde por tier (tokens `--tier-*` en el
  design system v2). El **reveal** del unlock es el pico emocional.
- **Colección con huecos visibles** → motor de retención.
- **Selección de avatar** persistida en el perfil; reusado en lobby, leaderboard y perfil
  (modelo Prodigy: el mismo personaje en todo el funnel).

### Personalización (opcional, más adelante — modelo Prodigy, versión ligera)
Slots mínimos sobre Quark: **color del núcleo** + **1 accesorio** (gorro/lentes). Editor
con preview en vivo. No hace falta el paper-doll completo de Prodigy para empezar.

---

## 6. Implicaciones de datos

- `profiles.avatar_url` ya existe. Para coleccionables agregar (Fase B):
  - `profiles.selected_avatar` (id del personaje elegido) y una tabla
    `owned_avatars(user_id, avatar_id, unlocked_at)` o un `jsonb` en el perfil.
  - El **unlock** se deriva de los puntos (de `challenge_attempts` + `game_results`) →
    umbrales server-side (anti-cheat).
- Invitados (sin login, ver T021): selección de avatar en `localStorage` (cosmético local).

---

## 7. Reuso (construir una vez, usar en todos lados)

| Pantalla | Estado típico de Quark |
| --- | --- |
| Landing | `idle`/`celebrate` (hero animado) |
| Lobby `/sala` | `idle` (junto al código de sala) |
| Pregunta | `thinking` |
| Reveal | `correct`/`wrong` según el jugador |
| Podio/finished | `celebrate` (+ confeti) |
| Resultados de reto solo | `correct`/`wrong` (ya hay `ResultPanel` de T014) |
| Perfil / Mis puntajes | avatar seleccionado + colección |

---

## 8. Accesibilidad

- **`prefers-reduced-motion`**: degradar a una pose estática (sin loop) — Rive permite no
  reproducir la State Machine y mostrar un frame.
- `role="img"` + `aria-label` (ya presente en el SVG actual).
- El estado emocional **nunca** es el único canal de feedback (siempre + ícono + copy).

---

## 9. Handoff a Fase B (tasks de implementación sugeridas)

1. **Fase 0 — Quark animado en SVG/CSS** (idle/correct/wrong + face-swap), integrado en
   `ResultPanel` y `/sala`. Sin deps nuevas. (Envío rápido, valida estados.)
2. **Rive del personaje** — producir `quark.riv` con State Machine; integrar
   `@rive-app/react-canvas`; reemplazar la versión SVG en los puntos del §7. + `canvas-confetti`
   para celebración.
3. **Coleccionables** — roster original + unlock por puntos + tiers + selección persistida.
4. **Personalización ligera** — color de núcleo + 1 accesorio.

> Estimación de assets y orden detallado en `asset-production-plan.md`.
