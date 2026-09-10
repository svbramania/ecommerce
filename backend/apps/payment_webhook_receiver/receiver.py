"""Saleor Payment App for Stripe — implements the four synchronous
transaction webhooks Saleor's checkout flow calls out to and waits on
(unlike the async ORDER_CREATED webhook in fulfillment_webhook_receiver/,
these must respond inline with a real result before the storefront's
mutation returns). Contract verified against Saleor's own "Building a
Payment App" docs and the live introspected schema before writing this —
see backend/apps/payment_webhook_receiver/README.md.

Real Stripe REST calls (PaymentIntents, Refunds) via urllib + the test
secret key — no Stripe SDK dependency, matching this repo's stdlib-first
style for these reference services. Raw card data never reaches this
process: the storefront collects it via Stripe.js/Elements client-side
and only a PaymentMethod id crosses the network to us (pay-tokenize in
docs/security-checklist.md).
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("payment_webhook_receiver")

WEBHOOK_SECRET = os.environ["PAYMENT_WEBHOOK_SECRET"]
STRIPE_SECRET_KEY = os.environ["STRIPE_SECRET_KEY"]
STRIPE_API = "https://api.stripe.com/v1"


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    if not signature_header:
        return False
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def stripe_request(method: str, path: str, params: dict, idempotency_key: str | None = None) -> dict:
    body = urllib.parse.urlencode(params).encode()
    headers = {
        "Authorization": f"Bearer {STRIPE_SECRET_KEY}",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    if idempotency_key:
        # Saleor may redeliver this webhook on a timeout/retry — without
        # this, a redelivered TRANSACTION_INITIALIZE_SESSION would create
        # a second real PaymentIntent for the same checkout. Stripe's own
        # idempotency mechanism collapses retries into the original result.
        headers["Idempotency-Key"] = idempotency_key
    req = urllib.request.Request(
        f"{STRIPE_API}{path}",
        data=body if method == "POST" else None,
        method=method,
        headers=headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as err:
        # Stripe returns a real JSON error body (decline reason, etc.) even
        # on 4xx — surface it rather than just the HTTP status.
        detail = json.loads(err.read())
        logger.warning("Stripe %s %s failed: %s", method, path, detail)
        return {"error": detail.get("error", {})}


def to_cents(amount: float) -> int:
    return round(amount * 100)


def from_cents(amount_cents: int) -> float:
    return amount_cents / 100


def handle_payment_gateway_initialize(payload: dict) -> dict:
    # Real, not fabricated: the publishable key is safe to hand to the
    # browser (it's what Stripe.js is designed to receive), unlike the
    # secret key which never leaves this process.
    return {
        "data": {
            "publishableKey": os.environ["STRIPE_PUBLISHABLE_KEY"],
            "environment": "test",
        }
    }


def handle_transaction_initialize(payload: dict) -> dict:
    # Saleor's subscription-query webhooks deliver the selected fields
    # directly at the top level, not wrapped in an "event" key (confirmed
    # live — same real finding as fulfillment_webhook_receiver.py).
    event = payload
    action = event["action"]
    payment_method_id = event.get("data", {}).get("paymentMethodId") if event.get("data") else None
    idempotency_key = event["idempotencyKey"]

    if not payment_method_id:
        return {"result": "CHARGE_FAILURE", "amount": action["amount"],
                "message": "No paymentMethodId provided by the storefront."}

    result = stripe_request("POST", "/payment_intents", {
        "amount": to_cents(action["amount"]),
        "currency": action["currency"].lower(),
        "payment_method": payment_method_id,
        "confirm": "true",
        "payment_method_types[]": "card",
        # No return_url/redirect handling built yet — see README's "Not
        # built" section. Test cards (4242...) never hit this path.
    }, idempotency_key=idempotency_key)

    if "error" in result:
        return {"result": "CHARGE_FAILURE", "amount": action["amount"],
                "pspReference": result["error"].get("payment_intent", {}).get("id"),
                "message": result["error"].get("message", "Stripe error")}

    pi_id = result["id"]
    status = result["status"]
    amount = from_cents(result["amount"])

    if status == "succeeded":
        return {"result": "CHARGE_SUCCESS", "amount": amount, "pspReference": pi_id}
    if status == "requires_action":
        return {"result": "CHARGE_ACTION_REQUIRED", "amount": amount, "pspReference": pi_id,
                "data": {"clientSecret": result["client_secret"]}}
    return {"result": "CHARGE_FAILURE", "amount": amount, "pspReference": pi_id,
            "message": f"Unexpected PaymentIntent status: {status}"}


def handle_transaction_process(payload: dict) -> dict:
    # Saleor's subscription-query webhooks deliver the selected fields
    # directly at the top level, not wrapped in an "event" key (confirmed
    # live — same real finding as fulfillment_webhook_receiver.py).
    event = payload
    action = event["action"]
    psp_reference = event["transaction"]["pspReference"]

    result = stripe_request("GET", f"/payment_intents/{psp_reference}", {})
    if "error" in result:
        return {"result": "CHARGE_FAILURE", "amount": action["amount"], "pspReference": psp_reference}

    status = result["status"]
    amount = from_cents(result["amount"])
    if status == "succeeded":
        return {"result": "CHARGE_SUCCESS", "amount": amount, "pspReference": psp_reference}
    if status == "requires_action":
        return {"result": "CHARGE_ACTION_REQUIRED", "amount": amount, "pspReference": psp_reference,
                "data": {"clientSecret": result["client_secret"]}}
    return {"result": "CHARGE_FAILURE", "amount": amount, "pspReference": psp_reference}


def handle_transaction_refund(payload: dict) -> dict:
    # Saleor's subscription-query webhooks deliver the selected fields
    # directly at the top level, not wrapped in an "event" key (confirmed
    # live — same real finding as fulfillment_webhook_receiver.py).
    event = payload
    action = event["action"]
    psp_reference = event["transaction"]["pspReference"]

    result = stripe_request("POST", "/refunds", {
        "payment_intent": psp_reference,
        "amount": to_cents(action["amount"]),
    })
    if "error" in result:
        return {"result": "REFUND_FAILURE", "amount": action["amount"], "pspReference": psp_reference}

    return {"result": "REFUND_SUCCESS", "amount": from_cents(result["amount"]),
            "pspReference": result["id"]}


ROUTES = {
    "/webhooks/payment-gateway-initialize": handle_payment_gateway_initialize,
    "/webhooks/transaction-initialize": handle_transaction_initialize,
    "/webhooks/transaction-process": handle_transaction_process,
    "/webhooks/transaction-refund": handle_transaction_refund,
}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        handler = ROUTES.get(self.path)
        if not handler:
            self.send_response(404)
            self.end_headers()
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        signature = self.headers.get("Saleor-Signature")

        if not verify_signature(body, signature):
            logger.warning("Rejected webhook at %s: bad/missing signature", self.path)
            self.send_response(401)
            self.end_headers()
            return

        try:
            payload = json.loads(body)
            response = handler(payload)
        except Exception:
            logger.exception("Error handling %s", self.path)
            self.send_response(500)
            self.end_headers()
            return

        logger.info("%s -> %s", self.path, response)
        body_out = json.dumps(response).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body_out)))
        self.end_headers()
        self.wfile.write(body_out)

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8081))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Payment webhook receiver listening on :%d", port)
    server.serve_forever()
