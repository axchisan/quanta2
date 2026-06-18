/**
 * Forma de respuesta estilo Kahoot (▲ ◆ ● ■). Acompaña SIEMPRE al color para que
 * el color no sea el único canal (accesibilidad, daltonismo) — patrón Kahoot.
 * Rellena con `currentColor`.
 */
export function AnswerShape({ index, className }: { index: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      {index === 0 ? (
        <path d="M12 4 L21 20 L3 20 Z" /> // triángulo
      ) : index === 1 ? (
        <path d="M12 3 L21 12 L12 21 L3 12 Z" /> // rombo
      ) : index === 2 ? (
        <circle cx="12" cy="12" r="8.5" /> // círculo
      ) : (
        <rect x="5" y="5" width="14" height="14" rx="2.5" /> // cuadrado
      )}
    </svg>
  );
}
