import { createServiceClient } from '@quanta/db';

/**
 * Cliente Supabase con service role (bypassa RLS). SOLO servidor
 * (API routes / server components). Nunca importar en código cliente.
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createServiceClient(url, key);
}
