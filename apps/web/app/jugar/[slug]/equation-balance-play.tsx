'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@quanta/ui';
import type { AttemptResult, Challenge, EquationSpecies } from '@quanta/types';
import { submitAttemptRequest } from '@/lib/challenges/client';

interface EqPayload {
  equation?: string;
  species?: EquationSpecies[];
  elements?: string[];
  max_coefficient?: number;
}

export function EquationBalancePlay({ challenge }: { challenge: Challenge }) {
  const payload = challenge.payload as EqPayload;
  const species = useMemo(() => payload.species ?? [], [payload.species]);
  const elements = useMemo(() => {
    if (payload.elements?.length) return payload.elements;
    const set = new Set<string>();
    for (const s of species) for (const el of Object.keys(s.atoms)) set.add(el);
    return [...set];
  }, [payload.elements, species]);
  const maxCoeff = payload.max_coefficient ?? 8;

  const startRef = useRef<number>(Date.now());
  const [coeffs, setCoeffs] = useState<number[]>(() => species.map(() => 1));
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setCoeff(i: number, delta: number) {
    setCoeffs((prev) =>
      prev.map((c, idx) => (idx === i ? Math.min(maxCoeff, Math.max(1, c + delta)) : c)),
    );
  }

  // Conteo de átomos por elemento (feedback en vivo; el server es la verdad).
  const counts = elements.map((el) => {
    let left = 0;
    let right = 0;
    species.forEach((s, i) => {
      const n = (s.atoms[el] ?? 0) * (coeffs[i] ?? 0);
      if (s.side === 'reactant') left += n;
      else right += n;
    });
    return { el, left, right, ok: left === right };
  });
  const allBalanced = counts.every((c) => c.ok);

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await submitAttemptRequest({
        challengeId: challenge.id,
        timeTakenMs: Date.now() - startRef.current,
        submittedAnswer: { coefficients: coeffs },
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo verificar');
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setResult(null);
    setCoeffs(species.map(() => 1));
    startRef.current = Date.now();
  }

  const reactants = species.map((s, i) => ({ s, i })).filter((x) => x.s.side === 'reactant');
  const products = species.map((s, i) => ({ s, i })).filter((x) => x.s.side === 'product');

  function speciesControl(x: { s: EquationSpecies; i: number }) {
    return (
      <div
        key={x.i}
        className="border-border bg-card flex items-center gap-1 rounded-lg border px-2 py-2"
      >
        <div className="flex flex-col">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground px-2 text-xs"
            onClick={() => setCoeff(x.i, 1)}
            disabled={!!result}
          >
            ▲
          </button>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground px-2 text-xs"
            onClick={() => setCoeff(x.i, -1)}
            disabled={!!result}
          >
            ▼
          </button>
        </div>
        <span className="text-primary w-5 text-center text-lg font-bold">{coeffs[x.i]}</span>
        <span className="text-lg font-medium">{x.s.formula}</span>
      </div>
    );
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

      <div className="border-border bg-card flex flex-wrap items-center justify-center gap-2 rounded-xl border p-5">
        {reactants.map((x, idx) => (
          <span key={x.i} className="flex items-center gap-2">
            {idx > 0 ? <span className="text-muted-foreground">+</span> : null}
            {speciesControl(x)}
          </span>
        ))}
        <span className="text-muted-foreground px-2 text-2xl">→</span>
        {products.map((x, idx) => (
          <span key={x.i} className="flex items-center gap-2">
            {idx > 0 ? <span className="text-muted-foreground">+</span> : null}
            {speciesControl(x)}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {counts.map((c) => (
          <span
            key={c.el}
            className={`rounded-lg border px-3 py-2 text-sm ${c.ok ? 'border-primary/40 bg-primary/10 text-primary' : 'border-destructive/40 bg-destructive/10 text-destructive'}`}
          >
            {c.el}: {c.left} ↔ {c.right} {c.ok ? '✓' : '✗'}
          </span>
        ))}
      </div>

      {!result ? (
        <Button size="lg" disabled={busy} onClick={verify}>
          {busy ? 'Verificando…' : allBalanced ? 'Verificar ✓' : 'Verificar'}
        </Button>
      ) : null}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      {result ? (
        <div
          className={`rounded-xl border p-5 ${result.isCorrect ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10'}`}
        >
          <p className="text-lg font-bold">
            {result.isCorrect ? '¡Correcto! 🎉' : 'Todavía no'}{' '}
            <span className="text-primary">+{result.score} pts</span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm">{result.explanation}</p>
          <Button className="mt-4" variant="secondary" onClick={retry}>
            Reintentar
          </Button>
        </div>
      ) : null}
    </main>
  );
}
