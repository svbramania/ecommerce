import { NextRequest, NextResponse } from "next/server";
import { saleorClient } from "@/lib/saleor-client";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { ProductListDocument } from "@/gql/generated/graphql";

// Backs the header search bar's type-ahead — real, live product matches via
// the same ProductFilterInput.search this app already proved works
// end-to-end (see docs/phase-4-growth.md), not a fabricated suggestions
// list.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ suggestions: [] });

  const result = await saleorClient
    .query(
      ProductListDocument,
      { first: 6, channel: DEFAULT_CHANNEL, filter: { search: q } },
      // network-only — same module-singleton urql cache bug found and
      // fixed elsewhere in this app (see fetchCheckout's comment in
      // lib/checkout.ts): a search that legitimately returns zero matches
      // (e.g. queried before Saleor's async search-index task has run for
      // a brand-new product) gets cached and served stale forever after
      // for that exact query string otherwise. Confirmed live: a product
      // that became searchable after a reindex still showed empty
      // suggestions here until this fix.
      { requestPolicy: "network-only" },
    )
    .toPromise();

  const suggestions = (result.data?.products?.edges ?? []).map((e) => ({
    name: e.node.name,
    slug: e.node.slug,
  }));

  return NextResponse.json({ suggestions });
}
