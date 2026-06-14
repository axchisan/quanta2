# 01 — Arquitectura

## Stack tecnológico

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Lenguaje | TypeScript estricto | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Plataforma | Web (PWA) + Móvil (Capacitor) | Una sola base de código |
| Framework web | Next.js 15 (App Router) | API Routes, Server Components, edge runtime |
| UI | shadcn/ui + Tailwind CSS v4 | Componentes Radix accesibles |
| Estado cliente | Zustand + TanStack Query | Store ligero + cache de servidor |
| Motor 2D | Phaser 3 (gameplay) + React (UI) | Físicas Arcade y Matter.js |
| Animaciones | Sprite sheets + Spine/DragonBones + Lottie + sprites IA | Pipeline soporta assets generados en runtime |
| Audio | Howler.js + Web Audio API + IA generativa (cacheada) | Stack completo |
| TTS | ElevenLabs (free) → Coqui XTTS / Piper (self-hosted) → Google/Azure (free tier) | Fallback chain |
| Backend BaaS | Supabase **self-hosted** en Coolify | Postgres + Auth + Realtime + Storage + Edge Functions |
| Auth | Híbrida: invitado (nickname + código sala) ⊕ cuenta (Magic Link / Google OAuth) | Vinculable sin perder progreso |
| Multiplayer | Supabase Realtime (presencia/broadcast/rankings) + Colyseus (retos competitivos authoritative) | Híbrido por tipo |
| LLMs | Gemini → Groq → OpenRouter | Gateway propio decide |
| Imágenes IA | Pollinations.ai → Hugging Face → Gemini nativo | Cache en Supabase Storage |
| Orquestación IA | `packages/ai-gateway` propio | Cache + rate limit + fallback + métricas |
| Anti-cheat | Edge Functions + Colyseus authoritative | Cliente nunca calcula puntaje final |
| Testing | Vitest + Testing Library + Playwright | Unit + integration + E2E |
| CI/CD | GitHub Actions + Coolify auto-deploy | Docker en VPS |
| Repo | pnpm workspaces + Turborepo | Tipos compartidos, builds cacheados |

## Diagrama de componentes (alto nivel)

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENTE (PWA / APK)                       │
│                                                                 │
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────┐ │
│  │   Next.js UI    │   │  Phaser canvas   │   │ Capacitor    │ │
│  │ (shadcn/Tailw)  │◀─▶│ (game-engine)    │   │ shell (móvil)│ │
│  │  Zustand + TQ   │   │  físicas/anim    │   └──────────────┘ │
│  └────────┬────────┘   └────────┬─────────┘                    │
│           │                     │                              │
│           └──────────┬──────────┘                              │
│                      ▼                                         │
│              ┌───────────────┐                                 │
│              │ Howler + WebA │  audio efectos + sintesis       │
│              └───────────────┘                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS + WSS
        ┌──────────────┼──────────────┬─────────────────┐
        ▼              ▼              ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐
│  Next.js     │ │  Supabase    │ │  Colyseus    │ │ AI Gateway │
│  API routes  │ │  self-hosted │ │  game-server │ │ (parte de  │
│  (apps/web)  │ │              │ │  (Node)      │ │  apps/web  │
│              │ │  - Postgres  │ │              │ │  api/ai/*) │
│  - sesión    │ │  - Auth      │ │  - rooms     │ │            │
│  - SSR       │ │  - Realtime  │ │  - state     │ │  Cache en  │
│              │ │  - Storage   │ │  - validate  │ │  Supabase  │
│              │ │  - EdgeFn    │ │              │ │            │
└──────────────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘
                        │                │               │
                        ▼                ▼               ▼
                  ┌─────────────────────────────────────────┐
                  │      Coolify VPS (147.93.178.204)       │
                  │   Docker: web, game-server, supabase    │
                  │         coqui-tts (opcional), piper     │
                  └─────────────────────────────────────────┘
                                                        │
                                                        ▼
                                          ┌───────────────────────┐
                                          │  Proveedores externos │
                                          │  Gemini · Groq        │
                                          │  OpenRouter           │
                                          │  Pollinations · HF    │
                                          │  ElevenLabs · Google  │
                                          └───────────────────────┘
```

## Flujos clave

### F1 — Estudiante invitado entra a una sala Kahoot
1. Abre `quanta.axchisan.com` → ingresa nickname + código de sala (ej: `FIS-3B`).
2. Next.js valida código contra Supabase (RLS lo permite si la sala existe y está abierta).
3. Cliente se conecta a Supabase Realtime (`presence` + `broadcast`) y a Colyseus (room `kahoot:<id>`).
4. Anfitrión inicia un reto → Colyseus envía `challenge:start` con datos del reto (sin la respuesta).
5. Estudiante responde → cliente envía a Colyseus → server valida contra solución almacenada → calcula puntaje (tiempo, dificultad, racha) → broadcast `score:update`.
6. Final del reto → Colyseus persiste resultados en Supabase via service role.
7. Ranking actualiza vía `postgres_changes` en todos los clientes.

### F2 — Tu hermana crea un reto nuevo con IA
1. Ingresa con cuenta (Magic Link) → entra al "Creador".
2. Llena formulario: tema (cinemática), dificultad (media), tipo (multiple choice), prompt opcional (`"sobre tiro parabólico"`).
3. Frontend llama a `POST /api/ai/generate-challenge` → AI Gateway:
   - Llama a Gemini con system prompt educativo + safety filters.
   - Recibe JSON con `title`, `statement`, `options`, `correctAnswer`, `explanation`, `assets[]`.
   - Si necesita sprite (`assets.type === "image"`), llama a Pollinations/Gemini en paralelo, sube resultado a Supabase Storage, devuelve URL.
   - Si necesita audio narración, llama a TTS, sube y cachea.
4. Frontend muestra preview del reto → usuario edita si quiere → guarda en `challenges` table (estado `draft`).
5. Publica → cambia estado a `published`, queda disponible en el catálogo y para crear salas.

### F3 — Generación de sprite con cache
1. Game-engine necesita un sprite "vector de fuerza azul". Llama a `aiGateway.image({ prompt, hash })`.
2. Gateway calcula `hash = sha256(prompt + model + params)`.
3. Busca en Supabase Storage `sprites-cache/<hash>.webp`. Si existe, devuelve URL inmediatamente.
4. Si no, llama a Pollinations.ai → recibe imagen → sube a Storage con ese hash → devuelve URL.
5. Próxima request con mismo prompt = hit de cache, latencia <50ms.

### F4 — Auth invitado se vincula a cuenta
1. Usuario juega como invitado, obtiene puntaje.
2. Decide crear cuenta → se loguea con Google.
3. Edge Function `link-guest-account` recibe `guestSessionId` + `userId`.
4. Mueve `attempts`, `room_memberships`, `creator_drafts` del invitado a la cuenta.
5. Borra el registro `guest_session`. Frontend recarga sesión autenticada.

## Boundary y separación de responsabilidades

- **`apps/web`** — UI, SSR, API routes. NO contiene lógica de juego (eso vive en `packages/game-engine`) ni proveedores IA directos (eso vive en `packages/ai-gateway`).
- **`apps/game-server`** — Solo Colyseus. Importa `packages/types` y `packages/db` (modelos). Validación de respuestas y cálculo de puntajes.
- **`packages/game-engine`** — Phaser puro. Recibe datos de retos y emite eventos. No conoce Supabase ni HTTP.
- **`packages/ai-gateway`** — Función pura `(request) → response`. Encapsula proveedores. Cachea via interfaz inyectable (en prod usa Supabase Storage; en tests usa memory).
- **`packages/types`** — Solo tipos. Sin lógica. Garantiza que web/server/engine hablan el mismo idioma.

## Decisiones cerradas

Ver [`04-tech-decisions.md`](04-tech-decisions.md) para el detalle (why/alternatives/consequences) de cada elección de stack.
