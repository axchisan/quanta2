import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from 'colyseus.js';
import { createGameServer } from '../src/app.js';
import type { GameServerHandle } from '../src/app.js';

async function waitFor(cond: () => boolean, ms = 6000): Promise<void> {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error('waitFor timeout');
    await new Promise((r) => setTimeout(r, 30));
  }
}

// El state de Colyseus tipa débil en el cliente; helper para leer campos.
interface KahootClientState {
  hostId: string;
  players: { size: number; get(id: string): { connected: boolean } | undefined };
}

describe('KahootRoom reconnection + host migration', () => {
  let handle: GameServerHandle;
  let port: number;

  beforeAll(async () => {
    handle = createGameServer(0);
    port = await handle.listen();
  });

  afterAll(async () => {
    await handle.shutdown();
  });

  it('reconnects a dropped client and migrates host when the host leaves', async () => {
    const url = `ws://localhost:${port}`;
    const clientA = new Client(url);
    const roomA = await clientA.create('kahoot', { nickname: 'Ana', topic: 'Energía', count: 1 });
    const stateA = roomA.state as unknown as KahootClientState;

    const clientB = new Client(url);
    const roomB = await clientB.joinById(roomA.roomId, { nickname: 'Beto' });
    const bId = roomB.sessionId;

    await waitFor(() => stateA.players.size === 2);
    expect(stateA.hostId).toBe(roomA.sessionId);

    // B se cae de forma inesperada (sin consentimiento) → el server lo retiene.
    const tokenB = roomB.reconnectionToken;
    await roomB.leave(false);
    await waitFor(() => stateA.players.get(bId)?.connected === false);
    expect(stateA.players.size).toBe(2); // sigue en la sala, esperando reconexión

    // B reconecta dentro de la ventana de 30s.
    const roomB2 = await clientB.reconnect(tokenB);
    const stateB = roomB2.state as unknown as KahootClientState;
    expect(roomB2.sessionId).toBe(bId);
    await waitFor(() => stateA.players.get(bId)?.connected === true);

    // El anfitrión (A) se va de forma consentida → el rol migra a B.
    await roomA.leave(true);
    await waitFor(() => stateB.hostId === bId);
    expect(stateB.players.size).toBe(1);

    await roomB2.leave(true);
  }, 20_000);
});
