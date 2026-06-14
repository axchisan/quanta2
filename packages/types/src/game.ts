import type { Challenge } from './challenge.js';

/** Eventos estandarizados entre las scenes Phaser y la capa React (ADR-0002). */
export interface GameEventMap {
  'engine:ready': { sceneKey: string };
  'challenge:ready': { challenge: Challenge };
  'challenge:input': { value: unknown };
  'challenge:complete': { value: unknown; clientTimeMs: number };
  'challenge:abort': { reason: string };
}

export type GameEventName = keyof GameEventMap;
