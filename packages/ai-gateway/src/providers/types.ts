import type { ProviderId } from '@quanta/types';

export interface TextProvider {
  readonly id: ProviderId;
  generateText(prompt: string): Promise<string>;
}

export interface ImageProvider {
  readonly id: ProviderId;
  generateImage(prompt: string): Promise<{ url: string }>;
}

export interface AudioProvider {
  readonly id: ProviderId;
  synthesize(text: string): Promise<{ url: string }>;
}

export class ProviderError extends Error {
  readonly provider: ProviderId;

  constructor(provider: ProviderId, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'ProviderError';
    this.provider = provider;
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: ProviderId, message = 'Provider timed out', options?: { cause?: unknown }) {
    super(provider, message, options);
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  readonly retryAfterMs?: number;

  constructor(
    provider: ProviderId,
    message = 'Provider rate limited',
    options?: { cause?: unknown; retryAfterMs?: number },
  ) {
    super(provider, message, options);
    this.name = 'ProviderRateLimitError';
    if (options?.retryAfterMs !== undefined) {
      this.retryAfterMs = options.retryAfterMs;
    }
  }
}

export class ModerationBlockedError extends ProviderError {
  constructor(
    provider: ProviderId,
    message = 'Content blocked by moderation',
    options?: { cause?: unknown },
  ) {
    super(provider, message, options);
    this.name = 'ModerationBlockedError';
  }
}

export class AllProvidersFailedError extends Error {
  readonly failures: ReadonlyArray<{ provider: ProviderId; error: unknown }>;

  constructor(failures: ReadonlyArray<{ provider: ProviderId; error: unknown }>) {
    const tried = failures.map((failure) => failure.provider).join(', ');
    super(`All providers failed: ${tried || '(none configured)'}`);
    this.name = 'AllProvidersFailedError';
    this.failures = failures;
  }
}
