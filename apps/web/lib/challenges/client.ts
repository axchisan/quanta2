import type { AttemptResult } from '@quanta/types';
import { postJson } from '@/lib/http';
import { getBrowserClient } from '@/lib/supabase/browser';

export async function submitAttemptRequest(input: {
  challengeId: string;
  timeTakenMs: number;
  submittedAnswer: Record<string, unknown>;
}): Promise<AttemptResult> {
  // Adjunta el token de sesión (si hay) para atribuir el intento al usuario.
  const { data } = await getBrowserClient().auth.getSession();
  return postJson<AttemptResult>('/api/attempts/submit', input, data.session?.access_token);
}

export interface TriviaChallengeResponse {
  challengeId: string;
  question: string;
  options: string[];
  topic: string;
  difficulty: string;
}

export function generateTriviaRequest(input: {
  topic: string;
  difficulty: string;
}): Promise<TriviaChallengeResponse> {
  return postJson<TriviaChallengeResponse>('/api/ai/generate-trivia', input);
}
