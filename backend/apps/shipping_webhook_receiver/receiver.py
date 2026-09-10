"""Saleor Shipping App for EasyPost — implements
SHIPPING_LIST_METHODS_FOR_CHECKOUT, called whenever a checkout's
available shipping methods are queried. Contract verified against
Saleor's shipping-events docs and the live schema before writing — see
this directory's README.md.

Real EasyPost API call (POST /v2/shipments) per request. Needs a real
ship-from address and package dimensions/weight to return real rates —
see SHIP_FROM_* below and the weight fallback note in build_shipment_request.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("shipping_webhook_receiver")

WEBHOOK_SECRET = os.environ["SHIPPING_WEBHOOK_SECRET"]
EASYPOST_API_KEY = os.environ["EASYPOST_API_KEY"]
EASYPOST_API = "https://api.easypost.com/v2"

# This business's real ship-from address — genuinely unset until
# supplied (same honesty note as tax_webhook_receiver's TAX_ORIGIN_*).
# Without it, no real EasyPost shipment can be quoted, so this returns an
# empty rate list rather than fabricate an origin.
SHIP_FROM = {
    "name": os.environ.get("SHIP_FROM_NAME", "Store"),
    "street1": os.environ.get("SHIP_FROM_STREET"),
    "city": os.environ.get("SHIP_FROM_CITY"),
    "state": os.environ.get("SHIP_FROM_STATE"),
    "zip": os.environ.get("SHIP_FROM_ZIP"),
    "country": os.environ.get("SHIP_FROM_COUNTRY"),
}

# Fallback used only when a variant has no weight set in Saleor (real
# catalogs should set this per-product for accurate rates) — 1 lb, a
# reasonable small-parcel default, not a claim about any specific product.
FALLBACK_WEIGHT_OZ = 16.0


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    if not signature_header:
        return False
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def to_ounces(weight: dict | None) -> float:
    if not weight or weight.get("value") is None:
        return FALLBACK_WEIGHT_OZ
    value, unit = weight["value"], weight["unit"]
    conversions = {"OZ": 1, "LB": 16, "KG": 35.274, "G": 0.035274}
    return value * conversions.get(unit, 1)


def call_easypost(shipment: dict) -> dict:
    body = json.dumps({"shipment": shipment}).encode()
    auth = base64.b64encode(f"{EASYPOST_API_KEY}:".encode()).decode()
    req = urllib.request.Request(
        f"{EASYPOST_API}/shipments",
        data=body,
        headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as err:
        detail = json.loads(err.read())
        logger.warning("EasyPost request failed: %s", detail)
        raise


def handle_list_methods(payload: dict) -> list[dict]:
    checkout = payload["checkout"]
    address = checkout.get("shippingAddress")
    if not address or not all(SHIP_FROM.values()):
        logger.info("No shipping address yet, or SHIP_FROM_* not configured — no rates.")
        return []

    total_oz = sum(
        to_ounces((line.get("variant") or {}).get("weight")) * line["quantity"]
        for line in checkout["lines"]
    )

    shipment = {
        "to_address": {
            "street1": address["streetAddress1"],
            "city": address["city"],
            "zip": address["postalCode"],
            "state": address.get("countryArea"),
            "country": address["country"]["code"],
        },
        "from_address": SHIP_FROM,
        "parcel": {"weight": round(total_oz, 2)},
    }

    result = call_easypost(shipment)
    rates = result.get("rates", [])

    return [
        {
            "id": rate["id"],
            "name": f"{rate['carrier']} {rate['service']}",
            "amount": float(rate["rate"]),
            "currency": rate["currency"],
            "maximum_delivery_days": rate.get("delivery_days"),
            "minimum_delivery_days": rate.get("delivery_days"),
        }
        for rate in rates
    ]


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/webhooks/list-methods":
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        signature = self.headers.get("Saleor-Signature")

        if not verify_signature(body, signature):
            logger.warning("Rejected webhook: bad/missing signature")
            self.send_response(401)
            self.end_headers()
            return

        try:
            payload = json.loads(body)
            response = handle_list_methods(payload)
        except Exception:
            logger.exception("Error handling list-methods")
            self.send_response(500)
            self.end_headers()
            return

        logger.info("list-methods -> %d rate(s)", len(response))
        body_out = json.dumps(response).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body_out)))
        self.end_headers()
        self.wfile.write(body_out)

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8083))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Shipping webhook receiver listening on :%d", port)
    server.serve_forever()
