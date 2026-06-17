import { cn } from '@quanta/ui';

/** Estados emocionales de Quark (avatar-system-spec §3). */
export type QuarkState = 'idle' | 'thinking' | 'correct' | 'wrong' | 'celebrate';

// Cara modular: la boca cambia por estado (técnica "mouth swap" de Duolingo).
const MOUTHS: Record<QuarkState, string> = {
  idle: 'M28.5 34.5 q3.5 3 7 0',
  thinking: 'M29 35.4 h6',
  correct: 'M27.6 34 q4.4 4.8 8.8 0',
  celebrate: 'M27.6 34 q4.4 4.8 8.8 0',
  wrong: 'M28.5 36.4 q3.5 -3 7 0',
};

const HAPPY = new Set<QuarkState>(['correct', 'celebrate']);

/**
 * Quark — la mascota de Quanta (átomo) con estados animados (Fase 0: SVG + CSS).
 * Hereda el color con `currentColor`. Las animaciones respetan
 * `prefers-reduced-motion` (definidas en `@quanta/ui/tokens.css`).
 *
 * Evolución prevista: rig en Rive con State Machine (ver avatar-system-spec §4).
 */
export function Quark({ state = 'idle', className }: { state?: QuarkState; className?: string }) {
  const happy = HAPPY.has(state);
  return (
    <span className={cn('quark', `quark--${state}`, 'inline-block', className)}>
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full"
        role="img"
        aria-label="Quark, la mascota de Quanta"
      >
        {/* Órbitas + electrones giran juntos (idle/celebración). */}
        <g className="quark__orbits">
          <g fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.9">
            <ellipse cx="32" cy="32" rx="28" ry="11" />
            <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(60 32 32)" />
            <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(120 32 32)" />
          </g>
          <circle cx="60" cy="32" r="3" fill="currentColor" />
          <circle cx="18" cy="13" r="3" fill="currentColor" />
          <circle cx="46" cy="51" r="3" fill="currentColor" />
        </g>

        {/* Núcleo + cara (no rotan). */}
        <circle cx="32" cy="32" r="11" fill="currentColor" />
        {happy ? (
          // Ojos felices (arcos ^ ^).
          <g stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round">
            <path d="M26.8 30.4 q1.7 -1.8 3.4 0" />
            <path d="M33.8 30.4 q1.7 -1.8 3.4 0" />
          </g>
        ) : (
          // Ojos normales (puntos).
          <g fill="#fff">
            <circle cx="28.5" cy="30" r="1.7" />
            <circle cx="35.5" cy="30" r="1.7" />
          </g>
        )}
        <path
          d={MOUTHS[state]}
          stroke="#fff"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
