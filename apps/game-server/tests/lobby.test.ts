import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from 'colyseus.js';
import { createGameServer } from '../src/app.js';
import { buildHeartbeat } from '../src/rooms/lobby-room.js';
import type { GameServerHandle } from '../src/app.js';
import type { HeartbeatMessage } from '../src/rooms/lobby-room.js';

describe('buildHeartbeat', () => {
  it('returns a heartbeat message with a numeric timestamp', () => {
    const message = buildHeartbeat();
    expect(message.type).toBe('heartbeat');
    expect(typeof message.at).toBe('number');
  });

  it('uses the provided timestamp', () => {
    expect(buildHeartbeat(123).at).toBe(123);
  });
});

describe('LobbyRoom integration', () => {
  let handle: GameServerHandle;
  let port: number;

  beforeAll(async () => {
    handle = createGameServer(0);
    port = await handle.listen();
  });

  afterAll(async () => {
    await handle.shutdown();
  });

  it('sends a heartbeat to a freshly joined client', async () => {
    const client = new Client(`ws://localhost:${port}`);
    const room = await client.joinOrCreate('lobby');

    const heartbeat = await new Promise<HeartbeatMessage>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Did not receive heartbeat within 5s'));
      }, 5000);

      room.onMessage('heartbeat', (message: HeartbeatMessage) => {
        clearTimeout(timeout);
        resolve(message);
      });
    });

    expect(heartbeat.type).toBe('heartbeat');
    expect(typeof heartbeat.at).toBe('number');

    await room.leave();
  });
});
