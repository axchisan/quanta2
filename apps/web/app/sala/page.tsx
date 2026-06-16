'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Room } from 'colyseus.js';
import { Badge, Button, Card, Input } from '@quanta/ui';
import { playSfx } from '@/lib/audio/sfx';
import { useAuth } from '@/lib/auth/use-auth';
import { getBrowserClient } from '@/lib/supabase/browser';
import {
  createKahootRoom,
  joinKahootRoom,
  reconnectKahootRoom,
  snapshot,
  saveResumeInfo,
  loadResumeInfo,
  clearResumeInfo,
  formatCode,
  normalizeCode,
  type KahootSnapshot,
  type ResumeInfo,
} from '@/lib/realtime/kahoot-client';
import { getGuestId, saveGuestMatch } from '@/lib/realtime/guest-history';

const TOPICS = ['Cinemática', 'Dinámica', 'Energía', 'Reacciones químicas', 'Estructura atómica'];
const DIFFS = [
  { label: 'Fácil', v: 'easy' },
  { label: 'Media', v: 'medium' },
  { label: 'Difícil', v: 'hard' },
] as const;
const AUDIENCES = [
  { label: 'Niños', v: 'ninos', hint: 'Primaria' },
  { label: 'Secundaria', v: 'secundaria', hint: 'Bachillerato' },
  { label: 'Universidad', v: 'universidad', hint: 'Profesional' },
] as const;
const NICK_KEY = 'quanta:nickname';

/** Token de Supabase del usuario logueado (para atribuir el resultado a su cuenta). */
async function getAccessToken(): Promise<string | undefined> {
  try {
    const { data } = await getBrowserClient().auth.getSession();
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}

export default function SalaPage() {
  const { user } = useAuth();
  const roomRef = useRef<Room | null>(null);
  const [snap, setSnap] = useState<KahootSnapshot | null>(null);
  const [sessionId, setSessionId] = useState('');
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [topic, setTopic] = useState<string>(TOPICS[0] ?? 'Cinemática');
  const [customTopic, setCustomTopic] = useState('');
  const [audience, setAudience] = useState<'ninos' | 'secundaria' | 'universidad'>('secundaria');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [code, setCode] = useState('');
  const [resume, setResume] = useState<ResumeInfo | null>(null);
  const [now, setNow] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const revealedRef = useRef(-1);
  const tokenRef = useRef('');
  const leftRef = useRef(false);
  const savedMatchRef = useRef(false);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code');
    if (c) setCode(formatCode(c));
    // Nombre recordado del navegador (identidad de invitado) + sala para reconectar.
    try {
      const saved = localStorage.getItem(NICK_KEY);
      if (saved) setNickname(saved);
    } catch {
      /* noop */
    }
    setResume(loadResumeInfo());
  }, []);

  // Si hay sesión iniciada, prellenar el nombre con el de la cuenta (editable).
  useEffect(() => {
    if (user?.name) setNickname((prev) => prev || user.name || '');
  }, [user]);

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

  // Partida terminada → no tiene sentido ofrecer reconexión.
  useEffect(() => {
    if (snap?.phase === 'finished') clearResumeInfo();
  }, [snap?.phase]);

  // Invitado (sin login): guardamos el resultado en el historial local del navegador.
  // (Los logueados se persisten server-side en game_results.)
  useEffect(() => {
    if (snap?.phase !== 'finished' || user || savedMatchRef.current) return;
    const me = snap.players.find((p) => p.id === sessionId);
    if (!me) return;
    savedMatchRef.current = true;
    getGuestId(); // asegura identidad de invitado
    saveGuestMatch({
      topic: snap.topic,
      score: me.score,
      rank: snap.players.findIndex((p) => p.id === sessionId) + 1,
      totalPlayers: snap.players.length,
      totalQuestions: snap.totalQuestions,
    });
  }, [snap, user, sessionId]);

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
    setResume(null);
    leftRef.current = false;
    if (!isReconnect) revealedRef.current = -1;
    saveResumeInfo({ roomId: room.roomId, token: room.reconnectionToken, nickname: nickname.trim() });
    room.onStateChange((state) => {
      tokenRef.current = room.reconnectionToken;
      // Mantené fresco el token persistido por si el usuario recarga la página.
      saveResumeInfo({
        roomId: room.roomId,
        token: room.reconnectionToken,
        nickname: nickname.trim(),
      });
      setSnap(snapshot(state));
    });
    room.onError((_code, message) => setError(message ?? 'Error de sala'));
    // code 1000 = salida consentida; otros = caída → intentar reconectar.
    room.onLeave((code) => {
      if (leftRef.current || code === 1000) {
        clearResumeInfo();
        setJoined(false);
        return;
      }
      void attemptReconnect();
    });
  }

  /** Reconecta a la sala previa guardada (tras recargar la página). */
  async function resumeRoom() {
    if (!resume) return;
    setError(null);
    setBusy(true);
    setReconnecting(true);
    try {
      bind(await reconnectKahootRoom(resume.token), true);
    } catch {
      clearResumeInfo();
      setResume(null);
      setError('La sala anterior ya no está disponible.');
    } finally {
      setReconnecting(false);
      setBusy(false);
    }
  }

  function rememberNickname() {
    try {
      localStorage.setItem(NICK_KEY, nickname.trim());
    } catch {
      /* noop */
    }
  }

  async function create() {
    setError(null);
    setBusy(true);
    rememberNickname();
    try {
      const accessToken = await getAccessToken();
      const effectiveTopic = customTopic.trim() || topic;
      bind(
        await createKahootRoom({
          nickname: nickname.trim(),
          topic: effectiveTopic,
          difficulty,
          audience,
          ...(accessToken ? { accessToken } : {}),
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la sala');
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    setError(null);
    setBusy(true);
    rememberNickname();
    try {
      const accessToken = await getAccessToken();
      bind(await joinKahootRoom(code.trim(), nickname.trim(), accessToken));
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

        {resume ? (
          <Card className="border-primary grid gap-2 border-2 text-center">
            <p className="text-sm font-semibold">Tenías una partida en curso</p>
            <p className="text-muted-foreground text-xs">
              Sala <span className="font-mono font-bold">{formatCode(resume.roomId)}</span> — podés
              volver a entrar.
            </p>
            <Button size="lg" disabled={busy} onClick={() => void resumeRoom()}>
              ↩ Volver a mi sala
            </Button>
            <button
              type="button"
              className="text-muted-foreground text-xs underline"
              onClick={() => {
                clearResumeInfo();
                setResume(null);
              }}
            >
              Descartar
            </button>
          </Card>
        ) : null}

        <Card className="grid gap-3">
          <label className="text-sm font-medium">Tu nombre</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Ej: Ana"
            maxLength={20}
          />
          <p className="mt-2 text-sm font-semibold">Crear una sala nueva</p>
          <span className="text-muted-foreground text-xs">Elegí un tema o escribí el tuyo</span>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                variant={t === topic && !customTopic.trim() ? 'default' : 'outline'}
                onClick={() => {
                  setTopic(t);
                  setCustomTopic('');
                }}
              >
                {t}
              </Button>
            ))}
          </div>
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Tema personalizado (ej: leyes de Newton, tabla periódica…)"
            maxLength={64}
          />
          <span className="text-muted-foreground text-xs">Nivel del público</span>
          <div className="flex gap-2">
            {AUDIENCES.map((a) => (
              <Button
                key={a.v}
                type="button"
                size="sm"
                variant={a.v === audience ? 'default' : 'outline'}
                onClick={() => setAudience(a.v)}
                title={a.hint}
              >
                {a.label}
              </Button>
            ))}
          </div>
          <span className="text-muted-foreground text-xs">Dificultad</span>
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
            onChange={(e) => setCode(formatCode(e.target.value))}
            placeholder="Código de sala (ABC-DEF)"
            className="text-center font-mono tracking-widest uppercase"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={7}
          />
          <Button
            variant="secondary"
            size="lg"
            disabled={!nickOk || normalizeCode(code).length !== 6 || busy}
            onClick={() => void join()}
          >
            Unirme
          </Button>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <p className="text-muted-foreground text-center text-xs">
            {user
              ? '✓ Tu puntaje de la partida se guardará en “Mis puntajes”.'
              : 'Entrá con tu cuenta para que tu puntaje cuente en “Mis puntajes”.'}
          </p>
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
          <p className="text-primary my-1 font-mono text-4xl font-extrabold tracking-widest">
            {formatCode(roomId)}
          </p>
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
            {snap.genFailed ? (
              isHost ? (
                <div className="grid gap-2">
                  <p className="text-destructive text-sm">
                    No se pudieron generar las preguntas 😕 (la IA está saturada).
                  </p>
                  <Button size="lg" variant="secondary" onClick={() => roomRef.current?.send('regenerate')}>
                    ↻ Reintentar
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Hubo un problema generando preguntas. El anfitrión va a reintentar…
                </p>
              )
            ) : isHost ? (
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
            <div className="mt-4 grid gap-2">
              {user ? (
                <Button asChild className="w-full">
                  <Link href="/mis-puntajes">Ver en Mis puntajes</Link>
                </Button>
              ) : null}
              <Button asChild className="w-full" variant="secondary">
                <Link href="/">Volver al inicio</Link>
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}
    </main>
  );
}
