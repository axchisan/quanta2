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

/** Respuesta del jugador para un reto de caída libre. */
export interface FreeFallAnswer {
  heightM: number;
  gravity: number;
  predictedTimeSeconds: number;
}

/** Resultado de un intento, devuelto al cliente tras la validación server-side. */
export interface AttemptResult {
  isCorrect: boolean;
  score: number;
  /** Valor correcto (server-side) para mostrar feedback (ej. tiempo real de caída). */
  correctValue: number;
  /** Valor que envió el jugador (para comparar en el feedback). */
  submittedValue: number;
  explanation: string;
}
