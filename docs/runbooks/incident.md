# Runbook — Incidente en producción

> Cuando algo se rompe y afecta usuarios reales (el juego no carga, las salas no conectan, la IA no responde, el ranking falsea scores). Objetivo: minimizar downtime y aprender del fallo.

## Niveles de severidad

| Nivel | Criterio | Tiempo máx. de respuesta |
|-------|----------|--------------------------|
| **SEV1** | App caída, ningún usuario puede jugar | <30 min |
| **SEV2** | Feature principal rota (ej: no se puede crear sala) | <2 h |
| **SEV3** | Feature secundaria rota (ej: no se puede regenerar sprite) | <24 h |
| **SEV4** | Bug cosmético o raro | Próximo sprint |

## Paso 1 — Contener (stop the bleeding)

### Si el cambio culpable está identificado y es reciente
```bash
# Revert del commit específico
git revert <sha>
git push origin main

# O revert del merge
git revert -m 1 <merge-sha>
git push origin main
```

Coolify auto-despliega el revert.

### Si no está claro qué causó
- ¿El último deploy fue reciente? Rollback al deploy anterior en Coolify UI.
- ¿Un proveedor externo cayó (Gemini, Supabase self-host)? Ver "Paso 2 — Diagnosticar".

### Si es un incidente de seguridad (API key expuesta, breach)
- **Rotá la key INMEDIATAMENTE** en el dashboard del proveedor.
- Actualizá secretos en Coolify.
- Forzá redeploy.
- Documentá en `state/DECISIONS.md` con `[INCIDENT]`.

## Paso 2 — Diagnosticar

### Logs
```bash
# Logs de Next.js (apps/web) en Coolify
curl -s -H "Authorization: Bearer <token>" \
  https://coolify.axchisan.com/api/v1/applications/<uuid>/logs

# Logs de game-server (Colyseus)
# idem con UUID de game-server

# Logs de Supabase self-hosted
# docker logs <contenedor> directo en el VPS
```

### Supabase health
```bash
# Postgres vivo?
psql "postgresql://postgres:<pw>@db.quanta.axchisan.com:5432/postgres" -c "SELECT 1;"

# Edge Functions
curl -X POST https://db.quanta.axchisan.com/functions/v1/health
```

### Proveedores IA
```bash
# Gemini
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GEMINI_API_KEY"

# Groq
curl -s -H "Authorization: Bearer $GROQ_API_KEY" https://api.groq.com/openai/v1/models
```

### Cuotas de IA quemadas
- Métricas en `ai_metrics` table o PostHog.
- Si 429 en todos los providers: fallback chain agotada → devolver error amigable al usuario mientras se investiga.

## Paso 3 — Comunicar

Durante un SEV1/SEV2:

1. Anotá en `state/BLOCKERS.md` con `[INCIDENT]`:
   ```markdown
   ### I-<YYYYMMDD>-<corto> — <título>
   - **Severidad:** SEV<n>
   - **Detectado:** YYYY-MM-DD HH:MM
   - **Síntomas:** <qué ven los usuarios>
   - **Estado actual:** investigating | mitigated | resolved
   - **Mitigación aplicada:** <qué hiciste>
   - **Owner:** <rol>
   ```
2. Si hay usuarios afectados (sala en vivo con gente), mostrar banner en UI:
   > "Estamos teniendo problemas técnicos. Los estamos resolviendo."

## Paso 4 — Resolver

- Identificá root cause.
- Implementá fix.
- Test en local o staging.
- Deploy a prod (via PR normal si no es SEV1; directo con revert/hotfix si es SEV1).

### Hotfix (bypass de proceso normal, solo SEV1)
```bash
git checkout main && git pull
git checkout -b hotfix/<corto>
# ... fix ...
git commit -m "fix: <descripción>"
git push -u origin hotfix/<corto>
gh pr create --base main --head hotfix/<corto> --title "fix: <descripción>" --body "SEV1 hotfix para <issue>"
# Self-approve (solo coordinator y solo SEV1):
gh pr merge --squash --delete-branch --admin
```

## Paso 5 — Postmortem

Dentro de 48h post-incidente, el Coordinador escribe un postmortem en `docs/incidents/<YYYY-MM-DD>-<slug>.md`:

```markdown
# Postmortem — <título>

## Resumen
- **Fecha:** YYYY-MM-DD
- **Duración:** <n> minutos
- **Severidad:** SEV<n>
- **Impacto:** <cuántos usuarios / qué features>

## Timeline
- HH:MM — detección (cómo nos enteramos)
- HH:MM — investigación
- HH:MM — mitigación aplicada
- HH:MM — resolución

## Root cause
<qué causó el incidente realmente>

## Qué funcionó
- <detección temprana, rollback rápido, etc.>

## Qué no funcionó
- <falta de alertas, test gap, deploy sin validar>

## Action items
- [ ] T<id> — <prevención>: owner <rol>, due <fecha>
- [ ] T<id> — <detección>: ...

## Lecciones aprendidas
<qué debe cambiar en procesos/código para que no vuelva a pasar>
```

Action items se transforman en tasks en `state/TASKS.md` con prioridad alta.

## Prevención

- **Tests E2E** cubriendo flujos críticos (login, sala, attempt).
- **Monitoring:** Coolify health checks en cada app.
- **Cuotas IA:** alertar cuando consumo sube 2x del promedio diario.
- **Staging environment:** Coolify tiene `quanta-staging.axchisan.com` para validar releases antes de prod (ideal desde Fase 2).
- **Backups:** Supabase self-hosted backup diario (`pg_dump` cron).
- **Rotación de keys:** cada 6 meses como mínimo.

## Contactos de emergencia

- **Humano (usuario):** `axchisan923@gmail.com` — leé el repo regularmente.
- **Coolify:** `https://coolify.axchisan.com` — acceso del humano.
- **Proveedores IA** (status pages):
  - Gemini: https://status.cloud.google.com/
  - Groq: https://status.groq.com
  - OpenRouter: https://status.openrouter.ai
  - ElevenLabs: https://status.elevenlabs.io

## Anti-patrones

- ❌ Arreglar en prod editando archivos en el server (zero trazabilidad).
- ❌ Ignorar un SEV1 porque "es tarde" — alguien puede estar jugando.
- ❌ Resolver y no escribir postmortem — se repite el problema.
- ❌ Postmortem buscando culpable. El foco es sistema, no persona.
- ❌ Rotar keys sin actualizar secretos en Coolify (app seguirá fallando).
