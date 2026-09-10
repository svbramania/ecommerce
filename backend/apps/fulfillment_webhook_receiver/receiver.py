"""Reference implementation of the "fulfillment service" pattern described
in docs/architecture.md: Saleor pushes ORDER_CREATED to this endpoint via a
webhook; this stands in for a real 3PL's system, which would normally
receive the same event, prepare the shipment on its own side, then call
back into Saleor with a fulfillment + tracking number. A real 3PL
integration follows this exact contract with its own logic in place of the
placeholder fulfillment step below — the webhook receipt, signature
verification, and callback shape are the real, reusable part.

Deliberately stdlib-only (http.server + urllib + hmac) — no framework
dependency to install/maintain for what is currently one endpoint.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("fulfillment_webhook_receiver")

WEBHOOK_SECRET = os.environ["FULFILLMENT_WEBHOOK_SECRET"]
SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://api:8000/graphql/")
SALEOR_APP_TOKEN = os.environ["FULFILLMENT_CONNECTOR_APP_TOKEN"]
# The warehouse this particular 3PL connector fulfills from — a real
# connector for a different 3PL/warehouse would use its own id here.
WAREHOUSE_ID = os.environ["FULFILLMENT_WAREHOUSE_ID"]


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    if not signature_header:
        return False
    # Saleor signs the raw request body with the webhook's own secretKey,
    # HMAC-SHA256, and sends it in the Saleor-Signature header.
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def call_saleor(query: str, variables: dict) -> dict:
    body = json.dumps({"query": query, "variables": variables}).encode()
    req = urllib.request.Request(
        SALEOR_API_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SALEOR_APP_TOKEN}",
        },
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


ORDER_FULFILL_MUTATION = """
mutation FulfillOrder($order: ID!, $lines: [OrderFulfillLineInput!]!) {
  orderFulfill(order: $order, input: {lines: $lines, notifyCustomer: false}) {
    fulfillments { id }
    errors { field message code }
  }
}
"""
# Each line names an order line id plus which warehouse stock fulfills it
# (OrderFulfillStockInput: {warehouse, quantity}) — Saleor's real multi-
# warehouse model, the same one docs/phase-1-mvp.md already confirmed live.

UPDATE_TRACKING_MUTATION = """
mutation UpdateTracking($id: ID!, $trackingNumber: String!) {
  orderFulfillmentUpdateTracking(id: $id, input: {trackingNumber: $trackingNumber, notifyCustomer: false}) {
    fulfillment { id trackingNumber }
    errors { field message code }
  }
}
"""


def handle_order_created(payload: dict) -> None:
    order = payload.get("order") or payload
    order_id = order.get("id")
    lines = order.get("lines", [])
    if not order_id or not lines:
        logger.warning("ORDER_CREATED payload missing id/lines, skipping: %s", payload)
        return

    # Placeholder for what a real 3PL does here: check its own warehouse
    # stock, decide which lines it can ship, queue a pick/pack job. This
    # reference implementation just fulfills every line in full — that
    # business logic is the part a real 3PL connector replaces.
    fulfill_lines = [
        {
            "orderLineId": line["id"],
            "stocks": [{"warehouse": WAREHOUSE_ID, "quantity": line["quantity"]}],
        }
        for line in lines
    ]

    result = call_saleor(ORDER_FULFILL_MUTATION, {"order": order_id, "lines": fulfill_lines})
    errors = result.get("data", {}).get("orderFulfill", {}).get("errors") or []
    if errors:
        logger.error("orderFulfill failed for %s: %s", order_id, errors)
        return

    fulfillments = result["data"]["orderFulfill"]["fulfillments"]
    logger.info("Created %d fulfillment(s) for order %s", len(fulfillments), order_id)

    for fulfillment in fulfillments:
        # A real 3PL would supply its own carrier-issued tracking number
        # once the shipment is actually booked — this is a placeholder to
        # prove the callback half of the contract works end-to-end.
        tracking_result = call_saleor(
            UPDATE_TRACKING_MUTATION,
            {"id": fulfillment["id"], "trackingNumber": "TEST-TRACKING-0001"},
        )
        tracking_errors = (
            tracking_result.get("data", {}).get("orderFulfillmentUpdateTracking", {}).get("errors")
            or []
        )
        if tracking_errors:
            logger.error("Tracking update failed for %s: %s", fulfillment["id"], tracking_errors)
        else:
            logger.info("Tracking number set on fulfillment %s", fulfillment["id"])


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/webhooks/order-created":
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
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            return

        self.send_response(200)
        self.end_headers()

        try:
            handle_order_created(payload)
        except Exception:
            logger.exception("Error handling ORDER_CREATED payload")

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Fulfillment webhook receiver listening on :%d", port)
    server.serve_forever()
