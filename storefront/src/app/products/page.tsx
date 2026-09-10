import Image from "next/image";
import { saleorClient } from "@/lib/saleor-client";
import { ProductListDocument } from "@/gql/generated/graphql";

const DEFAULT_CHANNEL = "default-channel";

export default async function ProductsPage() {
  const result = await saleorClient
    .query(ProductListDocument, { first: 24, channel: DEFAULT_CHANNEL })
    .toPromise();

  const products = result.data?.products?.edges.map((e) => e.node) ?? [];

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-semibold text-black dark:text-zinc-50">
          Products
        </h1>

        {result.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not load products: {result.error.message}
          </p>
        )}

        {!result.error && products.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No products yet — this is a genuinely empty catalog, not a
              loading state. Add real products via the{" "}
              <a
                href="http://localhost:9000"
                className="font-medium text-black underline dark:text-zinc-50"
              >
                Saleor Dashboard
              </a>{" "}
              to see them listed here.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-col gap-2 rounded-lg border border-black/10 p-3 dark:border-white/10"
              >
                {product.thumbnail?.url && (
                  <Image
                    src={product.thumbnail.url}
                    alt={product.thumbnail.alt ?? product.name}
                    width={200}
                    height={200}
                    className="aspect-square w-full rounded-md object-cover"
                  />
                )}
                <span className="text-sm font-medium text-black dark:text-zinc-50">
                  {product.name}
                </span>
                {product.pricing?.priceRange?.start?.gross && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {product.pricing.priceRange.start.gross.amount}{" "}
                    {product.pricing.priceRange.start.gross.currency}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
