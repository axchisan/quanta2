import { NextResponse } from 'next/server';
import { errorResponse, invalidInput } from '@/lib/api';
import { submitAttemptSchema } from '@/lib/challenges/schemas';
import { submitAttempt } from '@/lib/challenges/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = submitAttemptSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInput(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    }
    const result = await submitAttempt(getServiceClient(), parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
