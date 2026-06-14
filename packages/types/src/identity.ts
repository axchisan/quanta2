/** Identidad del jugador. Unión invitado ⊕ cuenta (ADR-0005). */
export type Identity =
  | { kind: 'guest'; guestSessionId: string; nickname: string; roomId: string }
  | { kind: 'user'; userId: string; nickname: string; avatarUrl?: string };

export type IdentityKind = Identity['kind'];

export interface Profile {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestSession {
  id: string;
  nickname: string;
  roomId: string;
  linkedUserId?: string;
  createdAt: string;
  lastSeenAt: string;
}
