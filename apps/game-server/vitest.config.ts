import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    // Colyseus (msgpackr/@pm2/io) rompe la IPC del pool 'forks' de vitest al
    // serializar mensajes binarios. El pool de workers por hilos lo evita.
    pool: 'threads',
  },
});
