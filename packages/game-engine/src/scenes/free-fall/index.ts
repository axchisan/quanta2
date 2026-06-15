import Phaser from 'phaser';
import { freeFallTime } from './physics';

export const FREE_FALL_SCENE_KEY = 'free-fall';

export interface FreeFallDropPayload {
  heightM: number;
  gravity: number;
}

export interface FreeFallLandedPayload {
  fallTimeMs: number;
}

/**
 * Escena de caída libre. Recibe el comando `free-fall:drop` (lo envía React) y
 * anima el objeto cayendo en el tiempo real `t = sqrt(2h/g)`, emitiendo
 * `free-fall:landed` al aterrizar. El `EventEmitter` lo crea React y se pasa vía
 * el registry del juego bajo la key `'emitter'`.
 */
export class FreeFallScene extends Phaser.Scene {
  private emitter: Phaser.Events.EventEmitter | undefined;
  private apple?: Phaser.GameObjects.Arc;
  private timerText?: Phaser.GameObjects.Text;
  private topY = 0;
  private groundY = 0;
  private dropping = false;
  private readonly onDrop = (payload: FreeFallDropPayload): void => this.handleDrop(payload);

  constructor() {
    super(FREE_FALL_SCENE_KEY);
  }

  create(): void {
    const { width, height } = this.scale;
    const emitter = this.registry.get('emitter') as Phaser.Events.EventEmitter | undefined;
    this.emitter = emitter;

    this.topY = height * 0.18;
    this.groundY = height * 0.82;
    const towerX = width * 0.5;

    this.add.rectangle(width / 2, this.groundY + 12, width, 24, 0x1e293b);
    this.add.rectangle(
      towerX,
      (this.topY + this.groundY) / 2,
      10,
      this.groundY - this.topY,
      0x334155,
    );
    this.apple = this.add.circle(towerX, this.topY, 16, 0xef4444);
    this.timerText = this.add
      .text(width / 2, height * 0.08, '0.00 s', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5);

    emitter?.on('free-fall:drop', this.onDrop);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    emitter?.emit('free-fall:ready');
  }

  private handleDrop({ heightM, gravity }: FreeFallDropPayload): void {
    if (this.dropping || !this.apple || !this.timerText) return;
    const t = freeFallTime(heightM, gravity);
    if (t <= 0) return;

    this.dropping = true;
    this.apple.setPosition(this.apple.x, this.topY);
    this.tweens.add({
      targets: this.apple,
      y: this.groundY,
      duration: t * 1000,
      ease: 'Quad.easeIn',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        this.timerText?.setText(`${(tween.progress * t).toFixed(2)} s`);
      },
      onComplete: () => {
        this.timerText?.setText(`${t.toFixed(2)} s`);
        this.dropping = false;
        this.emitter?.emit('free-fall:landed', { fallTimeMs: Math.round(t * 1000) });
      },
    });
  }

  private cleanup(): void {
    this.emitter?.off('free-fall:drop', this.onDrop);
  }
}
