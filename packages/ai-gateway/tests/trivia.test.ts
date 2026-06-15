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

  it('reconcilia correctIndex incoherente usando el texto de answer', () => {
    // El modelo apunta a index 2 ("19,6 m/s") pero su answer es "14 m/s" (index 1).
    const incoherent = JSON.stringify({
      question: 'Un objeto cae desde 10 m. ¿Velocidad de impacto? (g=9,8)',
      options: ['9,8 m/s', '14 m/s', '19,6 m/s', '20 m/s'],
      correctIndex: 2,
      answer: '14 m/s',
      explanation: 'v = √(2·g·h) = √(2·9,8·10) = √196 = 14 m/s.',
    });
    const q = parseTriviaQuestion(incoherent);
    expect(q.correctIndex).toBe(1);
  });

  it('tolera diferencias de formato al reconciliar (espacios/mayúsculas/puntuación)', () => {
    const q = parseTriviaQuestion(
      JSON.stringify({
        question: '¿Unidad de fuerza en el SI?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctIndex: 3,
        answer: ' newton. ',
        explanation: 'La fuerza se mide en newtons.',
      }),
    );
    expect(q.correctIndex).toBe(0);
  });

  it('no expone el campo answer en el resultado', () => {
    const q = parseTriviaQuestion(
      JSON.stringify({
        question: '¿Unidad de fuerza en el SI?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctIndex: 0,
        answer: 'Newton',
        explanation: 'La fuerza se mide en newtons.',
      }),
    );
    expect('answer' in q).toBe(false);
  });

  it('mantiene correctIndex si answer no coincide con ninguna opción', () => {
    const q = parseTriviaQuestion(
      JSON.stringify({
        question: '¿Unidad de fuerza en el SI?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctIndex: 0,
        answer: 'Kelvin',
        explanation: 'La fuerza se mide en newtons.',
      }),
    );
    expect(q.correctIndex).toBe(0);
  });
});
