/** Tiempo de caída libre: t = sqrt(2h/g). Pura, sin Phaser. */
export function freeFallTime(heightM: number, gravity: number): number {
  if (gravity <= 0 || heightM < 0) return 0;
  return Math.sqrt((2 * heightM) / gravity);
}
