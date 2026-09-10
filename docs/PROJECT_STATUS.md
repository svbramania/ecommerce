# Project status — all 5 phases

As of 2026-09-09. One-line-per-phase honest summary; each phase's own doc
has the full detail. Nothing below is rounded up.

| Phase | Status | Real, verified work | What's actually blocking the rest |
|---|---|---|---|
| 0 — Foundation | **Done** | Local Saleor + Postgres + Redis + Next.js storefront, all live-verified, CI in place | — |
| 1 — MVP store | **In progress** | Cart/checkout (address, shipping method, promo codes), rich-text descriptions, full customer accounts (register/confirm/login/logout/reset), CSP on checkout+cart — all live-verified against temporary test data | Payment/order-completion needs real Stripe test keys (user-provided); a real product catalog doesn't exist yet; a real shipping price and tax are business/account decisions |
| 2 — Supplier/fulfillment | **Done** (for the reference connector + CSV ingestion; a real 3PL/supplier is separate work) | Full fulfillment chain live-verified end to end; supplier CSV ingestion live-verified (validation, create, update, a real bug caught and fixed) | A real 3PL's/supplier's own catalog/API to integrate for real; backorders; bundle/kit SKUs |
| 3 — Scale (shipping/tax/BNPL/fraud/currency) | **Not started** | — | Every item needs a real third-party account (EasyPost/Shippo, Avalara/TaxJar, Affirm/Klarna, Signifyd/Riskified) this project doesn't have |
| 4 — Growth & retention | **Barely started** | Real discount/promo code redemption, live-verified (10% voucher, $100→$90) | Abandoned-cart email/SMS, reviews, loyalty, real search, multi-channel selling all need real third-party accounts or product decisions not yet made |
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

All pushed to `origin/main` at
[github.com/svbramania/ecommerce](https://github.com/svbramania/ecommerce).
