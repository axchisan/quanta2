import { createAIGateway, createGeminiProvider, MemoryCache } from '@quanta/ai-gateway';
import { env } from '../env.js';

type Gateway = ReturnType<typeof createAIGateway>;

let cached: Gateway | undefined;

/** Gateway de IA del game-server (Gemini). Usado por KahootRoom para generar trivias. */
export function getAIGateway(): Gateway {
  if (cached) return cached;
  if (!env.GEMINI_API_KEY) throw new Error('Falta GEMINI_API_KEY en el game-server');
  cached = createAIGateway({
    cache: new MemoryCache(),
    textProviders: [
      createGeminiProvider({
        apiKey: env.GEMINI_API_KEY,
        ...(env.GEMINI_MODEL ? { model: env.GEMINI_MODEL } : {}),
      }),
    ],
    imageProviders: [],
    audioProviders: [],
  });
  return cached;
}
