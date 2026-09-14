import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import { getCustomerToken } from "@/lib/auth";
import { ShopInfoDocument, ProductCategoriesDocument } from "@/gql/generated/graphql";
import { DEFAULT_CHANNEL } from "@/lib/checkout";

// Matches Amazon's real footer column structure ("Let Us Help You", "Get
// to Know Us") where this app has real functionality behind the link —
// Your Orders/Registry & Gift List/Shipping/Returns/Help/About/
// Accessibility are all real pages built for this, not placeholders.
// Deliberately excludes the Amazon footer categories that would require
// fabricating a business that doesn't exist here: Careers (no real job
// openings), Investor Relations/Press (not a public company, no press),
// Sell on [Store]/Become an Affiliate/Advertise (no real
// marketplace/affiliate/ad program), Amazon Payment Products (no store
// credit card or points program). Inventing those would misrepresent the
// business the same way fake product data would.
export async function Footer() {
  const [shopResult, categoriesResult, customerToken] = await Promise.all([
    saleorClient.query(ShopInfoDocument, {}).toPromise(),
    saleorClient
      .query(ProductCategoriesDocument, { channel: DEFAULT_CHANNEL }, { requestPolicy: "network-only" })
      .toPromise(),
    getCustomerToken(),
  ]);

  const shopName = shopResult.data?.shop?.name ?? "Store";
  // Empty categories (Saleor's auto-created "Default Category" placeholder,
  // plus any real category with 0 products on this channel) are filtered
  // out of every customer-facing nav — a category page with nothing in it
  // reads as a broken link.
  const categories = (categoriesResult.data?.categories?.edges.map((e) => e.node) ?? []).filter(
    (c) => !c.parent && (c.products?.totalCount ?? 0) > 0,
  );

  return (
    <footer className="mt-auto border-t border-border bg-header-bg text-header-fg">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <h2 className="mb-3 font-semibold uppercase tracking-wide text-header-fg/70">
            Shop
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/products" className="hover:underline">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.id}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-semibold uppercase tracking-wide text-header-fg/70">
            Let Us Help You
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
            </li>
            <li>
              <Link href={customerToken ? "/account" : "/login"} className="hover:underline">
                {customerToken ? "Your Account" : "Sign in"}
              </Link>
            </li>
            {!customerToken && (
              <li>
                <Link href="/register" className="hover:underline">
                  Create account
                </Link>
              </li>
            )}
            <li>
              <Link href="/account" className="hover:underline">
                Your Orders
              </Link>
            </li>
            <li>
              <Link href="/account/registries" className="hover:underline">
                Registry & Gift List
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:underline">
                Shipping Rates & Policies
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:underline">
                Returns & Replacements
              </Link>
            </li>
            <li>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-semibold uppercase tracking-wide text-header-fg/70">
            Get to Know Us
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className="hover:underline">
                {shopName} Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:underline">
                Accessibility
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-header-fg/60">
        <p className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </p>
        &copy; {new Date().getFullYear()} {shopName}
      </div>
    </footer>
  );
}
