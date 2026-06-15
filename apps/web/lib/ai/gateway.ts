import {
  createAIGateway,
  createGeminiProvider,
  createGroqProvider,
  MemoryCache,
} from '@quanta/ai-gateway';
import type { TextProvider } from '@quanta/ai-gateway';

type Gateway = ReturnType<typeof createAIGateway>;

let cached: Gateway | null = null;

/**
 * Gateway de IA (server-only). Cadena de texto: **Groq primero** (rápido y estable),
 * Gemini como fallback (suele dar 503 en horas pico).
 */
export function getAIGateway(): Gateway {
  if (cached) return cached;

  const textProviders: TextProvider[] = [];
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqModel = process.env.GROQ_MODEL;
    textProviders.push(createGroqProvider({ apiKey: groqKey, ...(groqModel ? { model: groqModel } : {}) }));
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const model = process.env.GEMINI_MODEL;
    textProviders.push(createGeminiProvider({ apiKey: geminiKey, ...(model ? { model } : {}) }));
  }
  if (textProviders.length === 0) throw new Error('Falta GROQ_API_KEY o GEMINI_API_KEY');

  cached = createAIGateway({
    cache: new MemoryCache(),
    textProviders,
    imageProviders: [],
    audioProviders: [],
  });
  return cached;
}
