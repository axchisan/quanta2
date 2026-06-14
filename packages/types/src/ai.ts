export type AIFeature =
  | 'generate-challenge'
  | 'generate-trivia'
  | 'explain-error'
  | 'hint'
  | 'image'
  | 'tts';

export type AIModality = 'text' | 'image' | 'audio';

export type TextProviderId = 'gemini' | 'groq' | 'openrouter';
export type ImageProviderId = 'pollinations' | 'huggingface' | 'gemini';
export type AudioProviderId = 'elevenlabs' | 'coqui' | 'piper' | 'google';
export type ProviderId = TextProviderId | ImageProviderId | AudioProviderId;

export interface AITextRequest {
  feature: Extract<AIFeature, 'generate-challenge' | 'generate-trivia' | 'explain-error' | 'hint'>;
  prompt: string;
  cacheable?: boolean;
}

export interface AIImageRequest {
  feature: 'image';
  prompt: string;
  size?: { width: number; height: number };
  style?: string;
}

export interface AIAudioRequest {
  feature: 'tts';
  text: string;
  voice?: string;
  language?: string;
}

export type AIRequest = AITextRequest | AIImageRequest | AIAudioRequest;

export interface AIResponse<TData = unknown> {
  data: TData;
  provider: ProviderId;
  cached: boolean;
  latencyMs: number;
}

export type AIErrorCode =
  | 'rate_limited'
  | 'all_providers_failed'
  | 'moderation_blocked'
  | 'invalid_output'
  | 'timeout';

export interface AIError {
  error: string;
  code: AIErrorCode;
}
