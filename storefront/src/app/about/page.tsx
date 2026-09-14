import type { Metadata } from "next";
import { saleorClient } from "@/lib/saleor-client";
import { ShopInfoDocument } from "@/gql/generated/graphql";

export const metadata: Metadata = {
  title: "About Us",
};

// Real facts only: Agile Mindset, LLC's own description of itself
// ("management consulting for a new era... Guided by Principles,
// Empowering Talent, Driving Impact"), pulled from agilemindset.com, and
// its real registered address. Deliberately doesn't invent a narrative
// connecting the consulting business to this storefront's retail catalog
// beyond the real, plain fact that the same company operates both.
export default async function AboutPage() {
  const shopResult = await saleorClient
    .query(ShopInfoDocument, {}, { requestPolicy: "network-only" })
    .toPromise();
  const shopName = shopResult.data?.shop?.name ?? "this store";

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">About Us</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            {shopName} is operated by Agile Mindset, LLC, based in the San Francisco Bay Area.
          </p>

          <p>
            Agile Mindset, LLC is a management consulting company — in its own words,
            &quot;guided by principles, empowering talent, driving impact.&quot; This storefront
            is a separate, real product line the company operates.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Contact</h2>
            <p>
              Agile Mindset, LLC
              <br />
              41041 Trimboli Way, Unit 1964
              <br />
              Fremont, CA 94538
              <br />
              Email:{" "}
              <a href="mailto:contact@agilemindset.com" className="text-accent underline">
                contact@agilemindset.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
