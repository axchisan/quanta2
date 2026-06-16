'use client';

// Sesión de invitado: identidad estable + historial de partidas en el navegador.
// Es TEMPORAL y local a este dispositivo (a diferencia de las cuentas, que persisten
// en la base de datos). Sirve para mostrar progreso y atribuir reconexiones sin login.

const GUEST_ID_KEY = 'quanta:guest-id';
const HISTORY_KEY = 'quanta:guest-history';
const MAX_HISTORY = 20;

export interface GuestMatch {
  topic: string;
  score: number;
  rank: number;
  totalPlayers: number;
  totalQuestions: number;
  at: number;
}

/** Id de invitado estable (se crea una vez por navegador). */
export function getGuestId(): string {
  try {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

export function loadGuestHistory(): GuestMatch[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as GuestMatch[]) : [];
  } catch {
    return [];
  }
}

export function saveGuestMatch(match: Omit<GuestMatch, 'at'>): void {
  try {
    const history = loadGuestHistory();
    history.unshift({ ...match, at: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    /* localStorage no disponible */
  }
}

export function clearGuestHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* noop */
  }
}
