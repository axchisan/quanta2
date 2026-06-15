/** Mascota de Quanta: un átomo sonriente. Hereda el color con `currentColor`. */
export function AtomMascot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Quanta">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.9">
        <ellipse cx="32" cy="32" rx="28" ry="11" />
        <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(60 32 32)" />
        <ellipse cx="32" cy="32" rx="28" ry="11" transform="rotate(120 32 32)" />
      </g>
      <circle cx="60" cy="32" r="3" fill="currentColor" />
      <circle cx="18" cy="13" r="3" fill="currentColor" />
      <circle cx="46" cy="51" r="3" fill="currentColor" />
      <circle cx="32" cy="32" r="11" fill="currentColor" />
      <circle cx="28.5" cy="30" r="1.7" fill="#fff" />
      <circle cx="35.5" cy="30" r="1.7" fill="#fff" />
      <path
        d="M28.5 34.5 q3.5 3 7 0"
        stroke="#fff"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
