# Phase 3 — Scale payments, tax, shipping

Status as of 2026-09-10: **multi-currency, tax, and shipping rates done
and verified live; PayPal (BNPL) backend done and verified, storefront
redirect flow built but not click-through-tested; fraud screening not
started.**

## Multi-currency — done, verified live

Saleor's channel model natively supports this — no third-party account
needed, just configuration. Created a second channel, `eu-channel` (EUR,
default country DE), as a real reference example — not a claim that
Germany/EUR is this business's actual target market, that's still a real
decision for the user. Verified live: the same product/variant, listed in
both channels with different prices ($12.50 in `default-channel`, €11.00
in `eu-channel`), correctly returned each channel's own price and
currency when queried anonymously.

**Not yet built on top of this**: a storefront channel-switcher (the
Next.js app currently hardcodes `DEFAULT_CHANNEL = "default-channel"` in
`lib/checkout.ts`).

## Automated tax (TaxJar) — done, verified live

See `backend/apps/tax_webhook_receiver/README.md`. Real TaxJar sandbox
calls; a real checkout's total correctly reflected a real 10.25% rate
once the channel's tax configuration was switched to `TAX_APP`. Origin
address is genuinely unset (no real business address yet), so every real
order currently shows $0 tax — correct behavior for a business without
established nexus, not a bug.

## Shipping rates (EasyPost) — done, verified live

See `backend/apps/shipping_webhook_receiver/README.md`. Real EasyPost
sandbox rates (USPS, FedEx) appeared automatically in a real checkout's
`shippingMethods` and were selectable, updating `shippingPrice` to the
exact real quote. Ship-from address is genuinely unset, so real checkouts
currently show only the internal "Default" method.

## BNPL (PayPal) — backend done and verified; storefront built, not fully click-tested

See `backend/apps/payment_webhook_receiver/README.md`'s PayPal section.
Real order creation, real approval URL, and a real correctly-handled
`ORDER_NOT_APPROVED` capture failure are all verified directly against
PayPal's sandbox API and through Saleor's own `transactionInitialize`.
The storefront's "Pay with PayPal" button and `/paypal-return` page are
built, following the same redirect pattern PayPal's API requires. **What's
not done**: clicking all the way through PayPal's own hosted checkout
form in a real browser — attempted, but the form didn't advance past
account creation for reasons that couldn't be confirmed (possibly
PayPal's own bot-detection). The buyer-approval half of the loop needs
either a real sandbox buyer account or the user completing one checkout
themselves.

## Fraud screening (Stripe Radar) — not separately built

Radar's basic tier is active by default the moment real Stripe keys
exist (already the case) — nothing extra to build for the basic tier.
Advanced Radar rules/review queues are a dashboard-configuration
decision for the user, not code.

**Next step for anything remaining**: mostly business decisions now
(a real ship-from address unlocks real tax/shipping numbers; a real
second market decision unlocks the currency switcher) rather than more
integration work.
