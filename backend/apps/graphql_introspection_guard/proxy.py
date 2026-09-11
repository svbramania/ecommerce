"""Reverse proxy in front of Saleor's GraphQL endpoint that blocks
anonymous/non-staff schema introspection — security-checklist item
api-introspection.

Real finding this exists because of: Saleor's `GRAPHQL_MIDDLEWARE`
setting (the documented extension point for this) is hardcoded to `[]`
in the official image's settings.py, not read from an env var — there
is no config flip to gate introspection. The only way to add one
without forking/vendoring Saleor's source (a deliberate architecture
decision this project made from the start, see docs/architecture.md)
is a proxy in front of it, same as every other "extend Saleor without
forking it" piece in backend/apps/.

Every real GraphQL client this app ships (storefront, the webhook
receivers) uses pre-built queries, never live introspection — so this
never affects normal traffic. It only blocks a request whose query
string contains `__schema`/`__type` (the introspection meta-fields)
UNLESS the caller's own Authorization header belongs to a real Saleor
staff user, verified by asking Saleor itself (`{ me { isStaff } }`)
rather than re-implementing JWT verification here — the same
"delegate the trust decision to the authoritative system" pattern the
payment/tax/shipping webhook receivers already use for signature
verification.

Deliberately stdlib-only (http.server + urllib), matching every other
app in backend/apps/ — this is a security-relevant chokepoint, not the
place to add a new framework dependency's own supply-chain risk.
"""
from __future__ import annotations

import json
import logging
import os
import re
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("graphql_introspection_guard")

# The real Saleor API, reachable over the docker-compose internal network
# by service name — never published to the host directly (see
# docker-compose.yml's comment on the `api` service).
UPSTREAM_URL = os.environ.get("UPSTREAM_SALEOR_URL", "http://api:8000/graphql/")
# Word-boundary match, not a plain substring — confirmed live that urql's
# cacheExchange injects `__typename` into every real query for cache
# normalization, and a naive `"__type" in query` check flags that as
# introspection too (a real false positive found while wiring the
# storefront through this proxy). `__typename` has no boundary after
# "__type", so \b__type\b correctly excludes it while still matching the
# real `__type(name: ...)` introspection field.
INTROSPECTION_PATTERN = re.compile(r"\b__schema\b|\b__type\b")

IS_STAFF_QUERY = json.dumps({"query": "{ me { isStaff } }"}).encode()


def is_introspection_query(body: bytes) -> bool:
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        return False
    query = parsed.get("query") or ""
    return bool(INTROSPECTION_PATTERN.search(query))


def caller_is_staff(auth_header: str | None) -> bool:
    if not auth_header:
        return False
    req = urllib.request.Request(
        UPSTREAM_URL,
        data=IS_STAFF_QUERY,
        headers={"Content-Type": "application/json", "Authorization": auth_header},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
    except (urllib.error.URLError, json.JSONDecodeError):
        return False
    me = (result.get("data") or {}).get("me") or {}
    return bool(me.get("isStaff"))


def forward(method: str, headers: dict, body: bytes | None) -> tuple[int, dict, bytes]:
    req = urllib.request.Request(UPSTREAM_URL, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as err:
        return err.code, dict(err.headers or {}), err.read()


class Handler(BaseHTTPRequestHandler):
    def _proxy(self, method: str) -> None:
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else None

        if method == "POST" and body and is_introspection_query(body):
            if not caller_is_staff(self.headers.get("Authorization")):
                logger.warning(
                    "Blocked anonymous/non-staff introspection query from %s",
                    self.address_string(),
                )
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"errors": [{"message": "Introspection is not available."}]}
                    ).encode()
                )
                return

        forward_headers = {
            k: v
            for k, v in self.headers.items()
            if k.lower() not in ("host", "content-length")
        }
        status, resp_headers, resp_body = forward(method, forward_headers, body)

        self.send_response(status)
        for k, v in resp_headers.items():
            if k.lower() not in ("content-length", "transfer-encoding", "connection"):
                self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)

    def do_POST(self):
        self._proxy("POST")

    def do_GET(self):
        self._proxy("GET")

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    logger.info("GraphQL introspection guard listening on :%d, forwarding to %s", port, UPSTREAM_URL)
    server.serve_forever()
