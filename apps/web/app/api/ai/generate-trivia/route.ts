import { NextResponse } from 'next/server';
import {
  parseTriviaQuestion,
  TriviaOutOfScopeError,
  type TriviaQuestion,
} from '@quanta/ai-gateway';
import { getAIGateway } from '@/lib/ai/gateway';
import { errorResponse, invalidInput } from '@/lib/api';
import { generateTriviaSchema } from '@/lib/challenges/schemas';
import { createTriviaChallenge } from '@/lib/challenges/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = generateTriviaSchema.safeParse(body);
    if (!parsed.success) return invalidInput(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    const { topic, difficulty } = parsed.data;

    const res = await getAIGateway().generateTrivia({ topic, difficulty });

    let question: TriviaQuestion;
    try {
      question = parseTriviaQuestion(res.data);
    } catch (e) {
      if (e instanceof TriviaOutOfScopeError) {
        return NextResponse.json(
          { error: { code: 'out_of_scope', message: 'Ese tema está fuera de Física/Química.' } },
          { status: 422 },
        );
      }
      return NextResponse.json(
        {
          error: {
            code: 'invalid_ai_output',
            message: 'La IA devolvió algo inesperado, probá de nuevo.',
          },
        },
        { status: 502 },
      );
    }

    const result = await createTriviaChallenge(getServiceClient(), {
      topic,
      difficulty,
      question,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
