# Security checklist — mapped into the phased roadmap

Source: a 32-item Saleor/Django security checklist the user shared
(2026-09-10, not something derived internally). Each item is placed in the
phase where it's actually addressed, with real status — not rounded up.
Legend: **done** (verified), **fixed** (this pass), **gap** (real, not yet
done), **blocked** (needs a staging/prod environment or a real account
that doesn't exist yet), **n/a** (nothing built yet for it to apply to).

## Phase 0 — Foundation / infra

| Item | Status | Note |
|---|---|---|
| `infra-db` | **fixed** | `docker-compose.yml`: Postgres/Redis now bound to `127.0.0.1` only, not all interfaces. Verified the API still works after the change. |
| `infra-celery` | **n/a** | Celery tasks are Saleor's own core code (trusted upstream) — no custom tasks written yet. |
| `api-introspection` | **fixed, verified live (2026-09-10)** | Confirmed Saleor's `GRAPHQL_MIDDLEWARE` setting is hardcoded `[]` in the official image (not env-configurable) — no config flip exists, so built `backend/apps/graphql_introspection_guard/` (its own README has full detail): a reverse proxy in front of Saleor's `/graphql/` endpoint that blocks any `__schema`/`__type` query unless the caller's own token is a real Saleor staff account (checked by asking Saleor, not by re-implementing JWT verification). Verified live: anonymous introspection blocked (403), a garbage token blocked, a real non-staff customer account blocked, a real staff token still returns all 1,483 types. `docker-compose.yml`'s `api` port is now loopback-only, matching `db`/`cache`; the guard (`graphql-introspection-guard`, port 8100) is the real public entry point, and the storefront is repointed at it. Found and fixed a real false-positive along the way: a naive substring match on `__type` also matched `__typename` (which urql's cache injects into every query), breaking normal traffic until fixed with a word-boundary regex. |
| `api-depth` | **partially done** | Saleor's cost-based complexity limiting is on by default (`maximumAvailable: 50000` shows up in every response's `extensions.cost`) — the mechanism exists and is active. Nobody has decided if 50000 is the right ceiling for this app; that's a tuning decision for closer to launch, not a code gap. |
| `be-secrets` | **gap, known, documented** | `backend/backend.env`'s `SECRET_KEY=changeme` is intentionally committed (matches Saleor's own public reference repo's convention, dev-only). No secrets manager exists — required before anything beyond a laptop. Already flagged in `docs/architecture.md`. |
| `be-deps` | **fixed, verified (2026-09-10)** | `.github/dependabot.yml` added (npm ecosystem for the storefront, plus github-actions itself). CI (`.github/workflows/ci.yml`) now runs `npm audit --audit-level=high` on every push/PR — confirmed it passes clean locally (0 vulnerabilities) before relying on it as a real gate. `backend/apps/` is deliberately stdlib-only Python (no third-party packages, see each app's README), so there's genuinely nothing else to scan yet. |
| `infra-creds` | **partially done** | The Phase 2 fulfillment connector already gets its own scoped app token (`MANAGE_ORDERS`/`MANAGE_SHIPPING` only), not a shared superuser credential — least-privilege by construction for that one piece. Nothing else has distinct credentials yet since nothing else exists. |

## Phase 1 — MVP store

| Item | Status | Note |
|---|---|---|
| `pay-recompute` | **done** | Structural, not something we added: the storefront never sends a price to trust — every total is Saleor's own server-computed `checkout.totalPrice`. |
| `pay-negative` | **done, verified live** | Tested directly: `checkoutCreate` with `quantity: -5` and `quantity: 0` both rejected with `ZERO_QUANTITY` — Saleor's own validation, not custom code. |
| `pay-webhook` | **done** | Every Saleor→payment-app webhook verifies `Saleor-Signature` (HMAC, same as the fulfillment webhook) before trusting a payload — tested live with a bad signature (401). |
| `pay-tokenize` | **done** | Raw card data never reaches our server — Stripe Elements collects it client-side and only a PaymentMethod id crosses the network to us, confirmed by design in `PaymentForm.tsx`. |
| `sf-csp` | **fixed this pass** | See below — CSP header added to the storefront. |
| `sf-sanitize` | **fixed this pass** | See below — the EditorJS description renderer sanitizes before rendering, built at the same time as the renderer itself rather than bolted on after. |
| `auth-privilege`, `auth-reset` | **fixed this pass** | See below — customer accounts (register/login/reset) built against Saleor's own account mutations. |
| `api-field-exposure` | **done, audited (2026-09-10)** | Order-history pages now exist (`me { orders }` on the account page), so this was actually revisited rather than left as a placeholder: confirmed `me` is Saleor's own access-scoped resolver (always the requesting user, never another customer's data), only the requesting user's own fields are queried, `authedClient()` builds a fresh urql client per request rather than a shared/cached one (ruling out the class of cross-request leak found elsewhere — see docs/phase-4-growth.md's urql caching bug), and no `order(id: ...)`-style lookup exists anywhere in the storefront that could allow guessing another customer's order (`order-confirmation` only echoes back a number already known client-side, no server fetch). |
| `api-rate-limit` | **fixed, verified live (2026-09-10)** | Server Actions (login/register/coupon-apply/checkout-payment) all post to their own page route, so edge middleware can't distinguish them by path — implemented as a shared Redis-backed fixed-window limiter (`storefront/src/lib/rate-limit.ts`, reusing the `cache` Redis instance already in docker-compose) called from inside each action: login (per-IP and per-email, two independent buckets), register (per-IP), `addPromoCode` (per-checkout, stops voucher-code brute-forcing), `chargeAndCompleteCheckout` (per-checkout, stops card-testing). Fails open if Redis is unreachable (a rate limiter shouldn't become a new single point of failure). Verified live end-to-end through the actual login form: 6 real wrong-password submissions, the first 5 showed the normal "invalid credentials" error and the 6th correctly showed "Too many login attempts" — confirmed via Redis directly that the counter reached 6 with the right TTL, then cleaned up. |

## Phase 2 — Supplier & fulfillment

| Item | Status | Note |
|---|---|---|
| `auth-app-scopes` | **done** | The one app that exists (fulfillment connector) already has exactly the scopes it needs, nothing broader. |
| `pay-race` | **n/a, trusted upstream** | Inventory-decrement/stock locking on `orderFulfill` is Saleor core, not our code. |
| `be-uploads` | **relevant here** | See below — the new supplier CSV ingestion tool validates content type/structure before processing, since this is the first place this project accepts an uploaded file. |

## Blocked on a real staging/prod environment (not skipped — nothing to point them at)

`be-debug`, `be-admin`, `auth-mfa`, `infra-https`, `be-deploy-check`,
`sf-scan` — every one of these is meaningless against a local dev box
with one dev superuser and no public URL. Revisit as a pre-launch gate
once a real deployment target exists.

## Phase 3/4 (unchanged from their own docs)

`api-anomaly` (monitoring/alerting — Phase 0 cross-cutting, not started),
`sf-thirdparty` (moot — zero third-party scripts exist), `auth-jwt`
tuning (Saleor's defaults are reasonable; no tuning decision made yet).
