# 08 — Diseño de juego

## Pilares de diseño

1. **Aprender haciendo, no leyendo.** Cada reto tiene interacción visual o manipulación; cero "lee este texto y elige".
2. **Feedback que enseña.** Errores explican el concepto, no solo dicen "incorrecto".
3. **Progresión visible.** Puntaje, racha, retos resueltos, comparativa con compañeros.
4. **Social opcional.** Solo divertirse / competir en vivo / cooperar — todos los modos válidos.
5. **Polish > cantidad.** Pocos retos pulidos > muchos retos chapuceros.

## Sistema de puntaje (server-side authoritative)

Cálculo en Edge Function / Colyseus tras cada attempt:

```
base = difficulty_multiplier[challenge.difficulty]   // easy=100, medium=200, hard=400
time_bonus = max(0, base * (1 - time_taken_ms / max_time_ms))
streak_bonus = base * 0.1 * current_streak           // máximo +50%
score = round(base + time_bonus + streak_bonus)      // si is_correct
score = 0                                             // si !is_correct (sin penalización)
```

`current_streak` se mantiene por sesión de juego (sala) o por día (modo solo).

## Modos de juego

### Modo Solo (Fase 1)
- Estudiante elige un reto del catálogo o juega un "Random Challenge".
- Recibe puntaje y feedback al instante.
- Puede reintentar (sin acumular score si ya lo resolvió bien antes).

### Sala Kahoot (Fase 2)
- Anfitrión crea sala con código → comparte URL/QR.
- Hasta 40 jugadores entran como invitados.
- Anfitrión arranca → cada reto aparece simultáneamente, cuenta regresiva (típicamente 30-60s).
- Al cerrar tiempo: leaderboard intermedio.
- Final: leaderboard final, MVP, retos más fallados.

### Duelo 1v1 (Fase 2)
- Dos jugadores se invitan (código directo) o matchmaking aleatorio.
- Mejor de 5 retos, alterna quien elige tema/dificultad.
- Ranking de duelos personal (Elo-like simple).

### Misiones cooperativas (Fase 4)
- 2-4 jugadores resuelven juntos un reto compuesto. Ej:
  - **Circuito Eléctrico**: cada jugador tiene un componente, deben armar el circuito en orden correcto.
  - **Reacción en Cadena**: cada jugador balancea una parte de una serie de ecuaciones químicas.
- Ganan o pierden todos juntos. Refuerza trabajo en equipo.

### Torneo / Liga asincrónica (Fase 4)
- Ronda semanal: cada jugador puede jugar N retos (limitado para evitar grindeo) entre lunes y domingo.
- Ranking global con badges (Top 10, Top 50%, Participante).
- Histórico visible en perfil.

## Retos del MVP (Fase 1)

### Reto 1 — Caída Libre 🪂 (Física, dificultad Easy)

**Concepto:** estudiante explora cinemática variando altura inicial y observando tiempo de caída.

**Mecánica:**
- Phaser scene con un objeto (manzana sprite) en la cima de una torre.
- Slider para altura inicial (5m - 100m).
- Slider para gravedad (1 - 20 m/s²) — incluye gravedad de Tierra, Luna, Marte como presets.
- Botón "Predecir tiempo de caída" → estudiante ingresa segundos.
- Botón "Soltar" → animación con física Matter.js, tiempo real medido.
- Validación: error <10% = correcto. Feedback con la fórmula `t = sqrt(2h/g)` y comparación numérica.

**Assets:**
- Sprite manzana/objeto (puede ser generado por IA).
- Fondo torre.
- Sonido caída (whoosh) y impacto (thud).
- Narración opcional del enunciado.

**Solución:** `t = sqrt(2 * altura / gravedad)`.

---

### Reto 2 — Balanceo de Ecuaciones ⚗️ (Química, dificultad Medium)

**Concepto:** drag & drop de coeficientes para balancear una ecuación química.

**Mecánica:**
- React UI dentro de Phaser (o overlay): ecuación visible (ej: `__ H2 + __ O2 → __ H2O`).
- Cada espacio recibe un coeficiente arrastrable de un palette (1, 2, 3, 4, 5, 6).
- Validación visual en tiempo real: átomos a izquierda y derecha se cuentan y colorean (verde si balancea, rojo si no).
- Botón "Verificar" → confirma balance.
- 3 ecuaciones progresivas en el reto (combustión metano, descomposición, síntesis).

**Assets:**
- Iconos de elementos (H, O, C, N, etc.) con colores estándar IUPAC.
- Sonido drop, sonido success.

**Solución:** array de coeficientes correctos; validación: la respuesta del usuario debe minimizar coeficientes (forma reducida) y balancear todos los elementos.

---

### Reto 3 — Trivia Mixta IA 🧠 (Física + Química, dificultad variable)

**Concepto:** pregunta de opción múltiple generada por IA con feedback educativo.

**Mecánica:**
- Estudiante elige tema (Cinemática, Dinámica, Energía, Reacciones, Estructura Atómica) y dificultad (Easy/Medium/Hard).
- Cliente llama a `POST /api/ai/generate-trivia`.
- AI Gateway → Gemini con prompt:
  ```
  Generá una pregunta de opción múltiple para un estudiante de colegio.
  Tema: <topic>. Dificultad: <difficulty>.
  Devolvé JSON: { question, options[4], correctIndex, explanation }.
  ```
- Frontend muestra pregunta + 4 opciones.
- Estudiante selecciona → server valida → si erra, llama de nuevo a IA con `feature: 'explain-error'` para feedback personalizado:
  ```
  El estudiante respondió "<su_opción>" a "<question>". La correcta era "<correct>".
  Explicá el error en máximo 3 oraciones, reforzando el concepto.
  ```
- Score: 100/200/400 + time bonus + streak.

**Assets:**
- Opcional: ilustración generada por IA del concepto si dificultad >=medium.
- Audio narración opcional.

---

## Estructura `challenges.payload` por kind

### `kind: 'simulation'` (caída libre)
```json
{
  "type": "free_fall",
  "params": {
    "initial_height_range": [5, 100],
    "gravity_range": [1, 20],
    "object_sprite": "apple"
  },
  "user_input": "predicted_time_seconds"
}
```

### `kind: 'drag_drop'` (balanceo)
```json
{
  "type": "equation_balance",
  "equation": "H2 + O2 -> H2O",
  "elements": ["H", "O"],
  "available_coefficients": [1, 2, 3, 4, 5, 6],
  "slot_count": 3
}
```

### `kind: 'multiple_choice'` (trivia)
```json
{
  "type": "multiple_choice",
  "question": "¿Cuál es la fórmula del agua?",
  "options": ["H2O", "CO2", "O2", "NaCl"],
  "ai_generated": true
}
```

### `solution` (server-only)
```json
// para simulation
{ "formula": "sqrt(2*h/g)", "tolerance_pct": 10 }

// para drag_drop
{ "coefficients": [2, 1, 2] }

// para multiple_choice
{ "correct_index": 0 }
```

## Catálogo de temas (etiquetas oficiales)

### Física
- `kinematics` (cinemática)
- `dynamics` (dinámica, fuerzas)
- `energy` (energía, trabajo, potencia)
- `waves` (ondas, sonido, luz)
- `electricity` (electricidad, circuitos)
- `magnetism`
- `thermodynamics`
- `optics`

### Química
- `atomic_structure` (estructura atómica)
- `periodic_table`
- `chemical_bonds` (enlaces)
- `equation_balance`
- `reactions` (tipos de reacciones)
- `stoichiometry`
- `acids_bases`
- `organic_chemistry`

### Mixto
- `units_conversion`
- `scientific_notation`

## Anti-cheat aplicado al diseño

- `solution` nunca viaja al cliente (RLS bloquea SELECT).
- `submitted_answer` se valida server-side antes de calcular `score`.
- Tiempo medido server-side: `time_taken_ms = server_received_at - server_sent_at`. Cliente puede mentir su timer pero no afecta score.
- En Colyseus rooms, cada `submit` se valida en el room y solo el room broadcast el `score:update`. El cliente no puede declarar su propio score.

## Polish y feel

- **Animaciones Lottie** en transiciones de pantalla y feedback (estrella al acertar, "ouch" al fallar).
- **Tweens Phaser** para movimiento de sprites entre estados.
- **Sonidos consistentes:** una librería de SFX común (Howler) — éxito, fallo, click, tick de countdown, fanfare de victoria.
- **Música de fondo opcional** (toggle): tema relajado durante exploración, intenso durante duelo.
- **Modo claro/oscuro** desde Fase 4.
- **Accesibilidad:** focus visible, contraste WCAG AA mínimo, labels en interacciones de drag & drop.

## Ideas backlog (no comprometidas)

- Reto de **Vectores** (fuerzas, suma vectorial visual).
- Reto de **Tabla Periódica** (encontrar elemento por propiedades).
- Reto **Laboratorio Virtual** (mezclar reactivos, observar reacción).
- Reto **Tiro Parabólico** (ajustar ángulo y velocidad para alcanzar blanco).
- Reto **Estequiometría** (calcular cantidades de productos).
- Reto **Onda en cuerda** (interactuar con frecuencia/amplitud).
