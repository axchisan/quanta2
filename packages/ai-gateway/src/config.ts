import { parseEnv, z } from '@quanta/config/env';
import type { AIFeature, ProviderId } from '@quanta/types';

export interface GatewayTimeouts {
  text: number;
  image: number;
  audio: number;
}

export interface GatewayConfig {
  featureProviderOrder: Record<AIFeature, ProviderId[]>;
  timeouts: GatewayTimeouts;
}

const DEFAULT_TIMEOUTS: GatewayTimeouts = {
  text: 30000,
  image: 60000,
  audio: 30000,
};

const FEATURE_PROVIDER_ORDER: Record<AIFeature, ProviderId[]> = {
  'generate-challenge': ['gemini', 'openrouter', 'groq'],
  'generate-trivia': ['gemini', 'groq', 'openrouter'],
  'explain-error': ['gemini', 'groq'],
  hint: ['groq', 'gemini'],
  image: ['pollinations', 'huggingface', 'gemini'],
  tts: ['elevenlabs', 'google', 'coqui'],
};

const envSchema = z.object({
  AI_GATEWAY_TEXT_TIMEOUT_MS: z.coerce.number().default(DEFAULT_TIMEOUTS.text),
  AI_GATEWAY_IMAGE_TIMEOUT_MS: z.coerce.number().default(DEFAULT_TIMEOUTS.image),
  AI_GATEWAY_AUDIO_TIMEOUT_MS: z.coerce.number().default(DEFAULT_TIMEOUTS.audio),
});

export function loadGatewayConfig(
  source: Record<string, string | undefined> = process.env,
): GatewayConfig {
  const env = parseEnv(envSchema, source);
  return {
    featureProviderOrder: FEATURE_PROVIDER_ORDER,
    timeouts: {
      text: env.AI_GATEWAY_TEXT_TIMEOUT_MS,
      image: env.AI_GATEWAY_IMAGE_TIMEOUT_MS,
      audio: env.AI_GATEWAY_AUDIO_TIMEOUT_MS,
    },
  };
}
