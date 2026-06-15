'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@quanta/ui';
import type { AttemptResult } from '@quanta/types';
import { ResultPanel } from '@/components/result-panel';
import {
  generateTriviaRequest,
  submitAttemptRequest,
  type TriviaChallengeResponse,
} from '@/lib/challenges/client';

const TOPICS = ['Cinemática', 'Dinámica', 'Energía', 'Reacciones químicas', 'Estructura atómica'];
const DIFFICULTIES = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Media', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
] as const;

type Difficulty = (typeof DIFFICULTIES)[number]['value'];
type Phase = 'pick' | 'loading' | 'answer' | 'result';

export default function TriviaPage() {
  const [topic, setTopic] = useState<string>(TOPICS[0] ?? 'Cinemática');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [phase, setPhase] = useState<Phase>('pick');
  const [trivia, setTrivia] = useState<TriviaChallengeResponse | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<number>(0);

  async function generate() {
    setError(null);
    setResult(null);
    setSelected(null);
    setPhase('loading');
    try {
      const t = await generateTriviaRequest({ topic, difficulty });
      setTrivia(t);
      startRef.current = Date.now();
      setPhase('answer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar la pregunta');
      setPhase('pick');
    }
  }

  async function answer(index: number) {
    if (!trivia || phase !== 'answer') return;
    setSelected(index);
    setPhase('result');
    try {
      const res = await submitAttemptRequest({
        challengeId: trivia.challengeId,
        timeTakenMs: Date.now() - startRef.current,
        submittedAnswer: { selectedIndex: index },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la respuesta');
      setPhase('answer');
    }
  }

  function optionClass(i: number): string {
    if (phase !== 'result' || !result) return 'border-border bg-card hover:border-primary';
    if (i === result.correctValue) return 'border-primary bg-primary/15';
    if (i === selected) return 'border-destructive bg-destructive/15';
    return 'border-border bg-card opacity-60';
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-4 py-10">
      <header>
        <Link href="/" className="text-muted-foreground text-sm underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Trivia IA 🧠</h1>
        <p className="text-muted-foreground mt-1">Física y Química, preguntas generadas por IA.</p>
      </header>

      <div className="border-border bg-card grid gap-3 rounded-xl border p-5">
        <p className="text-sm font-medium">Tema</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={t === topic ? 'default' : 'outline'}
              disabled={phase === 'loading'}
              onClick={() => setTopic(t)}
            >
              {t}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-sm font-medium">Dificultad</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <Button
              key={d.value}
              type="button"
              size="sm"
              variant={d.value === difficulty ? 'default' : 'outline'}
              disabled={phase === 'loading'}
              onClick={() => setDifficulty(d.value)}
            >
              {d.label}
            </Button>
          ))}
        </div>
        <Button className="mt-3" size="lg" disabled={phase === 'loading'} onClick={generate}>
          {phase === 'loading' ? 'Generando…' : trivia ? 'Otra pregunta' : 'Generar pregunta'}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>

      {trivia && phase !== 'pick' && phase !== 'loading' ? (
        <div className="border-border bg-card grid gap-3 rounded-xl border p-5">
          <p className="text-lg font-semibold">{trivia.question}</p>
          {trivia.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={phase === 'result'}
              onClick={() => void answer(i)}
              className={`rounded-lg border px-4 py-3 text-left transition ${optionClass(i)}`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}

      {result ? (
        <ResultPanel
          isCorrect={result.isCorrect}
          score={result.score}
          explanation={result.explanation}
          onRetry={() => void generate()}
          retryLabel="Otra pregunta"
        />
      ) : null}
    </main>
  );
}
