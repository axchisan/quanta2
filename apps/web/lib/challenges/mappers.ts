import type { Database } from '@quanta/types/db';
import type {
  Challenge,
  ChallengeKind,
  ChallengePayload,
  ChallengeStatus,
  Difficulty,
  Subject,
} from '@quanta/types';

type ChallengeRow = Database['public']['Tables']['challenges']['Row'];

/** Mapea una fila de `challenges` a `Challenge`. NUNCA incluye `solution` (anti-cheat). */
export function rowToChallenge(row: ChallengeRow): Challenge {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject as Subject,
    topic: row.topic,
    difficulty: row.difficulty as Difficulty,
    kind: row.kind as ChallengeKind,
    statement: row.statement,
    payload: (row.payload ?? {}) as ChallengePayload,
    isPredefined: row.is_predefined,
    status: row.status as ChallengeStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.slug ? { slug: row.slug } : {}),
    ...(row.explanation_template ? { explanationTemplate: row.explanation_template } : {}),
    ...(row.creator_id ? { creatorId: row.creator_id } : {}),
    ...(row.published_at ? { publishedAt: row.published_at } : {}),
  };
}
