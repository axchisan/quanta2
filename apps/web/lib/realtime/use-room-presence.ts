'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

export interface PresenceMember {
  key: string;
  nickname: string;
  role: string;
}

export type PresenceStatus = 'idle' | 'connecting' | 'connected';

/**
 * Presencia en vivo de una sala vía Supabase Realtime (canal `room:<id>`).
 * Cada cliente trackea su propio nickname/role; devuelve la lista sincronizada.
 */
export function useRoomPresence(
  roomId: string | null,
  sessionKey: string | null,
  nickname: string | null,
  role: string | null,
): { members: PresenceMember[]; status: PresenceStatus } {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [status, setStatus] = useState<PresenceStatus>('idle');

  useEffect(() => {
    if (!roomId || !sessionKey || !nickname || !role) return;
    const supabase = getBrowserClient();
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: sessionKey } },
    });
    setStatus('connecting');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ nickname: string; role: string }>();
        const list = Object.entries(state).flatMap(([key, metas]) => {
          const meta = metas[0];
          return meta ? [{ key, nickname: meta.nickname, role: meta.role }] : [];
        });
        setMembers(list);
      })
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') {
          setStatus('connected');
          void channel.track({ nickname, role });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, sessionKey, nickname, role]);

  return { members, status };
}
