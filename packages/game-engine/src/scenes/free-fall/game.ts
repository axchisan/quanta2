import Phaser from 'phaser';
import { FreeFallScene } from './index';

export interface FreeFallGameOptions {
  parent: string | HTMLElement;
  emitter: Phaser.Events.EventEmitter;
  width?: number;
  height?: number;
}

/** Crea el `Phaser.Game` de caída libre y deja el emitter en el registry. */
export function createFreeFallGame(opts: FreeFallGameOptions): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: opts.parent,
    backgroundColor: '#0b0f17',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: opts.width ?? 800,
      height: opts.height ?? 600,
    },
    scene: [FreeFallScene],
  });
  game.registry.set('emitter', opts.emitter);
  return game;
}
