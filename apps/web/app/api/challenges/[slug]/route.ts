import { NextResponse } from 'next/server';
import { errorResponse, invalidInput } from '@/lib/api';
import { challengeSlugSchema } from '@/lib/challenges/schemas';
import { getPublicChallenge } from '@/lib/challenges/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const parsed = challengeSlugSchema.safeParse(slug);
    if (!parsed.success) return invalidInput('Slug inválido');
    const challenge = await getPublicChallenge(getServiceClient(), parsed.data);
    return NextResponse.json({ challenge }, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
