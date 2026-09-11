import Image from "next/image";
import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { StockBadge } from "@/components/StockBadge";
import { FeaturedBadge } from "@/components/FeaturedBadge";
import type { ProductCardFieldsFragment } from "@/gql/generated/graphql";

export function ProductCard({ product }: { product: ProductCardFieldsFragment }) {
  const price = product.pricing?.priceRange?.start?.gross;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 transition hover:shadow-md"
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

      <span className="text-sm font-medium text-foreground">{product.name}</span>
      <StarRating rating={product.rating} />
      {price && (
        <span className="text-base font-bold text-price">
          {price.amount} {price.currency}
        </span>
      )}
      <StockBadge variants={product.variants ?? []} />
    </Link>
  );
}
