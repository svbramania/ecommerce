# Gift Registry

## Why this is its own service

Amazon's real footer has a "Registry & Gift List" link. Saleor has no
native concept of a registry, and two things were confirmed live before
picking an architecture:

- A regular customer CAN write metadata on their own `User` account via
  the public API (`updateMetadata` succeeded with a customer JWT, no
  staff permission needed).
- A stranger CANNOT read another customer's data — `user(id: ...)`
  returns a real `PermissionDenied` ("you need MANAGE_STAFF, MANAGE_USERS,
  or MANAGE_ORDERS") for anyone who isn't staff.

So storing a registry as `User.metadata` would only ever produce a
private list the owner can see themselves — not something shareable,
which is the entire point of a registry. Rather than merging a new model
into Saleor's own backend (this project has never forked/extended
Saleor's own codebase — every prior custom-data need used Saleor's own
metadata mechanism or a standalone sidecar), this is a new sidecar
service, same shape as the webhook receivers, with its own small SQLite
store for real persistence across requests.

## Model

- A **registry** has an owner (a real, confirmed Saleor customer,
  verified by forwarding their own JWT to Saleor's `me` query — this
  service has no separate login system), a title, an optional event
  date, and a random unguessable `share_slug` for the public URL.
- A **registry item** references a real Saleor product (and optionally
  variant) by id, a quantity wanted, and a quantity purchased so far.
  Product name/image/price are never stored — every read resolves them
  live from Saleor's own public product query, so a shared registry
  always reflects real current pricing/availability.

## Endpoints

| Method | Path | Auth | What |
|---|---|---|---|
| POST | `/registries` | customer JWT | create a registry |
| GET | `/registries/mine` | customer JWT | list my registries |
| DELETE | `/registries/{id}` | customer JWT, owner | delete a registry |
| POST | `/registries/{id}/items` | customer JWT, owner | add an item |
| DELETE | `/registries/{id}/items/{item_id}` | customer JWT, owner | remove an item |
| GET | `/registries/public/{slug}` | none | public view (the share link) |
| POST | `/registries/public/{slug}/items/{item_id}/purchase` | none | mark N purchased |

The "no auth" purchase endpoint is deliberate — matching real registry
UX, a gift-giver marks something bought without creating an account.

## Not built

- Email notification to the owner when something is purchased — no
  email-sending credential exists in this stack for this service yet
  (Saleor's own transactional email is separate).
- Editing an item's wanted quantity in place — remove and re-add instead.
- Any protection against someone hammering the public purchase endpoint
  to grief a registry (mark everything "purchased" without buying it) —
  a real deployment would want rate limiting or requiring the purchaser
  to at least give a name, which Amazon's own registries do.
- Pagination on `/registries/mine` — fine at real personal-registry
  scale, would need it if this became a multi-registry-per-business
  feature.

## Running it

Starts automatically with `docker compose up` (service name
`gift-registry`, port 8094 on the host). The SQLite file persists in the
`gift-registry-data` named volume across restarts.
