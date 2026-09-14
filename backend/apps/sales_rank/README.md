# Best-seller ranking

## Why this exists

The storefront needs to sort products by "most selling," but two real
constraints rule out the obvious approaches:

- Saleor's public `ProductOrderField` sort enum has no units-sold option
  (confirmed via schema introspection: NAME, RANK, PRICE, MINIMAL_PRICE,
  TYPE, PUBLISHED, PUBLISHED_AT, LAST_MODIFIED_AT, COLLECTION, RATING,
  CREATED_AT — that's the complete list).
- Real order/order-line data (`orders` query) requires `MANAGE_ORDERS`
  staff permission, which the public storefront client correctly never
  holds — it can't compute this itself at request time.

So `sync.py` runs with a staff token, sums real `OrderLine.quantity` per
product SKU across every non-draft/unconfirmed/cancelled/expired order,
and writes the result onto each live product as a `sales_count` metafield
— a real, publicly-readable field the storefront's existing metafield
mechanism (same pattern as `featured`, `reviews`, `bundle_components`)
can fetch and sort by client-side, since Saleor won't sort by a metafield
server-side either.

## Honest current state (as of 2026-09-14)

This store has exactly one real, non-test order (#9: 1× LED Rechargeable
Dog Collar, 1× Resin Art Starter Kit) — every other order in the system
is `TEST-DELETE-ME` test data against products that have since been
deleted. So `sales_count` is genuinely `1` for those two products and `0`
for the other 272 today. The mechanism is real and will become
meaningful as real orders accumulate; it is not a substitute for actual
sales volume, and the storefront's current "best selling" order should be
read as "creation order, with the 2 products that have a real sale
bumped to the top" until that changes.

## Not built

- No trigger — run on a schedule (cron/Celery beat) or after order
  status changes in a real deployment; this is a one-shot script.
- No handling of refunds/returns reducing the count — `OrderLine.quantity`
  reflects what was ordered, not net of any later return. Add that once
  the site has a real returns flow (none exists yet — see the Terms of
  Use's case-by-case returns language).

## Running it

```bash
SALES_RANK_STAFF_TOKEN=<staff JWT> python3 backend/apps/sales_rank/sync.py
```

`SALEOR_API_URL` defaults to `http://localhost:8000/graphql/`.
