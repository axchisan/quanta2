import type { TextProvider } from './types';
import { ProviderError, ProviderRateLimitError, ProviderTimeoutError } from './types';

export interface GroqProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  baseUrl?: string;
  temperature?: number;
}

// Modelo rápido y estable de Groq (configurable con GROQ_MODEL).
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_BASE = 'https://api.groq.com/openai/v1';

interface GroqResponse {
  choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
}

/**
 * Provider de texto Groq (API compatible con OpenAI). Muy rápido y confiable,
 * pensado como primario para la generación de trivia en tiempo real (Kahoot).
 * Devuelve el JSON crudo del modelo (modo `json_object`).
 */
export function createGroqProvider(opts: GroqProviderOptions): TextProvider {
  const model = opts.model ?? DEFAULT_MODEL;
  const base = opts.baseUrl ?? DEFAULT_BASE;
  const timeoutMs = opts.timeoutMs ?? 20000;
  const temperature = opts.temperature ?? 0.9;

  return {
    id: 'groq',
    async generateText(prompt: string): Promise<string> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let res: Response;
      try {
        res = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${opts.apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature,
            response_format: { type: 'json_object' },
          }),
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ProviderTimeoutError('groq', 'Groq agotó el timeout', { cause: error });
        }
        throw new ProviderError('groq', 'Error de red con Groq', { cause: error });
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 429) throw new ProviderRateLimitError('groq');
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new ProviderError('groq', `Groq HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as GroqResponse;
      const text = json.choices?.[0]?.message?.content ?? '';
      if (!text.trim()) throw new ProviderError('groq', 'Groq devolvió contenido vacío');
      return text;
    },
  };
}
