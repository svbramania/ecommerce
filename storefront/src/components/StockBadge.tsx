// Derived honestly from real quantityAvailable across variants — "unknown"
// (every variant untracked, quantityAvailable === null) is NOT the same as
// "in stock", so it renders no badge at all rather than guessing.
export function StockBadge({ variants }: { variants: { quantityAvailable?: number | null }[] }) {
  const known = variants.map((v) => v.quantityAvailable).filter((q): q is number => q != null);
  if (known.length === 0) return null;

  const max = Math.max(...known);

  if (max === 0) {
    return (
      <span className="rounded bg-stock-out-bg px-2 py-0.5 text-xs font-medium text-stock-out-fg">
        Out of stock
      </span>
    );
  }
  if (max <= 5) {
    return (
      <span className="rounded bg-stock-low-bg px-2 py-0.5 text-xs font-medium text-stock-low-fg">
        Only {max} left
      </span>
    );
  }
  return (
    <span className="rounded bg-stock-ok-bg px-2 py-0.5 text-xs font-medium text-stock-ok-fg">
      In stock
    </span>
  );
}
