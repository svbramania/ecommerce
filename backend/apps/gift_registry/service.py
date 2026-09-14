"""Gift Registry — a real, shareable registry (Amazon's "Registry & Gift
List"), built as its own sidecar service rather than either (a) Saleor
customer metadata, which turned out live-tested to be unreadable by an
anonymous visitor (`user(id:)` requires MANAGE_STAFF/MANAGE_USERS/
MANAGE_ORDERS — confirmed by a real PermissionDenied error), which would
make "share this link with someone who isn't logged in as you" impossible,
or (b) a new model merged into Saleor's own backend, which this project has
never done (every prior custom-data need has been solved via Saleor's own
metadata mechanism or a standalone sidecar, never a fork of Saleor itself).

This follows the same "stdlib-only Python, no framework, no image build"
shape as the webhook receivers (see backend/apps/fulfillment_webhook_receiver
for the reference pattern), but needs real persistence across requests
(registries are read back later, not just processed once), so it adds one
real thing those don't: a SQLite file on a named Docker volume.

Ownership is verified by forwarding the caller's own Saleor customer JWT to
Saleor's `me` query — if Saleor says that token is a valid, confirmed
customer, this service trusts the returned user id as the real owner
identity. No staff token, no separate account system: a customer can only
ever manage their own registries because their real login is what
authenticates every write. Public routes resolve live product name/image/
price from Saleor's own public (anonymous) product query at read time,
never a stored snapshot — so a public registry always reflects real current
pricing/availability, matching how the rest of this app treats product
data.

Endpoints:
  POST   /registries                              (auth) create
  GET    /registries/mine                         (auth) list my registries
  DELETE /registries/{id}                         (auth, owner only)
  POST   /registries/{id}/items                   (auth, owner only) add item
  DELETE /registries/{id}/items/{item_id}         (auth, owner only) remove item
  GET    /registries/public/{slug}                (no auth) public view
  POST   /registries/public/{slug}/items/{item_id}/purchase  (no auth) mark purchased

Not built: editing item quantity in place (delete + re-add instead), email
notification to the owner when something is purchased (no email-sending
credential exists in this stack yet), pagination on "mine" (fine at
personal-registry scale).
"""
from __future__ import annotations

import json
import logging
import os
import re
import secrets
import sqlite3
import urllib.error
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("gift_registry")

SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://api:8000/graphql/")
DEFAULT_CHANNEL = os.environ.get("GIFT_REGISTRY_CHANNEL", "default-channel")
DB_PATH = os.environ.get("GIFT_REGISTRY_DB_PATH", "/data/registry.db")


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS registries (
            id TEXT PRIMARY KEY,
            owner_user_id TEXT NOT NULL,
            owner_email TEXT NOT NULL,
            title TEXT NOT NULL,
            event_date TEXT,
            share_slug TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS registry_items (
            id TEXT PRIMARY KEY,
            registry_id TEXT NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
            product_id TEXT NOT NULL,
            variant_id TEXT,
            quantity_wanted INTEGER NOT NULL DEFAULT 1,
            quantity_purchased INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    """)
    conn.commit()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def saleor_gql(query: str, variables: dict, token: str | None = None) -> dict:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        SALEOR_API_URL,
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers=headers,
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


ME_QUERY = "{ me { id email isConfirmed } }"


def authenticate(token: str | None) -> dict | None:
    """Returns {"id": ..., "email": ...} for a real, confirmed Saleor
    customer if the token is valid, else None. This IS the auth system —
    there is no separate password/session store in this service."""
    if not token:
        return None
    try:
        result = saleor_gql(ME_QUERY, {}, token=token)
    except urllib.error.HTTPError:
        return None
    me = result.get("data", {}).get("me")
    if not me or not me.get("isConfirmed"):
        return None
    return {"id": me["id"], "email": me["email"]}


PRODUCT_QUERY = """
query($id: ID!, $channel: String!) {
  product(id: $id, channel: $channel) {
    id name slug
    thumbnail { url altText: alt }
    pricing { priceRange { start { gross { amount currency } } } }
  }
}
"""


def resolve_product(product_id: str) -> dict | None:
    try:
        result = saleor_gql(PRODUCT_QUERY, {"id": product_id, "channel": DEFAULT_CHANNEL})
    except urllib.error.HTTPError:
        return None
    return result.get("data", {}).get("product")


def registry_to_dict(conn: sqlite3.Connection, registry: sqlite3.Row, include_owner: bool) -> dict:
    items = conn.execute(
        "SELECT * FROM registry_items WHERE registry_id = ? ORDER BY created_at", (registry["id"],)
    ).fetchall()
    item_dicts = []
    for item in items:
        product = resolve_product(item["product_id"])
        item_dicts.append({
            "id": item["id"],
            "productId": item["product_id"],
            "variantId": item["variant_id"],
            "quantityWanted": item["quantity_wanted"],
            "quantityPurchased": item["quantity_purchased"],
            # A deleted/unpublished product resolves to null — the registry
            # keeps the row (so quantityPurchased history isn't lost) but
            # the storefront should render it as "no longer available"
            # rather than guessing at stale name/price data.
            "product": product,
        })
    data = {
        "id": registry["id"],
        "title": registry["title"],
        "eventDate": registry["event_date"],
        "shareSlug": registry["share_slug"],
        "items": item_dicts,
    }
    if include_owner:
        data["ownerEmail"] = registry["owner_email"]
    return data


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
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

    def _bearer_token(self) -> str | None:
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[len("Bearer "):]
        return None

    def do_OPTIONS(self):
        self._send_json(200, {})

    def do_GET(self):
        conn = get_conn()
        try:
            if self.path == "/registries/mine":
                user = authenticate(self._bearer_token())
                if not user:
                    return self._send_json(401, {"error": "Not authenticated"})
                rows = conn.execute(
                    "SELECT * FROM registries WHERE owner_user_id = ? ORDER BY created_at DESC",
                    (user["id"],),
                ).fetchall()
                return self._send_json(200, {
                    "registries": [registry_to_dict(conn, r, include_owner=False) for r in rows]
                })

            match = re.fullmatch(r"/registries/public/([\w-]+)", self.path)
            if match:
                slug = match.group(1)
                row = conn.execute(
                    "SELECT * FROM registries WHERE share_slug = ?", (slug,)
                ).fetchone()
                if not row:
                    return self._send_json(404, {"error": "Registry not found"})
                return self._send_json(200, registry_to_dict(conn, row, include_owner=True))

            self._send_json(404, {"error": "Not found"})
        finally:
            conn.close()

    def do_POST(self):
        conn = get_conn()
        try:
            if self.path == "/registries":
                user = authenticate(self._bearer_token())
                if not user:
                    return self._send_json(401, {"error": "Not authenticated"})
                body = self._read_json_body()
                title = (body.get("title") or "").strip()
                if not title:
                    return self._send_json(400, {"error": "title is required"})
                registry_id = str(uuid.uuid4())
                slug = secrets.token_urlsafe(8)
                conn.execute(
                    "INSERT INTO registries (id, owner_user_id, owner_email, title, event_date, share_slug) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (registry_id, user["id"], user["email"], title, body.get("eventDate"), slug),
                )
                conn.commit()
                row = conn.execute("SELECT * FROM registries WHERE id = ?", (registry_id,)).fetchone()
                return self._send_json(201, registry_to_dict(conn, row, include_owner=True))

            match = re.fullmatch(r"/registries/([\w-]+)/items", self.path)
            if match:
                registry_id = match.group(1)
                user = authenticate(self._bearer_token())
                if not user:
                    return self._send_json(401, {"error": "Not authenticated"})
                row = conn.execute(
                    "SELECT * FROM registries WHERE id = ? AND owner_user_id = ?",
                    (registry_id, user["id"]),
                ).fetchone()
                if not row:
                    return self._send_json(404, {"error": "Registry not found"})
                body = self._read_json_body()
                product_id = body.get("productId")
                if not product_id:
                    return self._send_json(400, {"error": "productId is required"})
                product = resolve_product(product_id)
                if not product:
                    return self._send_json(400, {"error": "Unknown product"})
                item_id = str(uuid.uuid4())
                conn.execute(
                    "INSERT INTO registry_items (id, registry_id, product_id, variant_id, quantity_wanted) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (item_id, registry_id, product_id, body.get("variantId"), int(body.get("quantity") or 1)),
                )
                conn.commit()
                updated = conn.execute("SELECT * FROM registries WHERE id = ?", (registry_id,)).fetchone()
                return self._send_json(201, registry_to_dict(conn, updated, include_owner=True))

            match = re.fullmatch(r"/registries/public/([\w-]+)/items/([\w-]+)/purchase", self.path)
            if match:
                slug, item_id = match.groups()
                registry = conn.execute(
                    "SELECT * FROM registries WHERE share_slug = ?", (slug,)
                ).fetchone()
                if not registry:
                    return self._send_json(404, {"error": "Registry not found"})
                item = conn.execute(
                    "SELECT * FROM registry_items WHERE id = ? AND registry_id = ?",
                    (item_id, registry["id"]),
                ).fetchone()
                if not item:
                    return self._send_json(404, {"error": "Item not found"})
                body = self._read_json_body()
                purchase_qty = int(body.get("quantity") or 1)
                # Capped at quantityWanted so a giver can't push the count
                # past what the registry owner actually asked for.
                new_purchased = min(item["quantity_wanted"], item["quantity_purchased"] + purchase_qty)
                conn.execute(
                    "UPDATE registry_items SET quantity_purchased = ? WHERE id = ?",
                    (new_purchased, item_id),
                )
                conn.commit()
                updated_registry = conn.execute(
                    "SELECT * FROM registries WHERE id = ?", (registry["id"],)
                ).fetchone()
                return self._send_json(200, registry_to_dict(conn, updated_registry, include_owner=False))

            self._send_json(404, {"error": "Not found"})
        finally:
            conn.close()

    def do_DELETE(self):
        conn = get_conn()
        try:
            match = re.fullmatch(r"/registries/([\w-]+)/items/([\w-]+)", self.path)
            if match:
                registry_id, item_id = match.groups()
                user = authenticate(self._bearer_token())
                if not user:
                    return self._send_json(401, {"error": "Not authenticated"})
                owned = conn.execute(
                    "SELECT 1 FROM registries WHERE id = ? AND owner_user_id = ?",
                    (registry_id, user["id"]),
                ).fetchone()
                if not owned:
                    return self._send_json(404, {"error": "Registry not found"})
                conn.execute(
                    "DELETE FROM registry_items WHERE id = ? AND registry_id = ?", (item_id, registry_id)
                )
                conn.commit()
                return self._send_json(200, {"ok": True})

            match = re.fullmatch(r"/registries/([\w-]+)", self.path)
            if match:
                registry_id = match.group(1)
                user = authenticate(self._bearer_token())
                if not user:
                    return self._send_json(401, {"error": "Not authenticated"})
                owned = conn.execute(
                    "SELECT 1 FROM registries WHERE id = ? AND owner_user_id = ?",
                    (registry_id, user["id"]),
                ).fetchone()
                if not owned:
                    return self._send_json(404, {"error": "Registry not found"})
                conn.execute("DELETE FROM registries WHERE id = ?", (registry_id,))
                conn.commit()
                return self._send_json(200, {"ok": True})

            self._send_json(404, {"error": "Not found"})
        finally:
            conn.close()

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_conn()
    init_db(conn)
    conn.close()

    port = int(os.environ.get("PORT", 8080))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("Gift registry service listening on :%d (db: %s)", port, DB_PATH)
    server.serve_forever()
