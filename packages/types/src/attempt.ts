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

/** Una especie química de una ecuación a balancear. */
export interface EquationSpecies {
  formula: string;
  side: 'reactant' | 'product';
  atoms: Record<string, number>;
}

/** Respuesta del jugador para un reto de balanceo: un coeficiente por especie. */
export interface EquationBalanceAnswer {
  coefficients: number[];
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
