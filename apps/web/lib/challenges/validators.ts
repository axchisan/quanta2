import type { FreeFallAnswer } from '@quanta/types';

export interface ValidationOutcome {
  isCorrect: boolean;
  correctValue: number;
  submittedValue: number;
}

/** Valida una respuesta de caída libre contra t = sqrt(2h/g) con tolerancia %. */
export function validateFreeFall(answer: FreeFallAnswer, tolerancePct: number): ValidationOutcome {
  const correct = Math.sqrt((2 * answer.heightM) / answer.gravity);
  const submitted = answer.predictedTimeSeconds;
  const errorPct = correct > 0 ? (Math.abs(submitted - correct) / correct) * 100 : Infinity;
  return {
    isCorrect: errorPct <= tolerancePct,
    correctValue: correct,
    submittedValue: submitted,
  };
}
