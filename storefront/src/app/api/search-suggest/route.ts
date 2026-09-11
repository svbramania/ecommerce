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
    .query(ProductListDocument, {
      first: 6,
      channel: DEFAULT_CHANNEL,
      filter: { search: q },
    })
    .toPromise();

  const suggestions = (result.data?.products?.edges ?? []).map((e) => ({
    name: e.node.name,
    slug: e.node.slug,
  }));

  return NextResponse.json({ suggestions });
}
