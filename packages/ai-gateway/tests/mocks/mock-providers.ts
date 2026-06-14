import type { ProviderId } from '@quanta/types';
import type { TextProvider } from '../../src/providers/types.js';
import { ProviderError } from '../../src/providers/types.js';

export interface MockTextProviderOptions {
  id: ProviderId;
  /** When set, generateText resolves with this string. */
  succeedWith?: string;
  /** When true, generateText always throws a ProviderError. */
  alwaysThrow?: boolean;
}

export class MockTextProvider implements TextProvider {
  readonly id: ProviderId;
  callCount = 0;

  private readonly succeedWith: string;
  private readonly alwaysThrow: boolean;

  constructor(options: MockTextProviderOptions) {
    this.id = options.id;
    this.succeedWith = options.succeedWith ?? 'ok';
    this.alwaysThrow = options.alwaysThrow ?? false;
  }

  generateText(_prompt: string): Promise<string> {
    this.callCount += 1;
    if (this.alwaysThrow) {
      return Promise.reject(
        new ProviderError(this.id, `mock provider "${this.id}" forced failure`),
      );
    }
    return Promise.resolve(this.succeedWith);
  }
}
