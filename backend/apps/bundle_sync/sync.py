"""Bundle/kit SKU stock sync — Saleor has no native "bundle" concept, so
this is a real, custom design rather than a built-in feature (unlike
backorders, which turned out to just be Saleor's own preorder mechanism —
see docs/phase-2-fulfillment.md).

A "bundle" is an ordinary Saleor product/variant (its own SKU, price,
real stock row) whose metadata records which real component SKUs and
quantities it's made of:

    bundle_components = '[{"sku": "WIDGET-A", "quantity": 2}, {"sku": "WIDGET-B", "quantity": 1}]'

This script finds every product with that metadata key, looks up each
component's real current stock, computes how many complete bundles could
be assembled right now (the minimum across components of
floor(component_stock / quantity_needed)), and writes that number as the
bundle's own stock via the real productVariantStocksUpdate mutation — so
Saleor's checkout (which already validates stock correctly, confirmed
live for backorders too) automatically stops selling a bundle the moment
any one component runs out, without any change to checkout/cart code.

Run on a schedule (cron/Celery beat) in a real deployment, whenever
component stock changes; this is a one-shot script, not a daemon.
"""
from __future__ import annotations

import json
import logging
import os
import sys
import urllib.error
import urllib.request

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("bundle_sync")

SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://localhost:8000/graphql/")
STAFF_TOKEN = os.environ["BUNDLE_SYNC_STAFF_TOKEN"]
WAREHOUSE_ID = os.environ["BUNDLE_SYNC_WAREHOUSE_ID"]
BUNDLE_METADATA_KEY = "bundle_components"


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


FIND_BUNDLES = """
query {
  products(first: 100, filter: {metadata: [{key: "bundle_components"}]}) {
    edges {
      node {
        id
        name
        metafield(key: "bundle_components")
        variants { id sku }
      }
    }
  }
}
"""

FIND_VARIANT_STOCK = """
query($sku: String) {
  productVariant(sku: $sku) {
    quantityAvailable
  }
}
"""

UPDATE_STOCK = """
mutation($variantId: ID!, $warehouse: ID!, $quantity: Int!) {
  productVariantStocksUpdate(variantId: $variantId, stocks: [{warehouse: $warehouse, quantity: $quantity}]) {
    errors { field message }
  }
}
"""

CREATE_STOCK = """
mutation($variantId: ID!, $warehouse: ID!, $quantity: Int!) {
  productVariantStocksCreate(variantId: $variantId, stocks: [{warehouse: $warehouse, quantity: $quantity}]) {
    errors { field message }
  }
}
"""


def sync_bundle(product: dict) -> None:
    raw = product.get("metafield")
    if not raw:
        return
    try:
        components = json.loads(raw)
    except json.JSONDecodeError:
        logger.error("Product %s has invalid bundle_components JSON, skipping", product["name"])
        return

    variants = product.get("variants") or []
    if not variants:
        logger.warning("Bundle %s has no variant, skipping", product["name"])
        return
    bundle_variant_id = variants[0]["id"]

    available_counts = []
    for component in components:
        sku, needed = component["sku"], component["quantity"]
        result = gql(FIND_VARIANT_STOCK, {"sku": sku})
        variant = result.get("productVariant")
        if not variant:
            logger.error("Bundle %s references unknown component SKU %s — treating as 0 available",
                         product["name"], sku)
            available_counts.append(0)
            continue
        available_counts.append(variant["quantityAvailable"] // needed)

    new_quantity = min(available_counts) if available_counts else 0
    logger.info("Bundle %r: components allow %d complete unit(s)", product["name"], new_quantity)

    update_result = gql(UPDATE_STOCK, {
        "variantId": bundle_variant_id, "warehouse": WAREHOUSE_ID, "quantity": new_quantity,
    })
    errors = update_result["productVariantStocksUpdate"]["errors"]
    if errors:
        # No stock row yet for this variant/warehouse — create one instead.
        create_result = gql(CREATE_STOCK, {
            "variantId": bundle_variant_id, "warehouse": WAREHOUSE_ID, "quantity": new_quantity,
        })
        create_errors = create_result["productVariantStocksCreate"]["errors"]
        if create_errors:
            logger.error("Failed to set stock for bundle %s: %s", product["name"], create_errors)


def main() -> int:
    result = gql(FIND_BUNDLES)
    bundles = [edge["node"] for edge in result["products"]["edges"]]
    logger.info("Found %d bundle product(s)", len(bundles))
    for bundle in bundles:
        sync_bundle(bundle)
    return 0


if __name__ == "__main__":
    sys.exit(main())
