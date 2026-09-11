# Phase 1 — MVP: a working store

Status as of 2026-09-10: **in progress**, not complete. Tracking each
backlog item honestly rather than marking the phase done early.

## Amazon-pattern visual/UX rebuild (2026-09-10)

Asked directly whether the storefront's look/workflows/UX matched
Amazon's — they didn't, in any dimension (no shared nav, bare
black/white/zinc default theme, no icon library). Full rebuild per
`/Users/Suraj/.claude/plans/calm-stargazing-wren.md`: deep-navy +
accent-blue design tokens (`globals.css`), a real header/mega-nav/
footer (none existed before — `Header.tsx`, `CategoryNav.tsx`,
`SearchBar.tsx` with live type-ahead via a new
`/api/search-suggest` route, `Footer.tsx`), a real homepage (was a bare
connection-check placeholder), a dense `ProductCard` grid reused across
the homepage/listing/related-products, and a "buy box" product-detail
redesign (real image gallery from `Product.media`, breadcrumbs, star
ratings, stock badges, a staff-set "featured" badge, related products,
and a reviews section) plus order-tracking on the account page.

Every Amazon UX staple that needs data this instance doesn't have
(reviews, personalized recommendations, sponsored placements) is wired
to a real, if currently empty, data source rather than faked — same
discipline as the rest of this project. Full detail, including what's
explicitly out of scope (review *submission*, e.g.), is in the plan
file above.

Two real bugs found and fixed during live verification, both worth
knowing about for any future page that renders real images or refetches
already-queried data:
- **Next.js 16's image optimizer blocks fetching from a hostname that
  resolves to a private/loopback IP by default** (a real SSRF
  protection) — silently 400s every product image against local Saleor
  otherwise. Fixed with `images.dangerouslyAllowLocalIP: true` in
  `next.config.ts`, the same "real, dev-only relaxation" reasoning
  already used for `HTTP_IP_FILTER_ENABLED=False`.
- **The same urql module-singleton document-cache staleness bug found
  earlier for product search recurred** for `ProductDetailDocument`
  and `CheckoutDetailsDocument` (the latter meaning cart/checkout
  totals could go stale) — both now use `requestPolicy: "network-only"`
  like the original fix.

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

- **Payment + order completion — done, verified live end-to-end** (the
  Phase 1 item that was blocked the longest): a custom Saleor Payment App
  for Stripe (`backend/apps/payment_webhook_receiver/`) implements the
  four sync transaction webhooks; `storefront/src/components/PaymentForm.tsx`
  uses real Stripe Elements (raw card data never reaches our server —
  pay-tokenize). Verified through the **actual browser UI**: added a
  product to cart, filled in a real Stripe Elements card form with
  Stripe's test card (4242 4242 4242 4242), clicked Pay, and landed on
  `/order-confirmation` with a real order number. Confirmed server-side:
  the resulting order has `isPaid: true` and the correct captured amount.
  A real bug was found and fixed along the way — the storefront's
  checkout never set a billing address (`checkoutBillingAddressUpdate`),
  so `checkoutComplete` failed with a real "Billing address is not set"
  error until `updateShippingAddress` was changed to default billing to
  the same address. Full detail in
  `backend/apps/payment_webhook_receiver/README.md`.

- **Order history on the account page**: queries the customer's real
  orders (`me { orders }`). Also wired `checkoutCustomerAttach` into
  login — a guest cart is now attached to the account the moment someone
  logs in, so the resulting order actually shows up in their history
  (without this, orders would never link to a real account). Verified
  live: added to cart as a guest, registered/confirmed/logged in, placed
  a real order, and it appeared correctly on `/account` as "Order #5 ·
  FULFILLED · Paid · 60 USD".
- **3D Secure**: the storefront now drives Stripe.js's `confirmCardPayment`
  when `transactionInitialize` returns `CHARGE_ACTION_REQUIRED`, then
  calls `transactionProcess` to finish. Verified live up through Stripe's
  real 3DS2 test challenge actually rendering (a real modal showing
  "3D Secure 2 Test Page" for this Stripe account) with the correct real
  `client_secret` — clicking through the challenge itself inside the
  nested iframe could not be automated (same category of limitation as
  PayPal's hosted checkout form), so the full charge-to-order path for a
  3DS card specifically is not confirmed end-to-end, only up to the
  challenge rendering correctly. Non-3DS cards complete the full path,
  confirmed repeatedly.

## Form accessibility — fixed (2026-09-10)

Asked directly whether accessibility had been addressed, and checked
rather than assumed: it hadn't, except incidentally on the products
search page. Every other form (login/register, checkout email +
address, promo code, add-to-cart, cart quantity/remove, Stripe/PayPal
payment) relied on `placeholder` text alone — no `<label>` elements,
no ARIA, anywhere in the storefront (confirmed via a real grep before
fixing, not guessed). That fails WCAG 3.3.2 and is exactly what an
axe-core scan flags first ("form elements must have labels").

Fixed across every form component: real `<label>`/`htmlFor` pairs (or
`sr-only` labels/implicit wrapping where a visible label would be
redundant, e.g. checkout's single email field), `aria-label` on the
cart's per-line quantity input and remove button (disambiguates
multiple identical controls for screen-reader users), `role="alert"`
on error messages and `role="status"` on save/apply confirmations so
they're actually announced, and a labelled `role="group"` around the
Stripe `CardElement` iframe. Verified live, not just by eye: read each
page's real DOM in the browser and confirmed every input resolves a
real accessible name (explicit label, implicit label wrapping, or
aria-label) — not a placeholder-only fallback.

Not done: no automated axe-core sweep wired into CI yet (this pass was
a manual, targeted fix after a direct question, not a systematic
audit) — a real follow-up, not silently skipped.

## Not done yet

A real flat-rate shipping price (currently $0.00 — a business decision
for the user, not something to invent), automated tax (see Phase 3 —
done, just needs a real address), transactional email *content*
customization (Saleor's default templates are what's sending right now,
confirmed via Mailpit), SEO metadata/sitemap, product images beyond the
thumbnail field.

## Note on the empty catalog

No real product data exists for this business yet. Per the project's
non-fabrication rule, no placeholder/sample products were inserted to make
screens look populated — every screen here is built against the real
(currently empty) catalog and handles that state honestly. Adding real
products (via the Dashboard or a future admin flow) is what will make the
listing page show real inventory — no code change needed for that.
