import type { AIAudioRequest, AIImageRequest, AIResponse, ProviderId } from '@quanta/types';
import { hashKey } from './cache/hash.js';
import type { AICache } from './cache/types.js';
import { runTextChain } from './chain.js';
import type { ImageProvider, TextProvider, AudioProvider } from './providers/types.js';
import { AllProvidersFailedError } from './providers/types.js';
import { buildChallengePrompt } from './prompts/challenge.js';
import { buildTriviaPrompt } from './prompts/trivia.js';

export type { AICache } from './cache/types.js';
export { MemoryCache } from './cache/memory-cache.js';
export { hashKey } from './cache/hash.js';
export { runTextChain } from './chain.js';
export { loadGatewayConfig } from './config.js';
export type { GatewayConfig, GatewayTimeouts } from './config.js';
export type { TextProvider, ImageProvider, AudioProvider } from './providers/types.js';
export {
  ProviderError,
  ProviderTimeoutError,
  ProviderRateLimitError,
  ModerationBlockedError,
  AllProvidersFailedError,
} from './providers/types.js';
export { buildChallengePrompt } from './prompts/challenge.js';
export { buildTriviaPrompt } from './prompts/trivia.js';

export interface ChallengeRequest {
  topic: string;
  difficulty: string;
  kind: string;
  prompt?: string;
}

export interface TriviaRequest {
  topic: string;
  difficulty: string;
}

export interface AIGateway {
  generateChallenge(req: ChallengeRequest): Promise<AIResponse<string>>;
  generateTrivia(req: TriviaRequest): Promise<AIResponse<string>>;
  image(req: AIImageRequest): Promise<AIResponse<{ url: string }>>;
  tts(req: AIAudioRequest): Promise<AIResponse<{ url: string }>>;
}

export interface AIGatewayDeps {
  cache: AICache;
  textProviders: TextProvider[];
  imageProviders: ImageProvider[];
  audioProviders: AudioProvider[];
}

export function createAIGateway(deps: AIGatewayDeps): AIGateway {
  const { cache, textProviders, imageProviders, audioProviders } = deps;

  return {
    async generateChallenge(req: ChallengeRequest): Promise<AIResponse<string>> {
      const start = Date.now();
      const prompt = buildChallengePrompt({
        topic: req.topic,
        difficulty: req.difficulty,
        kind: req.kind,
        ...(req.prompt !== undefined ? { extra: req.prompt } : {}),
      });
      const { text, provider } = await runTextChain(textProviders, prompt);
      return { data: text, provider, cached: false, latencyMs: Date.now() - start };
    },

    async generateTrivia(req: TriviaRequest): Promise<AIResponse<string>> {
      const start = Date.now();
      const prompt = buildTriviaPrompt({ topic: req.topic, difficulty: req.difficulty });
      const key = hashKey(['generate-trivia', req.topic, req.difficulty]);

      const hit = await cache.get(key);
      if (hit !== null) {
        return {
          data: hit,
          provider: textProviders[0]?.id ?? 'gemini',
          cached: true,
          latencyMs: Date.now() - start,
        };
      }

      const { text, provider } = await runTextChain(textProviders, prompt);
      await cache.set(key, text);
      return { data: text, provider, cached: false, latencyMs: Date.now() - start };
    },

    async image(req: AIImageRequest): Promise<AIResponse<{ url: string }>> {
      const start = Date.now();
      const key = hashKey(['image', req.prompt, req.style ?? '']);
      const hit = await cache.get(key);
      if (hit !== null) {
        return {
          data: { url: hit },
          provider: imageProviders[0]?.id ?? 'pollinations',
          cached: true,
          latencyMs: Date.now() - start,
        };
      }

      const failures: Array<{ provider: ProviderId; error: unknown }> = [];
      for (const provider of imageProviders) {
        try {
          const result = await provider.generateImage(req.prompt);
          await cache.set(key, result.url);
          return {
            data: result,
            provider: provider.id,
            cached: false,
            latencyMs: Date.now() - start,
          };
        } catch (error) {
          console.warn(`[ai-gateway] image provider "${provider.id}" failed; trying next`, error);
          failures.push({ provider: provider.id, error });
        }
      }
      throw new AllProvidersFailedError(failures);
    },

    async tts(req: AIAudioRequest): Promise<AIResponse<{ url: string }>> {
      const start = Date.now();
      const key = hashKey(['tts', req.text, req.voice ?? '', req.language ?? '']);
      const hit = await cache.get(key);
      if (hit !== null) {
        return {
          data: { url: hit },
          provider: audioProviders[0]?.id ?? 'elevenlabs',
          cached: true,
          latencyMs: Date.now() - start,
        };
      }

      const failures: Array<{ provider: ProviderId; error: unknown }> = [];
      for (const provider of audioProviders) {
        try {
          const result = await provider.synthesize(req.text);
          await cache.set(key, result.url);
          return {
            data: result,
            provider: provider.id,
            cached: false,
            latencyMs: Date.now() - start,
          };
        } catch (error) {
          console.warn(`[ai-gateway] audio provider "${provider.id}" failed; trying next`, error);
          failures.push({ provider: provider.id, error });
        }
      }
      throw new AllProvidersFailedError(failures);
    },
  };
}
