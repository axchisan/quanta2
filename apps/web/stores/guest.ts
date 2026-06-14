import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GuestIdentity } from '@quanta/types';

interface GuestState {
  identity: GuestIdentity | null;
  setIdentity: (identity: GuestIdentity) => void;
  clear: () => void;
}

/** Identidad de invitado persistida en localStorage (una sala a la vez, MVP). */
export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      identity: null,
      setIdentity: (identity) => set({ identity }),
      clear: () => set({ identity: null }),
    }),
    { name: 'quanta-guest' },
  ),
);
