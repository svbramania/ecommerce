import Link from "next/link";
import { saleorClient } from "@/lib/saleor-client";
import { ShopInfoDocument } from "@/gql/generated/graphql";

// Links only to routes that actually exist in this app — no fabricated
// "Careers"/"Press"/"Terms" pages. Inventing those links would misrepresent
// the site the same way fake product data would.
export async function Footer() {
  const result = await saleorClient.query(ShopInfoDocument, {}).toPromise();
  const shopName = result.data?.shop?.name ?? "Store";

  return (
    <footer className="mt-auto border-t border-border bg-header-bg text-header-fg">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-6 px-4 py-8 text-sm">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/products" className="hover:underline">
          All products
        </Link>
        <Link href="/cart" className="hover:underline">
          Cart
        </Link>
        <Link href="/account" className="hover:underline">
          Account
        </Link>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-header-fg/60">
        &copy; {new Date().getFullYear()} {shopName}
      </div>
    </footer>
  );
}
