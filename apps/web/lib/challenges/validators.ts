import type { EquationSpecies, FreeFallAnswer } from '@quanta/types';

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

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/**
 * Valida un balanceo de ecuación: los coeficientes deben igualar los átomos de
 * cada elemento a ambos lados Y estar en forma reducida (gcd = 1). No necesita
 * la `solution` para decidir correctitud (la deduce de las especies).
 */
export function validateEquationBalance(
  species: EquationSpecies[],
  coefficients: number[],
): ValidationOutcome {
  const invalid =
    coefficients.length !== species.length ||
    coefficients.some((c) => !Number.isInteger(c) || c < 1);
  if (invalid) return { isCorrect: false, correctValue: 0, submittedValue: 0 };

  const elements = new Set<string>();
  for (const s of species) for (const el of Object.keys(s.atoms)) elements.add(el);

  let balanced = true;
  for (const el of elements) {
    let left = 0;
    let right = 0;
    species.forEach((s, i) => {
      const n = (s.atoms[el] ?? 0) * (coefficients[i] ?? 0);
      if (s.side === 'reactant') left += n;
      else right += n;
    });
    if (left !== right) {
      balanced = false;
      break;
    }
  }

  const reduced = coefficients.reduce((a, b) => gcd(a, b)) === 1;
  return { isCorrect: balanced && reduced, correctValue: 0, submittedValue: 0 };
}
