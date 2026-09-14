// Original stylized sailing-schooner mark — three layered sails (jib,
// foresail, mainsail) over a simple hull, drawn as flat vector shapes.
// Each sail's straight leading edge doubles as its mast, so no separate
// mast lines are needed — they'd vanish at small sizes anyway. Colors are
// theme tokens so this renders correctly against the navy header in both
// light and dark mode; app/icon.svg is a standalone copy of the same
// artwork with literal colors (favicons render outside page CSS).
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8,80 Q60,96 112,82 L108,74 Q60,86 12,76 Z" fill="var(--color-accent)" />
      <path
        d="M10,78 L32,16 Q23,46 32,70 Z"
        fill="var(--color-header-fg)"
        fillOpacity="0.85"
      />
      <path d="M32,16 L32,70 L58,64 Q62,38 32,16 Z" fill="var(--color-header-fg)" />
      <path d="M84,10 L84,76 L110,68 Q116,36 84,10 Z" fill="var(--color-header-fg)" />
    </svg>
  );
}
