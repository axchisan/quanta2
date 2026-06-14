import type { Room, RoomMode } from './room.js';

/** Identidad mínima del invitado que se persiste en el cliente. */
export interface GuestIdentity {
  guestSessionId: string;
  nickname: string;
  roomId: string;
  roomCode: string;
  role: 'host' | 'player';
}

export interface CreateRoomInput {
  nickname: string;
  mode?: RoomMode;
}

export interface JoinRoomInput {
  nickname: string;
  code: string;
}

/** Miembro tal como lo expone la API (sin exponer ids sensibles de otros). */
export interface LobbyMember {
  nickname: string;
  role: 'host' | 'player' | 'spectator';
  isGuest: boolean;
}

export interface RoomEntryResult {
  room: Room;
  guest: GuestIdentity;
}

export interface RoomSnapshot {
  room: Room;
  members: LobbyMember[];
}
