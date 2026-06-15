import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { LobbyRoom } from './rooms/lobby-room.js';
import { KahootRoom } from './rooms/kahoot-room.js';

export interface GameServerHandle {
  gameServer: Server;
  /** Resolves with the actual bound port (useful when binding to 0 for tests). */
  listen: () => Promise<number>;
  shutdown: () => Promise<void>;
}

export function createGameServer(port: number): GameServerHandle {
  // Handler HTTP para healthcheck (Coolify) y raíz. Las conexiones WebSocket
  // las maneja Colyseus vía el evento 'upgrade' del mismo server.
  const httpServer: HttpServer = createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/health' || req.url === '/')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'quanta-game-server' }));
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });
  const gameServer = new Server({
    transport: new WebSocketTransport({ server: httpServer }),
  });

  gameServer.define('lobby', LobbyRoom);
  gameServer.define('kahoot', KahootRoom);

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
