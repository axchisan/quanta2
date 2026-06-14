import { pathToFileURL } from 'node:url';
import { env } from './env.js';
import { createGameServer } from './app.js';

export { createGameServer } from './app.js';
export type { GameServerHandle } from './app.js';
export { LobbyRoom, buildHeartbeat } from './rooms/lobby-room.js';
export type { HeartbeatMessage } from './rooms/lobby-room.js';

async function main(): Promise<void> {
  const handle = createGameServer(env.GAME_SERVER_PORT);
  const port = await handle.listen();
  console.log(`[game-server] listening on ws://localhost:${port}`);
}

const entryArg = process.argv[1];
const isEntrypoint = entryArg !== undefined && import.meta.url === pathToFileURL(entryArg).href;

if (isEntrypoint) {
  void main();
}
