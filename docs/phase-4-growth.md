# Phase 4 — Growth & retention

Status as of 2026-09-10: **in progress** — three real pieces done, the
rest genuinely blocked on third-party accounts this project doesn't have.

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

## Not done, and honestly can't be "finished" without real accounts

- **Reviews & ratings** — no reviews platform (Yotpo/Judge.me-style)
  account exists to integrate.
- **Loyalty/referral program** — no such system chosen or built; this is
  a real product-design decision (points? cashback? tiers?) as much as an
  integration, not something to invent unprompted.
- **Real search + facets + recommendations** — Saleor's own `products`
  query supports basic filtering, but a real faceted-search/recommendation
  experience (Algolia/Klevu-style) needs a real search provider account
  and, more importantly, a real product catalog to index — there are zero
  real products yet (see docs/phase-1-mvp.md).
- **Multi-channel push (Amazon, Google Shopping, Meta/Instagram Shop)** —
  each needs its own seller/merchant account and API credentials this
  project doesn't have.

None of these were faked or stubbed to look further along than they are.
