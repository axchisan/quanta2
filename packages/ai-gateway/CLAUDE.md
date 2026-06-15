# `@quanta/ai-gateway` — Gateway de IA generativa

Única vía por la que el resto del sistema toca proveedores externos de IA (LLM, imagen, TTS).
Cache + fallback chain + moderación + métricas viven acá. Leé `docs/07-ai-strategy.md` y
`docs/agents/ai-gateway.md` antes de tocar.

> Estado actual (T010+T019): providers de texto **Groq** (`createGroqProvider`, `llama-3.3-70b-versatile`,
> JSON mode, ~1s — **primario**) y **Gemini** (`createGeminiProvider`, `gemini-2.5-flash`, safety máximo
> — fallback). Gemini suele dar **503** en horas pico, por eso Groq va primero. `runTextChain` recorre el
> array de `textProviders` en orden. `parseTriviaQuestion` valida el JSON con Zod. El prompt de trivia
> acepta **audiencia** (`niños`/`secundaria`/`universidad`) y `nonce` (variedad en lote). Providers de
> imagen/TTS (Pollinations/HF, ElevenLabs/Coqui) siguen pendientes. Imports relativos **sin extensión**
> (compat webpack/Next). Env: `GROQ_API_KEY` y/o `GEMINI_API_KEY` (al menos uno), `*_MODEL` (opc.).

## Estructura

| Ruta                     | Qué hay                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `src/index.ts`           | API pública: `AIGateway`, `createAIGateway(deps)`.                                   |
| `src/chain.ts`           | `runTextChain` — intenta providers en orden, fallback, logging.                      |
| `src/config.ts`          | `GatewayConfig`, orden de providers por feature, timeouts (env vía `parseEnv`).      |
| `src/providers/types.ts` | Interfaces `TextProvider`/`ImageProvider`/`AudioProvider` + clases de error tipadas. |
| `src/cache/`             | `AICache` (interface), `MemoryCache` (Map, tests), `hashKey` (FNV-1a normalizado).   |
| `src/prompts/`           | Builders puros de prompts con guardrails educativos (español neutro).                |
| `tests/`                 | Mocks de providers + tests de fallback y cache.                                      |

## Reglas del paquete

- TS estricto: `import type` para tipos, sin `any`, sin `as` salvo boundaries de SDK externo.
- Reutilizá los tipos de `@quanta/types` (`AIRequest`/`AIResponse`/`ProviderId`/`AIFeature`/...).
  No los redefinas.
- Validación Zod de todo input/output externo (los providers reales devuelven cualquier cosa).
- Prompts = código, viven en `src/prompts/`. Cambios significativos → `state/DECISIONS.md`.
- Sin API keys hardcodeadas: todo via env validado.

## Scripts

```bash
pnpm --filter @quanta/ai-gateway test       # vitest (fallback + cache)
pnpm --filter @quanta/ai-gateway typecheck
pnpm --filter @quanta/ai-gateway lint
pnpm --filter @quanta/ai-gateway build       # tsup esm+cjs+dts
```

## Variables de entorno

| Var                           | Default | Uso                |
| ----------------------------- | ------- | ------------------ |
| `AI_GATEWAY_TEXT_TIMEOUT_MS`  | `30000` | Timeout de texto.  |
| `AI_GATEWAY_IMAGE_TIMEOUT_MS` | `60000` | Timeout de imagen. |
| `AI_GATEWAY_AUDIO_TIMEOUT_MS` | `30000` | Timeout de TTS.    |

Las API keys de cada provider (`GEMINI_API_KEY`, `GROQ_API_KEY`, ...) se añaden con sus
implementaciones reales.
