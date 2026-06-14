import { NextResponse } from 'next/server';
import { RoomError } from '@/lib/rooms/service';

/** Convierte errores en respuestas JSON con código semántico (sin filtrar internals). */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof RoomError) {
    return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
  }
  console.error('[api] error inesperado', e);
  return NextResponse.json(
    { error: { code: 'internal', message: 'Error interno del servidor' } },
    { status: 500 },
  );
}

export function invalidInput(message: string): NextResponse {
  return NextResponse.json({ error: { code: 'invalid_input', message } }, { status: 400 });
}
