"""Abandoned-cart email reminders.

Any checkout still returned by Saleor's own `checkouts` query is, by
definition, not yet an order — confirmed live: after completing several
real orders this session, none of their checkout ids remained queryable
(Saleor consumes the checkout on checkoutComplete). So "a checkout with a
real email, last touched more than ABANDONED_CART_HOURS ago" is a
genuine, real abandoned cart — no guessing needed about completion state.

Uses the same transactional-email infrastructure Saleor itself already
uses (EMAIL_URL — Mailpit locally, a real SMTP server in any other
environment), via stdlib smtplib. One-shot script, not a daemon — run on
a schedule (cron/Celery beat) in a real deployment.
"""
from __future__ import annotations

import json
import logging
import os
import smtplib
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("abandoned_cart")

SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://localhost:8000/graphql/")
STAFF_TOKEN = os.environ["ABANDONED_CART_STAFF_TOKEN"]
EMAIL_URL = os.environ.get("EMAIL_URL", "smtp://mailpit:1025")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@example.com")
SITE_URL = os.environ.get("SITE_URL", "http://localhost:3000")
ABANDONED_CART_HOURS = float(os.environ.get("ABANDONED_CART_HOURS", "24"))
REMINDER_SENT_KEY = "abandoned_cart_reminder_sent"


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


# CheckoutFilterInput.updatedAt is a DateRangeInput (date, not datetime —
# confirmed live against the real schema, not assumed) — day-level
# granularity only. Used here just as a coarse pre-filter; the real
# hour-level ABANDONED_CART_HOURS cutoff is checked in Python below
# against each checkout's actual updatedAt timestamp.
FIND_STALE_CHECKOUTS = """
query($beforeDate: Date!) {
  checkouts(first: 100, filter: {updatedAt: {lte: $beforeDate}}) {
    edges {
      node {
        id
        email
        updatedAt
        metafield(key: "abandoned_cart_reminder_sent")
        lines {
          quantity
          variant {
            product { name }
            pricing { price { gross { amount currency } } }
          }
        }
      }
    }
  }
}
"""

MARK_REMINDED = """
mutation($id: ID!, $sentAt: String!) {
  updateMetadata(id: $id, input: [{key: "abandoned_cart_reminder_sent", value: $sentAt}]) {
    errors { field message }
  }
}
"""


def send_reminder_email(to_email: str, checkout: dict) -> None:
    lines = checkout["lines"]
    # Computed from each line's variant.pricing (the variant's real-time
    # channel price) rather than any checkout/line totalPrice field —
    # confirmed live that BOTH the checkout-level and line-level cached
    # total price fields can still read as 0 right after checkout
    # creation, before Saleor's own (lazy) price calculation catches up.
    # variant.pricing isn't checkout-specific, so it doesn't have that lag.
    currency = lines[0]["variant"]["pricing"]["price"]["gross"]["currency"]
    total_amount = sum(
        line["quantity"] * line["variant"]["pricing"]["price"]["gross"]["amount"]
        for line in lines
    )
    resume_url = f"{SITE_URL}/cart/resume/{urllib.parse.quote(checkout['id'])}"

    item_lines = "\n".join(
        f"  - {line['quantity']} x {line['variant']['product']['name']}" for line in lines
    )
    body = (
        f"You left {len(lines)} item(s) in your cart, totaling "
        f"{total_amount} {currency}:\n\n{item_lines}\n\n"
        f"Pick up where you left off: {resume_url}\n"
    )

    msg = EmailMessage()
    msg["Subject"] = "You left something in your cart"
    msg["From"] = DEFAULT_FROM_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    parsed = urllib.parse.urlparse(EMAIL_URL)
    with smtplib.SMTP(parsed.hostname, parsed.port or 25, timeout=15) as smtp:
        if parsed.username:
            smtp.login(parsed.username, parsed.password or "")
        smtp.send_message(msg)


def main() -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=ABANDONED_CART_HOURS)
    # The API filter only understands whole dates, so pre-filter a day
    # generously (today's date is enough — any checkout updated today or
    # earlier is a candidate) and apply the real hour-precision cutoff below.
    result = gql(FIND_STALE_CHECKOUTS, {"beforeDate": datetime.now(timezone.utc).date().isoformat()})
    candidates = [edge["node"] for edge in result["checkouts"]["edges"]]
    checkouts = [c for c in candidates if datetime.fromisoformat(c["updatedAt"]) <= cutoff]
    logger.info("Found %d checkout(s) stale for more than %.2fh (of %d candidates)",
                len(checkouts), ABANDONED_CART_HOURS, len(candidates))

    sent = 0
    for checkout in checkouts:
        if not checkout["email"]:
            continue
        if checkout.get("metafield"):
            logger.info("Skipping %s — reminder already sent at %s", checkout["id"], checkout["metafield"])
            continue
        if not checkout["lines"]:
            continue

        try:
            send_reminder_email(checkout["email"], checkout)
        except Exception:
            logger.exception("Failed to send reminder for checkout %s", checkout["id"])
            continue

        gql(MARK_REMINDED, {"id": checkout["id"], "sentAt": datetime.now(timezone.utc).isoformat()})
        logger.info("Sent reminder for checkout %s to %s", checkout["id"], checkout["email"])
        sent += 1

    logger.info("Done: %d reminder(s) sent", sent)
    return 0


if __name__ == "__main__":
    sys.exit(main())
