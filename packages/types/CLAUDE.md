# `@quanta/types` — Tipos compartidos

Única fuente de verdad de los tipos que cruzan paquetes (web ⇄ game-server ⇄ game-engine ⇄ ai-gateway).

## Reglas

- **Solo tipos. Cero lógica, cero dependencias de runtime.**
- Si un tipo lo usa un solo paquete, vive en ese paquete, no acá.
- `src/db.ts` se **genera** desde el esquema Supabase (`pnpm db:gen-types`). No editar a mano.
- Naming `PascalCase` para tipos/interfaces.

## Módulos

| Archivo        | Contenido                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `identity.ts`  | `Identity` (guest ⊕ user), `Profile`, `GuestSession` (ADR-0005).                                                   |
| `challenge.ts` | `Challenge`, enums (`Subject`/`Difficulty`/`ChallengeKind`), assets. `solution` nunca viaja al cliente (ADR-0007). |
| `room.ts`      | `Room`, `RoomMember`, modos y estados.                                                                             |
| `attempt.ts`   | `ChallengeAttempt`, `SubmitAttemptInput`.                                                                          |
| `ai.ts`        | `AIRequest`/`AIResponse`, IDs de proveedores, errores.                                                             |
| `game.ts`      | `GameEventMap` — eventos Phaser ⇄ React.                                                                           |
| `db.ts`        | Tipos generados del esquema (placeholder hasta `db:gen-types`).                                                    |

Consumido como código fuente TS (sin build). Las apps lo transpilan vía `transpilePackages` / tsx / tsup.
