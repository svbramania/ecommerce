"""Newsletter signup — a real, persisted email-capture list, the first
concrete piece of executing the marketing plan (docs/marketing-plan-strategy.md's
365-day calendar assumed an audience to send to; before this, no such list
existed anywhere in this stack).

Same sidecar shape as gift_registry/reviews: stdlib-only Python, SQLite on
a named Docker volume. No account system needed here — a newsletter
subscription isn't owned by a Saleor identity, it's just an email address,
so there's nothing to authenticate for the one public write this service
does. Reading the list back (to actually send a campaign) is the one
sensitive operation, gated by a static shared-secret header rather than a
customer JWT, since this is a staff/marketing operation with no Saleor
staff-permission equivalent to check against externally.

Double opt-in: a new signup is stored as subscribed=1, confirmed=0 and a
real confirmation email is sent over SMTP to mailpit — the same
EMAIL_URL=smtp://mailpit:1025 backend/backend.env already configures for
Saleor's own account/order emails, just spoken to directly with stdlib
smtplib rather than through Saleor (this service isn't part of Saleor).
GET /subscribers only ever returns confirmed=1 rows — an address that
never clicked its confirmation link is never exportable, which is the
actual point of double opt-in, not just an email that gets sent and
ignored.

Endpoints:
  POST /subscribe                (no auth) body {email} -> subscribe + send confirmation email
  POST /confirm                  (no auth) body {email, token} -> completes double opt-in
  POST /unsubscribe              (no auth) body {email} -> real, honored opt-out
  GET  /subscribers              (admin token header) export the real, confirmed list

Not built: an actual campaign-send mechanism (this is the list; sending a
real campaign to it still needs a real ESP account — Mailchimp/SES/etc.
— which this project doesn't have, and mailpit only catches mail
locally, it never reaches a real inbox), segmentation, click/open
tracking, bounce handling.
"""
from __future__ import annotations

import json
import logging
import os
import re
import secrets
import smtplib
import sqlite3
import uuid
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("newsletter")

DB_PATH = os.environ.get("NEWSLETTER_DB_PATH", "/data/newsletter.db")
ADMIN_TOKEN = os.environ.get("NEWSLETTER_ADMIN_TOKEN", "")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

SMTP_HOST = os.environ.get("SMTP_HOST", "mailpit")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "1025"))
FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@example.com")
# Where the confirmation link in the email points — a storefront page
# (not this service directly) so the click lands somewhere styled and
# consistent with confirm-account/reset-password, which follow the same
# "email links to a storefront page, which calls the real API" shape.
CONFIRM_URL_BASE = os.environ.get("NEWSLETTER_CONFIRM_URL_BASE", "http://localhost:3000/newsletter/confirm")


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            subscribed INTEGER NOT NULL DEFAULT 1,
            confirmed INTEGER NOT NULL DEFAULT 0,
            confirm_token TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    """)
    conn.commit()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def send_confirmation_email(email: str, token: str) -> None:
    link = f"{CONFIRM_URL_BASE}?email={email}&token={token}"
    msg = EmailMessage()
    msg["Subject"] = "Confirm your newsletter signup"
    msg["From"] = FROM_EMAIL
    msg["To"] = email
    msg.set_content(
        "Thanks for signing up! Please confirm your email address to start "
        f"receiving news and deals:\n\n{link}\n\n"
        "If you didn't request this, you can ignore this email."
    )
    # Real SMTP send to the same mailpit instance every other transactional
    # email in this project already goes through (backend/backend.env's
    # EMAIL_URL) — visible at http://localhost:8025, not a stubbed no-op.
    # Failures are logged, not swallowed silently, but don't fail the
    # signup itself: the row is still real and confirmable via a resend
    # (resubmitting /subscribe issues a fresh token+email).
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
            smtp.send_message(msg)
    except OSError:
        logger.exception("Failed to send confirmation email to %s", email)


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except json.JSONDecodeError:
            return {}

    def do_OPTIONS(self):
        self._send_json(200, {})

    def do_GET(self):
        if self.path != "/subscribers":
            return self._send_json(404, {"error": "Not found"})

        auth = self.headers.get("Authorization", "")
        provided = auth[len("Bearer "):] if auth.startswith("Bearer ") else ""
        # Constant-time-ish check isn't the point here — this token gates
        # a marketing export, not a payment or account action; a plain
        # compare is proportionate to what's actually at risk.
        if not ADMIN_TOKEN or provided != ADMIN_TOKEN:
            return self._send_json(401, {"error": "Not authenticated"})

        conn = get_conn()
        try:
            # Only real, confirmed opt-ins are exportable — the entire
            # point of double opt-in is that an address that never clicked
            # its confirmation link never ends up on a real send list.
            rows = conn.execute(
                "SELECT email, created_at FROM subscribers WHERE subscribed = 1 AND confirmed = 1 ORDER BY created_at"
            ).fetchall()
            return self._send_json(200, {
                "subscribers": [{"email": r["email"], "subscribedAt": r["created_at"]} for r in rows],
                "count": len(rows),
            })
        finally:
            conn.close()

    def do_POST(self):
        body = self._read_json_body()
        email = (body.get("email") or "").strip().lower()

        if self.path == "/subscribe":
            if not EMAIL_RE.match(email):
                return self._send_json(400, {"error": "Enter a valid email address."})
            conn = get_conn()
            try:
                existing = conn.execute(
                    "SELECT confirmed FROM subscribers WHERE email = ?", (email,)
                ).fetchone()
                if existing and existing["confirmed"]:
                    # Already proved control of this inbox once (e.g.
                    # resubscribing after an unsubscribe) — reactivate
                    # without making them confirm a second time.
                    conn.execute(
                        "UPDATE subscribers SET subscribed = 1, updated_at = datetime('now') WHERE email = ?",
                        (email,),
                    )
                    conn.commit()
                    return self._send_json(200, {"ok": True, "pendingConfirmation": False})

                # New signup, or exists but never confirmed — resubmitting
                # here doubles as "resend my confirmation email" with a
                # fresh token.
                token = secrets.token_urlsafe(24)
                conn.execute(
                    """
                    INSERT INTO subscribers (id, email, subscribed, confirmed, confirm_token)
                    VALUES (?, ?, 1, 0, ?)
                    ON CONFLICT(email) DO UPDATE SET
                        subscribed = 1, confirm_token = excluded.confirm_token, updated_at = datetime('now')
                    """,
                    (str(uuid.uuid4()), email, token),
                )
                conn.commit()
                send_confirmation_email(email, token)
                return self._send_json(201, {"ok": True, "pendingConfirmation": True})
            finally:
                conn.close()

        if self.path == "/confirm":
            token = (body.get("token") or "").strip()
            if not EMAIL_RE.match(email) or not token:
                return self._send_json(400, {"error": "Invalid confirmation link."})
            conn = get_conn()
            try:
                row = conn.execute(
                    "SELECT confirm_token FROM subscribers WHERE email = ?", (email,)
                ).fetchone()
                if not row or row["confirm_token"] != token:
                    return self._send_json(400, {"error": "This confirmation link is invalid or expired."})
                conn.execute(
                    "UPDATE subscribers SET confirmed = 1, updated_at = datetime('now') WHERE email = ?",
                    (email,),
                )
                conn.commit()
                return self._send_json(200, {"ok": True})
            finally:
                conn.close()

        if self.path == "/unsubscribe":
            if not EMAIL_RE.match(email):
                return self._send_json(400, {"error": "Enter a valid email address."})
            conn = get_conn()
            try:
                conn.execute(
                    "UPDATE subscribers SET subscribed = 0, updated_at = datetime('now') WHERE email = ?",
                    (email,),
                )
                conn.commit()
                return self._send_json(200, {"ok": True})
            finally:
                conn.close()

        self._send_json(404, {"error": "Not found"})

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_conn()
    init_db(conn)
    conn.close()

    port = int(os.environ.get("PORT", 8080))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Newsletter service listening on :%d (db: %s)", port, DB_PATH)
    server.serve_forever()
