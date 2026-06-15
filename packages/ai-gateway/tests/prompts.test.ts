import { describe, expect, it } from 'vitest';
import { buildTriviaPrompt } from '../src/prompts/trivia.js';

describe('buildTriviaPrompt', () => {
  it('incluye el tema y la dificultad', () => {
    const prompt = buildTriviaPrompt({ topic: 'leyes de Newton', difficulty: 'hard' });
    expect(prompt).toContain('leyes de Newton');
    expect(prompt).toContain('hard');
  });

  it('por default apunta a secundaria', () => {
    const prompt = buildTriviaPrompt({ topic: 'energía', difficulty: 'easy' });
    expect(prompt.toLowerCase()).toContain('secundaria');
  });

  it('adapta el perfil del público según la audiencia', () => {
    const ninos = buildTriviaPrompt({ topic: 'energía', difficulty: 'easy', audience: 'ninos' });
    const uni = buildTriviaPrompt({
      topic: 'energía',
      difficulty: 'easy',
      audience: 'universidad',
    });
    expect(ninos.toLowerCase()).toContain('primaria');
    expect(uni.toLowerCase()).toContain('universitarios');
    expect(ninos).not.toBe(uni);
  });

  it('agrega la pista de variedad cuando hay nonce', () => {
    const prompt = buildTriviaPrompt({ topic: 'energía', difficulty: 'easy', nonce: 3 });
    expect(prompt).toContain('Variante #3');
  });
});
