# Bundle/kit SKU stock sync

Saleor has no native "bundle" concept (confirmed by schema search — no
field or mutation anywhere resembles it), unlike backorders, which turned
out to already be a real, built-in Saleor feature (its "preorder"
mechanism — see `docs/phase-2-fulfillment.md`, no code needed there).
This is genuinely custom design.

## The model

A bundle is an ordinary Saleor product/variant — its own SKU, price, and
real stock row — whose metadata records the real components it's made
of:

```
bundle_components = '[{"sku": "WIDGET-A", "quantity": 2}, {"sku": "WIDGET-B", "quantity": 1}]'
```

`sync.py` finds every product with that metadata key, looks up each
component's *real* current stock via Saleor's own `quantityAvailable`,
computes `min(component_stock // quantity_needed)` across all components,
and writes that number as the bundle's own stock via the real
`productVariantStocksUpdate`/`productVariantStocksCreate` mutations.
Saleor's checkout (already proven correct for backorders too) then
enforces that number automatically — no checkout/cart code needed at all,
only this stock number has to stay in sync with reality.

Run it whenever component stock changes — a cron job or Celery Beat task
in a real deployment; this script is one-shot, not a daemon.

## Verified live (2026-09-10)

Created two real component products (Widget A: 8 in stock, needs 2 per
bundle → 4 possible; Widget B: 3 in stock, needs 1 per bundle → 3
possible) and one bundle product with the metadata above (no stock row
of its own yet). Running `sync.py`:

- Correctly computed `min(4, 3) = 3` and created the bundle's stock row.
- A real checkout attempting to buy 4 bundles was correctly rejected
  (`INSUFFICIENT_STOCK`, "Only 3 remaining in stock").
- A real checkout for 3 bundles succeeded at the correct total ($90).
- Reduced Widget B's stock to 1 and re-ran the script — the bundle's
  stock correctly recalculated to `min(4, 1) = 1`, using
  `productVariantStocksUpdate` this time since a stock row already
  existed.

All three test products deleted afterward.

## Not built

- No trigger — this needs to be run on a schedule or hooked to a
  component's stock-change event (e.g. a webhook on stock updates) in a
  real deployment; it's a script, not a running service.
- No storefront UI for *creating* a bundle (staff would set the
  `bundle_components` metadata directly via the Dashboard's metadata
  editor or the API) — only *displaying* one is built
  (`storefront/src/app/products/[slug]/page.tsx` shows the component list
  when present).
