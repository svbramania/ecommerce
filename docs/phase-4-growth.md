# Phase 4 — Growth & retention

Status as of 2026-09-09: **barely started** — one real piece done, the
rest genuinely blocked on third-party accounts this project doesn't have.

## Done and verified

- **Discount/promo codes**: `checkoutAddPromoCode`/`checkoutRemovePromoCode`
  wired into the checkout page (`storefront/src/components/PromoCodeForm.tsx`).
  Verified live end-to-end with a real voucher (10% off, `TESTCODE10`,
  created via `voucherCreate`/`voucherChannelListingUpdate`): a $100
  checkout correctly became $90 with `discount.amount: 10` after applying
  the code. Both the test product and the test voucher were deleted
  afterward — nothing fake left active in the running system.

## Not done, and honestly can't be "finished" without real accounts

- **Abandoned-cart email/SMS flows** — needs a real email/SMS provider
  account (the local Mailpit catcher from Phase 0 proves email *can* be
  sent, but there's no real transactional-email or SMS provider
  configured).
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
