import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Rates & Policies",
};

// Real, live-queried shipping configuration as of 2026-09-14: one
// shipping zone (US only), one method (named "Default" in the Saleor
// Dashboard — not a real carrier/service name, so not claimed as one
// here), priced at $0.00 on the default channel. No specific delivery
// timeframe is configured anywhere in this stack, so none is promised
// here — Amazon's own shipping page commits to specific delivery
// windows because it has a real logistics network behind that promise;
// this store doesn't yet, and inventing one would misrepresent it.
export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Shipping Rates & Policies</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Where we ship</h2>
            <p>
              We currently ship to addresses within the United States only. We don&apos;t yet
              support international shipping.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Shipping cost</h2>
            <p>
              Your exact shipping cost is calculated and shown before you complete checkout,
              based on your order and delivery address. Standard shipping is currently free on
              all orders.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Delivery time</h2>
            <p>
              We don&apos;t currently provide a guaranteed delivery window. Once your order
              ships, you can track it from your{" "}
              <a href="/account" className="text-accent underline">
                account&apos;s order history
              </a>{" "}
              — a tracking number appears there as soon as it&apos;s available.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Questions</h2>
            <p>
              Contact us at{" "}
              <a href="mailto:contact@agilemindset.com" className="text-accent underline">
                contact@agilemindset.com
              </a>{" "}
              about a specific order&apos;s shipping status.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
