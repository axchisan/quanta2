# `@quanta/config` — Configuración compartida

Configs reutilizables para todo el monorepo: ESLint, presets de TypeScript y validación de entorno.

## Qué exporta

| Import                                 | Qué es                                                               |
| -------------------------------------- | -------------------------------------------------------------------- |
| `@quanta/config/eslint`                | Config ESLint flat base (TS estricto, sin `any`, type-imports).      |
| `@quanta/config/eslint/react`          | Base + reglas de React Hooks (apps/web, packages/ui).                |
| `@quanta/config/env`                   | `parseEnv(schema, source?)` — valida entorno con Zod y falla rápido. |
| `@quanta/config/tsconfig/library.json` | Preset TS para librerías con DOM.                                    |
| `@quanta/config/tsconfig/node.json`    | Preset TS para servicios Node.                                       |
| `@quanta/config/tsconfig/next.json`    | Preset TS para la app Next.js.                                       |

## Cómo se usa

`eslint.config.mjs` de cada paquete:

```js
export { default } from '@quanta/config/eslint';
```

`tsconfig.json` de cada paquete extiende `../../tsconfig.base.json` (opciones estrictas maestras)
o uno de los presets de este paquete.

## Reglas de oro

- El `tsconfig.base.json` raíz es la fuente de verdad de las opciones estrictas
  (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- Cambios acá impactan a TODO el repo → coordiná con el Coordinador antes de tocar.
