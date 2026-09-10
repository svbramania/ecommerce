# Phase 3 — Scale payments, tax, shipping

Status as of 2026-09-10: **multi-currency done and verified live**; every
other item still needs a real third-party account this project doesn't
have — nothing here can be honestly built without either those
credentials or fabricating behavior, and this project's whole approach
has been to do neither.

## Multi-currency — done, verified live

Saleor's channel model natively supports this — no third-party account
needed, just configuration. Created a second channel, `eu-channel` (EUR,
default country DE), as a real reference example — not a claim that
Germany/EUR is this business's actual target market, that's still a real
decision for the user. Verified live: the same product/variant, listed in
both channels with different prices ($12.50 in `default-channel`, €11.00
in `eu-channel`), correctly returned each channel's own price and
currency when queried anonymously — exactly what a real multi-currency
storefront needs. Test product deleted afterward; the `eu-channel` itself
was left in place as the working reference.

**Not yet built on top of this**: a storefront channel-switcher (the
Next.js app currently hardcodes `DEFAULT_CHANNEL = "default-channel"` in
`lib/checkout.ts`) and a real EU-covering shipping zone (the existing
"Default" zone only covers US) — both are real, quick follow-ups once an
actual second market is decided on, not done speculatively here.

- **Multi-carrier rate shopping** — needs a real EasyPost/Shippo-style
  account (or direct carrier accounts) to fetch real rates. Saleor's own
  shipping-zone/method model (confirmed live in Phase 1) is where a real
  integration would plug in — it already supports multiple methods per
  zone.
- **Automated multi-jurisdiction tax** — needs a real Avalara/TaxJar-style
  account. Saleor has a tax-app extension point for this.
- **BNPL (Affirm/Klarna-style)** — needs a real merchant account with one
  of these providers; also depends on Phase 1's payment gateway work
  (blocked on Stripe keys) being done first, since BNPL options typically
  surface at the same checkout step.
- **Fraud screening** — needs a real Signifyd/Riskified-style account.
- **Multi-currency / international pricing** — Saleor supports multiple
  channels with different currencies natively (the `default-channel` set
  up in Phase 1 is USD-only); adding a second currency is mostly a
  configuration/business decision (which markets, which currency) rather
  than an engineering blocker, but no such decision has been made yet.

**Next step for any of these**: get the real account/API keys, then this
becomes normal adapter-building work, the same shape as Phase 1's Stripe
integration point or Phase 2's fulfillment webhook contract.
