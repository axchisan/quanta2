import { z } from 'zod';

export const triviaQuestionSchema = z.object({
  question: z.string().min(8).max(400),
  options: z.array(z.string().min(1).max(200)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(8).max(800),
});

export type TriviaQuestion = z.infer<typeof triviaQuestionSchema>;

const outOfScopeSchema = z.object({ error: z.string() });

export class TriviaOutOfScopeError extends Error {
  constructor(reason: string) {
    super(`Trivia fuera de dominio: ${reason}`);
    this.name = 'TriviaOutOfScopeError';
  }
}

/**
 * Parsea y valida la salida JSON del LLM. Lanza `TriviaOutOfScopeError` si el
 * modelo devolvió `{ error }`, o `ZodError` si el shape es inválido (el caller
 * decide reintentar con otro provider).
 */
export function parseTriviaQuestion(text: string): TriviaQuestion {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim();
  const json: unknown = JSON.parse(cleaned);

  const outOfScope = outOfScopeSchema.safeParse(json);
  if (outOfScope.success) throw new TriviaOutOfScopeError(outOfScope.data.error);

  return triviaQuestionSchema.parse(json);
}
