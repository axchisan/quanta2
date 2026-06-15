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

export const multipleChoiceAnswerSchema = z.object({
  selectedIndex: z.number().int().min(0).max(9),
});

// `submittedAnswer` se valida por tipo de reto en el servicio (free_fall vs multiple_choice).
export const submitAttemptSchema = z.object({
  challengeId: z.string().uuid(),
  timeTakenMs: z.number().int().min(0).max(3_600_000),
  submittedAnswer: z.record(z.string(), z.unknown()),
});

export type SubmitAttemptBody = z.infer<typeof submitAttemptSchema>;

export const generateTriviaSchema = z.object({
  topic: z.string().trim().min(2).max(48),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export type GenerateTriviaBody = z.infer<typeof generateTriviaSchema>;
