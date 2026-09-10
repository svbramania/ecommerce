# Phase 1 — MVP: a working store

Status as of 2026-09-09: **in progress**, not complete. Tracking each
backlog item honestly rather than marking the phase done early.

## Done and verified

- **Default channel/warehouse/shipping zone**: already exist out of the box
  from Saleor's own setup (`default-channel`, USD, US; a "Default
  Warehouse"; a "Default" shipping zone covering US with one flat-rate
  method — currently priced at $0.00, a placeholder the user should set to
  a real rate before launch, not something to invent a number for here).
  Verified live via authenticated GraphQL queries, not assumed.
- **Product listing page** (`storefront/src/app/products/page.tsx`):
  queries Saleor's real `products` catalog for `default-channel`. Verified
  live — the catalog is genuinely empty right now (0 products), and the
  page correctly renders an honest "no products yet" state rather than a
  loading spinner or a fabricated placeholder product. Confirmed by
  building and grepping the actual rendered HTML.

## Not done yet

- Product detail page, cart, checkout flow, single live payment method,
  order lifecycle, customer accounts/login, flat-rate shipping price (real
  business decision needed, not a default), automated single-jurisdiction
  tax, transactional email content, SEO metadata/sitemap.

## Note on the empty catalog

No real product data exists for this business yet. Per the project's
non-fabrication rule, no placeholder/sample products were inserted to make
screens look populated — every screen here is built against the real
(currently empty) catalog and handles that state honestly. Adding real
products (via the Dashboard or a future admin flow) is what will make the
listing page show real inventory — no code change needed for that.
