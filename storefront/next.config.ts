import type { NextConfig } from "next";

// Security-checklist item sf-csp: checkout/cart specifically, since that's
// the page a card-skimmer-style (Magecart) attack targets. Baseline CSP,
// not the nonce-based strict variant Next.js also supports — a nonce
// forces every page to render dynamically (loses static optimization
// site-wide) for a policy that only needs to be strict on two routes.
// Still real protection even with 'unsafe-inline' present for Next's own
// inline bootstrap scripts: no arbitrary object embeds, no framing
// (clickjacking), connect-src locked to this origin + the Saleor API.
const SALEOR_API_ORIGIN =
  process.env.NEXT_PUBLIC_SALEOR_API_URL?.replace(/\/graphql\/?$/, "") ??
  "http://localhost:8000";

const checkoutCsp = [
  "default-src 'self'",
  // Stripe.js and the card-entry iframe it injects (PaymentForm.tsx), plus
  // GA4/HubSpot (Analytics.tsx) — allowed here too, deliberately, since the
  // checkout funnel is exactly what analytics needs to see, not just the
  // rest of the site. HubSpot's tracking script dynamically pulls in
  // additional *.hubspot.com/*.hs-scripts.com/*.hs-analytics.net requests
  // of its own at runtime — this list is the real, documented set for the
  // core tracking script; if a real portal ID surfaces more CSP violations
  // in the browser console, extend it then rather than guessing every
  // subdomain up front.
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://js.hs-scripts.com https://js.hs-analytics.net",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${SALEOR_API_ORIGIN} https://www.google-analytics.com`,
  `connect-src 'self' ${SALEOR_API_ORIGIN} https://api.stripe.com https://www.google-analytics.com https://analytics.google.com https://*.hubspot.com https://*.hs-analytics.net`,
  "frame-src https://js.stripe.com https://hooks.stripe.com",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Saleor serves uploaded product media from the API's own host —
    // localhost:8000 in local dev. Update/extend this when a real staging
    // or prod API domain exists.
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "8000" }],
  },
  async headers() {
    return [
      {
        source: "/(checkout|cart)",
        headers: [{ key: "Content-Security-Policy", value: checkoutCsp }],
      },
    ];
  },
};

export default nextConfig;
