'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { FreeFallDropPayload } from '@quanta/game-engine';

export interface GameCanvasHandle {
  drop: (payload: FreeFallDropPayload) => void;
}

interface GameCanvasProps {
  onLanded: (fallTimeMs: number) => void;
  onReady?: () => void;
}

/**
 * Embebe el canvas Phaser de Caída Libre. Phaser y `@quanta/game-engine` se
 * importan **dinámicamente** (solo cliente) para no romper el SSR. La comunicación
 * con React es por el `EventEmitter` que se pasa al juego (eventos `free-fall:*`).
 */
export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  { onLanded, onReady },
  ref,
) {
  const parentRef = useRef<HTMLDivElement>(null);
  const emitterRef = useRef<{ emit: (event: string, payload?: unknown) => void } | null>(null);
  const onLandedRef = useRef(onLanded);
  const onReadyRef = useRef(onReady);
  onLandedRef.current = onLanded;
  onReadyRef.current = onReady;

  useImperativeHandle(
    ref,
    () => ({
      drop: (payload) => emitterRef.current?.emit('free-fall:drop', payload),
    }),
    [],
  );

  useEffect(() => {
    let game: { destroy: (removeCanvas: boolean) => void } | null = null;
    let cancelled = false;

    void (async () => {
      const Phaser = (await import('phaser')).default;
      const { createFreeFallGame } = await import('@quanta/game-engine');
      if (cancelled || !parentRef.current) return;

      const emitter = new Phaser.Events.EventEmitter();
      emitterRef.current = emitter;
      emitter.on('free-fall:landed', (p: { fallTimeMs: number }) =>
        onLandedRef.current(p.fallTimeMs),
      );
      emitter.on('free-fall:ready', () => onReadyRef.current?.());

      game = createFreeFallGame({ parent: parentRef.current, emitter });
    })();

    return () => {
      cancelled = true;
      game?.destroy(true);
      emitterRef.current = null;
    };
  }, []);

  return (
    <div
      ref={parentRef}
      className="border-border h-[360px] w-full overflow-hidden rounded-xl border bg-[#0b0f17]"
    />
  );
});
