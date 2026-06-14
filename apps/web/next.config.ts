import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Salida self-contained para la imagen Docker (Coolify). En un monorepo,
  // `outputFileTracingRoot` apunta a la raíz para que Next trace las deps
  // de los workspace packages (@quanta/*) al bundle standalone.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@quanta/ui', '@quanta/types'],
};

export default config;
