import type { createServiceClient } from '@quanta/db';
import type {
  CreateRoomInput,
  JoinRoomInput,
  LobbyMember,
  RoomEntryResult,
  RoomMode,
  RoomSnapshot,
} from '@quanta/types';
import { generateRoomCode } from './code';
import { rowToRoom } from './mappers';

type Db = ReturnType<typeof createServiceClient>;

export class RoomError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'RoomError';
  }
}

async function uniqueCode(db: Db): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = generateRoomCode();
    const { data } = await db.from('rooms').select('id').eq('code', code).maybeSingle();
    if (!data) return code;
  }
  throw new RoomError('code_exhausted', 'No se pudo generar un código único', 503);
}

export async function createRoom(db: Db, input: CreateRoomInput): Promise<RoomEntryResult> {
  const mode: RoomMode = input.mode ?? 'kahoot';
  const code = await uniqueCode(db);

  const { data: room, error: roomErr } = await db
    .from('rooms')
    .insert({ code, mode, status: 'waiting' })
    .select()
    .single();
  if (roomErr || !room) {
    throw new RoomError('room_create_failed', roomErr?.message ?? 'No se pudo crear la sala', 500);
  }

  const { data: guest, error: guestErr } = await db
    .from('guest_sessions')
    .insert({ nickname: input.nickname, room_id: room.id })
    .select()
    .single();
  if (guestErr || !guest) {
    throw new RoomError(
      'guest_create_failed',
      guestErr?.message ?? 'No se pudo crear la sesión',
      500,
    );
  }

  const { error: memErr } = await db
    .from('room_memberships')
    .insert({ room_id: room.id, guest_session_id: guest.id, role: 'host' });
  if (memErr) throw new RoomError('membership_failed', memErr.message, 500);

  return {
    room: rowToRoom(room),
    guest: {
      guestSessionId: guest.id,
      nickname: guest.nickname,
      roomId: room.id,
      roomCode: room.code,
      role: 'host',
    },
  };
}

export async function joinRoom(db: Db, input: JoinRoomInput): Promise<RoomEntryResult> {
  const { data: room } = await db.from('rooms').select().eq('code', input.code).maybeSingle();
  if (!room) throw new RoomError('room_not_found', 'No existe una sala con ese código', 404);
  if (room.status === 'finished') throw new RoomError('room_closed', 'La sala ya terminó', 409);

  const { count } = await db
    .from('room_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id)
    .is('left_at', null);
  if (count !== null && count >= room.max_players) {
    throw new RoomError('room_full', 'La sala está llena', 409);
  }

  const { data: dup } = await db
    .from('guest_sessions')
    .select('id')
    .eq('room_id', room.id)
    .ilike('nickname', input.nickname)
    .maybeSingle();
  if (dup) throw new RoomError('nickname_taken', 'Ese nombre ya está en uso en la sala', 409);

  const { data: guest, error: guestErr } = await db
    .from('guest_sessions')
    .insert({ nickname: input.nickname, room_id: room.id })
    .select()
    .single();
  if (guestErr || !guest) {
    throw new RoomError('guest_create_failed', guestErr?.message ?? 'No se pudo unir', 500);
  }

  const { error: memErr } = await db
    .from('room_memberships')
    .insert({ room_id: room.id, guest_session_id: guest.id, role: 'player' });
  if (memErr) throw new RoomError('membership_failed', memErr.message, 500);

  return {
    room: rowToRoom(room),
    guest: {
      guestSessionId: guest.id,
      nickname: guest.nickname,
      roomId: room.id,
      roomCode: room.code,
      role: 'player',
    },
  };
}

export async function getRoomSnapshot(db: Db, code: string): Promise<RoomSnapshot> {
  const { data: room } = await db.from('rooms').select().eq('code', code).maybeSingle();
  if (!room) throw new RoomError('room_not_found', 'No existe una sala con ese código', 404);

  const { data: rows } = await db
    .from('room_memberships')
    .select('role, guest_session_id, user_id, joined_at')
    .eq('room_id', room.id)
    .is('left_at', null)
    .order('joined_at', { ascending: true });

  const memberships = rows ?? [];
  const guestIds = memberships
    .map((m) => m.guest_session_id)
    .filter((id): id is string => id !== null);

  const nameById = new Map<string, string>();
  if (guestIds.length > 0) {
    const { data: guests } = await db
      .from('guest_sessions')
      .select('id, nickname')
      .in('id', guestIds);
    for (const g of guests ?? []) nameById.set(g.id, g.nickname);
  }

  const members: LobbyMember[] = memberships.map((m) => ({
    nickname: m.guest_session_id ? (nameById.get(m.guest_session_id) ?? 'Jugador') : 'Jugador',
    role: m.role as LobbyMember['role'],
    isGuest: m.guest_session_id !== null,
  }));

  return { room: rowToRoom(room), members };
}
