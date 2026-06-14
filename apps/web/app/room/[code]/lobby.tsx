'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRoomPresence } from '@/lib/realtime/use-room-presence';
import { useGuestStore } from '@/stores/guest';
import { JoinPrompt } from './join-prompt';

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-16">
      {children}
    </main>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="text-primary mt-1 text-4xl font-bold tracking-widest transition hover:opacity-80"
      title="Copiar código"
    >
      {code}
      <span className="text-muted-foreground ml-2 align-middle text-xs">
        {copied ? '¡copiado!' : '📋'}
      </span>
    </button>
  );
}

export function Lobby({ code }: { code: string }) {
  const identity = useGuestStore((s) => s.identity);
  const setIdentity = useGuestStore((s) => s.setIdentity);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const id = identity && identity.roomCode === code ? identity : null;
  const { members, status } = useRoomPresence(
    id?.roomId ?? null,
    id?.guestSessionId ?? null,
    id?.nickname ?? null,
    id?.role ?? null,
  );

  if (!mounted) {
    return (
      <Screen>
        <p className="text-muted-foreground">Cargando…</p>
      </Screen>
    );
  }

  if (!id) {
    return (
      <Screen>
        <JoinPrompt code={code} onJoined={setIdentity} />
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Código de sala — compartilo</p>
        <CopyCode code={code} />
        <p className="text-muted-foreground mt-2 text-sm">
          {status === 'connected' ? `${members.length} en línea` : 'Conectando…'}
        </p>
      </div>

      <ul className="w-full max-w-sm space-y-2">
        {members.map((m) => (
          <li
            key={m.key}
            className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <span className="font-medium">{m.nickname}</span>
            {m.role === 'host' ? (
              <span className="bg-primary/15 text-primary rounded px-2 py-0.5 text-xs">
                anfitrión
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="text-muted-foreground text-sm">Esperando a que el anfitrión inicie el juego…</p>
      <Link href="/" className="text-muted-foreground text-sm underline">
        Salir
      </Link>
    </Screen>
  );
}
