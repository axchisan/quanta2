# Template — Reto del juego (Challenge)

> Usá este template cuando documentás un nuevo reto jugable. Los retos del MVP están en `docs/08-game-design.md`; nuevos retos se agregan ahí siguiendo esta estructura. Los retos creados por usuarios desde la herramienta (Fase 3) se guardan en DB (`challenges` tabla) pero su **tipo** y **mecánica** deben existir previamente en código.

## Formato

```markdown
## <Título del reto>

- **ID estable:** `<subject>-<topic>-<nn>` (ej: `kin-free-fall-01`)
- **Materia:** fisica | quimica | mixto
- **Tema:** <ej: cinemática, estequiometría, trivia>
- **Dificultad:** facil | medio | dificil
- **Tipo (`kind`):** simulation | drag-drop | trivia | multi-step
- **Tiempo estimado de juego:** <n> segundos
- **Modos compatibles:** solo | kahoot | duel | coop | tournament

### Objetivo pedagógico

<1-2 frases que digan qué aprende el jugador al jugarlo. Este reto existe PARA enseñar esto.>

### Narrativa / contexto

<Breve historia o setup que ve el jugador antes de jugar. Opcional pero mejora inmersión.>

### Mecánica

<Explicación paso a paso de cómo se juega. Incluí qué ve el jugador, qué puede tocar, qué pasa al interactuar.>

1. El jugador ve <X>.
2. Ajusta <Y> usando <control>.
3. Dispara la simulación / arrastra / responde.
4. Recibe feedback visual.
5. Se emite resultado a backend.

### Inputs del jugador

| Control | Rango | Default | Validación cliente |
|---------|-------|---------|-------------------|
| <ej: slider altura> | 1–100 m | 10 | number, bounds |

### Criterio de éxito

<Cuándo se considera "bien respondido". Definí la fórmula/condición en términos que el backend pueda validar.>

### Puntaje

- **Base:** <n> puntos si acierta.
- **Bonus por tiempo:** <fórmula>
- **Penalización por errores:** <cuántos intentos, qué resta>
- **Puntaje máximo:** <n>

### Assets requeridos

- **Sprites:** <lista>
- **Audio:** <efectos, música>
- **Fuentes:** <si aplica>
- **Generables por IA en runtime:** sí | no, y con qué prompt base.

### Payload schema (Zod)

```ts
// Se envía al cliente cuando la sala carga el reto
export const FallingBodyPayload = z.object({
  height: z.number().min(1).max(100),
  gravity: z.enum(['1.6', '9.8', '24.8']),
  hiddenVariable: z.enum(['time', 'velocity']),
});
```

### Solution schema (server-only)

```ts
// NUNCA se envía al cliente. Vive en la columna `solution` de challenges (RLS bloquea SELECT).
export const FallingBodySolution = z.object({
  expectedValue: z.number(),
  tolerance: z.number(), // ±% aceptable
});
```

### Attempt schema

```ts
// Lo que manda el cliente al terminar de jugar
export const FallingBodyAttempt = z.object({
  answeredValue: z.number(),
  timeSpentMs: z.number().int().nonnegative(),
  retries: z.number().int().min(0),
});
```

### Validación server-side

<Describí qué hace la Edge Function / Colyseus room para validar. Fórmula, tolerancias, edge cases.>

### Feedback IA

- **Cuándo se pide:** después del attempt, si el jugador falló.
- **Prompt base:** ver `docs/07-ai-strategy.md` §"Prompts base".
- **Input al LLM:** valor esperado, valor respondido, tema.
- **Output esperado:** explicación en español, máx 3 frases, tono amigable-pedagógico.

### Tests mínimos

- [ ] Unit: fórmula de validación con casos felices y bordes.
- [ ] Unit: generación de payload con diferentes dificultades.
- [ ] Integration: attempt válido → score correcto; attempt inválido → rechazo.
- [ ] Visual snapshot de la escena Phaser en un tamaño conocido.

### Accesibilidad

- [ ] Controles operables con teclado.
- [ ] Feedback no solo por color (usar icono + texto).
- [ ] Textos legibles en mobile (mínimo 14px).
- [ ] Animaciones respetan `prefers-reduced-motion`.

### Notas / referencias

<Libros, papers, videos, retos similares existentes que inspiraron>
```

## Reglas

- **ID estable** no cambia nunca. Si el reto se rediseña profundamente, creá un ID nuevo y deprecá el viejo.
- **Solution nunca en el cliente.** La RLS policy en `challenges` debe bloquear `SELECT` de esa columna para no-admins; la validación vive en Edge Functions o Colyseus.
- **Un reto = una mecánica principal.** No mezcles simulación + trivia + drag-drop en uno solo; partí en varios retos encadenados si hace falta.
- **Feedback IA es opcional, pero si se activa, se loguea** en `ai_metrics` con el `challenge_id` para auditar calidad.

## Anti-patrones

- ❌ Reto sin objetivo pedagógico claro ("es divertido" no alcanza).
- ❌ Solution en el payload del cliente (cheat trivial).
- ❌ Validación solo en el cliente (cheat por devtools).
- ❌ Assets sin fallback: si el sprite IA falla, el reto debe poder jugarse con placeholder.
- ❌ Puntaje sin tope: jugadores que spammean intentos no pueden superar indefinidamente a los honestos.
