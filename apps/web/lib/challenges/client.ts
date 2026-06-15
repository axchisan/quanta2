import type { AttemptResult, FreeFallAnswer } from '@quanta/types';
import { postJson } from '@/lib/http';

export function submitAttemptRequest(input: {
  challengeId: string;
  timeTakenMs: number;
  submittedAnswer: FreeFallAnswer;
}): Promise<AttemptResult> {
  return postJson<AttemptResult>('/api/attempts/submit', input);
}
