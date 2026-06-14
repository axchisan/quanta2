export type Subject = 'physics' | 'chemistry' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeKind = 'simulation' | 'drag_drop' | 'multiple_choice' | 'numeric_input';
export type ChallengeStatus = 'draft' | 'published' | 'flagged' | 'removed';

/**
 * Reto tal como lo recibe el cliente. NUNCA incluye `solution`
 * (vive solo server-side, anti-cheat ADR-0007).
 */
export interface Challenge {
  id: string;
  slug?: string;
  title: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  kind: ChallengeKind;
  statement: string;
  payload: ChallengePayload;
  explanationTemplate?: string;
  creatorId?: string;
  isPredefined: boolean;
  status: ChallengeStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChallengePayload = Record<string, unknown>;

/** Server-only: la solución y cómo validarla. Nunca se serializa al cliente. */
export interface ChallengeSolution {
  challengeId: string;
  solution: Record<string, unknown>;
}

export type ChallengeAssetKind = 'sprite' | 'background' | 'audio_narration' | 'audio_sfx';

export interface ChallengeAsset {
  id: string;
  challengeId: string;
  kind: ChallengeAssetKind;
  storagePath: string;
  provider?: string;
  promptHash?: string;
  createdAt: string;
}
