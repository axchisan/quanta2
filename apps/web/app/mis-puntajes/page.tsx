'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@quanta/ui';
import { useAuth } from '@/lib/auth/use-auth';
import { getBrowserClient } from '@/lib/supabase/browser';

interface AttemptRow {
  id: string;
  score: number;
  is_correct: boolean;
  created_at: string;
  challenges: { title: string } | null;
}

function Screen({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-10">{children}</main>;
}

export default function MisPuntajesPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void getBrowserClient()
      .from('challenge_attempts')
      .select('id, score, is_correct, created_at, challenges(title)')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows((data ?? []) as unknown as AttemptRow[]);
        setLoading(false);
      });
  }, [user]);

  if (authLoading) {
    return (
      <Screen>
        <p className="text-muted-foreground">Cargando…</p>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <Link href="/" className="text-muted-foreground text-sm underline">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Mis puntajes</h1>
        <p className="text-muted-foreground">Entrá con tu cuenta para ver tu progreso guardado.</p>
        <Button className="w-fit" onClick={() => void signInWithGoogle()}>
          Entrar con Google
        </Button>
      </Screen>
    );
  }

  const total = rows.reduce((acc, r) => acc + r.score, 0);
  const correct = rows.filter((r) => r.is_correct).length;

  return (
    <Screen>
      <Link href="/" className="text-muted-foreground text-sm underline">
        ← Volver
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Mis puntajes</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Puntos" value={total} />
        <Stat label="Retos jugados" value={rows.length} />
        <Stat label="Aciertos" value={correct} />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando intentos…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no jugaste ningún reto.{' '}
          <Link href="/" className="underline">
            Empezá ahora
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="border-border bg-card flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <span>{r.challenges?.title ?? 'Reto'}</span>
              <span className={r.is_correct ? 'text-primary' : 'text-muted-foreground'}>
                {r.is_correct ? `+${r.score}` : '✗ 0'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 text-center">
      <p className="text-primary text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
