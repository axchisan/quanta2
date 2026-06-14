export interface ChallengeAttempt {
  id: string;
  challengeId: string;
  userId?: string;
  guestSessionId?: string;
  roomId?: string;
  submittedAnswer: Record<string, unknown>;
  isCorrect: boolean;
  score: number;
  timeTakenMs: number;
  feedback?: string;
  createdAt: string;
}

/** Lo que el cliente envía; el server calcula `isCorrect`, `score`, `timeTakenMs`. */
export interface SubmitAttemptInput {
  challengeId: string;
  roomId?: string;
  submittedAnswer: Record<string, unknown>;
}
