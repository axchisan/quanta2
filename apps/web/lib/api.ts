import { NextResponse } from 'next/server';

interface HttpError {
  code: string;
  message: string;
  status: number;
}

function isHttpError(e: unknown): e is HttpError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    'status' in e &&
    typeof (e as { status: unknown }).status === 'number'
  );
}

/** Convierte errores en respuestas JSON con código semántico (sin filtrar internals). */
export function errorResponse(e: unknown): NextResponse {
  if (isHttpError(e)) {
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
