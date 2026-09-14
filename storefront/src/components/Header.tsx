import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { saleorClient } from "@/lib/saleor-client";
import { getCustomerToken } from "@/lib/auth";
import { getStoredCheckoutId, fetchCheckout } from "@/lib/checkout";
import { ShopInfoDocument, ProductCategoriesDocument } from "@/gql/generated/graphql";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import { SearchBar } from "@/components/SearchBar";
import { CategoryNav } from "@/components/CategoryNav";
import { LeftNavDrawer } from "@/components/LeftNavDrawer";
import { Logo } from "@/components/Logo";

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

export async function Header() {
  // network-only on both — this component renders on every page via the
  // root layout, and a stale cached category tree or shop name here would
  // be the most visible/frequent instance of the module-singleton urql
  // cache bug found elsewhere in this rebuild (see fetchCheckout's comment
  // in lib/checkout.ts for the full explanation).
  const [shopResult, categoriesResult, customerToken, checkoutId] = await Promise.all([
    saleorClient.query(ShopInfoDocument, {}, { requestPolicy: "network-only" }).toPromise(),
    saleorClient
      .query(
        ProductCategoriesDocument,
        { channel: DEFAULT_CHANNEL },
        { requestPolicy: "network-only" },
      )
      .toPromise(),
    getCustomerToken(),
    getStoredCheckoutId(),
  ]);

  const shop = shopResult.data?.shop;
  const checkout = checkoutId ? await fetchCheckout(checkoutId) : null;
  const cartCount = checkout?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;

  const allCategories = categoriesResult.data?.categories?.edges.map((e) => e.node) ?? [];
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

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-header-bg">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
          <LeftNavDrawer categories={rootCategories} isSignedIn={Boolean(customerToken)} />

          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-header-fg">
            <Logo className="h-7 w-9" />
            {shop?.name ?? "Store"}
          </Link>

          <SearchBar />

          {/* sr-only (not `hidden`) below narrow widths: `hidden` is
              display:none, which removes text from the accessibility tree
              entirely — confirmed live that left these links with NO
              accessible name at all on a narrow viewport. sr-only keeps the
              real word in the accessible name/DOM at every width (so a
              screen reader always announces "Cart"/"Sign in", and voice
              control has a real name to match against), just hidden
              visually below sm to avoid the overflow this was originally
              added to prevent. */}
          <Link
            href={customerToken ? "/account" : "/login"}
            className="flex shrink-0 items-center gap-1 text-sm text-header-fg hover:underline"
          >
            <User size={18} aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{customerToken ? "Account" : "Sign in"}</span>
          </Link>

          <Link
            href="/cart"
            className="flex shrink-0 items-center gap-1 text-sm text-header-fg hover:underline"
          >
            <span className="relative">
              <ShoppingCart size={20} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="sr-only sm:not-sr-only">
              Cart{cartCount > 0 ? ` (${cartCount} item${cartCount === 1 ? "" : "s"})` : ""}
            </span>
          </Link>
        </div>

        {shop?.defaultCountry?.code && (
          <div className="mx-auto max-w-6xl px-4 pb-2 text-xs text-header-fg/70">
            Shipping to {shop.defaultCountry.code}
          </div>
        )}
      </div>

      <CategoryNav categories={featuredCategories} />
    </header>
  );
}
