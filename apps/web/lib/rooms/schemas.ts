import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(20, 'El nombre no puede superar 20 caracteres');

export const roomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, 'Código inválido')
  .max(12, 'Código inválido');

export const createRoomSchema = z.object({
  nickname: nicknameSchema,
  mode: z.enum(['kahoot', 'duel', 'coop', 'tournament']).optional(),
});

export const joinRoomSchema = z.object({
  nickname: nicknameSchema,
  code: roomCodeSchema,
});

export type CreateRoomBody = z.infer<typeof createRoomSchema>;
export type JoinRoomBody = z.infer<typeof joinRoomSchema>;
