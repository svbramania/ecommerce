# GraphQL introspection guard

Security-checklist item `api-introspection`. A reverse proxy in front
of Saleor's `/graphql/` endpoint that blocks anonymous/non-staff
schema introspection, while passing every other request through
unmodified.

## Why a proxy, not a config flip

Verified live against the running container: Saleor's
`GRAPHQL_MIDDLEWARE` setting (the documented extension point for this)
is hardcoded to `[]` in the official image's `settings.py`, not read
from an environment variable —

```
GRAPHQL_MIDDLEWARE: list[str] = []
```

so there's no way to inject a custom introspection-gating middleware
without forking/vendoring Saleor's source, which this project
deliberately avoids (see docs/architecture.md). A proxy in front of the
endpoint is the same "extend Saleor without forking it" pattern every
other app in `backend/apps/` already uses.

## How it decides

Every real GraphQL client this app ships (the storefront, the
fulfillment/payment/tax/shipping webhook receivers) uses pre-built
queries — none of them do live introspection. So the guard only acts
on a request whose query contains the introspection root fields
(`__schema`, `__type`), and even then only blocks it if the caller
isn't a real Saleor staff user. It checks this by asking Saleor itself
— `{ me { isStaff } }` using the caller's own `Authorization` header —
rather than re-implementing JWT verification, the same
"delegate the trust decision to the authoritative system" pattern the
payment/tax/shipping receivers use for HMAC signature verification.

**Real bug found and fixed during verification**: the first version
matched introspection with a plain substring check (`"__type" in
query`), which also matches `__typename` — a field urql's
`cacheExchange` injects into every real query for cache normalization.
This broke the storefront's actual product listing page (blocked as
"introspection") the moment it was pointed at the guard. Fixed with a
word-boundary regex (`\b__type\b`) that matches standalone `__type(...)`
but not `__typename`.

## Verified live (2026-09-10)

- A normal anonymous query (`{ shop { name } }`) — passes.
- A query containing `__typename` (what urql actually sends) — passes,
  confirming the false-positive above is fixed.
- An anonymous `{ __schema { types { name } } }` — blocked, `403`.
- The same query with a garbage/invalid bearer token — still blocked
  (the is-staff check itself fails closed).
- The same query with a real, confirmed customer account's token
  (authenticated, but not staff) — still blocked. The test customer
  was deleted afterward.
- The same query with a real staff token — passes, returned all 1,483
  schema types (matching the count the original security-checklist
  pass found exposed).
- The storefront, repointed at the guard
  (`NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8100/graphql/`):
  homepage, the product listing/search page, and a full add-to-cart →
  cart flow with a real throwaway test product all work identically to
  talking to Saleor directly. Test product deleted afterward.

## What changed elsewhere

- `docker-compose.yml`: `api`'s host port is now `127.0.0.1:8000:8000`
  (loopback only, matching the existing `db`/`cache` precedent) instead
  of published on all interfaces — the guard, not Saleor directly, is
  now the real public-facing entry point. A new
  `graphql-introspection-guard` service publishes `8100:8080`,
  forwarding to `api:8000` over the internal compose network.
- `storefront/.env.local` / `.env.example`:
  `NEXT_PUBLIC_SALEOR_API_URL` now points at the guard's port.

## Not built

- Saleor Dashboard isn't rerouted through the guard — it's a
  browser-side SPA with no server-side config (it stores whatever API
  URL you give it in the browser's own localStorage on first visit),
  and it already requires staff login for anything sensitive, which is
  a separate, already-adequate boundary from the one this item is
  about (anonymous introspection). A real public deployment should
  still not expose Saleor's own port directly, regardless of what URL
  a given admin's browser is pointed at.
- The is-staff check makes one extra request to Saleor per
  introspection-shaped request — acceptable given how rare that shape
  is in real traffic, not optimized further (e.g. no short-lived cache
  of "this token is staff").
