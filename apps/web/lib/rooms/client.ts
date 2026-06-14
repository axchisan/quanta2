import type { JoinRoomInput, RoomEntryResult } from '@quanta/types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(msg ?? 'Ocurrió un error inesperado');
  }
  return data as T;
}

export function createRoomRequest(nickname: string): Promise<RoomEntryResult> {
  return postJson<RoomEntryResult>('/api/rooms/create', { nickname });
}

export function joinRoomRequest(input: JoinRoomInput): Promise<RoomEntryResult> {
  return postJson<RoomEntryResult>('/api/rooms/join', input);
}
