// SFX sintetizados con Web Audio API (sin archivos de assets). Asset-free.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  ac: AudioContext,
  freq: number,
  startOffset: number,
  dur: number,
  type: OscillatorType,
  gain: number,
): void {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + startOffset;
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

export type Sfx = 'success' | 'error' | 'click';

/** Reproduce un efecto corto. No-op en SSR o si no hay Web Audio. */
export function playSfx(kind: Sfx): void {
  const ac = getCtx();
  if (!ac) return;
  if (kind === 'success') {
    [523.25, 659.25, 783.99].forEach((f, i) => tone(ac, f, i * 0.09, 0.26, 'triangle', 0.18));
  } else if (kind === 'error') {
    tone(ac, 220, 0, 0.18, 'sawtooth', 0.13);
    tone(ac, 164.81, 0.11, 0.24, 'sawtooth', 0.13);
  } else {
    tone(ac, 660, 0, 0.05, 'square', 0.06);
  }
}
