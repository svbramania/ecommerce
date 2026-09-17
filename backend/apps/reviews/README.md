# Reviews

Real, customer-submitted product reviews with live verified-purchase
gating. Same sidecar shape as `../gift_registry` — see that service's
docstring for why this isn't Saleor customer metadata or a model merged
into Saleor's own backend.

## Why this exists

Saleor's `Product.rating` is a real field, but there is no backing review
system anywhere in the schema (no `Review` type, no submission mutation).
Before this service, the storefront's `ReviewsSection` could only ever
display a staff-seeded JSON array in product metadata — no customer could
actually leave a review. This replaces that with a real submission path.

## How verified-purchase works

Never trusted from the client. On every submission, the service forwards
the caller's own Saleor customer JWT to `me { orders { lines { variant {
product { id } } } } }` (the same field path `account.graphql`'s
`CurrentUserOrders` already relies on) and checks live whether the
reviewed product ever appears in one of that customer's own real orders.

## Endpoints

```
GET    /reviews/{productId}   (no auth) one product's reviews + average/count
GET    /reviews/summary?ids=a,b  (no auth) average/count for several products at once
POST   /reviews               (auth) submit/update your own review (one per product; resubmitting edits it)
DELETE /reviews/{id}          (auth, owner only)
```

## Not built

- Moderation or profanity filtering — no real moderator role or policy
  exists in this stack.
- Pagination on a single product's review list — fine at real, organic
  review counts.
- Photo/video attachments on a review.
