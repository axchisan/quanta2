import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Salida self-contained para la imagen Docker (Coolify). En un monorepo,
  // `outputFileTracingRoot` apunta a la raíz para que Next trace las deps
  // de los workspace packages (@quanta/*) al bundle standalone.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@quanta/ui',
    '@quanta/types',
    '@quanta/db',
    '@quanta/game-engine',
    '@quanta/ai-gateway',
    '@quanta/config',
  ],
  // Phaser 3 expone su build ESM (`module`) sin `export default`, lo que rompe
  // `import Phaser from 'phaser'` bajo webpack. Aliasamos al build UMD que sí
  // interopera el default. (`$` = match exacto del specifier `phaser`.)
  webpack(webpackConfig: { resolve?: { alias?: Record<string, string> } }) {
    webpackConfig.resolve ??= {};
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      phaser$: 'phaser/dist/phaser.js',
    };
    return webpackConfig;
  },
};

export default config;
