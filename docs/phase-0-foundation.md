# Phase 0 — Foundation

Status as of 2026-09-09. See `docs/architecture.md` for the stack/portability
decisions this builds on.

## Done and verified (not just written — actually run locally)

- **Repo structure**: `backend/` (Saleor config/env files — no vendored
  source, runs from official images), `storefront/` (Next.js app),
  `infra/terraform/` (placeholder, no cloud target yet), `docs/`.
- **Saleor core deployed locally**: `docker-compose.yml` brings up
  Postgres, Redis, the Saleor API (GraphQL), Celery worker, Saleor
  Dashboard, and Mailpit (catches outbound email locally). Verified live:
  migrations applied cleanly, `{ shop { name } }` returned real data over
  GraphQL, the Dashboard responded HTTP 200, Mailpit's inbox responded
  HTTP 200.
- **Auth scaffolding**: a local dev superuser exists
  (`admin@example.com` / `admin12345` — dev-only, not a real credential,
  never used outside this laptop's containers). Saleor's own
  permission-group system (RBAC) is built in and managed through the
  Dashboard from here — nothing custom needed on top for Phase 0.
- **Next.js storefront scaffold**: TypeScript, Tailwind, App Router,
  `urql` GraphQL client, GraphQL Code Generator wired to Saleor's live
  schema (`npm run codegen`). The homepage is a real server component that
  queries Saleor's `shop { name }` and renders the live result — verified
  by actually running it (`npm run dev`, `npm run build`) and confirming
  the rendered HTML contains the real shop name, not a mock. One real bug
  found and fixed in the process: `urql`'s default GET-based query request
  hit Saleor's GraphQL Playground route instead of executing the query;
  fixed by setting `preferGetMethod: false` on the client
  (`storefront/src/lib/saleor-client.ts`).
- **CI**: `.github/workflows/ci.yml` lints and builds the storefront, and
  validates `docker-compose.yml` syntax, on every push/PR to `main`.
- **Secrets hygiene**: `.env.example` documents every credential needed;
  `.gitignore` excludes real `.env`/`.env.local` files.

## Not done yet (genuine gaps, not silently skipped)

- **Payment processor (Stripe) sandbox wiring** — blocked on a real
  decision + credential only the user can provide: Stripe test API keys
  (`dashboard.stripe.com/test/apikeys`). Placeholders are documented in
  `.env.example`; nothing fabricated in their place.
- **Object storage (S3-compatible / MinIO)** — see the "Known gap" in
  `docs/architecture.md`. Local dev uses Saleor's default local-volume
  media storage instead for now.
- **Staging/prod environments** — Phase 0 only stood up local dev. No
  cloud account/target has been chosen yet (see `infra/terraform/README.md`).
- **`RSA_PRIVATE_KEY` / JWT signing key** — Saleor is currently generating
  a temporary key at container start (fine for local dev; logged as a
  warning). Needs an explicit, persisted key before anything beyond a
  laptop, so JWTs survive a container restart.

## How to run this locally

```bash
docker compose up -d
docker compose exec api python3 manage.py migrate
cd storefront && npm install && npm run dev
```

Dashboard: http://localhost:9000 (login with the dev superuser above).
API: http://localhost:8000/graphql/. Mailpit inbox: http://localhost:8025.
