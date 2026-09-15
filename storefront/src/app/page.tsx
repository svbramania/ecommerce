import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductListDocument } from "@/gql/generated/graphql";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/CategoryNav";
import { sortBySalesCount } from "@/lib/sort";
import { fetchAllProducts } from "@/lib/products";
import { fetchCategories } from "@/lib/categories";

export default async function Home() {
  // network-only — same module-singleton urql cache staleness bug found
  // and fixed repeatedly elsewhere in this app (see fetchCheckout's
  // comment in lib/checkout.ts): without it, the homepage grid would keep
  // showing whatever the catalog looked like on this query's first-ever
  // request, not reflecting later admin edits.
  const [{ featuredCategories }, allProducts, newArrivalsResult] = await Promise.all([
    // Deduped with Header's own call via react's cache() — both need the
    // same category list on this request (Header's copy is hidden on this
    // route; see HeaderCategoryNav).
    fetchCategories(),
    // Pages through the whole catalog (see lib/products.ts) — ranking by
    // real sales_count is only correct if every product was actually in
    // the pool being ranked.
    fetchAllProducts(),
    saleorClient
      .query(
        ProductListDocument,
        {
          first: 8,
          channel: DEFAULT_CHANNEL,
          sortBy: { field: "CREATED_AT", direction: "DESC" },
        },
        { requestPolicy: "network-only" },
      )
      .toPromise(),
  ]);

  const products = sortBySalesCount(allProducts).slice(0, 12);
  const newArrivals = newArrivalsResult.data?.products?.edges.map((e) => e.node) ?? [];

  return (
    <div className="bg-surface-muted">
      {/* No hero/title band here — the header's own logo+name (visible on
          every page) already carries the shop name, so a second, identical
          "Saleor e-commerce" heading right below it was pure duplication. */}
      <CategoryNav categories={featuredCategories} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Shop all products</h2>
          <Link href="/products" className="text-sm text-accent underline">
            See all &rarr;
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No products yet — this is a genuinely empty catalog, not a
              loading state. Add real products via the{" "}
              <a
                href="http://localhost:9000"
                className="font-medium text-accent underline"
              >
                Saleor Dashboard
              </a>{" "}
              to see them listed here.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}

        {newArrivals.length > 0 && (
          <>
            <h2 className="mb-6 mt-12 text-xl font-semibold text-foreground">
              New arrivals
            </h2>
            <ul className="flex snap-x gap-4 overflow-x-auto pb-2">
              {newArrivals.map((product) => (
                <li key={product.id} className="w-44 shrink-0 snap-start">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
