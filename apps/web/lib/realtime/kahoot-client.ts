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
  return getClient().joinById(roomId, { nickname, ...(accessToken ? { accessToken } : {}) });
}

/** Reconecta a una sala tras una caída usando el token de reconexión de Colyseus. */
export function reconnectKahootRoom(reconnectionToken: string): Promise<Room> {
  return getClient().reconnect(reconnectionToken);
}
