import { NextResponse } from 'next/server';
import { errorResponse, invalidInput } from '@/lib/api';
import { createRoomSchema } from '@/lib/rooms/schemas';
import { createRoom } from '@/lib/rooms/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json().catch(() => ({}));
    const parsed = createRoomSchema.safeParse(body);
    if (!parsed.success) {
      return invalidInput(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    }
    const { nickname, mode } = parsed.data;
    const result = await createRoom(getServiceClient(), {
      nickname,
      ...(mode ? { mode } : {}),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
