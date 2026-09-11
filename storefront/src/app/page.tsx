import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ShopInfoDocument, ProductListDocument } from "@/gql/generated/graphql";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  // network-only on both — same module-singleton urql cache staleness bug
  // found and fixed repeatedly elsewhere in this app (see fetchCheckout's
  // comment in lib/checkout.ts): without it, the homepage grid would keep
  // showing whatever the catalog looked like on this query's first-ever
  // request, not reflecting later admin edits.
  const [shopResult, gridResult, newArrivalsResult] = await Promise.all([
    saleorClient.query(ShopInfoDocument, {}).toPromise(),
    saleorClient
      .query(
        ProductListDocument,
        { first: 12, channel: DEFAULT_CHANNEL },
        { requestPolicy: "network-only" },
      )
      .toPromise(),
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

  const shop = shopResult.data?.shop;
  const products = gridResult.data?.products?.edges.map((e) => e.node) ?? [];
  const newArrivals = newArrivalsResult.data?.products?.edges.map((e) => e.node) ?? [];

  return (
    <div className="bg-surface-muted">
      <section className="bg-header-bg px-6 py-16 text-header-fg">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">{shop?.name ?? "Store"}</h1>
          {shop?.description && (
            <p className="mt-2 max-w-2xl text-header-fg/80">{shop.description}</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Shop all products</h2>
          <Link href="/products" className="text-sm text-accent hover:underline">
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
