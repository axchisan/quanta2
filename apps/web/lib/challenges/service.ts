import type { createServiceClient } from '@quanta/db';
import type { AttemptResult, Challenge, FreeFallAnswer } from '@quanta/types';
import { rowToChallenge } from './mappers';
import { computeScore } from './scoring';
import { validateFreeFall } from './validators';

type Db = ReturnType<typeof createServiceClient>;

export class ChallengeError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ChallengeError';
  }
}

/** Reto público (sin `solution`). Solo retos `published`. */
export async function getPublicChallenge(db: Db, slug: string): Promise<Challenge> {
  const { data } = await db
    .from('challenges')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (!data) throw new ChallengeError('challenge_not_found', 'Reto no encontrado', 404);
  return rowToChallenge(data);
}

export interface SubmitFreeFallInput {
  challengeId: string;
  timeTakenMs: number;
  submittedAnswer: FreeFallAnswer;
}

export async function submitAttempt(db: Db, input: SubmitFreeFallInput): Promise<AttemptResult> {
  const { data: challenge } = await db
    .from('challenges')
    .select('*')
    .eq('id', input.challengeId)
    .maybeSingle();
  if (!challenge) throw new ChallengeError('challenge_not_found', 'Reto no encontrado', 404);
  if (challenge.status !== 'published') {
    throw new ChallengeError('challenge_unavailable', 'El reto no está disponible', 409);
  }

  const payload = (challenge.payload ?? {}) as { type?: string };
  if (payload.type !== 'free_fall') {
    throw new ChallengeError('unsupported_kind', 'Tipo de reto no soportado aún', 422);
  }

  const solution = (challenge.solution ?? {}) as { tolerance_pct?: number };
  const tolerance = typeof solution.tolerance_pct === 'number' ? solution.tolerance_pct : 10;

  const outcome = validateFreeFall(input.submittedAnswer, tolerance);
  const difficulty =
    challenge.difficulty === 'medium' || challenge.difficulty === 'hard'
      ? challenge.difficulty
      : 'easy';
  const score = computeScore({
    difficulty,
    isCorrect: outcome.isCorrect,
    timeTakenMs: input.timeTakenMs,
  });

  const explanation = buildFreeFallExplanation(
    input.submittedAnswer,
    outcome.correctValue,
    outcome.isCorrect,
  );

  const { error } = await db.from('challenge_attempts').insert({
    challenge_id: challenge.id,
    is_correct: outcome.isCorrect,
    score,
    time_taken_ms: input.timeTakenMs,
    submitted_answer: { ...input.submittedAnswer },
    feedback: explanation,
  });
  if (error) throw new ChallengeError('attempt_persist_failed', error.message, 500);

  return {
    isCorrect: outcome.isCorrect,
    score,
    correctValue: outcome.correctValue,
    submittedValue: outcome.submittedValue,
    explanation,
  };
}

function buildFreeFallExplanation(
  answer: FreeFallAnswer,
  correct: number,
  isCorrect: boolean,
): string {
  const head = isCorrect ? '¡Correcto! 🎉' : 'Casi…';
  return (
    `${head} La fórmula es t = √(2h/g). Con h = ${answer.heightM} m y g = ${answer.gravity} m/s², ` +
    `el tiempo real de caída es ${correct.toFixed(2)} s. Vos predijiste ${answer.predictedTimeSeconds.toFixed(2)} s.`
  );
}
