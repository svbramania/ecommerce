// Saleor's storefront-facing ProductOrderField enum has no "units sold"
// option (confirmed via schema introspection), so "best selling" can't be
// requested as a server-side sortBy — it's computed by
// backend/apps/sales_rank/sync.py into a real, publicly-readable
// `sales_count` metafield instead, and sorted here after fetching.
// Array.prototype.sort is a stable sort (guaranteed since ES2019), so
// products tied on sales_count (currently almost everything, at 0) keep
// their original relative order rather than being shuffled.
export function sortBySalesCount<T extends { salesCount?: string | null }>(products: T[]): T[] {
  return [...products].sort(
    (a, b) => Number(b.salesCount ?? 0) - Number(a.salesCount ?? 0),
  );
}
