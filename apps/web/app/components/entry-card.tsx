'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@quanta/ui';
import { createRoomRequest, joinRoomRequest } from '@/lib/rooms/client';
import { useGuestStore } from '@/stores/guest';

export function EntryCard() {
  const router = useRouter();
  const setIdentity = useGuestStore((s) => s.setIdentity);
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nickOk = nickname.trim().length >= 2;

  async function run(kind: 'create' | 'join') {
    setError(null);
    setBusy(kind);
    try {
      const res =
        kind === 'create'
          ? await createRoomRequest(nickname.trim())
          : await joinRoomRequest({ nickname: nickname.trim(), code: code.trim() });
      setIdentity(res.guest);
      router.push(`/room/${res.guest.roomCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error');
      setBusy(null);
    }
  }

  return (
    <div className="w-full text-left">
      <label htmlFor="nickname" className="text-muted-foreground mb-2 block text-sm font-medium">
        Tu nombre
      </label>
      <Input
        id="nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Ej: Ana"
        maxLength={20}
        disabled={busy !== null}
      />

      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={!nickOk || busy !== null}
        onClick={() => run('create')}
      >
        {busy === 'create' ? 'Creando…' : 'Crear sala'}
      </Button>

      <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        o entrá con un código
        <span className="bg-border h-px flex-1" />
      </div>

      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Código (ej: 95P-YKE)"
        className="uppercase"
        disabled={busy !== null}
      />
      <Button
        variant="secondary"
        className="mt-3 w-full"
        size="lg"
        disabled={!nickOk || code.trim().length < 3 || busy !== null}
        onClick={() => run('join')}
      >
        {busy === 'join' ? 'Entrando…' : 'Unirme'}
      </Button>

      {error ? <p className="text-destructive mt-4 text-sm">{error}</p> : null}
    </div>
  );
}
