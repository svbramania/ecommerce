import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicRegistry } from "@/lib/giftRegistry";
import { MarkPurchasedButton } from "@/components/MarkPurchasedButton";

// Dedupes the sidecar-service lookup between generateMetadata and the page
// component itself — same reasoning as fetchProduct in products/[slug].
const fetchRegistry = cache(getPublicRegistry);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const registry = await fetchRegistry(slug);
  return { title: registry ? registry.title : "Registry" };
}

export default async function PublicRegistryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const registry = await fetchRegistry(slug);
  if (!registry) notFound();

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">{registry.title}</h1>
        {registry.eventDate && (
          <p className="mt-1 text-sm text-zinc-500">Event date: {registry.eventDate}</p>
        )}
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Buy something below and mark it purchased so other guests know it&apos;s
          taken care of — no account needed.
        </p>

        {registry.items.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500">This registry doesn&apos;t have any items yet.</p>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {registry.items.map((item) => {
              const fullyPurchased = item.quantityPurchased >= item.quantityWanted;
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-4 rounded-lg border border-border bg-surface p-4 ${
                    fullyPurchased ? "opacity-60" : ""
                  }`}
                >
                  {item.product?.thumbnail?.url ? (
                    <Image
                      src={item.product.thumbnail.url}
                      alt={item.product.thumbnail.altText ?? item.product.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-md bg-surface-muted" />
                  )}
                  <div className="flex-1">
                    {item.product ? (
                      <>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.pricing?.priceRange?.start?.gross && (
                          <p className="text-sm font-bold text-price">
                            {item.product.pricing.priceRange.start.gross.amount}{" "}
                            {item.product.pricing.priceRange.start.gross.currency}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium text-zinc-500">No longer available</span>
                    )}
                    <p className="text-xs text-zinc-500">
                      {item.quantityPurchased} of {item.quantityWanted} purchased
                    </p>
                  </div>
                  {item.product && (
                    <MarkPurchasedButton
                      slug={slug}
                      itemId={item.id}
                      disabled={fullyPurchased}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
