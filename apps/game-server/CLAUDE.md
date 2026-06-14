# `@quanta/game-server` — Colyseus (realtime authoritative)

Servidor Colyseus 0.16 para retos competitivos multiplayer (Kahoot, Duelo, Coop).
Las salas son la **fuente de verdad** del estado de juego: el cliente propone, el server decide.

## Estado actual

Skeleton inicial (T004). Solo existe `LobbyRoom` como placeholder con un latido
(`heartbeat`) para validar el transporte WebSocket de punta a punta. Las salas reales
(`KahootRoom`, `DuelRoom`, `CoopRoom`) se construyen sobre esta base.

## Estructura

```
src/
├─ index.ts              # entrypoint: arranca el server solo si se ejecuta directamente
├─ app.ts                # createGameServer(port) → { gameServer, listen, shutdown }
├─ env.ts                # GAME_SERVER_PORT (Zod, vía @quanta/config/env)
└─ rooms/
   └─ lobby-room.ts      # LobbyRoom + buildHeartbeat() puro y testeable
tests/
└─ lobby.test.ts         # unit (buildHeartbeat) + integración (join → heartbeat)
```

`createGameServer(0)` bindea a un puerto efímero y `listen()` devuelve el puerto real;
así los tests no chocan de puerto y no dependen de timing.

## Scripts

| Script                                  | Qué hace                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| `pnpm --filter @quanta/game-server dev` | `tsx watch` sobre `src/index.ts` (escucha en :2567)                              |
| `... build`                             | `tsup` → bundle ESM en `dist/` (workspace packages bundleados, colyseus externo) |
| `... start`                             | `node dist/index.js`                                                             |
| `... test`                              | `vitest run`                                                                     |
| `... typecheck`                         | `tsc --noEmit`                                                                   |

## Reglas del dominio (heredadas de docs/agents/backend-realtime.md)

- **Estado authoritative en el server.** Usá `@type` decorators de Colyseus para el state
  sincronizado (por eso `experimentalDecorators` + `useDefineForClassFields:false` en tsconfig).
- **Validación de respuestas server-side ANTES de calcular score.** El cliente envía
  `submitted_answer`; el server compara contra `solution` y aplica la fórmula de
  `docs/08-game-design.md`. La `solution` **nunca** viaja al cliente.
- **Tiempo medido server-side.** No confiar en timestamps del cliente para puntajes.
- **Anti-cheat.** Scores imposibles o timestamps inconsistentes → rechazo + log en
  `cheating_attempts`.
- **Reconexión.** `allowReconnection(client, 30)` mínimo en salas competitivas.
- **Sin lógica de presentación.** El server devuelve datos/estado, no formatea para UI.
- **Sin memory leaks entre salas.** Limpiá intervalos/timers en `onDispose` (como hace
  `LobbyRoom` con `this.clock.clear()`).

## Convenciones

- TS estricto (base raíz): `import type` para imports de solo-tipo, sin `any`.
- Archivos `kebab-case.ts`. Una sala = un archivo en `src/rooms/`.
- Inputs externos validados con Zod.
- Errores con código semántico: `{ error: { code: 'room_full', message } }`.
- Logging estructurado (room id, session id, user id si auth).
- Cobertura objetivo: 70% (lógica server-side crítica).

## Despliegue

`Dockerfile` multi-stage (build context = raíz del monorepo). Expone `2567`.
No se buildea localmente todavía (Docker no instalado en dev).
