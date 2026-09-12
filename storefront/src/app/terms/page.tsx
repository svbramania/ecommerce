import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
};

// Deliberately doesn't commit to a specific returns/refund window (e.g.
// "30 days") — no return policy or return mutation exists anywhere in this
// codebase, so inventing a specific number here would misrepresent an
// actual business commitment. Points customers to contact us instead;
// update this section once a real return policy is decided and built.
export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-surface-muted px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-surface p-8">
        <h1 className="text-2xl font-semibold text-foreground">Terms of Use</h1>
        <p className="mt-1 text-sm text-zinc-500">Last updated: September 12, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of this
            website (the &quot;Site&quot;), operated by Agile Mindset, LLC (&quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;). By accessing or using the Site, you agree to
            be bound by these Terms. If you do not agree, please do not use the Site.
          </p>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">1. Accounts</h2>
            <p>
              You may browse the Site without an account, but an account is required to
              check out faster and view order history. You are responsible for maintaining
              the confidentiality of your account credentials and for all activity under
              your account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              2. Orders, Pricing, and Payment
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>
                All prices are listed in the currency shown at checkout and are subject to
                change without notice.
              </li>
              <li>
                Payment is processed by Stripe or PayPal; by placing an order you agree to
                their applicable terms for the payment method you choose.
              </li>
              <li>
                We reserve the right to refuse or cancel any order, including for suspected
                fraud, pricing errors, or unavailable inventory. If we cancel an order after
                payment, you will be refunded.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              3. Shipping
            </h2>
            <p>
              Estimated shipping information is provided at checkout. Delivery dates are
              estimates only and are not guaranteed. Risk of loss and title for items
              purchased pass to you upon our delivery to the shipping carrier.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              4. Returns and Refunds
            </h2>
            <p>
              If you are not satisfied with an order, contact us at{" "}
              <a href="mailto:contact@agilemindset.com" className="text-accent underline">
                contact@agilemindset.com
              </a>{" "}
              and we will work with you on a return, exchange, or refund on a
              case-by-case basis.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              5. Intellectual Property
            </h2>
            <p>
              The Site and its content — including text, graphics, logos, and product
              descriptions — are owned by or licensed to Agile Mindset, LLC and are
              protected by applicable intellectual property laws. You may not copy,
              reproduce, or distribute Site content without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              6. Prohibited Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Use the Site for any unlawful purpose or in violation of these Terms.</li>
              <li>Attempt to gain unauthorized access to the Site or its systems.</li>
              <li>Interfere with or disrupt the Site&apos;s operation.</li>
              <li>Submit false or fraudulent orders or payment information.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              7. Third-Party Services
            </h2>
            <p>
              The Site relies on third-party services, including Stripe and PayPal for
              payment processing, and may use Google Analytics or HubSpot for analytics
              where enabled. Your use of those services is subject to their own terms and
              privacy policies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              8. Disclaimer of Warranties
            </h2>
            <p>
              The Site and its content are provided &quot;as is&quot; without warranties of
              any kind, express or implied, to the fullest extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              9. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, Agile Mindset, LLC will not be liable
              for any indirect, incidental, special, or consequential damages arising from
              your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              10. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the State of California, without
              regard to its conflict-of-law principles.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Changes will be posted on this
              page with an updated &quot;Last updated&quot; date. Continued use of the Site
              after changes take effect constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">12. Contact Us</h2>
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
