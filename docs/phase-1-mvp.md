# Phase 1 — MVP: a working store

Status as of 2026-09-09: **in progress**, not complete. Tracking each
backlog item honestly rather than marking the phase done early.

## Done and verified

- **Default channel/warehouse/shipping zone**: already exist out of the box
  from Saleor's own setup (`default-channel`, USD, US; a "Default
  Warehouse"; a "Default" shipping zone covering US with one flat-rate
  method — currently priced at $0.00, a placeholder the user should set to
  a real rate before launch, not something to invent a number for here).
  Verified live via authenticated GraphQL queries, not assumed.
- **Product listing page** (`storefront/src/app/products/page.tsx`):
  queries Saleor's real `products` catalog for `default-channel`. Verified
  live — the catalog is genuinely empty right now (0 products), and the
  page correctly renders an honest "no products yet" state rather than a
  loading spinner or a fabricated placeholder product. Confirmed by
  building and grepping the actual rendered HTML.

- **Cart & checkout flow** (`storefront/src/app/cart`, `.../checkout`,
  `.../actions/checkout.ts`, `lib/checkout.ts`): add-to-cart, quantity
  update/remove, email, shipping address, and delivery-method selection —
  all real Saleor `checkout*` mutations (introspected against the live
  schema before writing, not guessed), guest cart id tracked in an
  httpOnly cookie. **Verified live end-to-end**: created a temporary,
  clearly-labeled `TEST-DELETE-ME` product via the API, drove the full
  flow through an actual browser (add to cart → cart page showing the
  real price/total → checkout → address → a real address-validation error
  from Saleor surfaced correctly, which is how the missing `countryArea`
  (state/province) field on US addresses was found and added → shipping
  method appeared and was selectable), then deleted the test product
  afterward so the real catalog is empty again, not polluted with test
  data.

- **Rich-text description rendering** (`storefront/src/components/RichText.tsx`):
  parses Saleor's EditorJS JSON and builds React elements directly (headers,
  paragraphs, lists) — no `dangerouslySetInnerHTML` anywhere, text goes
  through React's own escaping, unrecognized block types are dropped. Built
  this way from the start rather than sanitizing an HTML string after the
  fact (security-checklist item `sf-sanitize`). Verified live with a real
  EditorJS description on a temporary test product — heading, paragraph
  (with inline `<b>` markup correctly stripped), and both list items
  rendered in order.
- **Customer accounts** (`register`, `login`, `logout`, `confirm-account`,
  `reset-password` pages + `app/actions/auth.ts`): built against Saleor's
  own `accountRegister`/`tokenCreate`/`confirmAccount`/`requestPasswordReset`
  mutations. Verified live, end to end, with a real (since-deleted) test
  account: registered → got a real confirmation email in Mailpit → this
  shop genuinely requires email confirmation before login works (a real
  finding, not assumed) → followed the real link → confirmed → logged in →
  account page showed the real email → logged out → `/account` correctly
  redirected back to `/login`. Also confirmed live that
  `requestPasswordReset` gives the same success response for a real vs.
  nonexistent email (security-checklist item `auth-reset`, no
  enumeration).
- **CSP header on `/checkout` and `/cart`** (`next.config.ts`) — security
  checklist item `sf-csp`. Verified live via response headers. Baseline
  (not nonce-based strict) CSP, chosen so the rest of the storefront keeps
  static optimization; still real protection (blocks arbitrary object
  embeds and framing, restricts `connect-src` to this origin + the Saleor
  API).

## Not done yet

- Order lifecycle (checkout → order, needs `checkoutComplete` which needs
  a payment gateway), single live payment method (blocked on real Stripe
  test keys — the checkout page states this plainly rather than faking a
  "Place order" button), a real flat-rate shipping price (currently
  $0.00 — a business decision for the user, not something to invent),
  automated tax, transactional email *content* customization (Saleor's
  default templates are what's sending right now, confirmed via Mailpit),
  SEO metadata/sitemap, product images beyond the thumbnail field, order
  history on the account page (needs a completed order to show, which
  needs Stripe).

## Note on the empty catalog

No real product data exists for this business yet. Per the project's
non-fabrication rule, no placeholder/sample products were inserted to make
screens look populated — every screen here is built against the real
(currently empty) catalog and handles that state honestly. Adding real
products (via the Dashboard or a future admin flow) is what will make the
listing page show real inventory — no code change needed for that.
