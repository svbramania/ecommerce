"""Product Reviews — real, customer-submitted reviews with live
verified-purchase gating, built as its own sidecar for the same reason
gift_registry is (see backend/apps/gift_registry/service.py): Saleor's
Product.rating is a real field but has no backing review system anywhere
in the schema (no Review type, no submission mutation), and a stranger
can't read another customer's data via Saleor's public API, so review
authorship/ownership can't live in Saleor customer metadata either.

Same shape as gift_registry: stdlib-only Python, SQLite on a named Docker
volume for real persistence across requests. Ownership and identity are
established the same way — the caller's own Saleor customer JWT is
forwarded to Saleor's `me` query, and whatever Saleor says the token
belongs to is trusted as the real submitter identity. There is no separate
account system here.

"Verified purchase" is computed live, not trusted from the client: on
every submission this queries the same customer's own real order history
(`me { orders { lines { variant { product { id } } } } }` — the same field
path account.graphql's CurrentUserOrders already relies on) and checks
whether the reviewed product ever appears in a line. A customer can only
review a product once (upsert on resubmission, not a growing list of
duplicates) — enforced by a UNIQUE(product_id, user_id) constraint, not
just client-side courtesy.

Endpoints:
  GET    /reviews/{productId}      (no auth) one product's reviews + average/count
  GET    /reviews/summary?ids=a,b  (no auth) average/count for many products at once
                                    (product listing grids; only products with
                                    >=1 real review appear in the result)
  POST   /reviews                  (auth) submit/update your own review
  DELETE /reviews/{id}             (auth, owner only) remove your own review

Not built: moderation/profanity filtering (no real policy or moderator
role exists in this stack), pagination on a single product's review list
(fine at the review counts a real, un-astroturfed store would see),
editing a review's rating without resubmitting the whole thing (resubmit
is the edit — same upsert path).
"""
from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
import urllib.error
import urllib.parse
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("reviews")

SALEOR_API_URL = os.environ.get("SALEOR_API_URL", "http://api:8000/graphql/")
DB_PATH = os.environ.get("REVIEWS_DB_PATH", "/data/reviews.db")


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            product_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            title TEXT,
            body TEXT,
            verified INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            UNIQUE(product_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    """)
    conn.commit()


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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


ME_QUERY = "{ me { id email firstName lastName isConfirmed } }"


def authenticate(token: str | None) -> dict | None:
    """Returns the real, confirmed Saleor customer for this token, or None.
    This IS the auth system — no separate password/session store here."""
    if not token:
        return None
    try:
        result = saleor_gql(ME_QUERY, {}, token=token)
    except urllib.error.HTTPError:
        return None
    me = result.get("data", {}).get("me")
    if not me or not me.get("isConfirmed"):
        return None
    name = " ".join(p for p in [me.get("firstName"), me.get("lastName")] if p).strip()
    return {"id": me["id"], "email": me["email"], "name": name or me["email"]}


ORDERS_QUERY = """
{ me { orders(first: 100) { edges { node { lines { variant { product { id } } } } } } } }
"""


def has_purchased(token: str, product_id: str) -> bool:
    """Live-checks the caller's own real order history — never trusted from
    the client. Capped at the caller's most recent 100 orders (Saleor's own
    per-connection page-size ceiling); a customer with more real orders than
    that on one product is a real edge case this doesn't chase."""
    try:
        result = saleor_gql(ORDERS_QUERY, {}, token=token)
    except urllib.error.HTTPError:
        return False
    orders = result.get("data", {}).get("me", {}).get("orders", {}).get("edges", [])
    for edge in orders:
        for line in edge["node"]["lines"]:
            variant = line.get("variant")
            product = variant.get("product") if variant else None
            if product and product.get("id") == product_id:
                return True
    return False


def review_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "productId": row["product_id"],
        "author": row["author_name"],
        "rating": row["rating"],
        "title": row["title"],
        "body": row["body"],
        "verified": bool(row["verified"]),
        "date": row["created_at"],
    }


def summarize(rows: list[sqlite3.Row]) -> dict:
    if not rows:
        return {"average": None, "count": 0}
    ratings = [r["rating"] for r in rows]
    return {"average": round(sum(ratings) / len(ratings), 2), "count": len(ratings)}


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
        parsed = urllib.parse.urlsplit(self.path)
        conn = get_conn()
        try:
            if parsed.path == "/reviews/summary":
                qs = urllib.parse.parse_qs(parsed.query)
                ids = [i for i in qs.get("ids", [""])[0].split(",") if i]
                if not ids:
                    return self._send_json(200, {"summaries": {}})
                placeholders = ",".join("?" for _ in ids)
                rows = conn.execute(
                    f"SELECT product_id, rating FROM reviews WHERE product_id IN ({placeholders})",
                    ids,
                ).fetchall()
                by_product: dict[str, list[sqlite3.Row]] = {}
                for row in rows:
                    by_product.setdefault(row["product_id"], []).append(row)
                summaries = {pid: summarize(rs) for pid, rs in by_product.items()}
                return self._send_json(200, {"summaries": summaries})

            # Saleor's global IDs are base64 (can contain +, /, =), so this
            # matches any non-slash segment rather than assuming a
            # character set, then unquotes the percent-encoding the
            # storefront's encodeURIComponent applies to those characters.
            match = re.fullmatch(r"/reviews/([^/]+)", parsed.path)
            if match:
                product_id = urllib.parse.unquote(match.group(1))
                rows = conn.execute(
                    "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
                    (product_id,),
                ).fetchall()
                return self._send_json(200, {
                    "reviews": [review_to_dict(r) for r in rows],
                    **summarize(rows),
                })

            self._send_json(404, {"error": "Not found"})
        finally:
            conn.close()

    def do_POST(self):
        if self.path != "/reviews":
            return self._send_json(404, {"error": "Not found"})

        user = authenticate(self._bearer_token())
        if not user:
            return self._send_json(401, {"error": "Not authenticated"})

        body = self._read_json_body()
        product_id = body.get("productId")
        rating = body.get("rating")
        title = (body.get("title") or "").strip()[:200]
        review_body = (body.get("body") or "").strip()[:4000]

        if not product_id:
            return self._send_json(400, {"error": "productId is required"})
        if not isinstance(rating, int) or not 1 <= rating <= 5:
            return self._send_json(400, {"error": "rating must be an integer 1-5"})

        verified = has_purchased(self._bearer_token(), product_id)

        conn = get_conn()
        try:
            review_id = str(uuid.uuid4())
            conn.execute(
                """
                INSERT INTO reviews (id, product_id, user_id, author_name, rating, title, body, verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(product_id, user_id) DO UPDATE SET
                    rating = excluded.rating,
                    title = excluded.title,
                    body = excluded.body,
                    verified = excluded.verified,
                    updated_at = datetime('now')
                """,
                (review_id, product_id, user["id"], user["name"], rating, title, review_body, int(verified)),
            )
            conn.commit()
            row = conn.execute(
                "SELECT * FROM reviews WHERE product_id = ? AND user_id = ?",
                (product_id, user["id"]),
            ).fetchone()
            return self._send_json(201, review_to_dict(row))
        finally:
            conn.close()

    def do_DELETE(self):
        match = re.fullmatch(r"/reviews/([\w-]+)", self.path)
        if not match:
            return self._send_json(404, {"error": "Not found"})

        user = authenticate(self._bearer_token())
        if not user:
            return self._send_json(401, {"error": "Not authenticated"})

        review_id = match.group(1)
        conn = get_conn()
        try:
            owned = conn.execute(
                "SELECT 1 FROM reviews WHERE id = ? AND user_id = ?", (review_id, user["id"])
            ).fetchone()
            if not owned:
                return self._send_json(404, {"error": "Review not found"})
            conn.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
            conn.commit()
            return self._send_json(200, {"ok": True})
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
    logger.info("Reviews service listening on :%d (db: %s)", port, DB_PATH)
    server.serve_forever()
