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

## Blocked — needs your decision (not made silently)

Webhook delivery itself failed live with `Forbidden IP address ...
Invalid IP address` — Saleor's own SSRF protection
(`HTTP_IP_FILTER_ENABLED`) refuses to call webhook targets on private IP
ranges by default, and the docker-compose internal network is one. Saleor's
own docs describe setting this to `False` for exactly this situation
("local apps development using docker host"), recommending `True` for
production (where a real 3PL's endpoint is a public HTTPS URL, not a
private IP). This wasn't changed here — the harness's own safety check
flagged editing a security-relevant setting as needing your explicit
sign-off rather than being done autonomously, and that's the right call
for a security toggle even when well-documented and narrowly scoped.

**To finish verifying this phase**: set `HTTP_IP_FILTER_ENABLED=False` in
`backend/common.env`, restart `api`/`worker`
(`docker compose restart api worker`), then repeat the draft-order test
above and confirm in `docker compose logs fulfillment-webhook` that it
received the webhook and successfully called `orderFulfill` +
`orderFulfillmentUpdateTracking`.

## Not done yet

- Supplier catalog ingestion (CSV/SFTP/API sync of price + stock) — no
  real supplier or their feed format exists to build against yet.
- A second, real 3PL connector (this reference implementation stands in
  for "any 3PL following the contract," but no actual 3PL account/API
  exists to integrate for real).
- Backorder handling, bundle/kit SKUs.
