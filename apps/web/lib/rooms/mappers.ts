import type { Database } from '@quanta/types/db';
import type { Room, RoomMode, RoomStatus } from '@quanta/types';

type RoomRow = Database['public']['Tables']['rooms']['Row'];

/** Mapea una fila de `rooms` (snake_case) al tipo de dominio `Room`. */
export function rowToRoom(row: RoomRow): Room {
  return {
    id: row.id,
    code: row.code,
    mode: row.mode as RoomMode,
    status: row.status as RoomStatus,
    maxPlayers: row.max_players,
    settings: (row.settings ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
    ...(row.host_id ? { hostId: row.host_id } : {}),
    ...(row.started_at ? { startedAt: row.started_at } : {}),
    ...(row.finished_at ? { finishedAt: row.finished_at } : {}),
  };
}
