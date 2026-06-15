import {
  createAIGateway,
  createGeminiProvider,
  createGroqProvider,
  MemoryCache,
} from '@quanta/ai-gateway';
import type { TextProvider } from '@quanta/ai-gateway';
import { env } from '../env.js';

type Gateway = ReturnType<typeof createAIGateway>;

let cached: Gateway | undefined;

/**
 * Gateway de IA del game-server. Usado por KahootRoom para generar trivias.
 * Orden de la cadena: **Groq primero** (rápido y estable) y Gemini como fallback.
 * Gemini suele responder 503 en horas pico, así que sin Groq la sala se queda
 * sin preguntas; con la cadena, la generación tolera la caída de un proveedor.
 */
export function getAIGateway(): Gateway {
  if (cached) return cached;

  const textProviders: TextProvider[] = [];
  if (env.GROQ_API_KEY) {
    textProviders.push(
      createGroqProvider({
        apiKey: env.GROQ_API_KEY,
        ...(env.GROQ_MODEL ? { model: env.GROQ_MODEL } : {}),
      }),
    );
  }
  if (env.GEMINI_API_KEY) {
    textProviders.push(
      createGeminiProvider({
        apiKey: env.GEMINI_API_KEY,
        ...(env.GEMINI_MODEL ? { model: env.GEMINI_MODEL } : {}),
      }),
    );
  }
  if (textProviders.length === 0) {
    throw new Error('Falta GROQ_API_KEY o GEMINI_API_KEY en el game-server');
  }

  cached = createAIGateway({
    cache: new MemoryCache(),
    textProviders,
    imageProviders: [],
    audioProviders: [],
  });
  return cached;
}
