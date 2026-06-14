import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@quanta/types/db';

export type QuantaClient = SupabaseClient<Database>;

/** Privileged client (service role key) — bypasses RLS. Server-only. */
export function createServiceClient(url: string, serviceRoleKey: string): QuantaClient {
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Public client (anon key) — subject to RLS. Safe for browser use. */
export function createBrowserClient(url: string, anonKey: string): QuantaClient {
  return createClient<Database>(url, anonKey);
}

export const TABLES = {
  profiles: 'profiles',
  guestSessions: 'guest_sessions',
  rooms: 'rooms',
  roomMemberships: 'room_memberships',
  challenges: 'challenges',
  challengeAttempts: 'challenge_attempts',
  challengeAssets: 'challenge_assets',
  aiCache: 'ai_cache',
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
