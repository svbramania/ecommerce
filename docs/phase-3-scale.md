# Phase 3 — Scale payments, tax, shipping

Status as of 2026-09-09: **not started**. Every item in this phase
requires a real third-party account this project doesn't have — nothing
here can be honestly built without either those credentials or fabricating
behavior, and this project's whole approach has been to do neither.

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
