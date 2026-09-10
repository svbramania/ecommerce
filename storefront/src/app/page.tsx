import { saleorClient } from "@/lib/saleor-client";
import { ShopInfoDocument } from "@/gql/generated/graphql";

export default async function Home() {
  // Server component, queried once at request time — proves the storefront
  // is actually wired to Saleor's live GraphQL API, not a static mock.
  // Phase 1 replaces this page with the real catalog/homepage.
  const result = await saleorClient.query(ShopInfoDocument, {}).toPromise();
  const shop = result.data?.shop;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-black/10 bg-white p-10 text-center dark:border-white/10 dark:bg-zinc-900">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Storefront ↔ Saleor connection check
        </p>
        {shop ? (
          <>
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              {shop.name}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Default country: {shop.defaultCountry?.code ?? "not set"}
            </p>
          </>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not reach the Saleor API at{" "}
            {process.env.NEXT_PUBLIC_SALEOR_API_URL}. Is{" "}
            <code>docker compose up -d</code> running?
          </p>
        )}
      </main>
    </div>
  );
}
