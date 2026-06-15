'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@quanta/ui';
import type { AttemptResult, Challenge } from '@quanta/types';
import { GameCanvas, type GameCanvasHandle } from '@/components/game/game-canvas';
import { ResultPanel } from '@/components/result-panel';
import { submitAttemptRequest } from '@/lib/challenges/client';

const PRESETS = [
  { label: 'Tierra', gravity: 9.8 },
  { label: 'Luna', gravity: 1.6 },
  { label: 'Marte', gravity: 3.7 },
];

type Phase = 'predict' | 'dropping' | 'result';

export function FreeFallPlay({ challenge }: { challenge: Challenge }) {
  const canvasRef = useRef<GameCanvasHandle>(null);
  const startRef = useRef<number>(Date.now());
  const [heightM, setHeightM] = useState(45);
  const [gravity, setGravity] = useState(9.8);
  const [predicted, setPredicted] = useState('');
  const [phase, setPhase] = useState<Phase>('predict');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predictedNum = Number(predicted);
  const canDrop =
    phase === 'predict' &&
    predicted.trim() !== '' &&
    Number.isFinite(predictedNum) &&
    predictedNum > 0;

  function handleDrop() {
    setError(null);
    setPhase('dropping');
    canvasRef.current?.drop({ heightM, gravity });
  }

  async function handleLanded() {
    try {
      const res = await submitAttemptRequest({
        challengeId: challenge.id,
        timeTakenMs: Date.now() - startRef.current,
        submittedAnswer: { heightM, gravity, predictedTimeSeconds: predictedNum },
      });
      setResult(res);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la respuesta');
      setPhase('predict');
    }
  }

  function retry() {
    setResult(null);
    setPredicted('');
    setPhase('predict');
    startRef.current = Date.now();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-4 py-10">
      <header>
        <Link href="/" className="text-muted-foreground text-sm underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{challenge.title}</h1>
        <p className="text-muted-foreground mt-1">{challenge.statement}</p>
      </header>

      <GameCanvas ref={canvasRef} onLanded={() => void handleLanded()} />

      <div className="border-border bg-card grid gap-4 rounded-xl border p-5">
        <label className="text-sm font-medium">
          Altura: <span className="text-primary">{heightM} m</span>
          <input
            type="range"
            min={5}
            max={100}
            value={heightM}
            disabled={phase !== 'predict'}
            onChange={(e) => setHeightM(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--color-primary)]"
          />
        </label>

        <div>
          <label className="text-sm font-medium">
            Gravedad: <span className="text-primary">{gravity} m/s²</span>
            <input
              type="range"
              min={1}
              max={20}
              step={0.1}
              value={gravity}
              disabled={phase !== 'predict'}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="mt-1 w-full accent-[var(--color-primary)]"
            />
          </label>
          <div className="mt-2 flex gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant="outline"
                size="sm"
                disabled={phase !== 'predict'}
                onClick={() => setGravity(p.gravity)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <label className="text-sm font-medium">
          Tu predicción del tiempo de caída (segundos)
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={predicted}
            disabled={phase !== 'predict'}
            onChange={(e) => setPredicted(e.target.value)}
            placeholder="Ej: 3.03"
            className="mt-1"
          />
        </label>

        <Button size="lg" disabled={!canDrop} onClick={handleDrop}>
          {phase === 'dropping' ? 'Cayendo…' : 'Soltar y comprobar'}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>

      {result ? (
        <ResultPanel
          isCorrect={result.isCorrect}
          score={result.score}
          explanation={result.explanation}
          onRetry={retry}
          extra={
            <>
              Tu predicción: <strong>{result.submittedValue.toFixed(2)} s</strong> · Real:{' '}
              <strong>{result.correctValue.toFixed(2)} s</strong>
            </>
          }
        />
      ) : null}
    </main>
  );
}
