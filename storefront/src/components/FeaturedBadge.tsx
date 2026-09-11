// Real, staff-set Dashboard metadata flag (key "featured") — same mechanism
// backend/apps/bundle_sync/ uses for bundle_components: no storefront UI
// writes this, staff set it directly via the Dashboard's metadata editor.
// Not a fake ad-auction/sponsored-placement system with invented bids.
export function FeaturedBadge({ metafield }: { metafield?: string | null }) {
  if (metafield !== "true") return null;
  return (
    <span className="rounded bg-sponsored-bg px-2 py-0.5 text-xs font-medium text-sponsored-fg">
      Featured
    </span>
  );
}
