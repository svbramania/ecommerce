import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement",
};

// Documents real, specific work actually done in this codebase (ARIA
// combobox search, modal-dialog focus handling, keyboard-operable
// category flyouts, honest "no ratings yet"/stock-badge empty states
// instead of guessing) rather than generic accessibility-statement
// boilerplate. Does NOT claim WCAG certification or full AA compliance —
// that's a real audit this hasn't had, and claiming it without one would
// be exactly the kind of fabricated fact this project avoids elsewhere.
export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Accessibility Statement</h1>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            We want this site to work for everyone, including people using screen readers,
            keyboard-only navigation, or other assistive technology. We&apos;re targeting the
            Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA as a guide, but we
            haven&apos;t had a formal third-party accessibility audit — we won&apos;t claim
            full compliance we haven&apos;t verified.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              What we&apos;ve specifically built
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Search suggestions use a standard combobox pattern with full keyboard support
                (arrow keys, Enter, Escape) and screen-reader announcements.
              </li>
              <li>
                The category menu and left navigation panel are keyboard-operable, not just
                mouse/touch — including proper focus handling when a panel opens and closes.
              </li>
              <li>
                Product images without a rating or stock information show that honestly (e.g.
                &quot;No ratings yet&quot;) instead of hiding the space or guessing.
              </li>
              <li>Every interactive icon-only control has a real text label for screen readers.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Found a problem?</h2>
            <p>
              If you run into an accessibility barrier anywhere on this site, tell us at{" "}
              <a href="mailto:contact@agilemindset.com" className="text-accent underline">
                contact@agilemindset.com
              </a>{" "}
              — please include the page and what happened, and we&apos;ll look into it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
