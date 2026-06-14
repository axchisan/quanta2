import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@quanta/ui', '@quanta/types'],
};

export default config;
