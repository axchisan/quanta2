import { describe, expect, it } from 'vitest';
import { runTextChain } from '../src/chain.js';
import { createAIGateway } from '../src/index.js';
import { MemoryCache } from '../src/cache/memory-cache.js';
import { AllProvidersFailedError } from '../src/providers/types.js';
import { MockTextProvider } from './mocks/mock-providers.js';

describe('runTextChain fallback', () => {
  it('falls back to the next provider when the first throws', async () => {
    const p1 = new MockTextProvider({ id: 'gemini', alwaysThrow: true });
    const p2 = new MockTextProvider({ id: 'groq', succeedWith: 'second-wins' });

    const result = await runTextChain([p1, p2], 'prompt');

    expect(result.text).toBe('second-wins');
    expect(result.provider).toBe('groq');
    expect(p1.callCount).toBe(1);
    expect(p2.callCount).toBe(1);
  });

  it('throws AllProvidersFailedError when every provider fails', async () => {
    const p1 = new MockTextProvider({ id: 'gemini', alwaysThrow: true });
    const p2 = new MockTextProvider({ id: 'groq', alwaysThrow: true });

    await expect(runTextChain([p1, p2], 'prompt')).rejects.toBeInstanceOf(AllProvidersFailedError);
  });
});

describe('createAIGateway cache', () => {
  it('serves the second identical trivia request from cache without re-calling the provider', async () => {
    const provider = new MockTextProvider({ id: 'gemini', succeedWith: 'trivia-payload' });
    const gateway = createAIGateway({
      cache: new MemoryCache(),
      textProviders: [provider],
      imageProviders: [],
      audioProviders: [],
    });

    const first = await gateway.generateTrivia({ topic: 'energy', difficulty: 'easy' });
    const second = await gateway.generateTrivia({ topic: 'energy', difficulty: 'easy' });

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.data).toBe('trivia-payload');
    expect(provider.callCount).toBe(1);
  });
});
