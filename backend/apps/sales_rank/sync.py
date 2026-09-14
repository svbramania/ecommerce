"""Best-seller ranking sync — Saleor's storefront-facing GraphQL API has no
native "sort by units sold" field (confirmed via schema introspection of
ProductOrderField: only NAME, RANK, PRICE, MINIMAL_PRICE, TYPE, PUBLISHED,
PUBLISHED_AT, LAST_MODIFIED_AT, COLLECTION, RATING, CREATED_AT exist), and
real order/order-line data requires MANAGE_ORDERS staff permission, which
the public storefront client correctly never holds. So "best selling" has
to be computed here, server-side with a staff token, and published back
onto each product as a real, publicly-readable metafield the storefront
can sort by — the same pattern bundle_sync uses for bundle_components.

This script sums real OrderLine.quantity per product SKU across every
non-draft, non-cancelled, non-expired order, then writes that integer as
each live product's `sales_count` metafield (0 for products with no real
sales yet — written explicitly so the storefront can always trust the
field is present, never ambiguous between "no data" and "zero sold").

Run on a schedule (cron/Celery beat) in a real deployment, whenever new
orders come in; this is a one-shot script, not a daemon.
"""
from __future__ import annotations

import json
import logging
import os
import sys
import urllib.error
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("sales_rank")

SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://localhost:8000/graphql/")
STAFF_TOKEN = os.environ["SALES_RANK_STAFF_TOKEN"]
SALES_COUNT_METADATA_KEY = "sales_count"

# Orders in these statuses represent no real, confirmed customer demand —
# a draft was never placed, an unconfirmed order isn't final, and
# cancelled/expired orders didn't result in a real sale.
EXCLUDED_ORDER_STATUSES = {"DRAFT", "UNCONFIRMED", "CANCELED", "EXPIRED"}


def gql(query: str, variables: dict | None = None) -> dict:
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        SALEOR_API_URL,
        data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {STAFF_TOKEN}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as err:
        logger.error("GraphQL request failed: %s", err.read())
        raise
    if "errors" in result:
        raise RuntimeError(result["errors"])
    return result["data"]


FETCH_ORDERS = """
query($after: String) {
  orders(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        status
        lines { productSku quantity }
      }
    }
  }
}
"""

FETCH_ALL_PRODUCTS = """
query($after: String) {
  products(first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        variants { sku }
      }
    }
  }
}
"""

UPDATE_METADATA = """
mutation($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    errors { field message }
  }
}
"""


def fetch_all(query: str, key: str) -> list[dict]:
    nodes: list[dict] = []
    after = None
    while True:
        data = gql(query, {"after": after})
        connection = data[key]
        nodes.extend(edge["node"] for edge in connection["edges"])
        if not connection["pageInfo"]["hasNextPage"]:
            break
        after = connection["pageInfo"]["endCursor"]
    return nodes


def compute_sales_by_sku() -> dict[str, int]:
    orders = fetch_all(FETCH_ORDERS, "orders")
    counts: dict[str, int] = {}
    skipped_statuses: dict[str, int] = {}
    for order in orders:
        if order["status"] in EXCLUDED_ORDER_STATUSES:
            skipped_statuses[order["status"]] = skipped_statuses.get(order["status"], 0) + 1
            continue
        for line in order["lines"]:
            sku = line["productSku"]
            if not sku:
                continue
            counts[sku] = counts.get(sku, 0) + line["quantity"]
    logger.info("Scanned %d orders; skipped by status: %s", len(orders), skipped_statuses)
    return counts


def main() -> int:
    sales_by_sku = compute_sales_by_sku()
    logger.info("Real sales found for %d distinct SKU(s)", len(sales_by_sku))

    products = fetch_all(FETCH_ALL_PRODUCTS, "products")
    logger.info("Writing sales_count metafield on %d product(s)", len(products))

    written, errors_count = 0, 0
    for product in products:
        skus = [v["sku"] for v in (product.get("variants") or []) if v.get("sku")]
        total = sum(sales_by_sku.get(sku, 0) for sku in skus)
        result = gql(UPDATE_METADATA, {
            "id": product["id"],
            "input": [{"key": SALES_COUNT_METADATA_KEY, "value": str(total)}],
        })
        errors = result["updateMetadata"]["errors"]
        if errors:
            errors_count += 1
            logger.error("Failed to set sales_count for product %s: %s", product["id"], errors)
        else:
            written += 1

    logger.info("Done: %d product(s) updated, %d error(s)", written, errors_count)
    return 0 if errors_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
