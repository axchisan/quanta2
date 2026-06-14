import { NextResponse } from 'next/server';
import { errorResponse, invalidInput } from '@/lib/api';
import { joinRoomSchema } from '@/lib/rooms/schemas';
import { joinRoom } from '@/lib/rooms/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = joinRoomSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInput(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    }
    const result = await joinRoom(getServiceClient(), parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
