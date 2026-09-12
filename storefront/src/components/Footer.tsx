import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import { getCustomerToken } from "@/lib/auth";
import { ShopInfoDocument, ProductCategoriesDocument } from "@/gql/generated/graphql";

// A larger, Amazon-style multi-column sitemap — but every link here goes
// to a route or category that actually exists. No "Careers"/"Press"/
// "Investor Relations"/"Help Center" columns: this app has no pages
// behind those, and inventing them would misrepresent the site the same
// way fake product data would. Two real columns (Shop, Your Account)
// plus the real category tree is what's honestly available today; add
// more columns only when real pages exist for them.
export async function Footer() {
  const [shopResult, categoriesResult, customerToken] = await Promise.all([
    saleorClient.query(ShopInfoDocument, {}).toPromise(),
    saleorClient
      .query(ProductCategoriesDocument, {}, { requestPolicy: "network-only" })
      .toPromise(),
    getCustomerToken(),
  ]);

  const shopName = shopResult.data?.shop?.name ?? "Store";
  const categories = categoriesResult.data?.categories?.edges.map((e) => e.node) ?? [];

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
            Your account
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/cart" className="hover:underline">
                Cart
              </Link>
            </li>
            <li>
              <Link href={customerToken ? "/account" : "/login"} className="hover:underline">
                {customerToken ? "Account" : "Sign in"}
              </Link>
            </li>
            {!customerToken && (
              <li>
                <Link href="/register" className="hover:underline">
                  Create account
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-semibold uppercase tracking-wide text-header-fg/70">
            {shopName}
          </h2>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-header-fg/60">
        &copy; {new Date().getFullYear()} {shopName}
      </div>
    </footer>
  );
}
