# 07 — Estrategia de IA

## Objetivo

Hacer de la IA generativa un diferenciador clave de Quanta sin caer en costos recurrentes ni dependencia de un solo proveedor. Todo pasa por el `packages/ai-gateway` propio.

## Capacidades soportadas

| Capacidad | Proveedores (orden de fallback) | Uso típico |
|-----------|---------------------------------|-----------|
| **LLM (texto)** | Gemini 2.0 Flash → Groq (Llama 3.3) → OpenRouter (DeepSeek/Qwen) | Generar retos, validar respuestas, explicar errores, sugerir hints |
| **Generación de imágenes** | Pollinations.ai → Hugging Face Inference → Gemini nativo | Sprites, fondos, diagramas educativos |
| **TTS (text-to-speech)** | ElevenLabs free → Coqui XTTS / Piper self-hosted → Google/Azure free | Narración de retos, feedback hablado |

## Arquitectura del Gateway

```
┌────────────────────────────────────────────────────────┐
│                   AI Gateway                           │
│   (packages/ai-gateway, llamado solo desde server)     │
│                                                        │
│  ┌──────────────┐                                      │
│  │ Request      │──┐                                   │
│  │ tipado (Zod) │  │                                   │
│  └──────────────┘  ▼                                   │
│                ┌───────────────┐                       │
│                │ Cache lookup  │ (Supabase ai_cache)   │
│                │ key=hash(...)  │                      │
│                └───┬───────────┘                       │
│                    │ miss                              │
│                    ▼                                   │
│                ┌────────────────┐                      │
│                │ Rate limit     │ (per user/feature)   │
│                │ + moderation   │ (system prompt)      │
│                └───┬────────────┘                      │
│                    ▼                                   │
│         ┌──────────┴──────────┐                        │
│         │ Provider chain      │                        │
│         │ try p1 → p2 → p3    │                        │
│         └──────────┬──────────┘                        │
│                    ▼                                   │
│             ┌──────────────┐                           │
│             │ Validate     │ (safety filters,          │
│             │ + sanitize   │  zod schema)              │
│             └──────┬───────┘                           │
│                    ▼                                   │
│             ┌──────────────┐                           │
│             │ Cache write  │                           │
│             │ + metrics    │                           │
│             └──────┬───────┘                           │
│                    ▼                                   │
│             ┌──────────────┐                           │
│             │ Response     │                           │
│             └──────────────┘                           │
└────────────────────────────────────────────────────────┘
```

## API pública del paquete

```typescript
// packages/ai-gateway/src/index.ts

export interface AITextRequest {
  feature: 'generate-challenge' | 'validate-answer' | 'explain-error' | 'hint';
  prompt: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  userId?: string;
  guestSessionId?: string;
}

export interface AIImageRequest {
  feature: 'sprite' | 'background' | 'diagram';
  prompt: string;
  size?: '512x512' | '1024x1024' | '1024x576';
  style?: 'cartoon' | 'realistic' | 'diagram';
  userId?: string;
}

export interface AIAudioRequest {
  feature: 'narration' | 'feedback';
  text: string;
  voice?: string;
  language?: 'es-CO' | 'es-ES';
  userId?: string;
}

export interface AIGateway {
  text(req: AITextRequest): Promise<AITextResponse>;
  image(req: AIImageRequest): Promise<AIImageResponse>;
  audio(req: AIAudioRequest): Promise<AIAudioResponse>;
}

export function createGateway(deps: GatewayDeps): AIGateway;
```

`GatewayDeps` se inyecta: cache, rate limiter, providers, env. En tests = mocks; en prod = real.

## Cache strategy

- **Cache key:** `sha256(provider + model + normalized_prompt + relevant_params)`.
- **Cache hit:** retorna respuesta inmediata, incrementa `hit_count`.
- **Cache miss:** llama proveedor, sube respuesta, almacena.
- **TTL:** infinito por default (las respuestas determinísticas son... determinísticas). Para features explícitamente "creativas" (`feature: 'generate-challenge'`), no cacheamos por defecto (se quiere variedad).
- **Storage:** texto en `ai_cache.value` (jsonb), imagen/audio en Supabase Storage con `ai_cache.value` apuntando a la URL.

## Fallback chain

Cada feature tiene una cadena predefinida en `packages/ai-gateway/src/config.ts`:

```typescript
export const PROVIDER_CHAINS = {
  text: {
    'generate-challenge':  ['gemini', 'openrouter:deepseek-r1', 'groq:llama-3.3-70b'],
    'validate-answer':     ['groq:llama-3.3-70b', 'gemini', 'openrouter:llama-3.3'],
    'explain-error':       ['gemini', 'groq:llama-3.3-70b'],
    'hint':                ['groq:llama-3.3-70b', 'gemini'],
  },
  image: {
    'sprite':              ['pollinations:flux', 'huggingface:flux-schnell', 'gemini:imagen'],
    'background':          ['pollinations:flux', 'huggingface:sdxl'],
    'diagram':             ['gemini:imagen', 'pollinations:flux'],
  },
  audio: {
    'narration':           ['elevenlabs', 'google-tts', 'coqui-xtts'],
    'feedback':            ['google-tts', 'piper', 'elevenlabs'],
  },
};
```

**Comportamiento:**
1. Intentar p1.
2. Si falla (timeout, 429, 5xx, safety block), intentar p2.
3. Si todos fallan, devolver error al caller con `code: 'all_providers_failed'` y registrar incidente.

## Rate limiting

- Por usuario/sesión: 30 requests de texto/min, 10 de imagen/min, 20 de audio/min (configurable).
- Por feature (global): límites soft definidos en config para no quemar cuotas (ej: max 1000 imágenes/día globales).
- Implementación: Redis (Upstash free) o tabla `rate_limits` en Postgres con sliding window.

## Moderación

### System prompts con guardrails

Cada llamada a LLM incluye en el system prompt:
```
Sos un asistente educativo para estudiantes de colegio (14-18 años) en Colombia/LATAM.
Tu único dominio es Física y Química nivel secundaria.
Reglas estrictas:
- Respondé SIEMPRE en español neutro.
- NUNCA generes contenido violento, sexual, discriminatorio, ilegal o peligroso.
- NUNCA inventes fórmulas o leyes que no existan.
- Si la consulta sale del dominio educativo o no podés responderla con certeza, devolvé un JSON con { error: "out_of_scope" }.
- Mantené tono amigable, claro y motivador.
- Las explicaciones de errores deben enseñar, no solo corregir.
```

### Safety filters nativos

- **Gemini:** `safetySettings` configurados al máximo (`BLOCK_LOW_AND_ABOVE` para harassment, hate, sexually_explicit, dangerous_content).
- **OpenRouter:** depende del modelo, los más permisivos quedan al final del fallback.
- **Pollinations / HuggingFace:** filtran por defecto contenido NSFW; verificamos en `packages/ai-gateway/src/providers/<x>.test.ts` con prompts de control.

### Validación post-generación

Para retos generados (alta exposición a estudiantes), validamos el JSON de salida con Zod **estricto**:

```typescript
const ChallengeSchema = z.object({
  title: z.string().min(5).max(120),
  statement: z.string().min(20).max(1000),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.union([z.string(), z.number()]),
  explanation: z.string().min(20).max(800),
  topic: z.enum(['kinematics','dynamics','energy','equation_balance','reactions','atomic_structure', /* ... */]),
});
```

Si falla validación, reintenta con el siguiente provider del chain.

## Métricas

- `ai_requests_total{feature, provider, status}` — counter.
- `ai_request_duration_seconds{feature, provider}` — histogram.
- `ai_cache_hit_ratio{feature}` — gauge.
- `ai_provider_failures_total{provider, error_kind}` — counter.

Almacenadas en tabla `ai_metrics` (rollup diario) o reenviadas a PostHog self-hosted (Fase 4).

## Observabilidad

- Cada request → log estructurado JSON (`requestId`, `feature`, `provider`, `cacheHit`, `durationMs`, `tokenCount` si aplica).
- Errores → captura con stack y contexto, persistidos en `ai_errors` para análisis posterior.

## Configuración de proveedores

Variables de entorno en `apps/web/.env.local` (server-only):

```
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
HUGGINGFACE_API_KEY=
ELEVENLABS_API_KEY=
GOOGLE_CLOUD_TTS_KEY_PATH=/run/secrets/google-tts.json
POLLINATIONS_BASE_URL=https://image.pollinations.ai
COQUI_TTS_BASE_URL=http://coqui-tts:5002  # interno Docker
PIPER_BASE_URL=http://piper:5500
```

Validación en `packages/config/env.ts` con Zod. App falla rápido si faltan keys obligatorias.

## Testing

- Mocks de proveedores en `packages/ai-gateway/tests/mocks/<provider>.ts`.
- Fixtures de respuestas reales (anonimizadas) en `tests/fixtures/`.
- Test de fallback: simular timeout en p1, verificar que p2 se llama.
- Test de cache: dos llamadas idénticas → segunda hit, sin llamar al provider.
- Test de rate limit: 31 requests rápidos → la 31 falla con `rate_limited`.
- Test de moderación: prompts adversariales → respuesta `error: out_of_scope` o equivalente.

## Política de costos

- Free tiers son la regla.
- Si un proveedor pasa a pago en algún momento, se ajusta el chain (lo bajamos en prioridad).
- Límite global de gasto: si introducimos un proveedor de pago, hard cap de $5/mes con kill-switch.
- Cache es la primera defensa contra costos. Apuntamos a >70% hit ratio en producción.

## Prompts y plantillas

Vivirán en `packages/ai-gateway/src/prompts/<feature>.ts` como funciones puras `(input) => string`. Versionadas. Si cambiás un prompt, anotalo en `state/DECISIONS.md` con el rationale (los prompts son código).
