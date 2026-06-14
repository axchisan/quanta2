export interface ChallengePromptInput {
  topic: string;
  difficulty: string;
  kind: string;
  extra?: string;
}

const SYSTEM = [
  'Sos un asistente educativo para estudiantes de colegio (14-18 años) en Colombia/LATAM.',
  'Tu único dominio es Física y Química nivel secundaria.',
  'Reglas estrictas:',
  '- Respondé SIEMPRE en español neutro.',
  '- NUNCA generes contenido violento, sexual, discriminatorio, ilegal o peligroso.',
  '- NUNCA inventes fórmulas o leyes que no existan.',
  '- Si la consulta sale del dominio educativo o no podés responderla con certeza, devolvé { "error": "out_of_scope" }.',
  '- Mantené un tono amigable, claro y motivador.',
].join('\n');

/** Pure builder for the generate-challenge prompt (system + user). */
export function buildChallengePrompt(input: ChallengePromptInput): string {
  const user = [
    `Generá un reto educativo de tipo "${input.kind}" sobre el tema "${input.topic}".`,
    `Nivel de dificultad: ${input.difficulty}.`,
    input.extra ? `Contexto adicional: ${input.extra}.` : null,
    'Devolvé JSON con: title, statement, options, correctAnswer, explanation, topic.',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return `${SYSTEM}\n\n${user}`;
}
