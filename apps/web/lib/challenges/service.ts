import type { createServiceClient } from '@quanta/db';
import type { TriviaQuestion } from '@quanta/ai-gateway';
import type {
  AttemptResult,
  Challenge,
  Difficulty,
  EquationSpecies,
  FreeFallAnswer,
} from '@quanta/types';
import type { Json } from '@quanta/types/db';
import { rowToChallenge } from './mappers';
import {
  equationBalanceAnswerSchema,
  freeFallAnswerSchema,
  multipleChoiceAnswerSchema,
} from './schemas';
import { computeScore } from './scoring';
import { validateEquationBalance, validateFreeFall, type ValidationOutcome } from './validators';

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

export interface TriviaChallengeResult {
  challengeId: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: string;
}

/** Persiste una pregunta de trivia generada por IA como reto `multiple_choice`. */
export async function createTriviaChallenge(
  db: Db,
  input: { topic: string; difficulty: Difficulty; question: TriviaQuestion; createdAt: string },
): Promise<TriviaChallengeResult> {
  const { data, error } = await db
    .from('challenges')
    .insert({
      title: `Trivia: ${input.topic}`,
      subject: 'mixed',
      topic: input.topic,
      difficulty: input.difficulty,
      kind: 'multiple_choice',
      statement: input.question.question,
      payload: {
        type: 'multiple_choice',
        question: input.question.question,
        options: input.question.options,
        ai_generated: true,
      },
      solution: {
        correct_index: input.question.correctIndex,
        explanation: input.question.explanation,
      },
      is_predefined: false,
      status: 'published',
      published_at: input.createdAt,
    })
    .select('id')
    .single();
  if (error || !data) {
    throw new ChallengeError('trivia_create_failed', error?.message ?? 'No se pudo crear', 500);
  }
  return {
    challengeId: data.id,
    question: input.question.question,
    options: input.question.options,
    topic: input.topic,
    difficulty: input.difficulty,
  };
}

export interface SubmitAttemptInput {
  challengeId: string;
  timeTakenMs: number;
  submittedAnswer: Record<string, unknown>;
  /** Si el jugador está logueado, el intento se atribuye a su cuenta. */
  userId?: string;
}

export async function submitAttempt(db: Db, input: SubmitAttemptInput): Promise<AttemptResult> {
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
  const solution = (challenge.solution ?? {}) as Record<string, unknown>;

  let outcome: ValidationOutcome;
  let explanation: string;

  if (payload.type === 'free_fall') {
    const answer = freeFallAnswerSchema.parse(input.submittedAnswer) as FreeFallAnswer;
    const tolerance = typeof solution.tolerance_pct === 'number' ? solution.tolerance_pct : 10;
    outcome = validateFreeFall(answer, tolerance);
    explanation = buildFreeFallExplanation(answer, outcome.correctValue, outcome.isCorrect);
  } else if (payload.type === 'multiple_choice') {
    const answer = multipleChoiceAnswerSchema.parse(input.submittedAnswer);
    const correctIndex = typeof solution.correct_index === 'number' ? solution.correct_index : -1;
    outcome = {
      isCorrect: answer.selectedIndex === correctIndex,
      correctValue: correctIndex,
      submittedValue: answer.selectedIndex,
    };
    explanation = typeof solution.explanation === 'string' ? solution.explanation : '';
  } else if (payload.type === 'equation_balance') {
    const answer = equationBalanceAnswerSchema.parse(input.submittedAnswer);
    const species = ((payload as { species?: EquationSpecies[] }).species ??
      []) as EquationSpecies[];
    outcome = validateEquationBalance(species, answer.coefficients);
    const solCoeffs = Array.isArray(solution.coefficients)
      ? (solution.coefficients as number[])
      : [];
    explanation = buildEquationExplanation(species, solCoeffs, outcome.isCorrect);
  } else {
    throw new ChallengeError('unsupported_kind', 'Tipo de reto no soportado aún', 422);
  }

  const difficulty: Difficulty =
    challenge.difficulty === 'medium' || challenge.difficulty === 'hard'
      ? challenge.difficulty
      : 'easy';
  const score = computeScore({
    difficulty,
    isCorrect: outcome.isCorrect,
    timeTakenMs: input.timeTakenMs,
  });

  const { error } = await db.from('challenge_attempts').insert({
    challenge_id: challenge.id,
    is_correct: outcome.isCorrect,
    score,
    time_taken_ms: input.timeTakenMs,
    submitted_answer: input.submittedAnswer as unknown as Json,
    feedback: explanation,
    ...(input.userId ? { user_id: input.userId } : {}),
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

function buildEquationExplanation(
  species: EquationSpecies[],
  coefficients: number[],
  isCorrect: boolean,
): string {
  const render = (side: 'reactant' | 'product'): string =>
    species
      .map((s, i) => ({ s, c: coefficients[i] ?? 1 }))
      .filter((x) => x.s.side === side)
      .map((x) => `${x.c === 1 ? '' : `${x.c} `}${x.s.formula}`)
      .join(' + ');
  const balanced = `${render('reactant')} → ${render('product')}`;
  return isCorrect
    ? `¡Correcto! La ecuación balanceada es: ${balanced}`
    : `Todavía no balancea. La forma correcta es: ${balanced}`;
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
