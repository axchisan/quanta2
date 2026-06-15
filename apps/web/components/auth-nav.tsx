'use client';

import Link from 'next/link';
import { Button } from '@quanta/ui';
import { useAuth } from '@/lib/auth/use-auth';

export function AuthNav() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return <div className="h-9 w-24" />;

  if (!user) {
    return (
      <Button size="sm" variant="outline" onClick={() => void signInWithGoogle()}>
        Entrar con Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link
        href="/mis-puntajes"
        className="text-foreground hover:text-primary hidden font-semibold sm:inline"
      >
        Mis puntajes
      </Link>
      <span className="text-muted-foreground hidden max-w-[10rem] truncate md:inline">
        {user.name ?? user.email}
      </span>
      <Button size="sm" variant="ghost" onClick={() => void signOut()}>
        Salir
      </Button>
    </div>
  );
}
