import { NextResponse } from 'next/server';
import type { createServiceClient } from '@quanta/db';
import { errorResponse, invalidInput } from '@/lib/api';
import { submitAttemptSchema } from '@/lib/challenges/schemas';
import { submitAttempt } from '@/lib/challenges/service';
import { getServiceClient } from '@/lib/supabase/server';

/** Verifica el JWT del header (si hay) y devuelve el user id atribuible. */
async function resolveUserId(
  db: ReturnType<typeof createServiceClient>,
  authHeader: string | null,
): Promise<string | undefined> {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) return undefined;
  const token = authHeader.slice(7).trim();
  if (!token) return undefined;
  const { data } = await db.auth.getUser(token);
  return data.user?.id;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = submitAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInput(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    }
    const db = getServiceClient();
    const userId = await resolveUserId(db, req.headers.get('authorization'));
    const result = await submitAttempt(db, { ...parsed.data, ...(userId ? { userId } : {}) });
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
