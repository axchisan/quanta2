export interface TriviaPromptInput {
  topic: string;
  difficulty: string;
}

const SYSTEM = [
  'Sos un asistente educativo para estudiantes de colegio (14-18 años) en Colombia/LATAM.',
  'Tu único dominio es Física y Química nivel secundaria.',
  'Reglas estrictas:',
  '- Respondé SIEMPRE en español neutro.',
  '- NUNCA generes contenido violento, sexual, discriminatorio, ilegal o peligroso.',
  '- NUNCA inventes fórmulas o leyes que no existan.',
  '- Si el tema sale del dominio educativo, devolvé { "error": "out_of_scope" }.',
  '- Mantené un tono amigable y motivador.',
].join('\n');

/** Pure builder for the generate-trivia prompt (system + user). */
export function buildTriviaPrompt(input: TriviaPromptInput): string {
  const user = [
    `Generá una pregunta de trivia sobre "${input.topic}" con dificultad ${input.difficulty}.`,
    'Devolvé JSON con: question, options (array de 4), correctIndex, explanation.',
  ].join('\n');

  return `${SYSTEM}\n\n${user}`;
}
