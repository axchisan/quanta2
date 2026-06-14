import Phaser from 'phaser';
import type { GameEventMap } from '@quanta/types';

export const BOOT_SCENE_KEY = 'boot';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(BOOT_SCENE_KEY);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Quanta Game Engine', {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const payload: GameEventMap['engine:ready'] = { sceneKey: BOOT_SCENE_KEY };
    this.events.emit('engine:ready', payload);
  }
}
