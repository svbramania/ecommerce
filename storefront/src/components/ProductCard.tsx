import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { StockBadge } from "@/components/StockBadge";
import { FeaturedBadge } from "@/components/FeaturedBadge";
import type { ProductCardFieldsFragment } from "@/gql/generated/graphql";

export function ProductCard({ product }: { product: ProductCardFieldsFragment }) {
  const price = product.pricing?.priceRange?.start?.gross;

  return (
    // h-full — stretches to fill its grid cell so every card in a row
    // matches the row's tallest card; combined with the fixed-height
    // slots below (name/price/stock), every card ends up the same size
    // everywhere, not just within one row. Confirmed live that without
    // this, product-name lines wrapping differently (1 line vs 3 lines)
    // and the stock badge sometimes rendering nothing at all (untracked
    // inventory — a real, honest state, not a bug) made card borders
    // visibly misaligned across the grid.
    <Link
      href={`/products/${product.slug}`}
      className="flex h-full flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition hover:shadow-md"
    >
      <div className="relative">
        {product.thumbnail?.url ? (
          <Image
            src={product.thumbnail.url}
            alt={product.thumbnail.alt ?? product.name}
            width={200}
            height={200}
            className="aspect-square w-full rounded-md object-cover"
          />
        ) : (
          <div className="aspect-square w-full rounded-md bg-surface-muted" />
        )}
        <div className="absolute left-1 top-1 flex flex-col gap-1">
          <FeaturedBadge metafield={product.featured} />
        </div>
      </div>

      {/* min-h reserves exactly 2 lines at text-sm regardless of actual
          name length; line-clamp-2 truncates longer names with an
          ellipsis instead of pushing the card taller. */}
      <span className="line-clamp-2 min-h-10 text-sm font-medium text-foreground">
        {product.name}
      </span>
      <StarRating rating={product.rating} />
      {/* Fixed-height slot even when a price is somehow absent, so its
          presence/absence never shifts the rows below it. */}
      <span className="min-h-6 text-base font-bold text-price">
        {price ? `${price.amount} ${price.currency}` : null}
      </span>
      {/* Fixed-height slot — StockBadge legitimately renders nothing for
          untracked-inventory variants (a real, honest state), which
          would otherwise collapse this row only on some cards. */}
      <div className="min-h-[22px]">
        <StockBadge variants={product.variants ?? []} />
      </div>
    </Link>
  );
}
