import { describe, expect, it, vi } from 'vitest';

// Phaser real depende de canvas/WebGL (no disponibles en tests headless) y su
// import ejecuta detección de features que rompe fuera del browser. Mockeamos
// un Phaser mínimo: NUNCA testeamos render real acá (eso es manual/E2E), solo
// la lógica pura del paquete (config, constantes, identidad de la scene class).
vi.mock('phaser', () => {
  class Scene {
    constructor(_config?: unknown) {}
  }
  return {
    default: {
      AUTO: 0,
      Scale: { RESIZE: 0, CENTER_BOTH: 0 },
      Scene,
    },
  };
});

const { BOOT_SCENE_KEY, BootScene, createGameConfig } = await import('../src/index.js');

describe('game-engine public API', () => {
  it('exposes the boot scene key', () => {
    expect(BOOT_SCENE_KEY).toBe('boot');
  });

  it('exports BootScene as a class', () => {
    expect(typeof BootScene).toBe('function');
  });

  it('builds a game config whose scene list includes BootScene', () => {
    const config = createGameConfig('app');
    expect(config).toBeTypeOf('object');
    expect(config.parent).toBe('app');
    expect(Array.isArray(config.scene)).toBe(true);
    expect(config.scene).toContain(BootScene);
  });
});
