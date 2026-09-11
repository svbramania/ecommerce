import Image from "next/image";
import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import {
  ProductListDocument,
  ProductCategoriesDocument,
  type ProductFilterInput,
  type ProductOrder,
} from "@/gql/generated/graphql";

const DEFAULT_CHANNEL = "default-channel";

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)", field: "NAME", direction: "ASC" },
  { value: "name-desc", label: "Name (Z–A)", field: "NAME", direction: "DESC" },
  { value: "price-asc", label: "Price (low to high)", field: "PRICE", direction: "ASC" },
  { value: "price-desc", label: "Price (high to low)", field: "PRICE", direction: "DESC" },
  { value: "newest", label: "Newest", field: "CREATED_AT", direction: "DESC" },
] as const;

function buildSortBy(sort: string | undefined): ProductOrder | undefined {
  const option = SORT_OPTIONS.find((o) => o.value === sort);
  if (!option) return undefined;
  return { field: option.field, direction: option.direction };
}

function buildFilter(params: {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}): ProductFilterInput | undefined {
  const filter: ProductFilterInput = {};

  if (params.q) filter.search = params.q;
  if (params.category) filter.categories = [params.category];
  if (params.inStock === "1") filter.stockAvailability = "IN_STOCK";

  const gte = params.minPrice ? Number(params.minPrice) : undefined;
  const lte = params.maxPrice ? Number(params.maxPrice) : undefined;
  if ((gte !== undefined && !Number.isNaN(gte)) || (lte !== undefined && !Number.isNaN(lte))) {
    filter.price = {
      ...(gte !== undefined && !Number.isNaN(gte) ? { gte } : {}),
      ...(lte !== undefined && !Number.isNaN(lte) ? { lte } : {}),
    };
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const filter = buildFilter(params);
  const sortBy = buildSortBy(params.sort);

  const [productsResult, categoriesResult] = await Promise.all([
    saleorClient
      .query(
        ProductListDocument,
        { first: 24, channel: DEFAULT_CHANNEL, filter, sortBy },
        // urql's default document cache is keyed per query+variables with no
        // TTL, and this client is a module-level singleton reused across
        // requests in the same server process — confirmed live that a
        // legitimately-empty search result (e.g. queried before Saleor's
        // async search-index task had run) gets cached and served stale
        // forever after. Search/filter results must reflect current data on
        // every request, so bypass the cache here.
        { requestPolicy: "network-only" },
      )
      .toPromise(),
    saleorClient.query(ProductCategoriesDocument, {}).toPromise(),
  ]);

  const products = productsResult.data?.products?.edges.map((e) => e.node) ?? [];
  const totalCount = productsResult.data?.products?.totalCount ?? 0;
  const categories = categoriesResult.data?.categories?.edges.map((e) => e.node) ?? [];
  const hasActiveFilters = Boolean(
    params.q || params.category || params.minPrice || params.maxPrice || params.inStock,
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-semibold text-black dark:text-zinc-50">
          Products
        </h1>

        <form
          method="GET"
          className="mb-8 flex flex-wrap items-end gap-4 rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="q" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="text"
              defaultValue={params.q ?? ""}
              placeholder="Search products…"
              className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="category"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={params.category ?? ""}
                className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="minPrice" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Min price
            </label>
            <input
              id="minPrice"
              name="minPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={params.minPrice ?? ""}
              className="w-24 rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="maxPrice" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Max price
            </label>
            <input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={params.maxPrice ?? ""}
              className="w-24 rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sort" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={params.sort ?? ""}
              className="rounded-md border border-black/15 bg-white px-3 py-1.5 text-sm text-black dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="">Relevance</option>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 pb-1.5 text-sm text-black dark:text-zinc-50">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={params.inStock === "1"}
              className="h-4 w-4"
            />
            In stock only
          </label>

          <button
            type="submit"
            className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <Link
              href="/products"
              className="pb-1.5 text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              Clear filters
            </Link>
          )}
        </form>

        {productsResult.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not load products: {productsResult.error.message}
          </p>
        )}

        {!productsResult.error && products.length === 0 && !hasActiveFilters && (
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

        {!productsResult.error && products.length === 0 && hasActiveFilters && (
          <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No products match these filters. Try clearing one or more of
              them.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              {totalCount} product{totalCount === 1 ? "" : "s"}
            </p>
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
          </>
        )}
      </div>
    </div>
  );
}
