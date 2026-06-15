import { createAIGateway, createGeminiProvider, MemoryCache } from '@quanta/ai-gateway';

type Gateway = ReturnType<typeof createAIGateway>;

let cached: Gateway | null = null;

/** Gateway de IA (server-only). Usa Gemini con la `GEMINI_API_KEY` del entorno. */
export function getAIGateway(): Gateway {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY');
  const model = process.env.GEMINI_MODEL;
  cached = createAIGateway({
    cache: new MemoryCache(),
    textProviders: [createGeminiProvider({ apiKey, ...(model ? { model } : {}) })],
    imageProviders: [],
    audioProviders: [],
  });
  return cached;
}
