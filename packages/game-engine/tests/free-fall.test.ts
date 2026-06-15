import { describe, expect, it } from 'vitest';
import { freeFallTime } from '../src/scenes/free-fall/physics.js';

describe('freeFallTime', () => {
  it('computes t = sqrt(2h/g)', () => {
    expect(freeFallTime(20, 10)).toBe(2);
    expect(freeFallTime(45, 9.8)).toBeCloseTo(3.0303, 3);
    expect(freeFallTime(80, 10)).toBe(4);
  });

  it('guards invalid input', () => {
    expect(freeFallTime(0, 9.8)).toBe(0);
    expect(freeFallTime(10, 0)).toBe(0);
    expect(freeFallTime(-5, 9.8)).toBe(0);
  });
});
