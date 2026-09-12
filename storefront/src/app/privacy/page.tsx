import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

// Real company facts only: legal entity name/address are Agile Mindset,
// LLC's actual registered contact info (pulled from agilemindset.com); the
// data-collection/cookie/third-party sections describe what this codebase
// actually does (see checkout.ts, Analytics.tsx, lib/auth.ts) — nothing
// here is boilerplate for services this app doesn't integrate with.
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-1 text-sm text-zinc-500">Last updated: September 12, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            This Privacy Policy explains how Agile Mindset, LLC (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares information when you
            visit or make a purchase on this website (the &quot;Site&quot;). By using the
            Site, you agree to the practices described below.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              1. Information We Collect
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <span className="font-medium text-foreground">Account information:</span>{" "}
                name and email address, if you create an account.
              </li>
              <li>
                <span className="font-medium text-foreground">Order information:</span>{" "}
                shipping and billing address, items purchased, and order history.
              </li>
              <li>
                <span className="font-medium text-foreground">Payment information:</span>{" "}
                payments are processed directly by Stripe and PayPal. We do not receive or
                store your full card number, expiration date, or CVC — those are entered
                directly into Stripe&apos;s or PayPal&apos;s own secure interfaces.
              </li>
              <li>
                <span className="font-medium text-foreground">Cookies and similar technologies:</span>{" "}
                used to keep your cart and sign-in session working as you browse.
              </li>
              <li>
                <span className="font-medium text-foreground">Usage data:</span> if enabled
                for this Site, Google Analytics and/or HubSpot may collect standard
                analytics data such as pages visited and general device/browser information.
                These are optional integrations and are inactive unless configured.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Process and fulfill your orders, including payment, shipping, and support.</li>
              <li>Create and maintain your account, if you choose to create one.</li>
              <li>Communicate with you about your orders or account.</li>
              <li>
                Understand how the Site is used so we can maintain and improve it, where
                analytics are enabled.
              </li>
              <li>Comply with applicable law and enforce our Terms of Use.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              3. Cookies
            </h2>
            <p>
              The Site uses cookies that are necessary for it to function — for example,
              to remember what is in your cart and to keep you signed in. If analytics
              integrations are enabled for this Site, Google Analytics and/or HubSpot may
              also set their own cookies to collect usage data. You can control or delete
              cookies through your browser settings; disabling necessary cookies may
              prevent parts of the Site (such as checkout) from working correctly.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              4. How We Share Information
            </h2>
            <p>We do not sell your personal information. We share information only with:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <span className="font-medium text-foreground">Payment processors</span> (Stripe,
                PayPal) to complete your transaction.
              </li>
              <li>
                <span className="font-medium text-foreground">Analytics providers</span> (Google
                Analytics, HubSpot), only if and where enabled for this Site.
              </li>
              <li>Service providers who help us operate the Site, bound to protect your data.</li>
              <li>Law enforcement or regulators, where required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              5. Your Rights and Choices
            </h2>
            <p>
              Depending on where you live, you may have the right to access, correct, or
              request deletion of your personal information, or to opt out of certain uses.
              California residents have rights under the California Consumer Privacy Act
              (CCPA), including the right to know what personal information we hold about
              you and to request its deletion. To exercise any of these rights, contact us
              using the information below.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              6. Children&apos;s Privacy
            </h2>
            <p>
              The Site is not directed to children under 13, and we do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              7. Data Security
            </h2>
            <p>
              We use reasonable administrative and technical safeguards to protect your
              information. No method of transmission or storage is completely secure, and
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted
              on this page with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">9. Contact Us</h2>
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
