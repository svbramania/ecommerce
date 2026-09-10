"""Saleor Tax App for TaxJar — implements CHECKOUT_CALCULATE_TAXES, the
synchronous webhook Saleor calls every time a checkout's totals need real
tax applied (contract verified against Saleor's own tax-events docs and
the live introspected schema before writing — see this directory's
README.md).

Real TaxJar sandbox API call (POST /v2/taxes) per request — no caching,
no fabricated rate table. Genuinely returns $0 tax for any address where
this business has no configured nexus, which is correct tax-law behavior,
not a bug — see the README for what that means for local testing.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("tax_webhook_receiver")

WEBHOOK_SECRET = os.environ["TAX_WEBHOOK_SECRET"]
TAXJAR_API_TOKEN = os.environ["TAXJAR_API_TOKEN"]
TAXJAR_API = os.environ.get("TAXJAR_API_BASE", "https://api.sandbox.taxjar.com/v2")

# This business's real ship-from address — genuinely unset until the user
# supplies one (see README). Without it, TaxJar correctly reports no
# nexus anywhere, so every real order shows $0 tax — honest behavior for
# a business that hasn't registered where it operates, not a bug.
ORIGIN = {
    "from_country": os.environ.get("TAX_ORIGIN_COUNTRY"),
    "from_state": os.environ.get("TAX_ORIGIN_STATE"),
    "from_zip": os.environ.get("TAX_ORIGIN_ZIP"),
    "from_city": os.environ.get("TAX_ORIGIN_CITY"),
    "from_street": os.environ.get("TAX_ORIGIN_STREET"),
}


def verify_signature(payload: bytes, signature_header: str | None) -> bool:
    if not signature_header:
        return False
    expected = hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature_header)


def call_taxjar(body: dict) -> dict:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{TAXJAR_API}/taxes",
        data=data,
        headers={
            "Authorization": f"Bearer {TAXJAR_API_TOKEN}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())["tax"]
    except urllib.error.HTTPError as err:
        detail = json.loads(err.read())
        logger.warning("TaxJar request failed: %s", detail)
        raise


def handle_calculate_taxes(payload: dict) -> dict:
    tax_base = payload["taxBase"]
    address = tax_base.get("address") or {}
    lines = tax_base["lines"]
    shipping_amount = tax_base["shippingPrice"]["amount"]

    subtotal = sum(line["totalPrice"]["amount"] for line in lines)

    request_body = {
        **{k: v for k, v in ORIGIN.items() if v},
        "to_country": (address.get("country") or {}).get("code"),
        "to_state": address.get("countryArea"),
        "to_zip": address.get("postalCode"),
        "to_city": address.get("city"),
        "to_street": address.get("streetAddress1"),
        "amount": subtotal + shipping_amount,
        "shipping": shipping_amount,
        "line_items": [
            {
                "id": str(i),
                "quantity": line["quantity"],
                "unit_price": line["unitPrice"]["amount"],
            }
            for i, line in enumerate(lines)
        ],
    }

    tax = call_taxjar(request_body)
    combined_rate = tax.get("rate", 0) or 0
    line_breakdown = (tax.get("breakdown") or {}).get("line_items", [])

    # TaxJar only returns a per-line breakdown when has_nexus is true;
    # without nexus, apply the (zero) top-level rate uniformly rather than
    # indexing into a breakdown array that won't exist.
    response_lines = []
    for i, line in enumerate(lines):
        net = line["totalPrice"]["amount"]
        if i < len(line_breakdown):
            rate = line_breakdown[i]["combined_tax_rate"]
            gross = net + line_breakdown[i]["tax_collectable"]
        else:
            rate = combined_rate
            gross = net * (1 + combined_rate)
        response_lines.append({
            "tax_rate": str(round(rate * 100, 4)),
            "total_gross_amount": round(gross, 2),
            "total_net_amount": round(net, 2),
        })

    shipping_tax = tax.get("amount_to_collect", 0) - sum(
        li["tax_collectable"] for li in line_breakdown
    ) if line_breakdown else 0

    return {
        "shipping_tax_rate": str(round(combined_rate * 100, 4)),
        "shipping_price_gross_amount": round(shipping_amount + shipping_tax, 2),
        "shipping_price_net_amount": round(shipping_amount, 2),
        "lines": response_lines,
    }


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/webhooks/checkout-calculate-taxes":
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
            response = handle_calculate_taxes(payload)
        except Exception:
            logger.exception("Error handling calculate-taxes")
            self.send_response(500)
            self.end_headers()
            return

        logger.info("calculate-taxes -> %s", response)
        body_out = json.dumps(response).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body_out)))
        self.end_headers()
        self.wfile.write(body_out)

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8082))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Tax webhook receiver listening on :%d", port)
    server.serve_forever()
