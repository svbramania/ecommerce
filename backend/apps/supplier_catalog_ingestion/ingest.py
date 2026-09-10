"""Reference supplier catalog ingestion — the CSV/price/stock-sync half of
Phase 2's supplier & fulfillment layer (see docs/phase-2-fulfillment.md).

The contract a real supplier feed follows, whether it actually arrives via
SFTP drop, an uploaded file, or an API pull: rows of (sku, name, price,
quantity). How the file *arrives* varies by supplier and isn't built here
(no real supplier account exists yet to design that against) — this is
the reusable Saleor-side half: validate the file, then upsert.

Security-checklist item be-uploads: content-type/size/structure are
checked before anything in the file is trusted, not just assumed.

Usage:
    python3 ingest.py --file catalog.csv --api-url http://localhost:8000/graphql/ \
        --token <staff or app token> --channel-id <id> --warehouse-id <id> \
        --product-type-id <id> --category-id <id> [--dry-run]
"""
from __future__ import annotations

import argparse
import csv
import json
import logging
import sys
import urllib.request
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("supplier_catalog_ingestion")

REQUIRED_COLUMNS = {"sku", "name", "price", "quantity"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB — a supplier catalog is rows of
# text, not something that legitimately needs to be larger; reject rather
# than stream an unbounded file into memory.


@dataclass
class CatalogRow:
    sku: str
    name: str
    price: float
    quantity: int


class ValidationError(Exception):
    pass


def load_and_validate_csv(path: str) -> list[CatalogRow]:
    with open(path, "rb") as f:
        raw = f.read(MAX_FILE_BYTES + 1)
    if len(raw) > MAX_FILE_BYTES:
        raise ValidationError(f"File exceeds the {MAX_FILE_BYTES} byte limit — rejected.")

    # A real content-type/signature check, not just trusting the .csv
    # extension: reject anything that isn't decodable as text outright
    # (e.g. a renamed binary/executable), matching be-uploads.
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as err:
        raise ValidationError(f"File is not valid UTF-8 text — rejected: {err}")

    reader = csv.DictReader(text.splitlines())
    if reader.fieldnames is None or not REQUIRED_COLUMNS.issubset(set(reader.fieldnames)):
        raise ValidationError(
            f"CSV must have columns {sorted(REQUIRED_COLUMNS)}, "
            f"found {reader.fieldnames}"
        )

    rows: list[CatalogRow] = []
    for i, raw_row in enumerate(reader, start=2):  # row 1 is the header
        sku = raw_row["sku"].strip()
        name = raw_row["name"].strip()
        if not sku or not name:
            raise ValidationError(f"Row {i}: sku and name are required, got {raw_row}")
        try:
            price = float(raw_row["price"])
            quantity = int(raw_row["quantity"])
        except ValueError as err:
            raise ValidationError(f"Row {i}: price/quantity must be numeric — {err}")
        if price < 0 or quantity < 0:
            raise ValidationError(f"Row {i}: price/quantity cannot be negative")
        rows.append(CatalogRow(sku=sku, name=name, price=price, quantity=quantity))

    if not rows:
        raise ValidationError("CSV has a valid header but no data rows.")
    return rows


class SaleorClient:
    def __init__(self, api_url: str, token: str):
        self.api_url = api_url
        self.token = token

    def call(self, query: str, variables: dict) -> dict:
        body = json.dumps({"query": query, "variables": variables}).encode()
        req = urllib.request.Request(
            self.api_url,
            data=body,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.token}"},
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
        if "errors" in result:
            raise RuntimeError(result["errors"])
        return result["data"]


FIND_VARIANT = """
query($sku: String) { productVariant(sku: $sku) { id product { id } } }
"""

CREATE_PRODUCT = """
mutation($name: String!, $productType: ID!, $category: ID!) {
  productCreate(input: {name: $name, productType: $productType, category: $category}) {
    product { id }
    errors { field message }
  }
}
"""

PUBLISH_PRODUCT = """
mutation($id: ID!, $channel: ID!) {
  productChannelListingUpdate(id: $id, input: {updateChannels: [{
    channelId: $channel, isPublished: true, visibleInListings: true,
    isAvailableForPurchase: true, availableForPurchaseAt: "2020-01-01T00:00:00Z"
  }]}) { errors { field message } }
}
"""

CREATE_VARIANT = """
mutation($product: ID!, $sku: String!) {
  productVariantCreate(input: {product: $product, sku: $sku, trackInventory: true, attributes: []}) {
    productVariant { id }
    errors { field message }
  }
}
"""

SET_PRICE = """
mutation($id: ID!, $channel: ID!, $price: PositiveDecimal!) {
  productVariantChannelListingUpdate(id: $id, input: [{channelId: $channel, price: $price}]) {
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

UPDATE_STOCK = """
mutation($variantId: ID!, $warehouse: ID!, $quantity: Int!) {
  productVariantStocksUpdate(variantId: $variantId, stocks: [{warehouse: $warehouse, quantity: $quantity}]) {
    errors { field message }
  }
}
"""


def upsert_row(client: SaleorClient, row: CatalogRow, *, channel_id: str, warehouse_id: str,
                product_type_id: str, category_id: str, dry_run: bool) -> None:
    existing = client.call(FIND_VARIANT, {"sku": row.sku})["productVariant"]

    if dry_run:
        action = "update" if existing else "create"
        logger.info("[dry-run] would %s sku=%s name=%r price=%s qty=%s",
                    action, row.sku, row.name, row.price, row.quantity)
        return

    if existing:
        variant_id = existing["id"]
        client.call(SET_PRICE, {"id": variant_id, "channel": channel_id, "price": row.price})
        client.call(UPDATE_STOCK, {"variantId": variant_id, "warehouse": warehouse_id,
                                     "quantity": row.quantity})
        logger.info("Updated sku=%s price=%s qty=%s", row.sku, row.price, row.quantity)
        return

    product = client.call(CREATE_PRODUCT, {"name": row.name, "productType": product_type_id,
                                             "category": category_id})["productCreate"]["product"]
    client.call(PUBLISH_PRODUCT, {"id": product["id"], "channel": channel_id})
    variant = client.call(CREATE_VARIANT, {"product": product["id"], "sku": row.sku}
                           )["productVariantCreate"]["productVariant"]
    client.call(SET_PRICE, {"id": variant["id"], "channel": channel_id, "price": row.price})
    client.call(CREATE_STOCK, {"variantId": variant["id"], "warehouse": warehouse_id,
                                 "quantity": row.quantity})
    logger.info("Created sku=%s name=%r price=%s qty=%s", row.sku, row.name, row.price, row.quantity)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True)
    parser.add_argument("--api-url", required=True)
    parser.add_argument("--token", required=True)
    parser.add_argument("--channel-id", required=True)
    parser.add_argument("--warehouse-id", required=True)
    parser.add_argument("--product-type-id", required=True)
    parser.add_argument("--category-id", required=True)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    try:
        rows = load_and_validate_csv(args.file)
    except ValidationError as err:
        logger.error("Rejected %s: %s", args.file, err)
        return 1

    logger.info("Validated %d row(s) in %s", len(rows), args.file)
    client = SaleorClient(args.api_url, args.token)

    failures = 0
    for row in rows:
        try:
            upsert_row(client, row, channel_id=args.channel_id, warehouse_id=args.warehouse_id,
                       product_type_id=args.product_type_id, category_id=args.category_id,
                       dry_run=args.dry_run)
        except Exception:
            logger.exception("Failed to upsert sku=%s", row.sku)
            failures += 1

    logger.info("Done: %d row(s), %d failure(s)", len(rows), failures)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
