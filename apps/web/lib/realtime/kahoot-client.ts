'use client';

import { Client, type Room } from 'colyseus.js';

function getClient(): Client {
  const url = process.env.NEXT_PUBLIC_GAME_SERVER_URL;
  if (!url) throw new Error('Falta NEXT_PUBLIC_GAME_SERVER_URL');
  return new Client(url);
}

export interface KahootPlayer {
  id: string;
  nickname: string;
  score: number;
  answered: boolean;
  connected: boolean;
}

export interface KahootSnapshot {
  phase: 'lobby' | 'question' | 'reveal' | 'finished';
  ready: boolean;
  genFailed: boolean;
  topic: string;
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: string[];
  correctIndex: number;
  deadline: number;
  hostId: string;
  players: KahootPlayer[];
}

interface RawPlayer {
  nickname: string;
  score: number;
  answered: boolean;
  connected: boolean;
}
interface RawState {
  phase: KahootSnapshot['phase'];
  ready: boolean;
  genFailed: boolean;
  topic: string;
  questionIndex: number;
  totalQuestions: number;
  question: string;
  options: Iterable<string>;
  correctIndex: number;
  deadline: number;
  hostId: string;
  players: { forEach(cb: (p: RawPlayer, id: string) => void): void };
}

export function snapshot(rawState: unknown): KahootSnapshot {
  const state = rawState as RawState;
  const players: KahootPlayer[] = [];
  state.players.forEach((p, id) =>
    players.push({
      id,
      nickname: p.nickname,
      score: p.score,
      answered: p.answered,
      connected: p.connected,
    }),
  );
  players.sort((a, b) => b.score - a.score);
  return {
    phase: state.phase,
    ready: state.ready,
    genFailed: state.genFailed,
    topic: state.topic,
    questionIndex: state.questionIndex,
    totalQuestions: state.totalQuestions,
    question: state.question,
    options: Array.from(state.options),
    correctIndex: state.correctIndex,
    deadline: state.deadline,
    hostId: state.hostId,
    players,
  };
}

export function createKahootRoom(opts: {
  nickname: string;
  topic: string;
  difficulty: string;
  audience?: string;
  /** JWT de Supabase para atribuir el resultado a la cuenta (si está logueado). */
  accessToken?: string;
}): Promise<Room> {
  return getClient().create('kahoot', { ...opts, count: 5 });
}

export function joinKahootRoom(
  roomId: string,
  nickname: string,
  accessToken?: string,
): Promise<Room> {
  return getClient().joinById(normalizeCode(roomId), {
    nickname,
    ...(accessToken ? { accessToken } : {}),
  });
}

// ── Código de sala estilo Kahoot (6 chars, mostrado como ABC-DEF) ────────────
const CODE_LENGTH = 6;

/** Normaliza un código: solo alfanumérico, mayúsculas, máx 6 chars. */
export function normalizeCode(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, CODE_LENGTH);
}

/** Formatea para mostrar/escribir con guion: `ABC-DEF`. */
export function formatCode(raw: string): string {
  const c = normalizeCode(raw);
  return c.length > 3 ? `${c.slice(0, 3)}-${c.slice(3)}` : c;
}

/** Reconecta a una sala tras una caída usando el token de reconexión de Colyseus. */
export function reconnectKahootRoom(reconnectionToken: string): Promise<Room> {
  return getClient().reconnect(reconnectionToken);
}

// ── Reconexión persistente (sobrevive a recargas de página) ──────────────────
// Colyseus retiene al jugador ~30s tras una caída no consentida. Guardamos el
// token en localStorage para ofrecer "volver a tu sala" si el usuario recargó.
const RESUME_KEY = 'quanta:kahoot:resume';
const RESUME_TTL_MS = 45_000;

export interface ResumeInfo {
  roomId: string;
  token: string;
  nickname: string;
  savedAt: number;
}

export function saveResumeInfo(info: Omit<ResumeInfo, 'savedAt'>): void {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify({ ...info, savedAt: Date.now() }));
  } catch {
    /* localStorage no disponible */
  }
}

export function loadResumeInfo(): ResumeInfo | null {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return null;
    const info = JSON.parse(raw) as ResumeInfo;
    if (Date.now() - info.savedAt > RESUME_TTL_MS) {
      clearResumeInfo();
      return null;
    }
    return info;
  } catch {
    return null;
  }
}

export function clearResumeInfo(): void {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    /* noop */
  }
}
