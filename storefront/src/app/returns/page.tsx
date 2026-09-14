import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Replacements",
};

// Deliberately doesn't commit to a specific returns window (e.g. "30
// days") — no return policy or return mutation exists anywhere in this
// codebase, matching the same honest gap already flagged in
// terms/page.tsx. This page exists as its own link (Amazon's footer has
// a dedicated "Returns & Replacements" page) but says the same real
// thing: contact us, case-by-case, until a real policy is decided.
export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Returns & Replacements</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            If you&apos;re not satisfied with an order, contact us and we&apos;ll work with you
            on a return, exchange, or refund on a case-by-case basis. We don&apos;t yet have an
            automated return process or a self-service return portal — every return currently
            goes through direct contact so we can make sure it&apos;s handled correctly.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">How to start a return</h2>
            <p>
              Email{" "}
              <a href="mailto:contact@agilemindset.com" className="text-accent underline">
                contact@agilemindset.com
              </a>{" "}
              with your order number (find it in your{" "}
              <a href="/account" className="text-accent underline">
                order history
              </a>
              ) and what you&apos;d like to do — return, exchange, or refund. We&apos;ll reply
              with next steps.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Damaged or incorrect items</h2>
            <p>
              If an item arrived damaged or isn&apos;t what you ordered, let us know as soon as
              possible with your order number so we can make it right.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
