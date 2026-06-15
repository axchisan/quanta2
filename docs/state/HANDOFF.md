# 🔄 HANDOFF — Retomar Quanta (sesión nueva)

> **Para el agente que retoma:** este archivo es tu punto de entrada. Leelo entero,
> luego seguí `docs/runbooks/kickoff-agent.md` y el briefing de rol que corresponda.
> Última actualización: **2026-06-15** (cierre de T016).

---

## 1. Qué es Quanta (1 línea)

Juego educativo de Física/Química para secundaria (14–18, Colombia/LATAM, en español),
monorepo, con retos generados por IA, multiplayer estilo Kahoot y creador de retos.
Stack: **pnpm + Turborepo · Next.js 15 + Tailwind v4 + shadcn · Phaser 3 · Colyseus ·
Supabase self-hosted · Gateway IA propio (Gemini) · Vitest · Docker + Coolify**.

## 2. Dónde estamos parados

| Fase | Estado |
| --- | --- |
| **Fase 0** — Infra + scaffolding | ✅ **Cerrada**. Monorepo armado, los 9 proyectos del workspace verdes, infra desplegada en Coolify. |
| **Fase 1** — MVP solo + auth | ✅ **Cerrada**. 3 retos jugables (Caída Libre, Trivia IA, Balanceo de Ecuaciones) + login Google + puntaje persistente + rediseño "Edu-friendly suave" + audio/pulido. |
| **Fase 2** — Multiplayer (Kahoot) | 🔵 **En progreso**. Core (T015) y robustez/reconexión (T016) **mergeados a `main` y en prod**. Falta lo de la sección 6. |

**Todo lo mergeado está en `main`** (último commit: `490c527` T016). **No hay PRs abiertos.**
**No hay nada en `in_progress`.** Arrancás limpio.

## 3. Qué está desplegado (prod, vivo)

VPS Coolify propio — `147.93.178.204`. Acceso por MCP `mcp__coolify__*` (toda la instancia).

| Servicio | Dominio | Estado |
| --- | --- | --- |
| **Web** (apps/web, Next.js) | `https://quanta.axchisan.com` | ✅ 200, rediseño live, `/sala` Kahoot funcionando |
| **Game-server** (apps/game-server, Colyseus WSS) | `wss://api.quanta.axchisan.com` | ✅ `/health` ok, KahootRoom + Gemini generando preguntas |
| **Supabase** self-hosted | `https://db.quanta.axchisan.com` | ✅ healthy, esquema `0001`, Google OAuth habilitado |

- **Auto-deploy:** push a `main` → webhook por-app de Coolify redeploya. Las `NEXT_PUBLIC_*` se hornean en build (cambiarlas exige redeploy).
- **⚠️ Swap obligatorio:** el VPS tiene un **swapfile de 4 GB** (agregado 2026-06-15). Sin él, los builds Docker concurrentes + Supabase causan **OOM** y el deploy de web falla (exit 255). Si volvés a ver deploys fallando: revisá RAM/swap por SSH y, si hace falta, bajá `concurrent_builds` a 1. Detalle en la memoria `quanta-deploy-infra`.

## 4. ⚠️ Gotchas críticos (NO los redescubras)

1. **Imports relativos SIN extensión** en `packages/game-engine` y `packages/ai-gateway` (y donde Next los consume vía dynamic import). Poner `.js` **rompe webpack** (tsc/tsup sí resuelven, webpack no).
2. **Phaser bajo webpack:** alias `phaser$ → phaser/dist/phaser.js` (UMD) en `apps/web/next.config.ts`. El build ESM de Phaser no exporta default → `import Phaser from 'phaser'` rompe sin el alias. `phaser` es dep directa de `apps/web`.
3. **Colyseus `onCreate` NO debe ser bloqueante.** Generar preguntas con Gemini va **en background** (`void this.generateQuestions()`), con flag `ready`. Un `onCreate` async que espere a la IA → timeout de matchmaking → "socket hang up".
4. **Anti-cheat:** la `solution`/`correctIndex` **nunca** viaja al cliente durante la pregunta. En Kahoot, `correctIndex` se mantiene en `-1` en el state sincronizado y solo se setea en el `reveal`.
5. **Modelo Gemini por defecto: `gemini-2.5-flash`** (configurable con `GEMINI_MODEL`). El key del usuario tiene cuota 0 en `gemini-2.0-flash`.
6. **Tests:** game-server usa vitest `pool: 'threads'` (forks rompe la IPC binaria de Colyseus) + `gameServer.gracefullyShutdown(false)`. game-engine testea con `phaser` **mockeado** (env node; el Phaser real necesita canvas/WebGL).
7. **Una rama por task** (`feat/<rol>-<Txxx>-<slug>`), PR contra `main`, esperar CI verde, el **usuario mergea**. Verificá no estar construyendo sobre una rama ya mergeada (revisá `git log origin/main` antes de ramificar).

## 5. 🔐 Secretos — NUNCA al repo

Todos viven en **env vars de Coolify** y en `apps/web/.env.local` (gitignored). **Antes de cada commit, grepea el diff staged por secretos.** Los que existen:
- `GEMINI_API_KEY` (Trivia + Kahoot) — en env de web y game-server en Coolify.
- Google OAuth client secret — en las env vars del servicio Supabase (`GOTRUE_EXTERNAL_GOOGLE_*`).
- `SUPABASE_SERVICE_ROLE_KEY` / anon / JWT secret — env del servicio Supabase.
- Acceso SSH al VPS: clave `~/.ssh/quanta_vps` (`root@147.93.178.204`). (El usuario dio una password root en su momento; se recomendó rotarla y se usa la key.)

## 6. Qué sigue (Fase 2, elegir con el usuario)

Opciones pendientes, sin orden fijo:
- **Persistir resultados de sala** → atar el puntaje Kahoot a la cuenta Google para que cuente en "Mis puntajes". *Diseño abierto:* requiere autenticar al jugador dentro de la sala Colyseus (pasar el JWT al `join`, verificarlo server-side) y resolver el `challenge_id` (las preguntas Kahoot hoy son in-memory, no se persisten como `challenges`). Probablemente convenga una tabla `game_results` o persistir las preguntas generadas como `challenges`. **Hablalo con el usuario antes de codear.**
- **Duelo 1v1** → nuevo modo (matchmaking 1v1, flujo alternado).
- **Chat de sala** → social, más chico.
- **Pendiente de verificación humana:** prueba multi-dispositivo real del flujo Kahoot en `quanta.axchisan.com` → "Jugar con amigos" (lo hace el usuario).

## 7. Verificar que todo está sano (comandos)

```bash
pnpm install                      # desde la raíz
pnpm -r typecheck                 # 0 errores
pnpm -r lint                      # limpio
pnpm -r test                      # game-server: lobby + kahoot (reconexión) verdes
pnpm --filter @quanta/web build   # standalone OK
pnpm --filter @quanta/game-server build
```

## 8. Mapa de archivos clave (lo que más se toca)

- `apps/game-server/src/rooms/kahoot-room.ts` — sala authoritative (game loop, scoring, reconexión, migración de host).
- `apps/web/app/sala/page.tsx` — UI Kahoot (crear/unirse, lobby, pregunta, leaderboard, reconexión).
- `apps/web/lib/realtime/kahoot-client.ts` — cliente colyseus.js (`createKahootRoom`/`joinKahootRoom`/`reconnectKahootRoom`/`snapshot`).
- `apps/web/lib/challenges/service.ts` — despacha `submitAttempt` por `payload.type`.
- `packages/ai-gateway/` — providers LLM (Gemini real), cache, fallback. `parseTriviaQuestion`.
- `packages/ui/src/tokens.css` — theme pastel "Edu-friendly".
- `docs/state/{SPRINT,TASKS,DECISIONS,CHANGELOG}.md` — estado vivo (dueño: Coordinador).
- `infra/coolify.md` — runbook de deploy.

## 9. Fuentes de verdad (leer en este orden)

1. `docs/runbooks/kickoff-agent.md` — qué abrir según tu rol.
2. `docs/agents/<rol>.md` — límites y responsabilidades de tu rol.
3. `docs/state/TASKS.md` — tareas y status (T001–T016 hechas).
4. `docs/state/DECISIONS.md` — por qué se hizo cada cosa (ADRs in-flight).
5. La memoria `quanta-deploy-infra` (índice en `MEMORY.md`) — topología y credenciales de deploy.
6. Los `CLAUDE.md` de cada `apps/*` y `packages/*` — convenciones internas.
