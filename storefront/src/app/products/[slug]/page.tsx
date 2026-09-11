import Image from "next/image";
import { notFound } from "next/navigation";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductDetailDocument } from "@/gql/generated/graphql";
import { AddToCartForm } from "@/components/AddToCartForm";
import { RichText } from "@/components/RichText";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await saleorClient
    .query(ProductDetailDocument, { slug, channel: DEFAULT_CHANNEL })
    .toPromise();

  const product = result.data?.product;
  if (!product) notFound();

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

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
        <div>
          {product.thumbnail?.url ? (
            <Image
              src={product.thumbnail.url}
              alt={product.thumbnail.alt ?? product.name}
              width={480}
              height={480}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="aspect-square w-full rounded-lg bg-black/5 dark:bg-white/5" />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            {product.name}
          </h1>
          <RichText json={product.description} />
          {bundleComponents && bundleComponents.length > 0 && (
            <div className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
              <p className="mb-1 font-medium text-black dark:text-zinc-50">This bundle includes:</p>
              <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
                {bundleComponents.map((c) => (
                  <li key={c.sku}>
                    {c.quantity} &times; {c.sku}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AddToCartForm
            variants={product.variants?.filter((v): v is NonNullable<typeof v> => v != null) ?? []}
          />
        </div>
      </div>
    </div>
  );
}
