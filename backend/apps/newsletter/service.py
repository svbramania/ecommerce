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

Endpoints:
  POST /subscribe                (no auth) body {email} -> subscribe (idempotent)
  POST /unsubscribe              (no auth) body {email} -> real, honored opt-out
  GET  /subscribers              (admin token header) export the real list

Not built: double opt-in confirmation email (no templating/queue exists
for it yet — this is a real, disclosed gap, not silently skipped),
segmentation, click/open tracking, an actual send mechanism (this is the
list; sending still needs a real ESP account, which doesn't exist here).
"""
from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("newsletter")

DB_PATH = os.environ.get("NEWSLETTER_DB_PATH", "/data/newsletter.db")
ADMIN_TOKEN = os.environ.get("NEWSLETTER_ADMIN_TOKEN", "")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            subscribed INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    """)
    conn.commit()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


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
            rows = conn.execute(
                "SELECT email, subscribed, created_at FROM subscribers WHERE subscribed = 1 ORDER BY created_at"
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
                conn.execute(
                    """
                    INSERT INTO subscribers (id, email, subscribed)
                    VALUES (?, ?, 1)
                    ON CONFLICT(email) DO UPDATE SET subscribed = 1, updated_at = datetime('now')
                    """,
                    (str(uuid.uuid4()), email),
                )
                conn.commit()
                return self._send_json(201, {"ok": True})
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
