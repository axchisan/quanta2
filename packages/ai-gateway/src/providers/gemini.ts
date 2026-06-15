import type { TextProvider } from './types';
import {
  ModerationBlockedError,
  ProviderError,
  ProviderRateLimitError,
  ProviderTimeoutError,
} from './types';

export interface GeminiProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  baseUrl?: string;
  temperature?: number;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Safety al máximo (ver docs/07-ai-strategy.md).
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
];

interface GeminiResponse {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string }> };
  }>;
  promptFeedback?: { blockReason?: string };
}

/** Provider de texto Gemini (Generative Language API). Devuelve JSON crudo. */
export function createGeminiProvider(opts: GeminiProviderOptions): TextProvider {
  const model = opts.model ?? DEFAULT_MODEL;
  const base = opts.baseUrl ?? DEFAULT_BASE;
  const timeoutMs = opts.timeoutMs ?? 30000;
  const temperature = opts.temperature ?? 0.9;

  return {
    id: 'gemini',
    async generateText(prompt: string): Promise<string> {
      const url = `${base}/models/${model}:generateContent?key=${opts.apiKey}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            safetySettings: SAFETY_SETTINGS,
            generationConfig: { temperature, responseMimeType: 'application/json' },
          }),
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ProviderTimeoutError('gemini', 'Gemini agotó el timeout', { cause: error });
        }
        throw new ProviderError('gemini', 'Error de red con Gemini', { cause: error });
      } finally {
        clearTimeout(timer);
      }

      if (res.status === 429) throw new ProviderRateLimitError('gemini');
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new ProviderError('gemini', `Gemini HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as GeminiResponse;
      if (json.promptFeedback?.blockReason) {
        throw new ModerationBlockedError('gemini', `Bloqueado: ${json.promptFeedback.blockReason}`);
      }
      const candidate = json.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new ModerationBlockedError('gemini', 'Gemini bloqueó la respuesta por seguridad');
      }
      const text = candidate?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
      if (!text.trim()) throw new ProviderError('gemini', 'Gemini devolvió contenido vacío');
      return text;
    },
  };
}
