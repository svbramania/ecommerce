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
  // Stripe.js and the card-entry iframe it injects — required for the
  // real Stripe Elements integration on this page (see PaymentForm.tsx).
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${SALEOR_API_ORIGIN}`,
  `connect-src 'self' ${SALEOR_API_ORIGIN} https://api.stripe.com`,
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
