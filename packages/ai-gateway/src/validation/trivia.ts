import { z } from 'zod';

export const triviaQuestionSchema = z.object({
  question: z.string().min(8).max(400),
  options: z.array(z.string().min(1).max(200)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(8).max(800),
  /**
   * Texto EXACTO de la opción correcta. Lo usamos para reconciliar `correctIndex`
   * (el modelo a veces apunta a un índice que no coincide con su razonamiento).
   * Opcional: si falta, confiamos en `correctIndex`. No forma parte del shape final.
   */
  answer: z.string().min(1).max(200).optional(),
});

export type TriviaQuestion = Omit<z.infer<typeof triviaQuestionSchema>, 'answer'>;

const outOfScopeSchema = z.object({ error: z.string() });

export class TriviaOutOfScopeError extends Error {
  constructor(reason: string) {
    super(`Trivia fuera de dominio: ${reason}`);
    this.name = 'TriviaOutOfScopeError';
  }
}

/** Normaliza para comparar texto de opciones (espacios, mayúsculas, puntuación). */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?¡¿"'()]/g, '')
    .trim();
}

/**
 * Reconciliación anti-incoherencia: si el modelo dio el texto de la respuesta
 * correcta (`answer`) y coincide con una opción distinta de la que apunta
 * `correctIndex`, corregimos el índice (el texto refleja mejor el razonamiento
 * del modelo que el índice, que es donde suele equivocarse).
 */
export function reconcileTrivia(parsed: z.infer<typeof triviaQuestionSchema>): TriviaQuestion {
  const { answer, ...question } = parsed;
  if (answer) {
    const target = normalize(answer);
    const matchIndex = question.options.findIndex((opt) => normalize(opt) === target);
    if (matchIndex >= 0 && matchIndex !== question.correctIndex) {
      return { ...question, correctIndex: matchIndex };
    }
  }
  return question;
}

/**
 * Parsea y valida la salida JSON del LLM. Lanza `TriviaOutOfScopeError` si el
 * modelo devolvió `{ error }`, o `ZodError` si el shape es inválido (el caller
 * decide reintentar con otro provider). Reconcilia `correctIndex` contra `answer`.
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

  return reconcileTrivia(triviaQuestionSchema.parse(json));
}
