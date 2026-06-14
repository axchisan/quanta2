# `infra/` — Infraestructura y despliegue

Configuración de contenedores y despliegue de Quanta. Modelo de producción:
**Coolify VPS** (`coolify.axchisan.com`, `147.93.178.204`) corriendo Docker (ver ADR-0003/0004).

## Componentes

| Servicio                                  | Cómo corre en dev                                          | Cómo corre en prod                             |
| ----------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| `apps/web` (Next.js)                      | `pnpm --filter @quanta/web dev`                            | Imagen Docker en Coolify (auto-deploy on push) |
| `apps/game-server` (Colyseus)             | `pnpm --filter @quanta/game-server dev`                    | `apps/game-server/Dockerfile` en Coolify       |
| Supabase (Postgres/Auth/Realtime/Storage) | `pnpm --filter @quanta/db db:start` (CLI, requiere Docker) | Supabase self-hosted en Coolify                |

## `docker-compose.dev.yml`

Levanta `web` + `game-server` en contenedores para validar el empaquetado Docker
de punta a punta. **El build context es la raíz del monorepo** (necesita el workspace pnpm).

```bash
# Desde la raíz del repo
docker compose -f infra/docker-compose.dev.yml up --build
```

Supabase local NO está en este compose: se levanta aparte con `pnpm --filter @quanta/db db:start`
(su propio stack Docker gestionado por el Supabase CLI).

> **Nota:** Docker todavía no está instalado en el entorno de desarrollo actual
> (ver `docs/state/BLOCKERS.md`). Estos archivos son scaffolding verificable por
> construcción; el build real de imágenes queda pendiente hasta instalar Docker.

## Pendiente (backlog del Coordinador)

- Configurar auto-deploy en Coolify para `web` y `game-server` (B002, B003).
- Configurar Supabase self-hosted en Coolify (B004).
- ~~Dockerfile de producción para `apps/web`~~ ✅ hecho y verificado (build + run). Ver `infra/coolify.md`.
