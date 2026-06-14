// Alfabeto sin caracteres ambiguos (sin O/0/I/1/L) para códigos legibles.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Código de sala humano-legible tipo `K7P-2QX`. */
export function generateRoomCode(): string {
  const pick = (n: number): string =>
    Array.from({ length: n }, () => {
      const i = Math.floor(Math.random() * ALPHABET.length);
      return ALPHABET[i] ?? 'X';
    }).join('');
  return `${pick(3)}-${pick(3)}`;
}
