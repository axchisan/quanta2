# `@quanta/ui` — Componentes compartidos + theme Quanta

Componentes shadcn-style reutilizables (botones, cards, inputs base) y el **theme Quanta**. Consumido por `apps/web` **como código fuente TS** vía `transpilePackages` (no hay build — no compiles, no `dist/`).

## Estructura

```
src/
├─ index.ts             # API pública (re-exporta todo)
├─ tokens.css           # ★ FUENTE DE VERDAD del theme Quanta (Tailwind v4)
├─ lib/utils.ts         # cn() — merge de clases Tailwind
└─ components/          # un componente por archivo, kebab-case
tests/                  # tests de utils puras (vitest, env node)
```

## Patrón shadcn (copy-paste, no instalar)

- Traemos componentes shadcn manualmente y los adaptamos al theme Quanta. **No** corremos el CLI de shadcn ni instalamos como dependencia.
- Variantes con `class-variance-authority` (`cva`). Export del componente **y** de su `*Variants` (ej. `buttonVariants`) para que `apps/web` componga estilos (links con look de botón, etc.).
- `asChild` vía `@radix-ui/react-slot` `Slot` para renderizar como otro elemento (ej. `<Button asChild><Link/></Button>`).
- Server-renderable por defecto. `'use client'` **solo** si el componente tiene estado/efectos internos. `Button` no lo necesita.
- Clases Tailwind **siempre** vía `cn()` / `cva`. Nunca interpolación dinámica de strings (`bg-${x}`) — Tailwind no la detecta.

## `tokens.css` — theme

- Enfoque **CSS-first de Tailwind v4**: bloque `@theme inline` que mapea `--color-*` a los custom properties shadcn (`--background`, `--primary`, ...), más `:root` (light) y `.dark`.
- Colores como **tripletes HSL** (`245 75% 60%`) envueltos en `hsl(var(--x))` para que funcione el modificador de opacidad (`bg-primary/90`).
- Paleta Quanta: **índigo eléctrico** (primary) + **cyan** (accent) — vibe física/ciencia.
- `apps/web/app/globals.css` lo importa **después** de `@import "tailwindcss";`.
- Cambios de paleta/branding se hacen **aquí**, no en la app.

## Tipos / strict

- Base estricta: `verbatimModuleSyntax` + `isolatedModules` → usá `import type` para imports solo-de-tipo (`ClassValue`, `VariantProps`).
- `exactOptionalPropertyTypes` ON: cuidado con props opcionales (`asChild?`).
- Sin `any`. Archivos kebab-case, componentes PascalCase.

## Accesibilidad (WCAG AA mínimo)

- Focus visible siempre (`focus-visible:ring-*`). No remover el outline sin reemplazo.
- Contraste AA: los tokens están elegidos para cumplirlo sobre `background`/`card`.
- `aria-*` y roles correctos en componentes interactivos compuestos.
- Estados `disabled` perceptibles (`disabled:opacity-50`) y no enfocables.

## Scripts

```bash
pnpm --filter @quanta/ui lint
pnpm --filter @quanta/ui typecheck
pnpm --filter @quanta/ui test       # vitest, solo utils puras (env node)
```

> Los tests aquí son para utilidades puras (`cn`). El render de componentes con DOM se prueba en `apps/web` (jsdom/Playwright), no acá — mantenemos este paquete liviano en dependencias.
