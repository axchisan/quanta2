import { z } from 'zod';

export const challengeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Slug inválido');

export const freeFallAnswerSchema = z.object({
  heightM: z.number().min(1).max(500),
  gravity: z.number().min(0.1).max(50),
  predictedTimeSeconds: z.number().min(0).max(120),
});

export const submitAttemptSchema = z.object({
  challengeId: z.string().uuid(),
  timeTakenMs: z.number().int().min(0).max(3_600_000),
  submittedAnswer: freeFallAnswerSchema,
});

export type SubmitAttemptBody = z.infer<typeof submitAttemptSchema>;
