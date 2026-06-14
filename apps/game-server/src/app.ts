import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { LobbyRoom } from './rooms/lobby-room.js';

export interface GameServerHandle {
  gameServer: Server;
  /** Resolves with the actual bound port (useful when binding to 0 for tests). */
  listen: () => Promise<number>;
  shutdown: () => Promise<void>;
}

export function createGameServer(port: number): GameServerHandle {
  const httpServer: HttpServer = createServer();
  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  gameServer.define('lobby', LobbyRoom);

  return {
    gameServer,
    listen: async () => {
      await gameServer.listen(port);
      const address = httpServer.address();
      if (address === null || typeof address === 'string') {
        throw new Error('Game server did not bind to a TCP port.');
      }
      return address.port;
    },
    shutdown: () => gameServer.gracefullyShutdown(false),
  };
}
