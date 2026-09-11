import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductListDocument } from "@/gql/generated/graphql";
import { ProductCard } from "@/components/ProductCard";

// Real same-category query — Saleor has no native "related products" field
// (confirmed via schema introspection), so this is a genuine, if simple,
// heuristic (same category, excluding the current product) rather than a
// fabricated or ML-personalized rail.
export async function RelatedProducts({
  categoryId,
  excludeProductId,
}: {
  categoryId: string;
  excludeProductId: string;
}) {
  const result = await saleorClient
    .query(ProductListDocument, {
      first: 9,
      channel: DEFAULT_CHANNEL,
      filter: { categories: [categoryId] },
    })
    .toPromise();

  const related = (result.data?.products?.edges.map((e) => e.node) ?? [])
    .filter((p) => p.id !== excludeProductId)
    .slice(0, 8);

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Related products</h2>
      {related.length === 0 ? (
        <p className="text-sm text-zinc-500">No related products yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {related.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
