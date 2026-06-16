/**
 * T017 — Extractor de tokens de diseño (Playwright headless).
 *
 * Para CADA sitio del benchmark: navega, toma screenshots de pantallas clave y
 * extrae CSS computado (colores, tipografía, radios, sombras) de elementos
 * representativos vía getComputedStyle. La salida alimenta los `sites/*.md`.
 *
 * ⚠️ USO INTERNO DE ESTUDIO. Las capturas van a `assets/refs/<sitio>/` SOLO como
 * referencia de análisis — NUNCA se importan en la app. No redistribuir assets
 * con copyright. Esto extrae *estructura y estilo* para entender técnicas.
 *
 * Requisitos (no instalados por defecto en este repo):
 *   pnpm add -D playwright && npx playwright install chromium
 *
 * Uso:
 *   node docs/research/design-benchmark/tools/extract-design-tokens.mjs
 *   node docs/research/design-benchmark/tools/extract-design-tokens.mjs kahoot duolingo
 *
 * Salida:
 *   docs/research/design-benchmark/assets/refs/<sitio>/screenshot.png
 *   docs/research/design-benchmark/assets/refs/<sitio>/tokens.json
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, '..', 'assets', 'refs');

/** Sitios objetivo. `selectors` = elementos representativos a inspeccionar. */
const SITES = [
  { name: 'kahoot', url: 'https://kahoot.com/', selectors: ['button', 'h1', 'a'] },
  { name: 'duolingo', url: 'https://www.duolingo.com/', selectors: ['button', 'h1', '[class*="button"]'] },
  { name: 'quizizz', url: 'https://quizizz.com/', selectors: ['button', 'h1'] },
  { name: 'blooket', url: 'https://www.blooket.com/', selectors: ['button', 'h1'] },
  { name: 'gimkit', url: 'https://www.gimkit.com/', selectors: ['button', 'h1'] },
  { name: 'brilliant', url: 'https://brilliant.org/', selectors: ['button', 'h1'] },
  { name: 'khan-academy', url: 'https://www.khanacademy.org/', selectors: ['button', 'h1'] },
  { name: 'prodigy', url: 'https://www.prodigygame.com/', selectors: ['button', 'h1'] },
];

/** Propiedades computadas de interés (tokens de diseño). */
const PROPS = [
  'color',
  'backgroundColor',
  'backgroundImage',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'borderRadius',
  'boxShadow',
  'padding',
];

async function run() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('Falta playwright. Instalá: pnpm add -D playwright && npx playwright install chromium');
    process.exit(1);
  }

  const only = process.argv.slice(2);
  const targets = only.length ? SITES.filter((s) => only.includes(s.name)) : SITES;

  const browser = await chromium.launch();
  for (const site of targets) {
    const outDir = join(REFS_DIR, site.name);
    await mkdir(outDir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      console.log(`→ ${site.name} (${site.url})`);
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.screenshot({ path: join(outDir, 'screenshot.png'), fullPage: false });

      // Paleta global: colores de fondo/borde más frecuentes en la página.
      const tokens = await page.evaluate((props) => {
        const sample = (sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const cs = getComputedStyle(el);
          return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(cs[p] ? p : p)]));
        };
        const palette = {};
        for (const el of Array.from(document.querySelectorAll('*')).slice(0, 4000)) {
          const bg = getComputedStyle(el).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)') palette[bg] = (palette[bg] || 0) + 1;
        }
        const topColors = Object.entries(palette)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([c, n]) => ({ color: c, count: n }));
        return { topColors, sample };
      }, PROPS);

      // getComputedStyle de los selectores representativos (uno por uno).
      const elements = {};
      for (const sel of site.selectors) {
        elements[sel] = await page
          .$eval(sel, (el, props) => {
            const cs = getComputedStyle(el);
            return Object.fromEntries(props.map((p) => [p, cs[p]]));
          }, PROPS)
          .catch(() => null);
      }

      await writeFile(
        join(outDir, 'tokens.json'),
        JSON.stringify({ url: site.url, topColors: tokens.topColors, elements }, null, 2),
      );
      console.log(`  ✓ ${site.name}: screenshot + tokens.json`);
    } catch (err) {
      console.error(`  ✗ ${site.name}: ${err.message}`);
    } finally {
      await page.close();
    }
  }
  await browser.close();
}

run();
