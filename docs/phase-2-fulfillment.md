# Phase 2 — Supplier & fulfillment layer

Status as of 2026-09-09: **in progress**. This phase is the project's core
differentiator (Shopify-equivalent supplier/3PL integration experience),
so it's tracked in the most detail.

## Done and verified

- **Standardized order → 3PL contract, built and running**:
  `backend/apps/fulfillment_webhook_receiver/` — a reference "fulfillment
  service" connector matching the pattern described in
  `docs/architecture.md`. A real Saleor App was created
  (`appCreate`, permissions `MANAGE_ORDERS`/`MANAGE_SHIPPING`) and a real
  webhook registered against it (`webhookCreate`, `ORDER_CREATED`, using a
  subscription query rather than the legacy fixed payload, so the exact
  payload shape is explicit and versioned). The receiver itself (stdlib
  Python, no framework dependency) verifies Saleor's HMAC webhook
  signature, then calls back into Saleor with `orderFulfill` +
  `orderFulfillmentUpdateTracking` — the same two mutations a real 3PL's
  system would call once it has actually shipped something. Running as its
  own docker-compose service (`fulfillment-webhook`).
- **A real order was placed to test this** (`draftOrderCreate` +
  `draftOrderComplete` — Saleor's manual-order flow, which doesn't need a
  payment gateway, so this didn't wait on Phase 1's Stripe blocker) and
  confirmed `UNFULFILLED` status, proving the order side of the contract
  is real.

## Full chain verified live (2026-09-10, user-approved)

`HTTP_IP_FILTER_ENABLED=False` set in `backend/common.env` (local dev
only — see the comment there) after explicit user approval. Re-ran the
draft-order test with a fresh test product and confirmed, in order:

1. `fulfillment-webhook` logs: `POST /webhooks/order-created HTTP/1.1" 200`
2. `Created 1 fulfillment(s) for order ...`
3. `Tracking number set on fulfillment ...`
4. A fresh `order(id: ...)` query showed `status: FULFILLED`, a real
   fulfillment with `trackingNumber: "TEST-TRACKING-0001"`, and the
   correct line/product/quantity.

The test product was deleted afterward; the test order itself is
harmless local-only DB state (not part of the repo, never committed).
This is the complete, real "Shopify-equivalent" 3PL contract: an order
placed → a 3PL's system notified → fulfillment + tracking pushed back —
proven working end-to-end, not just written.

## Supplier catalog ingestion — done, verified live

`backend/apps/supplier_catalog_ingestion/` — a CSV (sku, name, price,
quantity) upsert tool. Verified live: rejects a malformed CSV (missing
column, non-numeric price, a binary file renamed to `.csv`), a real
dry-run correctly identified new SKUs, a real run created two real
products (catching and fixing a real bug — missing `visibleInListings` —
along the way), and re-running with changed values correctly updated
them in place instead of duplicating. Full detail in that directory's own
README. What's *not* built: the actual delivery mechanism for a real
supplier's feed (SFTP/API) — no real supplier exists yet to design that
against; this tool is the reusable Saleor-side upsert logic regardless of
how the file arrives.

## Not done yet

- A second, real 3PL connector (this reference implementation stands in
  for "any 3PL following the contract," but no actual 3PL account/API
  exists to integrate for real).
- Backorder handling, bundle/kit SKUs — real, separate design work
  (Saleor has no native bundle concept), not started.
