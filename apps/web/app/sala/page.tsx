'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Room } from 'colyseus.js';
import { Badge, Button, Card, Input } from '@quanta/ui';
import { playSfx } from '@/lib/audio/sfx';
import {
  createKahootRoom,
  joinKahootRoom,
  reconnectKahootRoom,
  snapshot,
  type KahootSnapshot,
} from '@/lib/realtime/kahoot-client';

const TOPICS = ['Cinemática', 'Dinámica', 'Energía', 'Reacciones químicas', 'Estructura atómica'];
const DIFFS = [
  { label: 'Fácil', v: 'easy' },
  { label: 'Media', v: 'medium' },
  { label: 'Difícil', v: 'hard' },
] as const;

export default function SalaPage() {
  const roomRef = useRef<Room | null>(null);
  const [snap, setSnap] = useState<KahootSnapshot | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0] ?? 'Cinemática');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [code, setCode] = useState('');
  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const revealedRef = useRef(-1);
  const tokenRef = useRef('');
  const leftRef = useRef(false);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code');
    if (c) setCode(c);
  }, []);

  useEffect(() => {
    if (snap?.phase !== 'question') return;
    const t = setInterval(() => setNow(Date.now()), 300);
    return () => clearInterval(t);
  }, [snap?.phase]);

  // Sonido + reset al cambiar de pregunta / revelar.
  useEffect(() => {
    if (!snap) return;
    if (snap.phase === 'question')
      setSelected((prev) => (snap.questionIndex !== revealedRef.current ? null : prev));
    if (snap.phase === 'reveal' && revealedRef.current !== snap.questionIndex) {
      revealedRef.current = snap.questionIndex;
      playSfx(selected === snap.correctIndex ? 'success' : 'error');
    }
  }, [snap, selected]);

  useEffect(
    () => () => {
      leftRef.current = true;
      void roomRef.current?.leave();
    },
    [],
  );

  async function attemptReconnect() {
    const token = tokenRef.current;
    if (!token || leftRef.current) {
      setJoined(false);
      return;
    }
    setReconnecting(true);
    for (let i = 0; i < 5 && !leftRef.current; i++) {
      try {
        bind(await reconnectKahootRoom(token), true);
        setReconnecting(false);
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    setReconnecting(false);
    setJoined(false);
    if (!leftRef.current) setError('Se perdió la conexión con la sala.');
  }

  function bind(room: Room, isReconnect = false) {
    roomRef.current = room;
    tokenRef.current = room.reconnectionToken;
    setSessionId(room.sessionId);
    setJoined(true);
    if (!isReconnect) revealedRef.current = -1;
    room.onStateChange((state) => {
      tokenRef.current = room.reconnectionToken;
      setSnap(snapshot(state));
    });
    room.onError((_code, message) => setError(message ?? 'Error de sala'));
    // code 1000 = salida consentida; otros = caída → intentar reconectar.
    room.onLeave((code) => {
      if (leftRef.current || code === 1000) {
        setJoined(false);
        return;
      }
      void attemptReconnect();
    });
  }

  async function create() {
    setError(null);
    setBusy(true);
    try {
      bind(await createKahootRoom({ nickname: nickname.trim(), topic, difficulty }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la sala');
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    setError(null);
    setBusy(true);
    try {
      bind(await joinKahootRoom(code.trim(), nickname.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo unir a la sala');
    } finally {
      setBusy(false);
    }
  }

  function answer(i: number) {
    if (selected !== null) return;
    setSelected(i);
    roomRef.current?.send('answer', { index: i });
  }

  const nickOk = nickname.trim().length >= 2;

  // ── Pantalla de entrada ────────────────────────────────────────────
  if (!joined || !snap) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-5 px-4 py-8">
        <Link href="/" className="text-muted-foreground hover:text-primary text-sm font-semibold">
          ← Inicio
        </Link>
        <h1 className="text-center text-3xl font-extrabold tracking-tight">Sala con amigos 🎉</h1>
        <Card className="grid gap-3">
          <label className="text-sm font-medium">Tu nombre</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ej: Ana"
            maxLength={20}
          />
          <p className="mt-2 text-sm font-semibold">Crear una sala nueva</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={t === topic ? 'default' : 'outline'}
                onClick={() => setTopic(t)}
              >
                {t}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {DIFFS.map((d) => (
              <Button
                key={d.v}
                type="button"
                size="sm"
                variant={d.v === difficulty ? 'default' : 'outline'}
                onClick={() => setDifficulty(d.v)}
              >
                {d.label}
              </Button>
            ))}
          </div>
          <Button size="lg" disabled={!nickOk || busy} onClick={() => void create()}>
            {busy ? 'Conectando…' : 'Crear sala'}
          </Button>
          <div className="text-muted-foreground my-1 text-center text-xs">
            o unite con un código
          </div>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de sala"
          />
          <Button
            variant="secondary"
            size="lg"
            disabled={!nickOk || code.trim().length < 4 || busy}
            onClick={() => void join()}
          >
            Unirme
          </Button>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </Card>
      </main>
    );
  }

  // ── En sala ────────────────────────────────────────────────────────
  const isHost = snap.hostId === sessionId;
  const me = snap.players.find((p) => p.id === sessionId);
  const roomId = roomRef.current?.roomId ?? '';
  const remaining = Math.max(0, Math.ceil((snap.deadline - now) / 1000));

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-8">
      {reconnecting ? (
        <div className="bg-accent/20 text-accent-foreground rounded-xl px-4 py-2 text-center text-sm font-semibold">
          Reconectando…
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <Badge variant="muted">{snap.topic}</Badge>
        {snap.totalQuestions > 0 && snap.questionIndex >= 0 ? (
          <Badge>{`${snap.questionIndex + 1} / ${snap.totalQuestions}`}</Badge>
        ) : null}
      </div>

      {snap.phase === 'lobby' ? (
        <Card className="text-center">
          <p className="text-muted-foreground text-sm">Código de la sala — compartilo</p>
          <p className="text-primary my-1 text-3xl font-extrabold tracking-widest">{roomId}</p>
          <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left">
            {snap.players.map((p) => (
              <li
                key={p.id}
                className="bg-muted flex items-center justify-between rounded-xl px-3 py-2"
              >
                <span className="font-semibold">{p.nickname}</span>
                {p.id === snap.hostId ? <Badge variant="secondary">anfitrión</Badge> : null}
              </li>
            ))}
          </ul>
          <div className="mt-5">
            {isHost ? (
              snap.ready && snap.totalQuestions > 0 ? (
                <Button size="lg" onClick={() => roomRef.current?.send('start')}>
                  ▶ Iniciar juego
                </Button>
              ) : (
                <p className="text-muted-foreground text-sm">Generando preguntas con IA…</p>
              )
            ) : (
              <p className="text-muted-foreground text-sm">Esperando a que el anfitrión inicie…</p>
            )}
          </div>
        </Card>
      ) : null}

      {snap.phase === 'question' || snap.phase === 'reveal' ? (
        <Card className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {snap.phase === 'question' ? `${remaining}s` : 'Respuesta'}
            </span>
            {me ? <span className="text-primary font-bold">{me.score} pts</span> : null}
          </div>
          <p className="text-lg font-semibold">{snap.question}</p>
          {snap.options.map((opt, i) => {
            const reveal = snap.phase === 'reveal';
            const isCorrect = reveal && i === snap.correctIndex;
            const isWrongPick = reveal && i === selected && i !== snap.correctIndex;
            const base = 'rounded-xl border-2 px-4 py-3 text-left transition';
            const cls = isCorrect
              ? 'border-primary bg-primary/15'
              : isWrongPick
                ? 'border-destructive bg-destructive/15'
                : selected === i
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary';
            return (
              <button
                key={i}
                type="button"
                disabled={snap.phase !== 'question' || selected !== null}
                onClick={() => answer(i)}
                className={`${base} ${cls}`}
              >
                {opt}
              </button>
            );
          })}
          {snap.phase === 'question' && selected !== null ? (
            <p className="text-muted-foreground text-center text-sm">
              ¡Respondido! Esperando al resto…
            </p>
          ) : null}
        </Card>
      ) : null}

      {snap.phase === 'reveal' || snap.phase === 'finished' ? (
        <Card>
          <p className="font-display mb-2 text-center text-xl font-bold">
            {snap.phase === 'finished' ? '🏆 Resultado final' : 'Tabla de posiciones'}
          </p>
          <ol className="space-y-2">
            {snap.players.map((p, idx) => (
              <li
                key={p.id}
                className="bg-muted flex items-center justify-between rounded-xl px-3 py-2"
              >
                <span className="font-semibold">
                  {idx + 1}. {p.nickname} {p.id === sessionId ? '(vos)' : ''}
                </span>
                <span className="text-primary font-bold">{p.score}</span>
              </li>
            ))}
          </ol>
          {snap.phase === 'finished' ? (
            <Button asChild className="mt-4 w-full" variant="secondary">
              <Link href="/">Volver al inicio</Link>
            </Button>
          ) : null}
        </Card>
      ) : null}
    </main>
  );
}
