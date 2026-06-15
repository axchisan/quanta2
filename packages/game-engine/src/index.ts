import Phaser from 'phaser';
import { BootScene } from './scenes/boot/index';

export { BootScene, BOOT_SCENE_KEY } from './scenes/boot/index';
export { FreeFallScene, FREE_FALL_SCENE_KEY } from './scenes/free-fall/index';
export type { FreeFallDropPayload, FreeFallLandedPayload } from './scenes/free-fall/index';
export { freeFallTime } from './scenes/free-fall/physics';
export { createFreeFallGame } from './scenes/free-fall/game';
export type { FreeFallGameOptions } from './scenes/free-fall/game';

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0b0f17',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  };
}
