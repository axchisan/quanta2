# Tasks — Cola priorizada

> **Cómo se usa:**
>
> - Cada task sigue el formato de `templates/task.md`.
> - Solo el **Coordinador** crea, prioriza, asigna y borra tasks.
> - Especialistas SOLO cambian el campo `status` de su propia task (`pending` → `in_progress` → `done`).
> - Tasks ordenadas por prioridad de ejecución (las primeras se trabajan primero).
> - `id` formato: `T<número>` zero-padded a 3 dígitos.
> - `blockedBy`: lista de task IDs que deben cerrarse antes.

---

## Pendientes / En progreso

### T001 — Scaffolding monorepo (pnpm + Turborepo)

- **Owner:** coordinator
- **Status:** done (2026-04-19) — `pnpm install/lint/typecheck/test/build` verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** —
- **Description:** Inicializar repo git, crear estructura de carpetas del plan, `pnpm-workspace.yaml`, `turbo.json`, `package.json` raíz con scripts (`dev`, `build`, `test`, `lint`, `typecheck`). `.gitignore` apropiado para Node + Next + Phaser.
- **Acceptance:**
  - `pnpm install` ejecuta sin errores.
  - `pnpm typecheck` corre (aunque no haya código).
  - Repo subido a GitHub (`github.com/<user>/quanta`).
- **Notes:** Coordinator hace este por bootstrapping; después de T001 los especialistas arrancan.

### T002 — CI básica en GitHub Actions

- **Owner:** coordinator
- **Status:** done (2026-04-19) — `.github/workflows/ci.yml`: install --frozen-lockfile → lint → typecheck → test → build
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** Workflow `.github/workflows/ci.yml` que en cada push/PR ejecuta: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Cache de pnpm store y Turborepo remoto (opcional).
- **Acceptance:** PR de prueba pasa por los 4 checks.

### T003 — Skeleton apps/web (Next.js 15)

- **Owner:** ui-web
- **Status:** done (2026-04-19) — dev sirve la landing `<h1>Quanta</h1>` en :3000, `build` genera estáticos OK
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/web` con Next.js 15 (App Router), TypeScript estricto, Tailwind v4 configurado, shadcn/ui inicializado, una landing trivial (`<h1>Quanta</h1>`). `apps/web/CLAUDE.md` con detalles internos.
- **Acceptance:**
  - `pnpm --filter @quanta/web dev` levanta en localhost:3000 mostrando la landing.
  - `pnpm --filter @quanta/web build` produce build estática sin errores.

### T004 — Skeleton apps/game-server (Colyseus)

- **Owner:** backend-realtime
- **Status:** done (2026-04-19) — `LobbyRoom` con heartbeat; test de integración conecta vía WS y recibe broadcast
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `apps/game-server` con Colyseus + Node 22 + TypeScript estricto. Una room placeholder `LobbyRoom` que acepta conexiones y broadcasts un mensaje cada 5s. Dockerfile listo. `apps/game-server/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-server dev` levanta en localhost:2567.
  - Cliente test (script en `tests/`) se conecta y recibe broadcast.

### T005 — Skeleton packages/game-engine (Phaser)

- **Owner:** game-engine
- **Status:** done (2026-04-19) — `BootScene` + `createGameConfig`; build genera bundle (esm+cjs+dts); tests verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/game-engine` con Phaser 3, TypeScript estricto. Una scene placeholder `BootScene` que muestra texto "Quanta Game Engine" y emite evento `engine:ready`. Export desde `index.ts`. `packages/game-engine/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/game-engine build` produce bundle.
  - Tests vacíos corren (`pnpm --filter @quanta/game-engine test`).

### T006 — Skeleton packages/ai-gateway

- **Owner:** ai-gateway
- **Status:** done (2026-04-19) — estructura providers/cache/prompts/chain/config; tests de fallback y cache verdes
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/ai-gateway` con TypeScript estricto, Zod, fetch nativo. Estructura de carpetas: `providers/`, `cache/`, `prompts/`, `chain.ts`, `config.ts`. Interfaz pública `AIGateway` definida (sin implementación real todavía, retorna stub). Tests con un mock provider que verifica fallback chain. `packages/ai-gateway/CLAUDE.md`.
- **Acceptance:**
  - `pnpm --filter @quanta/ai-gateway test` pasa con test de fallback.
  - Build sin errores.

### T007 — Skeleton packages/db (esquema + migración inicial)

- **Owner:** backend-realtime
- **Status:** done (2026-04-19) — `db:start` levanta Supabase local, `db:migrate` aplica `0001_initial_schema.sql` (8 tablas, RLS habilitado en todas), `db:gen-types` regenera `packages/types/src/db.ts` (510 líneas); typecheck/lint verdes contra el esquema real
- **Priority:** P0
- **Sprint:** 0
- **BlockedBy:** T001
- **Description:** `packages/db` con Supabase CLI configurado, primera migración `0001_initial_schema.sql` que crea las 8 tablas core (`profiles`, `guest_sessions`, `rooms`, `room_memberships`, `challenges`, `challenge_attempts`, `ai_cache`, `challenge_assets`) según `docs/06-data-model.md`. RLS policies básicas. Seeds vacíos.
- **Acceptance:**
  - `pnpm db:start && pnpm db:migrate` levanta Supabase local con esquema.
  - `pnpm db:gen-types` produce tipos TS válidos en `packages/types/src/db.ts`.

---

## Done

### T008 — Entrada de invitado + Lobby (Fase 1)

- **Owner:** ui-web
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Vertical slice de entrada: crear sala (código) / unirse con nickname+código → lobby con presencia en vivo. API routes `app/api/rooms/{create,join,[code]}` (service role, Zod), clientes Supabase (reusa `@quanta/db`), store zustand persistido, `useRoomPresence` (Supabase Realtime), componente `Input` en `@quanta/ui`, páginas landing + `/room/[code]`.
- **Acceptance:**
  - Crear→unirse→snapshot verificado **contra el Supabase de producción** (`db.quanta.axchisan.com`): filas en `rooms`/`guest_sessions`/`room_memberships`, nickname repetido→409, código inexistente→404.
  - `lint/typecheck/test/build` verdes; landing y lobby renderizan.

### T009 — Reto Caída Libre (Fase 1, solo jugable)

- **Owner:** game-engine / ui-web / backend-realtime
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Reto de Física (cinemática) jugable solo end-to-end: escena Phaser `FreeFallScene` + `createFreeFallGame` + `freeFallTime` (motor), `GameCanvas` (import dinámico de Phaser, sin SSR), página `/jugar/[slug]` con sliders de altura/gravedad + presets + predicción. Validación y **scoring server-side** (`/api/attempts/submit`): `t = √(2h/g)`, tolerancia 10%, fórmula de puntaje de `docs/08`. Reto sembrado en `challenges` (migración `0002`).
- **Acceptance:**
  - Seed aplicado a prod; `GET /api/challenges/caida-libre` devuelve el reto **sin `solution`** (anti-cheat).
  - `POST /api/attempts/submit` verificado contra prod: predicción correcta → `score 187`, incorrecta → `score 0`, `correctValue` server-side; intento persistido en `challenge_attempts`.
  - Página `/jugar/caida-libre` SSR 200 con controles; `lint/typecheck/test/build` verdes.

### T010 — Reto Trivia IA (Fase 1) + AI Gateway/Gemini

- **Owner:** ai-gateway / ui-web
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Trivia de opción múltiple generada por IA. `ai-gateway`: provider **Gemini real** (`gemini-2.5-flash`, safety máximo, timeout/429/bloqueos), `parseTriviaQuestion` (Zod, out_of_scope), `generateTrivia` sin cache (variedad). `web`: `/api/ai/generate-trivia` (Gemini → valida → guarda reto `multiple_choice` con `solution` server-only → devuelve sin `correctIndex`), `submitAttempt` extendido para `multiple_choice`, página `/jugar/trivia` (picker tema/dificultad → generar → responder → feedback IA).
- **Acceptance:**
  - Verificado contra **Gemini real**: `generate-trivia` produce pregunta válida sin `correctIndex` (anti-cheat); responder correcto → `score 190`, incorrecto → `score 0` + explicación de la IA; intentos persistidos.
  - `lint/typecheck/test (ai-gateway 8) /build` verdes.
- **Notes:** Requiere `GEMINI_API_KEY` en el entorno (Coolify web env para prod).

### T011 — Reto Balanceo de Ecuaciones (Fase 1)

- **Owner:** ui-web / backend-realtime
- **Status:** done (2026-06-14)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Reto de Química (`equation_balance`): el jugador ajusta coeficientes por especie con feedback de átomos en vivo (verde/rojo por elemento). Validación **server-side** genérica (`validateEquationBalance`): balancea todos los elementos Y forma reducida (gcd=1). `/jugar/[slug]` despacha por `payload.type` (free_fall vs equation_balance). Retos sembrados (migración `0003`: síntesis del agua, combustión del metano).
- **Acceptance:**
  - Seed aplicado a prod; `GET` del reto **sin `solution`** (anti-cheat).
  - Verificado contra prod: `[1,2,1,2]` → correcto `score 370`; `[1,1,1,1]` → incorrecto; `[2,4,2,4]` (no reducido) → incorrecto; intentos persistidos.
  - Tests del validador + `lint/typecheck/test/build` verdes.

### T012 — Cuenta con Google + puntaje persistente (Fase 1)

- **Owner:** ui-web / backend-realtime
- **Status:** done (2026-06-15)
- **Priority:** P0
- **Sprint:** 1
- **Description:** Auth real con Supabase (Google OAuth). `useAuth` (sesión browser, signIn/signOut), `AuthNav` en el layout. Los intentos se atribuyen al usuario logueado: el cliente envía el JWT, la ruta `submit` lo verifica server-side y guarda `user_id`. Página `/mis-puntajes` (lee los intentos del dueño vía RLS `auth.uid()`).
- **Config (vía MCP en Supabase):** `GOTRUE_EXTERNAL_GOOGLE_ENABLED/CLIENT_ID/SECRET/REDIRECT_URI`, `ADDITIONAL_REDIRECT_URLS` (allow-list), `API_EXTERNAL_URL`. Redeploy del servicio.
- **Acceptance:**
  - `/auth/v1/settings` → `google: true`; `authorize?provider=google` redirige a Google con el client_id y callback correctos.
  - RLS `challenge_attempts_select_own = (user_id = auth.uid())` verificada; `/mis-puntajes` SSR 200; build/typecheck/test/lint verdes.
  - **Pendiente de prueba humana:** el clic final de login en el consent de Google (interactivo).
- **Notes:** El cliente OAuth de Google lo creó el usuario (creds en env del servicio Supabase, no en el repo).

### T013 — Rediseño "Edu-friendly suave" (pulido, fundación)

- **Owner:** ui-web
- **Status:** done (2026-06-15) — fundación; iteración por página continúa
- **Priority:** P1
- **Sprint:** 1
- **Description:** Pulido visual/UX. Theme pastel (lavanda/menta/durazno, esquinas redondeadas, sombras suaves) en `@quanta/ui/tokens.css`; componentes `Card`/`Badge` + `Button`/`Input` ablandados (pill, soft). Fuentes redondeadas (Baloo 2 display + Nunito) vía next/font. Mascota átomo sonriente. Header con marca + nav. IA reorganizada: landing (hero + CTA "Jugar" + salas en beta) y nuevo hub `/jugar` (catálogo de retos). Las páginas de retos heredan el theme por tokens.
- **Acceptance:** landing + `/jugar` renderizan con el nuevo look; `lint/typecheck/test/build` verdes. Limpieza de datos de prueba en prod (conservando la cuenta del usuario).
- **Notes:** Dirección elegida por el usuario. Pendiente: pulido fino por página (retos), audio (SFX/TTS), y revisión visual en prod.

### T014 — Cierre de Fase 1 (audio + pulido + mobile)

- **Owner:** ui-web
- **Status:** done (2026-06-15)
- **Priority:** P1
- **Sprint:** 1
- **Description:** Cierre del MVP. **Audio SFX** sintetizado con Web Audio (éxito/error/click, sin assets). `ResultPanel` compartido por los 3 retos: mascota átomo que reacciona (rebota al acertar) + sonido + feedback consistente. Pulido por página (Card/Badge, theme pastel heredado) y revisión responsive.
- **Acceptance:** las 6 rutas renderizan 200; `ResultPanel` suena y muestra la mascota; `lint/typecheck/test/build` verdes. Docs de estado actualizados.
- **Notes:** Narración TTS y sprites IA quedan diferidos (faltan providers). Cierra Fase 1 ~95%.

### T015 — Sala Kahoot multiplayer (Fase 2, core)

- **Owner:** backend-realtime / ui-web
- **Status:** done (2026-06-15)
- **Priority:** P0 (Fase 2)
- **Sprint:** 2
- **Description:** Primer slice de Fase 2. `KahootRoom` en Colyseus (estado authoritative `@colyseus/schema`): el server genera N preguntas de trivia con Gemini (en background, no bloquea matchmaking), corre el game loop (lobby → pregunta 20s → reveal → … → finished), valida respuestas y puntúa server-side. **Anti-cheat:** `correctIndex` nunca se sincroniza durante la pregunta (solo en el reveal). Web: cliente `colyseus.js` + página `/sala` (crear/unirse por código, lobby, pregunta con timer, leaderboard en vivo, sonido). Landing "Jugar con amigos" → `/sala` (reemplaza el dead-end del lobby T008).
- **Acceptance:**
  - KahootRoom verificada end-to-end con cliente Node contra **Gemini real**: genera preguntas, 2 jugadores, flujo completo, `correctIndex` oculto durante la pregunta y revelado en el reveal.
  - `/sala` SSR 200; `lint/typecheck/test/build` verdes. `GEMINI_API_KEY` seteada en el game-server de Coolify (aplica al redeploy).
- **Notes:** Falta prueba humana multi-dispositivo en prod. Pendiente Fase 2: Duelo 1v1, chat, persistir resultados de sala.

### T016 — Kahoot: reconexión + migración de anfitrión (Fase 2)

- **Owner:** backend-realtime / ui-web
- **Status:** done (2026-06-15)
- **Priority:** P1 (Fase 2)
- **Sprint:** 2
- **Description:** Robustez de salas para uso real en clase (wifi inestable). Server: `onLeave` async con `allowReconnection(30s)` ante caídas no consentidas (retiene al jugador con `connected=false`, recupera `sessionId` y score al volver); migración de anfitrión al primer jugador conectado si el host se va; avance de ronda si todos los que quedan ya respondieron. Web `/sala`: reconexión automática (`reconnectKahootRoom`, 5 reintentos) ante caída inesperada + banner "Reconectando…".
- **Acceptance:**
  - Test de integración: caída no consentida → retención → reconexión con mismo `sessionId` → migración de anfitrión al salir el host. ✅
  - `lint/typecheck/test/build` verdes (web + game-server).
- **Notes:** Pendiente Fase 2: persistir resultados de sala (atribuir score Kahoot a la cuenta), Duelo 1v1, chat.

### T017 — Investigación de diseño & assets (benchmark de productos similares)

- **Owner:** ui-web
- **Status:** done (2026-06-15, #19) — rama `feat/ui-T017-design-benchmark`. Dossier completo (8 sitios + síntesis + design system v2 + spec de avatares + plan de assets + references + tools). **Nota:** WebSearch/WebFetch denegados en la sesión → análisis desde conocimiento documentado (HEX aprox.); script Playwright listo para pase en vivo. Recomendación clave de avatares: **Rive (State Machine) + Lottie/confetti**. Desbloquea T022.
- **Priority:** P1 (fundación de pulido)
- **Sprint:** 2/3
- **BlockedBy:** —
- **Description:** Task de **investigación** (no se rediseña nada acá). Escanear y analizar
  productos educativos/gamificados líderes (**Kahoot**, **Duolingo** + ≥6 variados:
  Quizizz, Blooket, Gimkit, Prodigy, Khan Academy, Brilliant, etc.) para subir el nivel
  de diseño de Quanta exponencialmente. Ejes: design tokens, **★ sistema de avatares /
  personajes animados** (lo de los muñecos animados tipo Kahoot/Duolingo), ilustración,
  motion, sonido, UX de gamificación, onboarding, a11y. Metodología con Playwright
  (render + screenshots + extracción de CSS computado) + WebSearch/WebFetch + galerías
  (Mobbin/Dribbble/Figma). Entregable: **dossier** en `docs/research/design-benchmark/`
  (análisis por sitio + `SYNTHESIS.md` + `quanta-design-system-v2.md` +
  `avatar-system-spec.md` + `asset-production-plan.md` + `references.md`).
  **⚠️ Derivados originales, NO piratear assets con copyright** (ver brief).
- **Brief completo:** [`docs/research/design-benchmark/README.md`](../research/design-benchmark/README.md) — **leer antes de empezar.**
- **Acceptance:** ver sección 8 del brief (≥8 sitios analizados, síntesis, design system v2,
  spec de avatares con tecnología recomendada, plan de assets, cero assets con copyright comiteados).
- **Notes:** Primero el dossier; el **pulido** se deriva en tasks T018+ (aplicar design
  system, sistema de avatares animados, rework de pantallas, sonido/celebración) que
  consumen esta investigación. No codear pulido dentro de T017.

### T018 — Persistir resultados de sala Kahoot (Fase 2)

- **Owner:** backend-realtime / ui-web
- **Status:** done (2026-06-15, #13) — rama `feat/backend-realtime-T018-persist-kahoot-results`
- **Priority:** P1 (Fase 2)
- **Sprint:** 2
- **BlockedBy:** —
- **Description:** Atar el puntaje de la partida Kahoot a la cuenta Google para que cuente
  en "Mis puntajes". El cliente pasa el `accessToken` de Supabase en `create`/`join`; el
  game-server lo verifica server-side (`auth.getUser`, mismo patrón que `attempts/submit`)
  y, al `finish`, persiste el resultado agregado por jugador logueado en la **tabla nueva
  `game_results`** (migración `0004`) — no se reutiliza `challenge_attempts` (las preguntas
  Kahoot son efímeras, no son `challenges`). Upsert idempotente por `(user_id, room_code)`,
  en background (no bloquea el game loop). Invitados (sin login) no se persisten. `/mis-puntajes`
  ahora muestra dos secciones: "Partidas con amigos" (game_results) y "Retos en solitario".
- **Acceptance:**
  - Migración `0004` aplicada a prod; grants + RLS verificados (anon no lee ajeno, owner sí).
  - Camino real verificado contra prod: upsert service-role con `on_conflict=user_id,room_code`
    → idempotente (1 fila, score mergeado); ANON read → `[]`; cleanup sin residuos.
  - `lint/typecheck/test/build` verdes (web + game-server). Env del game-server en Coolify ya
    tiene `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
  - **Pendiente de prueba humana:** join con JWT real de Google + partida multi-dispositivo.
- **Notes:** Decisiones de diseño registradas en `DECISIONS.md` (2026-06-15). Pendiente Fase 2:
  Duelo 1v1, chat de sala. T017 (investigación de diseño) sigue pending.

### T019 — Salas: IA confiable (Groq) + personalización + reconexión persistente (Fase 2)

- **Owner:** ai-gateway / backend-realtime / ui-web
- **Status:** done (2026-06-15, #14) — rama `feat/backend-realtime-T019-salas-ia-personalizacion`
- **Priority:** P0 (Fase 2 — desbloquea el bug de generación)
- **Sprint:** 2
- **BlockedBy:** —
- **Description:** Mejoras de robustez y personalización de las salas Kahoot:
  - **Bug crítico resuelto:** la generación con IA se quedaba colgada porque **Gemini
    devolvía HTTP 503** (saturado) y no había fallback → 0 preguntas. Se añadió el
    **proveedor Groq** (`createGroqProvider`, API compatible OpenAI, `llama-3.3-70b-versatile`,
    JSON mode, ~1s) como **primario**, con Gemini de fallback. Tanto el game-server como la web.
  - **Generación en paralelo** (`Promise.allSettled`) en vez de secuencial → mucho más rápido;
    tolera la caída de un proveedor (conserva las preguntas que sí salieron). Flag `genFailed`
    + mensaje `regenerate` (el anfitrión reintenta si falló) con UI de error/retry.
  - **Personalización:** tema **libre** (input además de presets) + selector de **audiencia**
    (niños / secundaria / universidad) que ajusta vocabulario y profundidad del prompt.
  - **Nombre pre-cargado** desde la sesión (editable) y recordado en el navegador (invitados).
  - **Reconexión persistente:** el token de reconexión se guarda en `localStorage` (TTL 45s);
    al volver a `/sala` tras recargar, se ofrece "Volver a mi sala".
- **Acceptance:**
  - Groq verificado contra su API (HTTP 200, JSON válido, ~1s). Env `GROQ_API_KEY` seteada en
    Coolify (game-server + web).
  - `lint/typecheck/test/build` verdes; tests de prompt (audiencia/nonce) añadidos (ai-gateway 12).
  - **Pendiente prueba humana:** partida real multi-dispositivo con generación Groq + reconexión por recarga.
- **Notes:** No incluye los códigos de 6 dígitos ni avatares (ver T020/T022). La validación de
  coherencia de la respuesta IA (correctIndex vs explicación) queda en T024.

---

## Backlog priorizado de mejoras (planteado 2026-06-15, pendiente)

> Pedido del usuario: subir interactividad/personalización y pulir UX de salas. Se desarrolla
> de a poco para no saturar. Orden sugerido por impacto/dependencia.

### T020 — Códigos de sala estilo Kahoot (6 caracteres + auto-formato)

- **Owner:** backend-realtime / ui-web · **Status:** done (2026-06-15, #16) — rama `feat/backend-realtime-T020-codigos-sala-cortos`
- **Priority:** P1 · **Sprint:** 2/3
- **Description:** `roomId` corto de **6 caracteres** estilo Kahoot (alfabeto sin ambiguos
  `0/O/1/I/L`), mostrado/escrito como `ABC-DEF`. Colyseus 0.16 permite reemplazar `this.roomId`
  en `onCreate` (el listing y el registro local se setean DESPUÉS); se genera con
  `matchMaker.query` para garantizar unicidad. El input se **auto-formatea** (mayúsculas + guion)
  y `joinKahootRoom` normaliza antes de `joinById`. El `room_code` de `game_results` hereda el
  código corto.
- **Acceptance:** test de integración (genera `^[A-Z0-9]{6}$` + join por el código) verde;
  `lint/typecheck/test/build` verdes (game-server 5). Reconexión/persistencia siguen funcionando.
- **Notes:** Pendiente prueba humana multi-dispositivo (crear → compartir código → unirse).

### T021 — Sesiones de invitado persistentes (browser-based)

- **Owner:** ui-web · **Status:** done (2026-06-15, #17) — rama `feat/ui-web-T021-sesiones-invitado`
- **Priority:** P1 · **Sprint:** 3
- **Description:** Para usuarios **sin login**, identidad de invitado estable en el navegador
  (`quanta:guest-id`) e **historial local de partidas** (`quanta:guest-history`, máx 20). Al
  terminar una partida sin sesión, se guarda `{topic, score, rank, totalPlayers, totalQuestions}`
  en `localStorage` (módulo `lib/realtime/guest-history.ts`). `/mis-puntajes` muestra ese historial
  bajo "Tu progreso como invitado" con CTA a iniciar sesión. **Decisión:** se mantiene **local**
  (no se persiste en DB como pidió el usuario: "no a largo plazo como las autenticadas"); el nombre
  recordado + la reconexión por token ya venían de T019.
- **Acceptance:** `lint/typecheck/test/build` verdes; partida de invitado aparece en "Mis puntajes"
  (solo este dispositivo); logueados siguen yendo a `game_results`.
- **Notes:** Si en el futuro se quiere puntaje de invitado **cross-device**, habría que persistir en
  DB vía `guest_session_id` (relajar `game_results.user_id` o usar `guest_sessions`) — fuera de alcance.

### T022 — Sistema de avatares estilo Kahoot (gestión + edición)

- **Owner:** ui-web / game-engine · **Status:** pending · **Priority:** P2 · **Sprint:** 3/4
- **BlockedBy:** T017 (investigación de diseño & avatares)
- **Description:** Avatares/personajes animados editables por el jugador (estilo Kahoot/Duolingo):
  selector + editor (color, rasgos, accesorios), render en lobby/leaderboard, persistencia en
  el perfil. La **tecnología y el spec** salen del dossier de T017 (`avatar-system-spec.md`).
  Derivados originales, sin assets con copyright.

### T023 — Personalización avanzada de partidas

- **Owner:** ui-web / backend-realtime · **Status:** done (2026-06-15, #18) — rama `feat/backend-realtime-T023-personalizacion-avanzada`
- **Priority:** P2 · **Sprint:** 3
- **Description:** Ejes ajustables al crear la sala: **cantidad de preguntas** (3/5/10) y
  **segundos por pregunta** (10/20/30, clamp server-side [5,60]). El server usa `questionMs`
  por sala (afecta deadline + timeBonus). Construye sobre la base de T019 (tema libre + audiencia).
- **Acceptance:** `lint/typecheck/test/build` verdes (game-server 5); las opciones se pasan en
  `create` y el server las clampa. Pendiente prueba humana.
- **Notes:** Materia (física/química/mixto) y modo de juego quedan para una iteración futura
  (hoy el tema libre + presets ya cubre la mayoría).

### T025 — Fase B pulido: Design System v2 (tokens) + Quark animado (Fase 0)

- **Owner:** ui-web · **Status:** review (2026-06-16) — rama `feat/ui-T025-design-system-v2-quark`
- **Priority:** P1 (primer pulido derivado de T017) · **Sprint:** 3
- **BlockedBy:** T017 (cerrada)
- **Description:** Primer slice de pulido del dossier T017, **sin deps nuevas**:
  - **Design system v2 en `@quanta/ui/tokens.css`:** tokens semánticos de gamificación
    (`--success/--streak/--xp/--info`), tiers de rareza, `--primary-depth`, `--shadow-pop`,
    sistema de motion (`--ease-out/--ease-spring`) + keyframes de la mascota + bloque
    `prefers-reduced-motion`. Mapeo en `@theme` → utilidades `bg-success`, `text-streak`, etc.
  - **Botón 3D "press-down"** como variante `solid3d` del `Button`.
  - **Quark (Fase 0):** `components/quark.tsx` — el `AtomMascot` evoluciona a mascota con
    **estados** (`idle/thinking/correct/wrong/celebrate`) animados con SVG+CSS y cara modular
    (mouth/eye swap). Integrado en `ResultPanel` (acierto/error), landing (idle) y podio de
    `/sala` (celebrate). Respeta `prefers-reduced-motion`.
- **Acceptance:** `lint/typecheck/test/build` verdes; utilidades + keyframes presentes en el CSS
  compilado. Pendiente verificación visual humana en prod.
- **Notes:** Siguiente en Fase B: **Quark en Rive** (State Machine, T-pulido-C) + color+forma en
  respuestas + coleccionables. Ver `asset-production-plan.md`.

### T024 — Validación de coherencia de respuestas IA

- **Owner:** ai-gateway · **Status:** done (2026-06-15, #15) — rama `feat/ai-gateway-T024-coherencia-respuestas`
- **Priority:** P1 · **Sprint:** 2/3
- **Description:** El LLM a veces devuelve un `correctIndex` que **no coincide** con su propia
  explicación (visto con Groq y Gemini). **Solución (sin llamadas extra):** el prompt ahora pide
  también `answer` = el TEXTO EXACTO de la opción correcta; `parseTriviaQuestion` **reconcilia**
  el `correctIndex` para que apunte a la opción cuyo texto coincide con `answer` (normalizado:
  espacios/mayúsculas/puntuación). El texto refleja mejor el razonamiento del modelo que el índice,
  que es donde suele equivocarse. `answer` no se expone en el shape final.
- **Acceptance:** tests de reconciliación (índice incoherente → corregido; formato tolerante; answer
  inexistente → mantiene índice; answer no expuesto). Smoke test real contra Groq: devuelve `answer`
  coherente. `lint/typecheck/test/build` verdes (ai-gateway 16).
- **Notes:** v1 garantiza coherencia índice↔texto↔explicación. Verificar que la respuesta sea
  **físicamente correcta** (solver/segundo modelo) queda como mejora futura si hace falta.

---

> Tasks identificadas pero no priorizadas todavía. El Coordinador las mueve a sprint cuando corresponda.

- **B001** — Configurar Husky + lint-staged en pre-commit.
- **B002** — Configurar deploy en Coolify para apps/web (auto-deploy on push to main).
- **B003** — Configurar deploy en Coolify para apps/game-server.
- **B004** — Configurar Supabase self-hosted en Coolify.
- **B005** — Implementar auth invitado end-to-end (UI + Edge Function `join-room`).
- **B006** — Implementar `LobbyPage` (entrar a sala con código).
- **B007** — Implementar reto Caída Libre (Fase 1).
- **B008** — Implementar reto Balanceo de Ecuaciones (Fase 1).
- **B009** — Implementar reto Trivia Mixta IA (Fase 1).
- **B010** — Configurar Pollinations.ai provider en ai-gateway.
- **B011** — Configurar Gemini provider en ai-gateway.
- **B012** — Configurar ElevenLabs / Coqui TTS provider en ai-gateway.
- **B013** — Implementar cache Supabase para ai-gateway.
- **B014** — Implementar Edge Function `validate-attempt`.
- **B015** — Implementar `KahootRoom` Colyseus (Fase 2).
- **B016** — Implementar `DuelRoom` Colyseus (Fase 2).
- **B017** — Implementar UI de creador de retos (Fase 3).
- **B018** — Implementar PWA manifest + service worker (Fase 4).
- **B019** — Configurar Capacitor para Android (Fase 4).
