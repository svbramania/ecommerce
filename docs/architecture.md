# Architecture decisions

## Stack

- **Backend**: [Saleor](https://saleor.io) (Python/Django + GraphQL), run from
  the official `ghcr.io/saleor/saleor` images — not vendored into this repo.
  Chosen over Medusa (Node/TypeScript) specifically for Django's
  secure-by-default posture: built-in CSRF protection, an ORM that
  parameterizes queries (blocks SQL injection by default), and
  auto-escaped templates (blocks XSS by default).
- **Storefront**: Next.js (TypeScript, App Router) in `storefront/`, talking
  to Saleor over GraphQL via `urql`.
- **Database**: PostgreSQL. **Cache / Celery broker**: Redis.

## Cloud portability (build once, move later — including the data)

The whole stack is deliberately built so a later move to any cloud provider
is a configuration change, not a rewrite:

- **Everything runs in Docker.** The same images/containers that run on a
  laptop run identically on a VPS or any cloud container service.
- **Postgres, not a proprietary database.** Every major cloud offers a
  managed Postgres (RDS, Cloud SQL, Azure Database for PostgreSQL). Moving
  the data later is `pg_dump`/restore or logical replication, not a rewrite.
- **12-factor config.** Every environment-specific value — DB connection,
  secrets, API keys — comes from environment variables (see
  `.env.example`, `backend/*.env`). Moving environments means pointing at
  new env vars, not editing code.
- **No cloud-proprietary services yet.** No serverless-only functions, no
  proprietary NoSQL, no IAM-coupled auth. Those are exactly what would lock
  this in and make a later migration expensive.

## Known gap: object storage

Saleor supports S3 (and S3-compatible services like Cloudflare R2/Backblaze
B2) for media/static files via documented `AWS_*` env vars
(`AWS_ACCESS_KEY_ID`, `AWS_STORAGE_BUCKET_NAME`, `AWS_MEDIA_BUCKET_NAME`,
etc. — see Saleor's own docs at `/setup/media-s3`). What's **not**
confirmed yet: those docs don't list a custom-endpoint override, which is
normally what's needed to point at a self-hosted S3-compatible target like
MinIO rather than real AWS S3. Local dev currently uses Saleor's default
local-volume media storage (a named Docker volume, `saleor-media`) instead.

Before wiring MinIO into local dev or a self-hosted S3-compatible target
into staging, this needs a short, deliberate spike to confirm whether
Saleor's storage backend (via `django-storages`) honors a custom endpoint,
or whether a small settings override is required. Not started — tracked
here rather than guessed at in code.

## Testing approach

Property-based / randomized (Monte Carlo-style) testing for business logic
with real combinatorial edge-case surface — pricing, tax, inventory
allocation, discount stacking, multi-warehouse stock splits — using
Hypothesis once that code exists (Phase 2+). Simple CRUD/UI smoke tests use
plain fixed-example tests where randomization doesn't add value.
