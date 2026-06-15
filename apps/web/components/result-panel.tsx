'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@quanta/ui';
import { AtomMascot } from '@/components/atom-mascot';
import { playSfx } from '@/lib/audio/sfx';

interface ResultPanelProps {
  isCorrect: boolean;
  score: number;
  explanation: string;
  onRetry?: () => void;
  retryLabel?: string;
  extra?: ReactNode;
}

/** Panel de resultado compartido por los retos: mascota + sonido + feedback. */
export function ResultPanel({
  isCorrect,
  score,
  explanation,
  onRetry,
  retryLabel = 'Reintentar',
  extra,
}: ResultPanelProps) {
  useEffect(() => {
    playSfx(isCorrect ? 'success' : 'error');
  }, [isCorrect]);

  return (
    <div
      className={`rounded-lg border-2 p-5 ${
        isCorrect ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <AtomMascot
          className={`h-14 w-14 shrink-0 ${isCorrect ? 'text-primary animate-bounce' : 'text-destructive'}`}
        />
        <div>
          <p className="font-display text-2xl font-extrabold">
            {isCorrect ? '¡Correcto!' : 'Casi…'}
          </p>
          {isCorrect ? <p className="text-primary font-bold">+{score} puntos</p> : null}
        </div>
      </div>
      {extra ? <div className="mt-3 text-sm">{extra}</div> : null}
      <p className="text-muted-foreground mt-3 text-sm">{explanation}</p>
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
