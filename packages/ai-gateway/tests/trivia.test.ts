import { describe, expect, it } from 'vitest';
import { parseTriviaQuestion, TriviaOutOfScopeError } from '../src/validation/trivia.js';

const valid = JSON.stringify({
  question: '¿Cuál es la unidad de la fuerza en el SI?',
  options: ['Newton', 'Joule', 'Watt', 'Pascal'],
  correctIndex: 0,
  explanation: 'La fuerza se mide en newtons (N), definidos como kg·m/s².',
});

describe('parseTriviaQuestion', () => {
  it('parses a valid trivia JSON', () => {
    const q = parseTriviaQuestion(valid);
    expect(q.options).toHaveLength(4);
    expect(q.correctIndex).toBe(0);
  });

  it('strips ```json fences', () => {
    const q = parseTriviaQuestion('```json\n' + valid + '\n```');
    expect(q.question).toContain('fuerza');
  });

  it('throws on out_of_scope', () => {
    expect(() => parseTriviaQuestion('{"error":"out_of_scope"}')).toThrow(TriviaOutOfScopeError);
  });

  it('throws on invalid shape (3 options)', () => {
    const bad = JSON.stringify({
      question: 'x'.repeat(10),
      options: ['a', 'b', 'c'],
      correctIndex: 0,
      explanation: 'y'.repeat(10),
    });
    expect(() => parseTriviaQuestion(bad)).toThrow();
  });
});
