export interface AICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}
