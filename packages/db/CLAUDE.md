# `@quanta/db` — Capa de datos Supabase/Postgres

Esquema Postgres (Supabase self-hosted), migraciones, seeds y el factory tipado del cliente Supabase. Dueño: agente **backend-realtime** (ver `docs/agents/backend-realtime.md`). La biblia del esquema es `docs/06-data-model.md`.

## Reglas de oro

- **Migraciones forward-only.** Nunca editar una migración ya mergeada. Si algo se rompió, se arregla con una migración nueva. Una feature = una migración.
- **RLS en TODA tabla.** Ninguna tabla queda con RLS deshabilitado. Sin política explícita = nadie lee/escribe (el service role siempre bypassa RLS).
- **`solution` (challenges) nunca viaja al cliente.** Además de la política de fila, se revoca el `SELECT` de esa columna a `anon`/`authenticated` y se re-otorga columna por columna. Solo el service role la lee.
- **Sin `any`** en `src/`. TS estricto (`verbatimModuleSyntax` → usar `import type`).

## Dónde viven las cosas

| Ruta                        | Qué hay                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `src/index.ts`              | Factory tipado del cliente (`createServiceClient`, `createBrowserClient`) + const `TABLES`. |
| `supabase/config.toml`      | Config de Supabase local (API 54321, DB 54322, Studio 54323).                               |
| `supabase/migrations/*.sql` | Migraciones. La CLI las lee de acá por defecto.                                             |
| `seeds/`                    | Datos seed (retos predefinidos del MVP). Vacío por ahora.                                   |

> **Nota sobre la ubicación de migraciones.** `docs/06-data-model.md` menciona `packages/db/migrations/<ts>_<name>.sql`. La Supabase CLI, en cambio, espera las migraciones en `supabase/migrations/`. Para que los scripts (`db:migrate`, `db:reset`) funcionen sin configuración extra, **la fuente de verdad es `supabase/migrations/`**. La primera migración es `supabase/migrations/0001_initial_schema.sql`.

## Comandos

```bash
pnpm db:start       # supabase start  (levanta el stack local en Docker)
pnpm db:stop        # supabase stop
pnpm db:migrate     # supabase migration up --local
pnpm db:reset       # supabase db reset --local  (DESTRUCTIVO: recrea la DB local)
pnpm db:gen-types   # genera ../types/src/db.ts desde el esquema local
pnpm lint
pnpm typecheck
pnpm clean
```

### Regenerar tipos

Tras cambiar el esquema y aplicar migraciones, correr `pnpm db:gen-types`. Esto sobrescribe `packages/types/src/db.ts` con el tipo `Database` real generado por la CLI. El factory de `src/index.ts` consume ese tipo vía `@quanta/types/db`.

## Requisitos: Docker + Supabase CLI

`db:start`, `db:migrate`, `db:reset` y `db:gen-types` requieren **Docker** y la **Supabase CLI** (incluida como devDependency). Verificado end-to-end con Docker 29.5 + Supabase CLI 2.106.

> **Quirk de `db:gen-types`:** el CLI 2.106 exige presencia de `SUPABASE_ACCESS_TOKEN` incluso para `gen types --local` (regresión "LegacyPlatformAuthRequired") y ya no acepta el positional `typescript`. El script setea un token dummy (`${SUPABASE_ACCESS_TOKEN:-local-dev}`) y usa la sintaxis nueva; no hace falta `supabase login` para generar tipos locales. La salida se reformatea con Prettier al correr `pnpm format`.

## Flujo de trabajo de una migración nueva

1. Crear `supabase/migrations/<NNNN>_<descripcion>.sql` (forward-only).
2. `pnpm db:reset` para recrear la DB local desde cero y aplicar todas las migraciones.
3. Habilitar RLS y políticas para cada tabla nueva. Probar con roles `anon` y `authenticated`.
4. `pnpm db:gen-types` para regenerar los tipos.
5. `pnpm typecheck && pnpm lint`.

## API pública (`src/index.ts`)

- `createServiceClient(url, serviceRoleKey)` — cliente privilegiado (bypassa RLS). **Solo servidor.**
- `createBrowserClient(url, anonKey)` — cliente público (sujeto a RLS).
- `TABLES` — nombres de las 8 tablas core.
