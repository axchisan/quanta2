import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api';
import { roomCodeSchema } from '@/lib/rooms/schemas';
import { getRoomSnapshot } from '@/lib/rooms/service';
import { getServiceClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  try {
    const { code } = await params;
    const parsed = roomCodeSchema.safeParse(code);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'invalid_input', message: 'Código inválido' } },
        { status: 400 },
      );
    }
    const snapshot = await getRoomSnapshot(getServiceClient(), parsed.data);
    return NextResponse.json(snapshot, { status: 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
