import { saleorClient } from "@/lib/saleor-client";
import {
  ProductListDocument,
  type ProductCardFieldsFragment,
  type ProductFilterInput,
} from "@/gql/generated/graphql";
import { DEFAULT_CHANNEL } from "@/lib/checkout";

// Saleor caps a single connection page at 100 records, and its own
// default product order (no sortBy given) is alphabetical by NAME, not
// creation order — confirmed live: ranking only the first 100 of 274
// products missed real best-sellers entirely because their names simply
// don't sort into the first 100 alphabetically. Sorting by real
// sales_count (lib/sort.ts) is only correct if it sees the whole matching
// set first, so this pages through everything (capped at MAX_PRODUCTS as
// a sanity ceiling) before the caller sorts/slices.
const MAX_PRODUCTS = 500;

export async function fetchAllProducts(
  filter?: ProductFilterInput,
): Promise<ProductCardFieldsFragment[]> {
  const products: ProductCardFieldsFragment[] = [];
  let after: string | undefined;

  while (products.length < MAX_PRODUCTS) {
    const result = await saleorClient
      .query(
        ProductListDocument,
        { first: 100, after, channel: DEFAULT_CHANNEL, filter },
        { requestPolicy: "network-only" },
      )
      .toPromise();

    const page = result.data?.products;
    if (!page) break;

    products.push(...page.edges.map((e) => e.node));
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor ?? undefined;
  }

  return products;
}
