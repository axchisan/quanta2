'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@quanta/ui';
import type { GuestIdentity } from '@quanta/types';
import { joinRoomRequest } from '@/lib/rooms/client';

export function JoinPrompt({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (identity: GuestIdentity) => void;
}) {
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await joinRoomRequest({ nickname: nickname.trim(), code });
      onJoined(res.guest);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo unir');
      setBusy(false);
    }
  }

  return (
    <div className="border-border bg-card w-full max-w-sm rounded-xl border p-6 shadow-lg">
      <p className="text-muted-foreground text-sm">Te uniste a la sala</p>
      <p className="text-primary mt-1 text-2xl font-bold tracking-widest">{code}</p>
      <label htmlFor="nick" className="text-muted-foreground mb-2 mt-5 block text-sm font-medium">
        Elegí tu nombre
      </label>
      <Input
        id="nick"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Ej: Beto"
        maxLength={20}
        disabled={busy}
      />
      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={nickname.trim().length < 2 || busy}
        onClick={submit}
      >
        {busy ? 'Entrando…' : 'Entrar a la sala'}
      </Button>
      {error ? <p className="text-destructive mt-4 text-sm">{error}</p> : null}
      <Link href="/" className="text-muted-foreground mt-4 block text-center text-sm underline">
        Volver al inicio
      </Link>
    </div>
  );
}
