import type { AttemptResult } from '@quanta/types';
import { postJson } from '@/lib/http';

export function submitAttemptRequest(input: {
  challengeId: string;
  timeTakenMs: number;
  submittedAnswer: Record<string, unknown>;
}): Promise<AttemptResult> {
  return postJson<AttemptResult>('/api/attempts/submit', input);
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
