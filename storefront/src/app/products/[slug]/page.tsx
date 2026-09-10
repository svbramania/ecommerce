import Image from "next/image";
import { notFound } from "next/navigation";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductDetailDocument } from "@/gql/generated/graphql";
import { AddToCartForm } from "@/components/AddToCartForm";

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
          {/* product.description is Saleor's EditorJS rich-text JSON, not
              plain text — rendering it properly is a follow-up (a small
              EditorJS-to-HTML renderer), not built yet. Showing raw JSON
              here would be worse than omitting it. */}
          <AddToCartForm
            variants={product.variants?.filter((v): v is NonNullable<typeof v> => v != null) ?? []}
          />
        </div>
      </div>
    </div>
  );
}
