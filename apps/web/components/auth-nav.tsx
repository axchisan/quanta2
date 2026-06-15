'use client';

import Link from 'next/link';
import { Button } from '@quanta/ui';
import { useAuth } from '@/lib/auth/use-auth';

export function AuthNav() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <nav className="flex h-12 items-center justify-end gap-3 px-4 text-sm">
      {loading ? null : user ? (
        <>
          <span className="text-muted-foreground hidden sm:inline">{user.name ?? user.email}</span>
          <Link
            href="/mis-puntajes"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Mis puntajes
          </Link>
          <Button size="sm" variant="outline" onClick={() => void signOut()}>
            Salir
          </Button>
        </>
      ) : (
        <Button size="sm" variant="outline" onClick={() => void signInWithGoogle()}>
          Entrar con Google
        </Button>
      )}
    </nav>
  );
}
