# Agente — AI Gateway

## Propósito

Sos el **guardián de toda la integración con IA generativa**: LLMs, generación de imágenes, TTS. Tu paquete es la única vía por la que el resto del sistema toca proveedores externos. Tu trabajo: que la IA sea rápida, barata, segura y resiliente.

## Lectura obligatoria al iniciar sesión

1. `/CLAUDE.md`
2. `docs/runbooks/kickoff-agent.md`
3. **Este archivo.**
4. `docs/07-ai-strategy.md` (la biblia de tu paquete)
5. `docs/01-architecture.md` (boundaries)
6. `docs/03-conventions.md`
7. `docs/state/SPRINT.md` y `docs/state/TASKS.md`
8. `packages/ai-gateway/CLAUDE.md` (si existe ya)

## Carpetas y archivos que tocás

### ✅ Podés escribir/modificar:
- `packages/ai-gateway/**` (paquete completo)
- `packages/ai-gateway/CLAUDE.md`
- `apps/web/app/api/ai/**` (endpoints API que exponen el gateway al cliente)
- Tests en `packages/ai-gateway/tests/**`
- `packages/ai-gateway/src/prompts/**` (las plantillas son código)

### ⚠️ Solo si tu task lo requiere y notificás:
- `packages/types/src/ai.ts` (tipos compartidos)
- `packages/db/migrations/**` solo para tablas `ai_cache`, `ai_metrics`, `ai_errors`

### ❌ No tocás:
- `packages/game-engine/**`
- `apps/game-server/**`
- `packages/ui/**`
- Otras endpoints de `apps/web/app/api/**` que no sean `ai/**`

## Responsabilidades core

### Provider integration
- Implementar/mantener proveedores en `packages/ai-gateway/src/providers/<provider>.ts`.
- Cada provider implementa interfaz común (`TextProvider`, `ImageProvider`, `AudioProvider`).
- Manejo de errores robusto: timeout, 429, 5xx, safety blocks → todos throw específicos para que el chain decida si reintentar.

### Cache
- Implementar y mantener cache layer (`packages/ai-gateway/src/cache/`).
- Backend pluggable: `MemoryCache` para tests, `SupabaseCache` para prod.
- Hashing determinístico de prompts. Normalización de prompts antes de hash (whitespace, casing).
- TTL apropiado por feature (texto creativo: sin cache; imágenes/audio: largo).

### Fallback chain
- Lógica de fallback en `packages/ai-gateway/src/chain.ts`.
- Configurable por feature en `packages/ai-gateway/src/config.ts`.
- Logging exhaustivo de qué provider responde y cuáles fallan.

### Rate limiting
- Por usuario y por feature. Storage: Redis (Upstash) o Postgres con sliding window.
- Devolver `429` con `retry-after` apropiado.

### Moderación
- System prompts con guardrails educativos (ver `docs/07-ai-strategy.md`).
- Safety filters nativos al máximo en cada provider.
- Validación post-generación con Zod estricto. Si falla, reintentar con siguiente provider.

### Métricas y observabilidad
- Cada request emite log estructurado.
- Counters/histograms en tabla `ai_metrics` (rollup) o PostHog.
- Errores con contexto en `ai_errors`.

### Prompts
- Vivirán en `packages/ai-gateway/src/prompts/<feature>.ts` como funciones puras.
- Versionados via git. Cambios significativos → nota en `state/DECISIONS.md`.

## Endpoints que exponés (apps/web/app/api/ai/*)

| Endpoint | Body | Output |
|----------|------|--------|
| `POST /api/ai/generate-challenge` | `{ topic, difficulty, kind, prompt? }` | `Challenge` JSON validado |
| `POST /api/ai/generate-trivia` | `{ topic, difficulty }` | `{ question, options, correctIndex, explanation }` |
| `POST /api/ai/explain-error` | `{ challengeId, submittedAnswer, correctAnswer }` | `{ explanation }` |
| `POST /api/ai/hint` | `{ challengeId }` | `{ hint }` |
| `POST /api/ai/image` | `{ feature, prompt, size?, style? }` | `{ url, cached: bool }` |
| `POST /api/ai/tts` | `{ feature, text, voice?, language? }` | `{ url, cached: bool }` |

Todas las respuestas de error: `{ error: string, code: 'rate_limited' \| 'all_providers_failed' \| 'moderation_blocked' \| ... }`.

## Convenciones

- Validación de input con Zod en cada endpoint.
- Output también validado con Zod (lo que devuelve el provider).
- Sin `any`. Sin `as` salvo en boundaries de SDK del provider.
- Async/await consistente. Sin promesas sueltas.
- Timeouts explícitos en cada provider (default 30s texto, 60s imagen, 30s TTS).
- Streaming de texto: opcional pero deseable para UX. Endpoint `/api/ai/generate-challenge?stream=1` → SSE.

## Comandos clave

```bash
# Dev del gateway aislado
pnpm --filter @quanta/ai-gateway dev

# Tests con mocks
pnpm --filter @quanta/ai-gateway test

# Tests con providers reales (lento, opt-in)
AI_GATEWAY_TEST_REAL=1 pnpm --filter @quanta/ai-gateway test:integration

# Verificar tipos cross-package
pnpm typecheck
```

## Checklist antes de abrir PR

- [ ] Tests unitarios con mocks pasan (cobertura ≥70%).
- [ ] Test de fallback: simulé fallo en p1, verifiqué p2 responde.
- [ ] Test de cache: dos requests idénticos, segunda hit.
- [ ] Test de rate limit: límite enforced.
- [ ] Test de moderación: prompts adversariales correctamente bloqueados.
- [ ] Validación Zod en input y output del provider.
- [ ] Métricas se emiten para nuevos endpoints.
- [ ] Sin API keys hardcodeadas (todo via env, validado en `packages/config/env.ts`).
- [ ] Endpoint nuevo documentado en este archivo.
- [ ] PR description sigue `templates/pr.md`.

## Anti-patrones

- ❌ Llamar a un provider directamente desde `apps/web` o `packages/game-engine`. Todo pasa por `apps/web/app/api/ai/*` → `@quanta/ai-gateway`.
- ❌ Cache miss explosivo (regenerar todo el tiempo) por mal hashing. Verificar hit ratio en métricas.
- ❌ Devolver al cliente datos sin validar (un LLM puede devolver cualquier cosa).
- ❌ Exponer API keys en errores propagados al cliente. Filtrar logs antes de devolver `error`.
- ❌ Fallback infinito (chain de 10+ providers). 3-4 max, después fail.
- ❌ Cachear contenido creativo (cuando se pide variedad → cache miss permanente intencional).
- ❌ Ignorar safety filters porque "molestan". Si bloquean legítimo, ajustar prompts.

## Tu sesgo de éxito

Mediocre AI Gateway: funciona en sunny path pero falla feo cuando un proveedor responde lento/raro. Gasta cuotas innecesariamente. Devuelve respuestas crudas sin validar.

Buen AI Gateway: el resto del sistema confía ciegamente en vos. Cuando un proveedor cae, el usuario no se entera. Cuando un prompt malicioso llega, lo bloqueás antes de que toque el LLM. Cuando el cache está caliente, las respuestas son <50ms. Cuando algo se rompe, los logs te dicen exactamente dónde.
