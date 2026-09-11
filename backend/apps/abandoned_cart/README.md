# Abandoned-cart email reminders

Any checkout still returned by Saleor's own `checkouts` query is, by
definition, not yet an order — confirmed live across every payment flow
tested this session: once a checkout completes (`checkoutComplete`),
Saleor consumes it and its id stops being queryable. So "a checkout
with a real email, last touched more than `ABANDONED_CART_HOURS` ago"
is a genuine abandoned cart signal, not a guess.

One-shot script (`reminder.py`), not a daemon — run on a schedule
(cron/Celery beat) in a real deployment. Sends real transactional
email through the same infrastructure Saleor itself uses (`EMAIL_URL`
— Mailpit locally, a real SMTP server elsewhere) via stdlib `smtplib`.

## Real finding: checkout/line price totals lag right after creation

`CheckoutFilterInput.updatedAt` is a `DateRangeInput` — date-level only,
not a datetime range (confirmed live: a `DateTime!` variable produced a
real GraphQL type-mismatch error). The query uses it only as a coarse
same-day pre-filter; the real hour-precision `ABANDONED_CART_HOURS`
cutoff is applied in Python against each checkout's actual `updatedAt`.

More significantly: both `checkout.totalPrice` and `line.totalPrice`
can read as exactly `0` immediately after `checkoutCreate` — Saleor
appears to compute these lazily, and a plain requery moments later
shows the correct value. This was proven live twice, independently:
first trusting `checkout.totalPrice` (showed `0.0 USD` on a real,
priced cart), then switching to summing `line.totalPrice` per line
(same result — `0.0 USD` — on a second fresh test checkout, proving
the lag isn't specific to the checkout-level field).

The fix: compute the email total from `variant.pricing.price.gross`
(quantity × each line's variant real-time channel price) instead of
any checkout- or line-level cached total. `pricing` isn't
checkout-specific, so it isn't subject to that lazy-calculation lag.
Verified live with a third fresh test product/checkout — the email
correctly read "4 item(s) ... totaling 39.0 USD" (4 × $9.75).

## Idempotency

Sending sets `abandoned_cart_reminder_sent` metadata on the checkout;
subsequent runs skip any checkout that already carries it. Verified
live: two already-reminded checkouts were correctly skipped on a later
run that also found and reminded a new one.

## Resume link

`{SITE_URL}/cart/resume/{checkoutId}` → the storefront's
`src/app/cart/resume/[id]/page.tsx` stores that checkout id as the
visitor's active cart cookie and redirects to `/cart` — same trust
level as the plain (unsigned) checkout-id cookie the rest of the
storefront already uses. A real deployment sending real customer data
by email may want a signed/expiring token instead.

## Not built

- No scheduler — this is a script, run manually or via cron/Celery
  beat in a real deployment.
- No email content customization beyond a plain-text body (matches the
  rest of Phase 1's stance on Saleor's default email templates).
