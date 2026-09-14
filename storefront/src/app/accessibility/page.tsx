import type { Metadata } from "next";
import { HighContrastToggle } from "@/components/HighContrastToggle";

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
            <h2 className="mb-2 text-base font-semibold text-foreground">Display settings</h2>
            <HighContrastToggle />
          </section>

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
                A &quot;Skip to main content&quot; link is the first focusable thing on every
                page, so keyboard and voice-control users don&apos;t have to tab or dictate
                through the header and navigation on every single page.
              </li>
              <li>
                Every interactive control has a real, visible text label — not just an icon
                with a hidden description. This matters specifically for voice control/dictation
                software (like macOS Voice Control or Dragon), which works by matching what you
                say to what&apos;s visibly on screen; an icon-only button with no visible label
                can be impossible to target that way.
              </li>
              <li>
                Success and error messages (like &quot;Added to cart&quot; or a failed action)
                are announced to screen readers automatically as they appear, not just shown
                visually.
              </li>
              <li>
                Text and icon colors meet WCAG&apos;s minimum contrast ratios against their
                background — checked with actual contrast-ratio math, not eyeballed.
              </li>
              <li>
                Stock and order status (&quot;In stock&quot;, &quot;Only 2 left&quot;,
                &quot;Out of stock&quot;) are always shown as text, not conveyed by color alone —
                this matters for colorblind users, who can&apos;t rely on green-vs-red to tell
                those states apart, and the high-contrast toggle above doesn&apos;t change that
                reliance on color anywhere on the site.
              </li>
              <li>
                Product images without a rating or stock information show that honestly (e.g.
                &quot;No ratings yet&quot;) instead of hiding the space or guessing.
              </li>
              <li>Motion respects your system&apos;s &quot;reduce motion&quot; setting.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Dictation and voice control
            </h2>
            <p>
              If you navigate by voice, every button and link on this site is built to have a
              real, visible label you can say out loud to activate it (for example, saying
              &quot;click add to cart&quot; targets a button that&apos;s actually labeled
              &quot;Add to cart&quot;, not a hidden description that doesn&apos;t match what you
              see). A small number of compact icon-only controls (like the arrow that expands a
              subcategory) rely on your voice control software&apos;s built-in
              &quot;show numbers&quot; overlay feature instead, since adding visible text to
              every one of those would clutter the page — if you hit one of those and it&apos;s
              not working well for you, let us know.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Known limitations</h2>
            <p>Being honest about what&apos;s not done yet:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                We haven&apos;t run this site through real assistive technology beyond our own
                testing (a screen reader, a switch device, Windows High Contrast/forced-colors
                mode) or had a formal third-party audit or VPAT done.
              </li>
              <li>
                If your session is inactive for a long time at checkout, it can expire without a
                warning beforehand — we haven&apos;t built that warning yet.
              </li>
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
