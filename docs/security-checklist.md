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
| `api-introspection` | **gap, real** | Tested live: full schema introspection (1,483 types) returned to an *anonymous* request. Saleor has no documented env var for this — gating it needs a small custom component (a GraphQL-aware reverse proxy, or Saleor middleware) that inspects for `__schema`/`__type` and requires staff auth. Not built — this is genuine new engineering, not a config flip, and rushing it under time pressure would be worse than flagging it clearly. |
| `api-depth` | **partially done** | Saleor's cost-based complexity limiting is on by default (`maximumAvailable: 50000` shows up in every response's `extensions.cost`) — the mechanism exists and is active. Nobody has decided if 50000 is the right ceiling for this app; that's a tuning decision for closer to launch, not a code gap. |
| `be-secrets` | **gap, known, documented** | `backend/backend.env`'s `SECRET_KEY=changeme` is intentionally committed (matches Saleor's own public reference repo's convention, dev-only). No secrets manager exists — required before anything beyond a laptop. Already flagged in `docs/architecture.md`. |
| `be-deps` | **gap** | No automated dependency/CVE scanning configured yet (already listed as a cross-cutting gap since Phase 0). |
| `infra-creds` | **partially done** | The Phase 2 fulfillment connector already gets its own scoped app token (`MANAGE_ORDERS`/`MANAGE_SHIPPING` only), not a shared superuser credential — least-privilege by construction for that one piece. Nothing else has distinct credentials yet since nothing else exists. |

## Phase 1 — MVP store

| Item | Status | Note |
|---|---|---|
| `pay-recompute` | **done** | Structural, not something we added: the storefront never sends a price to trust — every total is Saleor's own server-computed `checkout.totalPrice`. |
| `pay-negative` | **done, verified live** | Tested directly: `checkoutCreate` with `quantity: -5` and `quantity: 0` both rejected with `ZERO_QUANTITY` — Saleor's own validation, not custom code. |
| `pay-webhook`, `pay-tokenize` | **blocked** | No payment gateway wired yet (needs real Stripe test keys). |
| `sf-csp` | **fixed this pass** | See below — CSP header added to the storefront. |
| `sf-sanitize` | **fixed this pass** | See below — the EditorJS description renderer sanitizes before rendering, built at the same time as the renderer itself rather than bolted on after. |
| `auth-privilege`, `auth-reset` | **fixed this pass** | See below — customer accounts (register/login/reset) built against Saleor's own account mutations. |
| `api-field-exposure` | **n/a so far** | No endpoint currently returns anything beyond what the buyer placing the order should see; revisit once customer order-history pages exist. |
| `api-rate-limit` | **gap** | No rate limiting on login/checkout/coupon-apply yet — needs an actual edge/proxy layer (e.g. Next.js middleware or a real API gateway), tracked as real follow-up work, not built this pass. |

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
