import { cache } from "react";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductCategoriesDocument } from "@/gql/generated/graphql";

// Amazon's top nav bar doesn't list every department — it shows a short,
// curated row of shortcuts next to the "All" hamburger, which is where the
// full department list actually lives (see LeftNavDrawer). This is the
// same split: a fixed, curated slice of real category slugs across the top,
// full tree behind "All". First-iteration pick, not traffic-driven (no real
// analytics exist yet) — revisit once real category-level traffic data
// exists.
const FEATURED_CATEGORY_SLUGS = [
  "electronics-accessories",
  "home-lighting",
  "beauty-personal-care",
  "toys-games",
  "pet-accessories",
  "books",
];

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

// react's cache() dedupes this within a single request — both Header (the
// sticky top nav on every page) and the homepage (the same nav rendered
// again below the hero title) need this, and without it they'd fire two
// real network queries for the same data on every homepage request.
export const fetchCategories = cache(async (): Promise<{
  rootCategories: NavCategory[];
  featuredCategories: NavCategory[];
}> => {
  const result = await saleorClient
    .query(ProductCategoriesDocument, { channel: DEFAULT_CHANNEL }, { requestPolicy: "network-only" })
    .toPromise();

  const allCategories = result.data?.categories?.edges.map((e) => e.node) ?? [];
  // Empty categories (no products on this channel) are real, existing
  // Saleor category records — but showing a customer a category page with
  // nothing in it reads as a broken link, so they're filtered out of every
  // customer-facing nav rather than deleted.
  const rootCategories = allCategories
    .filter((c) => !c.parent && (c.products?.totalCount ?? 0) > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: (c.children?.edges.map((e) => e.node) ?? []).filter(
        (child) => (child.products?.totalCount ?? 0) > 0,
      ),
    }));
  const featuredCategories = FEATURED_CATEGORY_SLUGS.map((slug) =>
    rootCategories.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => c != null);

  return { rootCategories, featuredCategories };
});
