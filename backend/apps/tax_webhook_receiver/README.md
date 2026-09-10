# Tax webhook receiver (Saleor Tax App for TaxJar)

Implements `CHECKOUT_CALCULATE_TAXES`, the sync webhook Saleor calls
whenever a checkout's totals need real tax. Contract verified against
Saleor's tax-events docs and the live schema before writing.

## Setup (already done once for local dev)

1. Created the app (`identifier: "custom.tax.taxjar"`, permission
   `HANDLE_TAXES`) and registered the webhook with a subscription query
   selecting `taxBase` (currency, address, lines, shippingPrice).
2. **The channel's tax configuration must point at this app** — creating
   the webhook alone isn't enough. Saleor defaults every channel to
   `FLAT_RATES` (its own built-in tables); switching to the app requires:
   ```graphql
   mutation {
     taxConfigurationUpdate(id: "<channel's TaxConfiguration id>", input: {
       taxCalculationStrategy: TAX_APP
       taxAppId: "custom.tax.taxjar"
       chargeTaxes: true
     }) { errors { field message code } }
   }
   ```
   Already applied to `default-channel` locally.

## Verified live (2026-09-10)

- Real TaxJar sandbox API call, confirmed directly against TaxJar with no
  origin configured: `has_nexus: false`, `$0` tax — correct, not a bug.
- With a **temporary** matching origin/destination override (proving the
  mechanism, not a real business address — reverted afterward, see
  `backend/tax.env`): TaxJar returned a real 10.25% Springfield, IL rate.
- **Through Saleor's own checkout**, not just this service directly: a
  real checkout's `totalPrice.gross` came back as $27.56 on a $25.00 net
  subtotal — the exact TaxJar-calculated tax, applied automatically by
  Saleor once the channel's tax config pointed at this app.
- Origin reverted to empty afterward — every real checkout right now
  correctly shows $0 tax until a real ship-from address is configured
  (see `backend/tax.env.example`), which is honest behavior for a
  business without an established nexus, not a broken integration.

## Not built

- `ORDER_CALCULATE_TAXES` (re-calculating tax after an order is edited
  post-purchase) — same contract shape, not registered yet.
- Multiple ship-from locations (only one `TAX_ORIGIN_*` address is
  supported) — fine for a single-warehouse business, a real limitation
  for a multi-warehouse one.
