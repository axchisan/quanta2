'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

type RawUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
} | null;

function mapUser(u: RawUser): AuthUser | null {
  if (!u) return null;
  const md = u.user_metadata ?? {};
  const name =
    typeof md.full_name === 'string' ? md.full_name : typeof md.name === 'string' ? md.name : null;
  return {
    id: u.id,
    email: u.email ?? null,
    name,
    avatarUrl: typeof md.avatar_url === 'string' ? md.avatar_url : null,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(mapUser(data.session?.user ?? null));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signInWithGoogle(): Promise<void> {
    await getBrowserClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/mis-puntajes` },
    });
  }

  async function signOut(): Promise<void> {
    await getBrowserClient().auth.signOut();
  }

  return { user, loading, signInWithGoogle, signOut };
}
