# Project status — all 5 phases

As of 2026-09-10. One-line-per-phase honest summary; each phase's own doc
has the full detail. Nothing below is rounded up.

| Phase | Status | Real, verified work | What's actually blocking the rest |
|---|---|---|---|
| 0 — Foundation | **Done** | Local Saleor + Postgres + Redis + Next.js storefront, all live-verified, CI in place | — |
| 1 — MVP store | **In progress — payment, 3DS, order history done** | Cart/checkout, rich-text descriptions, full customer accounts, CSP, a full Stripe payment integration (real Payment App, real Stripe Elements, a real order with `isPaid: true`), **3D Secure challenge flow**, and **order history on the account page** (with checkout-customer-attach on login) — all live-verified | A real product catalog doesn't exist yet; a real shipping price and tax are business/account decisions; the full 3DS charge-to-order path is verified only up through the challenge rendering correctly (the challenge click-through itself couldn't be automated) |
| 2 — Supplier/fulfillment | **Done** (for the reference connector + CSV ingestion; a real 3PL/supplier is separate work) | Full fulfillment chain live-verified end to end; supplier CSV ingestion live-verified; **backorders** (Saleor's native preorder mechanism, no new code) and **bundle/kit SKUs** (custom stock-sync script) both live-verified | A real 3PL's/supplier's own catalog/API to integrate for real |
| 3 — Scale (shipping/tax/BNPL/fraud/currency) | **Multi-currency, tax, shipping done; PayPal backend done** | Multi-currency (real 2nd channel), TaxJar (real checkout tax), EasyPost (real checkout shipping rates) — all live-verified through Saleor's own checkout. PayPal: real order creation + approval URL + correctly-handled decline, verified directly and through Saleor, storefront redirect flow built | PayPal's buyer-approval click-through not completed (PayPal's own hosted form, not our code); fraud screening (Stripe Radar's basic tier is already active, nothing more built); real origin addresses for tax/shipping are business decisions |
| 4 — Growth & retention | **In progress** | Real discount/promo code redemption ($100→$90 voucher); **abandoned-cart email reminders** (real stale-checkout detection + email, a real Saleor price-lag quirk found and fixed); **product search/filtering** (real search/category/price/stock filters + sorting against Saleor's native schema, a real async-search-indexing quirk and a real urql stale-cache bug found and fixed) — all live-verified | Reviews, loyalty, faceted/ML search beyond Saleor's own filters, and multi-channel selling all need real third-party accounts or product decisions not yet made |
| 5 — Platform/ecosystem | **Not started, deliberately** | — | Depends on an unanswered strategic question: single store vs. multi-merchant platform (see docs/phase-5-platform.md) |

## What "finish all 5 phases" actually required, and why it wasn't possible

Phases 3, 4 (mostly), and 5 each depend on either a real third-party
account/credential this session doesn't have (payment processor beyond
sandbox, tax engine, carrier-rate API, fraud screening, BNPL provider,
search/reviews/loyalty platforms, marketplace seller accounts) or a
business/strategic decision only the user can make (a real shipping
price, which markets/currencies to support, single-store vs. platform).
Building fake versions of any of these would have violated this project's
own non-fabrication rule from the start of this work. Instead, every
phase's own doc states plainly what's real, what's tested, and exactly
what unblocks the next piece — so nothing is lost and nothing is
overclaimed.

## Every commit, in order

1. `03db9a0` — Phase 0 foundation
2. `e966cba` — Phase 1 product listing (started)
3. `abfd71f` — Phase 1 cart/checkout (verified end-to-end)
4. `2c08127` — Phase 2 fulfillment webhook contract
5. `5c3e4ac` — Phase 4 discount/promo codes (started)
6. `163ee4e` — Security checklist mapping, Stripe payments, supplier CSV ingestion
7. `6e3ae15` — Abandoned-cart email reminders (Phase 4)
8. (this commit) — Product search/filtering (Phase 4)

All pushed to `origin/main` at
[github.com/svbramania/ecommerce](https://github.com/svbramania/ecommerce).
