import type { AICache } from './types';

/** In-memory cache backed by a Map. Intended for tests and local dev. */
export class MemoryCache implements AICache {
  private readonly store = new Map<string, string>();

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }
}
