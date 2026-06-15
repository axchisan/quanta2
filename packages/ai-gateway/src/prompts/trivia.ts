/** Audiencia destino: ajusta vocabulario y profundidad de la pregunta. */
export type TriviaAudience = 'ninos' | 'secundaria' | 'universidad';

export interface TriviaPromptInput {
  topic: string;
  difficulty: string;
  /** Público objetivo. Default: 'secundaria'. */
  audience?: TriviaAudience;
  /** Pista de variedad para evitar preguntas repetidas al generar en lote. */
  nonce?: string | number;
}

const AUDIENCE_PROFILE: Record<TriviaAudience, string> = {
  ninos:
    'estudiantes de primaria (8-12 años): usá lenguaje muy simple, ejemplos cotidianos y cercanos, sin fórmulas complejas. La pregunta debe ser concreta y divertida.',
  secundaria:
    'estudiantes de secundaria/bachillerato (12-17 años): nivel escolar, podés usar fórmulas básicas y conceptos del currículo de física y química de secundaria.',
  universidad:
    'estudiantes universitarios y profesionales: usá terminología técnica precisa, mayor profundidad conceptual y, si aplica, razonamiento cuantitativo.',
};

function buildSystem(audience: TriviaAudience): string {
  return [
    `Sos un asistente educativo de Física y Química. Tu público son ${AUDIENCE_PROFILE[audience]}`,
    'Reglas estrictas:',
    '- Respondé SIEMPRE en español neutro.',
    '- NUNCA generes contenido violento, sexual, discriminatorio, ilegal o peligroso.',
    '- NUNCA inventes fórmulas o leyes que no existan.',
    '- Mantené el contenido dentro de Física y Química. Si el tema pedido sale de ese dominio educativo, devolvé { "error": "out_of_scope" }.',
    '- Adaptá el vocabulario y la dificultad al público indicado.',
    '- Mantené un tono amigable y motivador.',
  ].join('\n');
}

/** Pure builder for the generate-trivia prompt (system + user). */
export function buildTriviaPrompt(input: TriviaPromptInput): string {
  const audience = input.audience ?? 'secundaria';
  const lines = [
    `Generá una pregunta de trivia sobre "${input.topic}" con dificultad ${input.difficulty}.`,
    'Devolvé JSON con: question, options (array de 4), correctIndex, answer, explanation.',
    '- "answer" debe ser el TEXTO EXACTO (idéntico) de la opción correcta dentro de "options".',
    '- "correctIndex" (0-3) debe apuntar a esa misma opción.',
    '- Verificá que correctIndex, answer y explanation sean coherentes entre sí antes de responder.',
  ];
  if (input.nonce !== undefined) {
    lines.push(
      `Variante #${input.nonce}: debe ser claramente distinta de otras preguntas del mismo tema (otro enfoque, dato o subtema).`,
    );
  }
  return `${buildSystem(audience)}\n\n${lines.join('\n')}`;
}
