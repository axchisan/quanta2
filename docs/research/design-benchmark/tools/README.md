# tools/ — Scripts de extracción (T017)

Scripts reproducibles usados para el benchmark de diseño.

## `extract-design-tokens.mjs`

Extractor headless con Playwright: para cada sitio del benchmark navega, toma un
screenshot y extrae CSS computado (colores dominantes, tipografía, radios, sombras)
de elementos representativos, y guarda todo en `../assets/refs/<sitio>/`.

> ⚠️ **Uso interno de estudio.** Las capturas son solo referencia de análisis y
> **nunca** se importan en la app. No redistribuir assets con copyright.

### Requisitos

Playwright no está instalado en el repo (la fundación de E2E quedó pendiente). Para
correr el script:

```bash
pnpm add -D playwright
npx playwright install chromium
```

### Uso

```bash
# todos los sitios
node docs/research/design-benchmark/tools/extract-design-tokens.mjs

# solo algunos
node docs/research/design-benchmark/tools/extract-design-tokens.mjs kahoot duolingo
```

### Notas

- Muchos sitios son SPAs con consentimiento de cookies / paywalls que pueden tapar el
  render inicial; ajustá `waitUntil`/selectores o agregá un paso de "aceptar cookies"
  por sitio si hace falta.
- La extracción complementa —no reemplaza— el análisis cualitativo de `sites/*.md`,
  que se nutre además de case studies, blogs de diseño y galerías (ver `references.md`).
