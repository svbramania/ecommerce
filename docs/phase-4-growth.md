# Phase 4 — Growth & retention

Status as of 2026-09-10: **in progress** — four real pieces done, the
rest genuinely blocked on third-party accounts or product decisions
this project doesn't have.

## Done and verified

- **Discount/promo codes**: `checkoutAddPromoCode`/`checkoutRemovePromoCode`
  wired into the checkout page (`storefront/src/components/PromoCodeForm.tsx`).
  Verified live end-to-end with a real voucher (10% off, `TESTCODE10`,
  created via `voucherCreate`/`voucherChannelListingUpdate`): a $100
  checkout correctly became $90 with `discount.amount: 10` after applying
  the code. Both the test product and the test voucher were deleted
  afterward — nothing fake left active in the running system.

- **Abandoned-cart email reminders** (`backend/apps/abandoned_cart/`):
  a one-shot script that finds real checkouts (Saleor consumes a
  checkout on completion, so any still-queryable checkout genuinely
  isn't an order yet) idle longer than `ABANDONED_CART_HOURS`, and
  emails a real resume link via the existing Mailpit/SMTP
  infrastructure. Verified live across three fresh test products —
  found and fixed a real Saleor quirk along the way (both
  `checkout.totalPrice` and per-line `totalPrice` can read as `0`
  immediately after `checkoutCreate`, before Saleor's lazy price
  calculation catches up); the fix computes the email total from each
  line's real-time `variant.pricing` instead. Idempotency (skip an
  already-reminded checkout) also verified live. Full detail in that
  app's own README. Not built: a scheduler (this is a script, meant for
  cron/Celery beat in a real deployment) and email content
  customization beyond plain text.

- **Product search & filtering** (`storefront/src/app/products/page.tsx`,
  `storefront/src/gql/products.graphql`): real search text, category,
  price range, and in-stock-only filters, plus name/price/newest
  sorting — all against Saleor's own native `ProductFilterInput`/
  `ProductOrder` GraphQL arguments (introspected against the live
  schema, not guessed), rendered as a plain `<form method="GET">` so
  filters are shareable/bookmarkable URLs with no client JS required.
  Verified live end-to-end with three fresh test products across two
  categories and varying price/stock — search, category, price range,
  in-stock, and sort each independently confirmed to include/exclude
  the right products.

  Two real, non-obvious findings along the way: (1) Saleor's product
  search is backed by a Postgres `search_vector` column populated by
  an **async Celery task** (`set_product_search_document_values`), not
  updated synchronously on product creation — a freshly created
  product is genuinely unsearchable until that task runs (triggered
  here via `python manage.py update_search_indexes`; a real deployment
  needs this scheduled, e.g. Celery Beat, not just a worker). (2) The
  storefront's shared urql client used a cache-first request policy by
  default; since search results depend on this async indexing, an
  empty result queried before indexing finished was cached
  **indefinitely** (no TTL, module-level client reused across
  requests) and kept being served stale even after the same product
  became searchable — fixed by setting `requestPolicy: "network-only"`
  on this query, since search/filter results must always reflect
  current data. All three test products and the test category were
  deleted afterward.

## Not done, and honestly can't be "finished" without real accounts

- **Reviews & ratings** — no reviews platform (Yotpo/Judge.me-style)
  account exists to integrate.
- **Loyalty/referral program** — no such system chosen or built; this is
  a real product-design decision (points? cashback? tiers?) as much as an
  integration, not something to invent unprompted.
- **Faceted search/recommendations beyond Saleor's own filters** — a
  real Algolia/Klevu-style experience (typo tolerance, ML
  recommendations, synonym handling) would need a real external search
  provider account; what Saleor's own schema natively supports (text
  search, category/price/stock filters, sorting) is now wired in.
- **Multi-channel push (Amazon, Google Shopping, Meta/Instagram Shop)** —
  each needs its own seller/merchant account and API credentials this
  project doesn't have.

None of these were faked or stubbed to look further along than they are.
