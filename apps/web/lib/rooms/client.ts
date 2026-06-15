import type { JoinRoomInput, RoomEntryResult } from '@quanta/types';
import { postJson } from '@/lib/http';

export function createRoomRequest(nickname: string): Promise<RoomEntryResult> {
  return postJson<RoomEntryResult>('/api/rooms/create', { nickname });
}

export function joinRoomRequest(input: JoinRoomInput): Promise<RoomEntryResult> {
  return postJson<RoomEntryResult>('/api/rooms/join', input);
}
