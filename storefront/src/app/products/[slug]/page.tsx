import Link from "next/link";
import { notFound } from "next/navigation";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductDetailDocument, ShopInfoDocument } from "@/gql/generated/graphql";
import { AddToCartForm } from "@/components/AddToCartForm";
import { RichText } from "@/components/RichText";
import { ProductGallery } from "@/components/ProductGallery";
import { StarRating } from "@/components/StarRating";
import { StockBadge } from "@/components/StockBadge";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ReviewsSection } from "@/components/ReviewsSection";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [productResult, shopResult] = await Promise.all([
    // urql's document cache is keyed per query+variables with no TTL, and
    // saleorClient is a module-level singleton reused across requests in
    // the same server process — confirmed live (again) that editing a
    // product's real media/stock/etc. after the first request keeps
    // serving the pre-edit response forever after otherwise. Same fix
    // already applied to the product-list search query for the same
    // reason.
    saleorClient
      .query(
        ProductDetailDocument,
        { slug, channel: DEFAULT_CHANNEL },
        { requestPolicy: "network-only" },
      )
      .toPromise(),
    saleorClient.query(ShopInfoDocument, {}).toPromise(),
  ]);

  const product = productResult.data?.product;
  if (!product) notFound();

  const shopName = shopResult.data?.shop?.name;
  const variants = product.variants?.filter((v): v is NonNullable<typeof v> => v != null) ?? [];

  // Bundles are ordinary products whose metadata records the real
  // component SKUs/quantities they're made of — the stock number Saleor
  // shows for this product is already the real, computed "how many
  // complete bundles are available" figure (see
  // backend/apps/bundle_sync/README.md). This just makes the composition
  // visible; it isn't what enforces availability.
  let bundleComponents: { sku: string; quantity: number }[] | null = null;
  if (product.bundleComponents) {
    try {
      bundleComponents = JSON.parse(product.bundleComponents);
    } catch {
      bundleComponents = null;
    }
  }

  let reviewCount = 0;
  if (product.reviewsMetadata) {
    try {
      const parsed = JSON.parse(product.reviewsMetadata);
      if (Array.isArray(parsed)) reviewCount = parsed.length;
    } catch {
      reviewCount = 0;
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-6 text-sm text-zinc-500">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link href={`/products?category=${product.category.id}`} className="hover:underline">
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 sm:grid-cols-2">
          <ProductGallery
            media={product.media ?? []}
            fallbackThumbnail={product.thumbnail}
            productName={product.name}
          />

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-6">
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
            <StarRating rating={product.rating} reviewCount={reviewCount} />

            {variants[0]?.pricing?.price?.gross && (
              <p className="text-2xl font-bold text-price">
                {variants[0].pricing.price.gross.amount} {variants[0].pricing.price.gross.currency}
              </p>
            )}

            <StockBadge variants={variants} />

            <RichText json={product.description} />

            {bundleComponents && bundleComponents.length > 0 && (
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="mb-1 font-medium text-foreground">This bundle includes:</p>
                <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
                  {bundleComponents.map((c) => (
                    <li key={c.sku}>
                      {c.quantity} &times; {c.sku}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <AddToCartForm variants={variants} />

            {shopName && (
              <p className="text-xs text-zinc-500">
                Ships from and sold by {shopName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-12">
          {product.category && (
            <RelatedProducts categoryId={product.category.id} excludeProductId={product.id} />
          )}
          <ReviewsSection reviewsMetadata={product.reviewsMetadata} />
        </div>
      </div>
    </div>
  );
}
