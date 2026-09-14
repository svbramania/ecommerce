import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { getCustomerToken } from "@/lib/auth";
import { listMyRegistries } from "@/lib/giftRegistry";
import { RemoveRegistryItemButton } from "@/components/RemoveRegistryItemButton";
import { CopyShareLinkButton } from "@/components/CopyShareLinkButton";

export default async function RegistryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getCustomerToken();
  if (!token) redirect("/login");

  // The gift-registry service has no "get one registry" endpoint scoped
  // to the owner (only "mine" and the public-by-slug view) — fine at
  // personal-registry scale, filter client-side here rather than adding
  // an endpoint for a list that's realistically always small.
  const registries = await listMyRegistries(token);
  const registry = registries.find((r) => r.id === id);
  if (!registry) notFound();

  const shareUrl = `/registry/${registry.shareSlug}`;

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/account/registries" className="text-sm text-accent underline">
          &larr; Back to your registries
        </Link>

        <h1 className="mb-1 mt-4 text-2xl font-semibold text-foreground">{registry.title}</h1>
        {registry.eventDate && (
          <p className="mb-4 text-sm text-zinc-500">Event date: {registry.eventDate}</p>
        )}

        <div className="mb-8 rounded-lg border border-border bg-surface p-4">
          <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
            Share this link with anyone — they can view and mark items as purchased without
            needing an account:
          </p>
          <CopyShareLinkButton path={shareUrl} />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Items ({registry.items.length})
        </h2>

        {registry.items.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No items yet — add products from any product page using the &quot;Add to
            registry&quot; button.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {registry.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"
              >
                {item.product?.thumbnail?.url ? (
                  <Image
                    src={item.product.thumbnail.url}
                    alt={item.product.thumbnail.altText ?? item.product.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-md bg-surface-muted" />
                )}
                <div className="flex-1">
                  {item.product ? (
                    <Link href={`/products/${item.product.slug}`} className="font-medium text-foreground hover:underline">
                      {item.product.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-zinc-500">
                      No longer available
                    </span>
                  )}
                  <p className="text-xs text-zinc-500">
                    Wanted: {item.quantityWanted} · Purchased: {item.quantityPurchased}
                  </p>
                </div>
                <RemoveRegistryItemButton registryId={registry.id} itemId={item.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
