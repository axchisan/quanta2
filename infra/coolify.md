# Runbook — Desplegar Quanta en Coolify

Guía paso a paso para dejar la **base funcional** desplegada en el VPS Coolify
(`147.93.178.204`, Traefik + Let's Encrypt). Después de esto, cada push a `main`
redepliega solo (vía webhook). Estado objetivo:

| Subdominio                | Servicio                           | Cómo se construye                  |
| ------------------------- | ---------------------------------- | ---------------------------------- |
| `quanta.axchisan.com`     | `apps/web` (Next.js)               | `apps/web/Dockerfile` (standalone) |
| `api.quanta.axchisan.com` | `apps/game-server` (Colyseus, WSS) | `apps/game-server/Dockerfile`      |
| `db.quanta.axchisan.com`  | Supabase self-hosted               | Service template de Coolify        |

> Repo: `github.com/axchisan/quanta2` (público). Fuente en Coolify: **Public GitHub**.
> Ambos Dockerfiles están **verificados** (build + run) con Docker 29.5.

---

## Paso 0 — DNS (hacelo primero, tarda en propagar)

En tu proveedor DNS de `axchisan.com`, creá 3 registros **A** → `147.93.178.204`:

```
quanta        A   147.93.178.204
api.quanta    A   147.93.178.204
db.quanta     A   147.93.178.204
```

(No hay wildcard configurado en el server, por eso cada host necesita su A record.)

---

## Paso 1 — Proyecto

Coolify → **Projects → + New** → nombre `Quanta`. Dentro, environment `production`.

---

## Paso 2 — Supabase (el pesado, primero)

> ⚠️ Supabase self-hosted son ~8-10 contenedores (~2-4 GB RAM). Antes de arrancar,
> verificá RAM/disco libres en el VPS: `free -h` y `df -h`. Si está justo, parar
> servicios `exited` que no uses libera poco (ya están parados); el consumo real
> viene de los `running`.

1. Proyecto `Quanta` → **+ New Resource → Service → Supabase**.
2. Domain: `https://db.quanta.axchisan.com`.
3. En **Environment Variables** del service, Coolify genera los secretos. Anotá / fijá:
   - `POSTGRES_PASSWORD` (fuerte)
   - `JWT_SECRET` (≥32 chars)
   - `ANON_KEY` y `SERVICE_ROLE_KEY` (derivadas del JWT_SECRET — usar el generador de Supabase si el template no las crea)
   - `SITE_URL=https://quanta.axchisan.com`
   - `API_EXTERNAL_URL=https://db.quanta.axchisan.com`
   - `SUPABASE_PUBLIC_URL=https://db.quanta.axchisan.com`
   - `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` (acceso a Studio)
   - SMTP (opcional, para Magic Link más adelante)
4. **Deploy**. Esperá a que todos los contenedores queden `healthy` (puede tardar).
5. Verificá Studio en `https://db.quanta.axchisan.com` (login con DASHBOARD\_\*).

### Aplicar el esquema

Studio → **SQL Editor** → pegá el contenido de
`packages/db/supabase/migrations/0001_initial_schema.sql` → **Run**.
Verificá en **Table Editor** que existan las 8 tablas con RLS activo.

> Alternativa CLI: `supabase db push --db-url 'postgresql://postgres:<POSTGRES_PASSWORD>@db.quanta.axchisan.com:5432/postgres'`
> (solo si exponés el puerto 5432; por defecto no está público).

---

## Paso 3 — apps/web

1. Proyecto `Quanta` → **+ New Resource → Public Repository**.
2. Repo: `https://github.com/axchisan/quanta2`, branch `main`.
3. Build Pack: **Dockerfile**.
   - **Base Directory:** `/`
   - **Dockerfile Location:** `/apps/web/Dockerfile`
4. **Port:** `3000`. **Domain:** `https://quanta.axchisan.com`.
5. **Environment Variables:**
   ```
   NEXT_PUBLIC_APP_URL=https://quanta.axchisan.com
   NEXT_PUBLIC_GAME_SERVER_URL=wss://api.quanta.axchisan.com
   NEXT_PUBLIC_SUPABASE_URL=https://db.quanta.axchisan.com
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY del Paso 2>
   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY del Paso 2>
   ```
   (Las `NEXT_PUBLIC_*` se hornean en build → si las cambiás, redeploy.)
6. **Healthcheck:** path `/`, puerto 3000.
7. **Deploy.**

---

## Paso 4 — apps/game-server

1. Proyecto `Quanta` → **+ New Resource → Public Repository** (mismo repo `quanta2`, branch `main`).
2. Build Pack: **Dockerfile**.
   - **Base Directory:** `/`
   - **Dockerfile Location:** `/apps/game-server/Dockerfile`
3. **Port:** `2567`. **Domain:** `https://api.quanta.axchisan.com`.
   (Traefik termina TLS y proxya el upgrade WebSocket automáticamente → el cliente usa `wss://`.)
4. **Environment Variables:**
   ```
   GAME_SERVER_PORT=2567
   SUPABASE_URL=https://db.quanta.axchisan.com
   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY del Paso 2>
   ```
5. **Healthcheck:** path `/health`, puerto 2567.
6. **Deploy.**

---

## Paso 5 — Auto-deploy on push (webhook)

Como la fuente es "Public GitHub" (sin GitHub App), el auto-deploy se hace con webhook:

1. En cada app (web y game-server) → **Webhooks** → copiá la **Deploy Webhook URL** (y el secret si lo pide).
2. GitHub repo `quanta2` → **Settings → Webhooks → Add webhook**:
   - Payload URL = la de Coolify
   - Content type = `application/json`
   - Events = solo `push`
3. Repetí para la segunda app. (Supabase no necesita webhook: es infra estable.)

A partir de acá, **push a `main` → redeploy automático** de web y game-server.

---

## Paso 6 — Smoke test

```bash
curl -I https://quanta.axchisan.com           # 200, landing <h1>Quanta</h1>
curl https://api.quanta.axchisan.com/health   # {"status":"ok",...}
# Studio: https://db.quanta.axchisan.com (login dashboard)
```

Si los tres responden, la **base funcional está desplegada**. Las features de Fase 1
(auth invitado, retos, IA) se agregan en PRs que redeployan solas.

---

## Notas / troubleshooting

- **TLS no emite:** revisá que el A record propagó (`dig quanta.axchisan.com`) antes del deploy; Let's Encrypt usa HTTP challenge.
- **WSS no conecta:** confirmá que el puerto expuesto del game-server es 2567 y que el dominio `api.quanta` resuelve; Traefik maneja el upgrade WS solo.
- **Build OOM / lento:** `concurrent_builds=2` en el server; desplegá de a uno si el VPS está justo de RAM.
- **Env `NEXT_PUBLIC_*` no aplica:** se hornean en build-time → siempre redeploy tras cambiarlas.
- **Migración nueva:** Studio → SQL Editor, o agregar un paso de `supabase db push` en CI (futuro).
