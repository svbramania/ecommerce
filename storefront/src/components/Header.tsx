import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { saleorClient } from "@/lib/saleor-client";
import { getCustomerToken } from "@/lib/auth";
import { getStoredCheckoutId, fetchCheckout } from "@/lib/checkout";
import { ShopInfoDocument, ProductCategoriesDocument } from "@/gql/generated/graphql";
import { SearchBar } from "@/components/SearchBar";
import { CategoryNav } from "@/components/CategoryNav";

export async function Header() {
  // network-only on both — this component renders on every page via the
  // root layout, and a stale cached category tree or shop name here would
  // be the most visible/frequent instance of the module-singleton urql
  // cache bug found elsewhere in this rebuild (see fetchCheckout's comment
  // in lib/checkout.ts for the full explanation).
  const [shopResult, categoriesResult, customerToken, checkoutId] = await Promise.all([
    saleorClient.query(ShopInfoDocument, {}, { requestPolicy: "network-only" }).toPromise(),
    saleorClient
      .query(ProductCategoriesDocument, {}, { requestPolicy: "network-only" })
      .toPromise(),
    getCustomerToken(),
    getStoredCheckoutId(),
  ]);

  const shop = shopResult.data?.shop;
  const checkout = checkoutId ? await fetchCheckout(checkoutId) : null;
  const cartCount = checkout?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;

  const allCategories = categoriesResult.data?.categories?.edges.map((e) => e.node) ?? [];
  const rootCategories = allCategories
    .filter((c) => !c.parent)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: c.children?.edges.map((e) => e.node) ?? [],
    }));

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-header-bg">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
          <Link href="/" className="shrink-0 text-lg font-bold text-header-fg">
            {shop?.name ?? "Store"}
          </Link>

          <SearchBar />

          <Link
            href={customerToken ? "/account" : "/login"}
            className="flex shrink-0 items-center gap-1 text-sm text-header-fg hover:underline"
          >
            <User size={18} />
            <span className="hidden sm:inline">{customerToken ? "Account" : "Sign in"}</span>
          </Link>

          <Link
            href="/cart"
            className="flex shrink-0 items-center gap-1 text-sm text-header-fg hover:underline"
          >
            <span className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>

        {shop?.defaultCountry?.code && (
          <div className="mx-auto max-w-6xl px-4 pb-2 text-xs text-header-fg/70">
            Shipping to {shop.defaultCountry.code}
          </div>
        )}
      </div>

      <CategoryNav categories={rootCategories} />
    </header>
  );
}
