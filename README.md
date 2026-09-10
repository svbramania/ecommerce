# Ecommerce

A Saleor-based ecommerce platform, built to match the supplier/3PL
integration depth of Shopify's app ecosystem — see `docs/` for the
architecture decisions and phased roadmap.

- `docs/PROJECT_STATUS.md` — honest one-page status of all 5 phases
- `docs/architecture.md` — stack, cloud-portability plan, known gaps
- `docs/phase-0-foundation.md`, `phase-1-mvp.md`, `phase-2-fulfillment.md`,
  `phase-3-scale.md`, `phase-4-growth.md`, `phase-5-platform.md` — per-phase detail

## Quickstart (local dev)

```bash
docker compose up -d
docker compose exec api python3 manage.py migrate
```

Then, in another terminal:

```bash
cd storefront
npm install
cp .env.local.example .env.local
npm run dev
```

- Storefront: http://localhost:3000
- Saleor Dashboard (admin): http://localhost:9000
- Saleor GraphQL API: http://localhost:8000/graphql/
- Mailpit (local email inbox): http://localhost:8025

Copy `.env.example` to `.env` and fill in real values (Stripe test keys,
etc.) before anything beyond the default local setup.
