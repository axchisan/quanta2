export type RoomMode = 'kahoot' | 'duel' | 'coop' | 'tournament';
export type RoomStatus = 'waiting' | 'in_progress' | 'finished';
export type RoomMemberRole = 'host' | 'player' | 'spectator';

export interface Room {
  id: string;
  code: string;
  mode: RoomMode;
  hostId?: string;
  status: RoomStatus;
  maxPlayers: number;
  settings: Record<string, unknown>;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface RoomMember {
  roomId: string;
  userId?: string;
  guestSessionId?: string;
  role: RoomMemberRole;
  joinedAt: string;
  leftAt?: string;
}
