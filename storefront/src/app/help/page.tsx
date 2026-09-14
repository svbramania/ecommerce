import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help",
};

const TOPICS = [
  { href: "/account", label: "Your Account", description: "View your profile and sign-in details." },
  { href: "/account", label: "Your Orders", description: "Check order status and tracking." },
  { href: "/account/registries", label: "Registry & Gift List", description: "Create or manage a gift registry." },
  { href: "/shipping", label: "Shipping Rates & Policies", description: "Where we ship, cost, and delivery." },
  { href: "/returns", label: "Returns & Replacements", description: "Start a return or report a problem." },
  { href: "/privacy", label: "Privacy Policy", description: "How we handle your information." },
  { href: "/terms", label: "Terms of Use", description: "The terms that govern using this site." },
];

// A real, minimal help hub — not a fabricated support-ticket system or
// live-chat widget this app doesn't have. Every link here goes to a page
// that actually exists; the direct-contact option is the same real inbox
// used everywhere else on the site (privacy/terms/returns), not a
// separate support queue that doesn't exist.
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Help</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Find what you need below, or contact us directly.
        </p>

        <ul className="mt-8 flex flex-col gap-3">
          {TOPICS.map((topic) => (
            <li key={topic.label}>
              <Link
                href={topic.href}
                className="block rounded-lg border border-border bg-surface-muted p-4 hover:border-accent"
              >
                <p className="font-medium text-foreground">{topic.label}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{topic.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-border pt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Can&apos;t find what you&apos;re looking for? Email{" "}
            <a href="mailto:contact@agilemindset.com" className="text-accent underline">
              contact@agilemindset.com
            </a>{" "}
            and we&apos;ll get back to you.
          </p>
        </div>
      </div>
    </div>
  );
}
