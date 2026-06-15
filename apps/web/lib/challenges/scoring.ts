import type { Difficulty } from '@quanta/types';

const DIFFICULTY_BASE: Record<Difficulty, number> = { easy: 100, medium: 200, hard: 400 };
const DEFAULT_MAX_TIME_MS = 60_000;
const MAX_STREAK_BONUS_STEPS = 5; // +0.1 por nivel, tope +50%

/** Puntaje server-side (ver docs/08-game-design.md). 0 si incorrecto, sin penalización. */
export function computeScore(opts: {
  difficulty: Difficulty;
  isCorrect: boolean;
  timeTakenMs: number;
  maxTimeMs?: number;
  streak?: number;
}): number {
  if (!opts.isCorrect) return 0;
  const base = DIFFICULTY_BASE[opts.difficulty];
  const maxTime = opts.maxTimeMs ?? DEFAULT_MAX_TIME_MS;
  const clamped = Math.min(Math.max(opts.timeTakenMs, 0), maxTime);
  const timeBonus = Math.max(0, base * (1 - clamped / maxTime));
  const streak = Math.min(Math.max(opts.streak ?? 0, 0), MAX_STREAK_BONUS_STEPS);
  const streakBonus = base * 0.1 * streak;
  return Math.round(base + timeBonus + streakBonus);
}
