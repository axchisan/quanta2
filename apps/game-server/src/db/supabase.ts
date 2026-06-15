import { createServiceClient, type QuantaClient } from '@quanta/db';
import { env } from '../env.js';

let cached: QuantaClient | null | undefined;

/**
 * Cliente Supabase con service role (bypassa RLS). Server-only.
 * Devuelve `null` si no hay credenciales configuradas: la persistencia de
 * resultados es opcional (en dev/tests no la necesitamos).
 */
export function getServiceClient(): QuantaClient | null {
  if (cached !== undefined) return cached;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    cached = null;
    return cached;
  }
  cached = createServiceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  return cached;
}

/**
 * Verifica el access token de Supabase del jugador y devuelve su user id.
 * Mismo patrón que la ruta `attempts/submit` de la web. Devuelve `undefined`
 * para invitados (sin token) o tokens inválidos.
 */
export async function verifyAccessToken(token: string | undefined): Promise<string | undefined> {
  const db = getServiceClient();
  if (!db || !token) return undefined;
  try {
    const { data } = await db.auth.getUser(token);
    return data.user?.id;
  } catch {
    return undefined;
  }
}

export interface GameResultRow {
  user_id: string;
  room_code: string;
  mode: string;
  topic: string;
  nickname: string;
  score: number;
  rank: number;
  total_players: number;
  correct_count: number;
  total_questions: number;
}

/**
 * Persiste (upsert) los resultados de una partida para los jugadores logueados.
 * Upsert por (user_id, room_code) para ser idempotente ante reintentos.
 * No lanza: la persistencia nunca debe tumbar la sala.
 */
export async function persistGameResults(rows: GameResultRow[]): Promise<void> {
  const db = getServiceClient();
  if (!db || rows.length === 0) return;
  try {
    const { error } = await db
      .from('game_results')
      .upsert(rows, { onConflict: 'user_id,room_code' });
    if (error) console.error('[kahoot] no se pudieron persistir resultados', error.message);
  } catch (error) {
    console.error('[kahoot] error persistiendo resultados', error);
  }
}
