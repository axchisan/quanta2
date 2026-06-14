import { Room } from 'colyseus';
import type { Client } from 'colyseus';

export interface HeartbeatMessage {
  type: 'heartbeat';
  at: number;
}

const HEARTBEAT_INTERVAL_MS = 5000;

export function buildHeartbeat(at: number = Date.now()): HeartbeatMessage {
  return { type: 'heartbeat', at };
}

export class LobbyRoom extends Room {
  override onCreate(): void {
    this.clock.setInterval(() => {
      this.broadcast('heartbeat', buildHeartbeat());
    }, HEARTBEAT_INTERVAL_MS);
  }

  override onJoin(client: Client): void {
    console.log(`[lobby] client joined: ${client.sessionId}`);
    client.send('heartbeat', buildHeartbeat());
  }

  override onLeave(client: Client): void {
    console.log(`[lobby] client left: ${client.sessionId}`);
  }

  override onDispose(): void {
    this.clock.clear();
  }
}
