import { describe, expect, it } from 'vitest';
import type { EquationSpecies } from '@quanta/types';
import { validateEquationBalance, validateFreeFall } from '@/lib/challenges/validators';

const water: EquationSpecies[] = [
  { formula: 'H2', side: 'reactant', atoms: { H: 2 } },
  { formula: 'O2', side: 'reactant', atoms: { O: 2 } },
  { formula: 'H2O', side: 'product', atoms: { H: 2, O: 1 } },
];

describe('validateEquationBalance', () => {
  it('accepts the reduced balanced answer [2,1,2]', () => {
    expect(validateEquationBalance(water, [2, 1, 2]).isCorrect).toBe(true);
  });
  it('rejects unbalanced [1,1,1]', () => {
    expect(validateEquationBalance(water, [1, 1, 1]).isCorrect).toBe(false);
  });
  it('rejects non-reduced [4,2,4]', () => {
    expect(validateEquationBalance(water, [4, 2, 4]).isCorrect).toBe(false);
  });
  it('rejects coefficient < 1', () => {
    expect(validateEquationBalance(water, [2, 0, 2]).isCorrect).toBe(false);
  });
});

describe('validateFreeFall', () => {
  it('correct within tolerance', () => {
    expect(
      validateFreeFall({ heightM: 45, gravity: 9.8, predictedTimeSeconds: 3.03 }, 10).isCorrect,
    ).toBe(true);
  });
  it('incorrect outside tolerance', () => {
    expect(
      validateFreeFall({ heightM: 45, gravity: 9.8, predictedTimeSeconds: 10 }, 10).isCorrect,
    ).toBe(false);
  });
});
