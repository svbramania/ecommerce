# Supplier catalog ingestion (reference)

The other half of Phase 2's supplier/fulfillment layer — see
`backend/apps/fulfillment_webhook_receiver/` for the order-out direction
(3PL fulfillment); this is the catalog-in direction (supplier price/stock
sync).

## The contract

A CSV with exactly these columns: `sku, name, price, quantity`. This is
deliberately the smallest real contract that lets a supplier feed create
or update products — real suppliers will have their own formats (and some
will arrive via SFTP or an API instead of a plain CSV upload), but the
Saleor-side upsert logic here (look up by SKU, update if it exists,
create if it doesn't) is the reusable part regardless of transport.

## Usage

```bash
python3 ingest.py \
  --file catalog.csv \
  --api-url http://localhost:8000/graphql/ \
  --token <a staff or scoped-app token> \
  --channel-id <channel id> \
  --warehouse-id <warehouse id> \
  --product-type-id <product type id> \
  --category-id <category id> \
  [--dry-run]
```

`--dry-run` logs what would happen without writing anything — use it to
check a new supplier's file before trusting it.

## Verified live (2026-09-09)

- Rejects a CSV missing a required column, a non-numeric price, and a
  binary file renamed to `.csv` — all three tested directly
  (security-checklist item `be-uploads`).
- A real dry-run against the local stack correctly identified two new
  SKUs as creates.
- A real run created both products, correctly published and visible in
  the storefront's own `products(channel: ...)` query (a bug — missing
  `visibleInListings` — was found and fixed during this verification, not
  before).
- Re-running with changed price/quantity on an existing SKU correctly
  updated it in place rather than creating a duplicate.
- Test products deleted afterward.

## Not built

- Backorder handling (selling below zero stock with a promise date) and
  bundle/kit SKUs (Saleor has no native product-bundle concept — this
  would need a custom model mapping one "bundle" variant to several
  component variants, decremented together) — both real, separate design
  work, not done in this pass.
- The actual SFTP/API delivery mechanism for a real supplier's feed — no
  real supplier exists yet to design that against.
