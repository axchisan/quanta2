import { createBrowserClient } from '@quanta/db';

type BrowserClient = ReturnType<typeof createBrowserClient>;

let cached: BrowserClient | null = null;

/** Cliente Supabase público (anon key) para Realtime/presence en el browser. */
export function getBrowserClient(): BrowserClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  cached = createBrowserClient(url, key);
  return cached;
}
