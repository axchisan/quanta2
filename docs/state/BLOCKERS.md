# Blockers activos

> **Cómo se usa:**
>
> - Cualquier agente registra acá cuando una task se bloquea esperando algo (otro agente, decisión humana, dependencia externa).
> - **Coordinador** revisa diariamente y media/escala.
> - Cuando un blocker se resuelve, marcar `RESUELTO` con fecha y mover a sección "Resueltos recientes" (limpiar después de 1-2 sprints).
> - Etiquetas: `[ESCALATION]` para cosas que requieren atención del humano, `[BLOCKED]` para deps cross-agente, `[EXT]` para deps externas.

---

## Activos

### B002 — Docker no instalado (bloquea verificación runtime de Supabase y Colyseus en contenedor)

- **Tipo:** [ESCALATION]
- **Reportado:** 2026-04-19 por coordinator
- **Task afectada:** T007 (parcial) — el esquema/migración/seed están escritos y typechean, pero `pnpm db:start && pnpm db:migrate && pnpm db:gen-types` no se pudieron ejecutar (requieren Docker). También bloquea `infra/docker-compose.dev.yml`.
- **Bloquea a:** backend-realtime (verificación end-to-end del esquema), infra.
- **Esperando:** que el humano instale Docker en el entorno de dev (`paru -S docker` / habilitar servicio) y re-corra los scripts `db:*`.
- **Notas:** El resto del scaffolding (lint/typecheck/test/build) NO depende de Docker y está verde. El test de Colyseus corre embebido (sin Docker).

---

## Resueltos recientes

### B001 — Tooling Node + pnpm no instalado — **RESUELTO 2026-04-19**

- **Tipo:** [ESCALATION]
- **Reportado:** 2026-04-19 por coordinator
- **Resuelto:** 2026-04-19 por humano (axchisan). Node v25.9.0, npm 11.12.1, pnpm 10.33.0 instalados.
- **Nota:** Node 25 (no LTS 22). Revisar en T001 si fijamos `engines: node >=22.11 <26` o restringimos. Conviene dejar Node 22 LTS como recomendado en `.nvmrc` pero permitir 25 para dev local.

---

## Plantilla

```markdown
### B<id> — Título corto del blocker

- **Tipo:** [BLOCKED] | [ESCALATION] | [EXT]
- **Reportado:** YYYY-MM-DD por <rol>
- **Task afectada:** T<id>
- **Bloquea a:** <rol/persona>
- **Esperando:** <qué se necesita para desbloquear>
- **Notas:** <contexto adicional, links, etc.>
```
