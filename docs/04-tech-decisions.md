# 04 — Decisiones técnicas (ADRs)

Cada decisión arquitectónica importante se documenta como ADR (Architectural Decision Record). Formato corto: contexto, decisión, alternativas, consecuencias.

> **Cuándo agregar una ADR:** cualquier decisión que afecte a más de un paquete, cambie un proveedor externo, cambie un patrón de datos, o que un futuro agente no pueda entender solo leyendo el código.

---

## ADR-0001 — Plataforma híbrida (PWA + Capacitor móvil)

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** El juego debe ser accesible desde múltiples dispositivos (PCs del colegio, celulares, tablets) sin fricción de instalación, pero también queremos opción de empaquetado móvil para compartir por WhatsApp y mejor experiencia táctil offline.

**Decisión:** Web (Next.js + PWA) como base. Capacitor para empaquetar APK/IPA cuando se necesite distribución más formal. Mismo código fuente.

**Alternativas:**
- *Solo web*: limita iOS PWA features, sin presencia en stores.
- *Móvil nativo (Flutter/React Native)*: imposible compartir por URL, fricción para que cada compañero entre.
- *Desktop (Electron/Tauri)*: requiere instalación, casi nadie va a instalarlo.

**Consecuencias:** Una sola base de código. PWA es la primary path; Capacitor se activa en Fase 4. Hay que cuidar que las APIs usadas funcionen en PWA y en webview de Capacitor (ej: cuidado con `localStorage` vs `IndexedDB`).

---

## ADR-0002 — Phaser 3 como motor de juego 2D

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Necesitamos motor 2D maduro con físicas integradas para simulaciones (caída libre, péndulos, colisiones), animaciones (sprites + skeletal), audio espacial y compatibilidad con browser y webview móvil.

**Decisión:** Phaser 3 para el canvas de juego. React (vía portal o div separado) para UI/menús/HUD encima. `packages/game-engine` exporta scenes y un `EventEmitter` para comunicación bidireccional con React.

**Alternativas:**
- *PixiJS + Matter.js*: más bajo nivel, requiere armar game loop y asset loader, más boilerplate.
- *Three.js / R3F*: 3D, sobre-ingeniería para retos 2D.
- *Solo Canvas/SVG con Framer Motion*: muy limitado para físicas y animaciones complejas.
- *Cocos Creator / Construct*: editores visuales que rompen el flujo de código + git + multi-agente.

**Consecuencias:** Curva de aprendizaje moderada (Phaser tiene su propio EventEmitter, lifecycle, asset loader). Aislamos bien con `packages/game-engine` para que React no importe Phaser directamente.

---

## ADR-0003 — Supabase self-hosted en Coolify como backend

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Necesitamos auth, DB relacional, realtime y storage. Costo objetivo $0 recurrente. Datos de menores de edad → no pueden vivir en la nube de un tercero sin razón fuerte.

**Decisión:** Supabase **self-hosted** en el VPS Coolify del usuario (`coolify.axchisan.com`, `147.93.178.204`). Usamos Postgres + Auth + Realtime + Storage + Edge Functions.

**Alternativas:**
- *Supabase cloud free tier*: rápido de arrancar pero datos en su cloud y límites estrictos.
- *Firebase*: NoSQL, menos flexible para queries complejas de stats. Menos ergonómico para un developer con expertise en SQL.
- *PocketBase*: más simple pero menos features (sin Postgres, RLS más básico).
- *Backend propio Node + Postgres + Socket.IO*: mucho más código, mantenimiento.

**Consecuencias:** Mantenimiento del Supabase self-hosted recae en el usuario (backups, updates de imagen Docker). A cambio: control total, costo $0, datos en VPS propio. Si algún día se quiere migrar a Supabase cloud, el código cliente no cambia.

---

## ADR-0004 — Multiplayer híbrido: Supabase Realtime + Colyseus

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Necesitamos tres tipos de comunicación en tiempo real: (1) presencia y broadcast de eventos sociales (chat de sala, quien está conectado, ranking que actualiza), (2) lógica authoritative de retos competitivos (anti-cheat, sincronización estricta de estado del juego), (3) persistencia de resultados.

**Decisión:** Híbrido por tipo de interacción.
- **Supabase Realtime**: presence, broadcast (chat, eventos UI), `postgres_changes` (rankings que se persisten).
- **Colyseus** (self-hosted en Coolify): rooms para retos competitivos, estado authoritative server-side, validación de respuestas, cálculo de puntaje.

**Alternativas:**
- *Solo Supabase Realtime*: no tiene primitiva de "estado authoritative del room"; reimplementarlo con functions sería frágil.
- *Solo Colyseus*: tendríamos que reimplementar persistencia y broadcast social que Supabase ya da gratis.
- *Socket.IO custom*: máxima flexibilidad pero todo a mano (rooms, reconexión, anti-cheat).

**Consecuencias:** Dos sistemas de websockets simultáneos en el cliente. Aislar bien con un `RealtimeManager` que sabe cuándo usar cada uno. Más complejidad inicial pero mejor separación de responsabilidades.

---

## ADR-0005 — Auth híbrida (invitado + cuenta opcional)

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Tres casos de uso: (a) profesor proyecta una sala en clase y los estudiantes deben entrar en 30s sin registrarse, (b) tu hermana y amigos quieren guardar progreso y competir entre sesiones, (c) creación de retos requiere identidad para ownership y moderación.

**Decisión:**
- **Modo invitado:** nickname + código de sala. Sin email, sin password. Sesión persistida en `localStorage` con UUID generado en el cliente, validado server-side. Datos en tabla `guest_sessions`.
- **Cuenta completa:** Magic Link + Google OAuth (Supabase Auth). Habilita historial, ranking persistente, creación de retos.
- **Vinculación:** un invitado puede crear cuenta y migrar su `guest_session` (Edge Function `link-guest-account`).

**Alternativas:**
- *Solo cuentas*: fricción inaceptable en aula.
- *Solo invitados*: no hay continuidad, no hay creador de retos.
- *Email + password clásico*: peor UX para estudiantes.

**Consecuencias:** Dos shapes de "user" en el cliente. `packages/types` define `Identity = { kind: 'guest' | 'user', ... }` y todo el código consume la unión. Edge cases en migración guest→user (qué hacer si el guest tiene retos en draft, etc.) deben tratarse explícitamente.

---

## ADR-0006 — Gateway IA propio con cache + fallback chain

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Múltiples proveedores IA (LLMs, imagen, TTS) con diferentes free tiers, latencias y APIs. Riesgo de quemar cuotas, exponer API keys o tener latencia inconsistente. Necesitamos un punto único de control con cache para reducir consumo y fallback para resiliencia.

**Decisión:** `packages/ai-gateway` propio. Recibe `AIRequest` tipado, decide proveedor por feature/prioridad, cachea respuestas determinísticas (mismo prompt = misma respuesta cacheada), aplica rate limit por usuario, registra métricas. Llamado solo desde server (Next.js API routes y game-server).

**Alternativas:**
- *Llamada directa desde cliente*: API keys expuestas o un proxy mínimo igual.
- *LiteLLM / Portkey*: librerías existentes que cubren parte. Las consideramos para Fase 3+ si nuestro gateway se vuelve mantenible. Por ahora preferimos código propio simple, ajustado a nuestras 3-4 features.
- *Vercel AI SDK*: bueno para streaming UI pero no resuelve fallback/cache.

**Consecuencias:** Más código propio inicial. A cambio: control total, cero exposición de keys, métricas de costo/uso por feature, fácil swap de proveedor.

---

## ADR-0007 — Anti-cheat server-side estricto

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Los rankings significan algo (clase real, competencia entre amigos). Si se pueden falsificar desde devtools, pierden valor pedagógico y social.

**Decisión:** Cliente nunca calcula puntaje final ni recibe la respuesta correcta antes de enviar la suya. Toda validación + scoring vive en (a) Edge Functions de Supabase para retos asincrónicos y (b) Colyseus authoritative para retos sincronizados.

**Alternativas:**
- *Confianza total cliente*: rankings sin valor.
- *Validación cruzada con muestreo*: complejo y todavía hackeable.
- *Anti-cheat criptográfico avanzado*: sobre-ingeniería para colegio.

**Consecuencias:** El cliente recibe el reto sin la solución. Para retos donde la solución es derivada (ej: balanceo de ecuación), validación es trivial server-side. Para retos generados por IA, la solución se almacena cifrada/no expuesta y solo el server la lee.

---

## ADR-0008 — Monorepo pnpm + Turborepo

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** 5 agentes simultáneos en tmux trabajando en áreas distintas. Tipos compartidos entre web, game-server, engine. Builds que se vuelven lentos.

**Decisión:** Monorepo con pnpm workspaces (eficiente en disco, deduplica deps). Turborepo para cachear builds y tests. Estructura `apps/*` (deployables) + `packages/*` (libs).

**Alternativas:**
- *Polyrepo*: un repo por servicio. Coordinación manual de tipos, fricción cross-repo.
- *Monorepo sin Turborepo*: builds lentos cuando crece.
- *Monolito*: bloquea paralelismo entre agentes.

**Consecuencias:** Cada agente trabaja en su paquete sin pisarse. Cambios cross-package se atienden con tasks específicas (Coordinador asigna). Tipos compartidos garantizan cero desincronización.

---

## ADR-0009 — Idioma del juego: español neutro

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Audiencia primaria en Colombia/LATAM. Posible expansión futura a más países.

**Decisión:** Todo el contenido (UI, retos, prompts IA, narración TTS) en español neutro. Sin i18n por ahora. Si se internacionaliza después, se introducirá `next-intl`.

**Consecuencias:** Strings hardcodeadas en español en componentes y prompts. Refactor a i18n cuando sea necesario.

---

## ADR-0010 — Privacidad mínima, cero PII obligatoria

**Fecha:** 2026-04-18
**Estado:** Aceptada

**Contexto:** Estudiantes son menores de edad. Cumplir espíritu de LOPI/GDPR. Mantener simplicidad operativa.

**Decisión:** Solo nickname obligatorio. Email opcional (cuenta). Sin nombre real, edad, colegio, ubicación. Telemetría anónima (qué retos se juegan, no quién). Datos en VPS propio. Sin trackers de terceros (ni Google Analytics, ni Sentry cloud, ni cookies de marketing).

**Consecuencias:** No podemos hacer ciertos análisis (cohortes por edad, geolocalización). A cambio: cero compliance burden, padres no tienen razón para objetar.

---

## Plantilla para nuevas ADRs

Copiar `templates/adr.md` y agregar al final de este archivo (incremental, no editar ADRs existentes salvo cambio de estado).
