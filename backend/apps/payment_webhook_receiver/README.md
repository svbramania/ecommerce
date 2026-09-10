# Payment webhook receiver (Saleor Payment Apps for Stripe and PayPal)

Implements Saleor's four synchronous transaction webhooks — see
`receiver.py`'s module docstring and Saleor's own "Building a Payment App"
docs. Unlike `fulfillment_webhook_receiver/` (async, fire-and-forget),
these are synchronous: Saleor's checkout mutations call out to this
service and wait for the HTTP response before returning.

## Setup (already done once for local dev)

1. Create the Saleor App (staff-authenticated):
   ```graphql
   mutation {
     appCreate(input: {
       name: "Custom Stripe Payment App"
       identifier: "custom.payment.stripe"
       permissions: [HANDLE_PAYMENTS]
     }) { app { id } authToken errors { field message } }
   }
   ```

2. Register the four sync webhooks against that app, each with a
   subscription query (not the legacy fixed payload) — see `webhookCreate`
   calls used while building this, one per event:
   `PAYMENT_GATEWAY_INITIALIZE_SESSION`, `TRANSACTION_INITIALIZE_SESSION`,
   `TRANSACTION_PROCESS_SESSION`, `TRANSACTION_REFUND_REQUESTED`, each
   `targetUrl` pointing at `http://payment-webhook:8081/webhooks/<path>`.

3. `backend/payment.env` (gitignored) holds `PAYMENT_WEBHOOK_SECRET` —
   must match the `secretKey` used when creating the webhooks above.
   Stripe's own keys come from the root `.env` (`STRIPE_SECRET_KEY`,
   `STRIPE_PUBLISHABLE_KEY`) via `docker-compose.yml`'s `env_file: [.env,
   backend/payment.env]` on this service.

## Verified live (2026-09-10) — the full chain, not just this service in isolation

- Signature verification: a bad `Saleor-Signature` is rejected with 401.
- `PAYMENT_GATEWAY_INITIALIZE_SESSION`: returns the real publishable key
  from `.env`.
- `TRANSACTION_INITIALIZE_SESSION`: creates and confirms a real Stripe
  PaymentIntent using Stripe's test PaymentMethod (`pm_card_visa`),
  confirmed directly against Stripe's own API afterward (`status:
  succeeded`).
- `TRANSACTION_REFUND_REQUESTED`: refunds that same PaymentIntent, also
  confirmed directly against Stripe's API.
- **The full Saleor-orchestrated flow**, not just this service called
  directly: `paymentGatewayInitialize` → `transactionInitialize` →
  `checkoutComplete` against a real checkout, resulting in a real Order
  with `isPaid: true` and the correct captured amount.
- **The real storefront UI**, through an actual browser: added a product
  to cart, filled a real Stripe Elements card form with Stripe's test
  card (4242 4242 4242 4242), and completed a real order — see
  `docs/phase-1-mvp.md`.

One real bug was found and fixed during this: the initial implementation
assumed Saleor wraps the delivered payload in an `"event"` key (matching
Saleor's generic webhook docs) — the actual delivered payload for a
subscription-query webhook puts the selected fields at the top level
instead (the same real finding already documented in
`fulfillment_webhook_receiver`).

## Known gaps — not built (Stripe)

- **3D Secure / `CHARGE_ACTION_REQUIRED` follow-through**: the code
  returns this result correctly, but the storefront doesn't yet drive
  Stripe.js's confirmation step for it — only cards that don't trigger
  3DS (like the test card above) complete today. A real gap, not
  something to fake past.
- **Idempotency-Key is wired in** (`idempotencyKey` from the webhook
  payload passed to Stripe's `POST /payment_intents` call) so a
  redelivered `TRANSACTION_INITIALIZE_SESSION` doesn't double-charge —
  this part is done, just calling it out since it's easy to miss.
- No webhook exists yet for Stripe's *own* async events (e.g., a delayed
  payment method's status changing after the fact) — only the
  Saleor-initiated sync webhooks are implemented.

## PayPal — a second payment app, same service

A second Saleor App (`identifier: "custom.payment.paypal"`) with its own
four sync webhooks, pointed at `/webhooks/paypal-*` routes on this same
container — same pattern as Stripe, different real provider (PayPal
Orders API v2, OAuth2 client-credentials token cached in-process). PayPal's
flow is inherently redirect-based (the buyer approves on PayPal's own
site), unlike Stripe's single-call test-card path, so `transactionInitialize`
always returns `CHARGE_ACTION_REQUIRED` with an `approvalUrl` — the
storefront (`PaypalButton.tsx`) redirects the browser there, and
`/paypal-return` calls `transactionProcess` (which captures the order)
once the buyer is back.

### Verified live (2026-09-10)

- Real OAuth2 token obtained from PayPal's sandbox.
- Real order created via `POST /v2/checkout/orders` — confirmed directly
  against PayPal's own `GET /v2/checkout/orders/{id}`, correct $25.00
  USD, status `CREATED`.
- The real `approvalUrl` genuinely resolves to PayPal's actual sandbox
  checkout page, showing the correct amount — opened it in a real
  browser and reached PayPal's guest-checkout card form.
- A capture attempt against an order the buyer hadn't approved yet
  correctly failed with PayPal's real `ORDER_NOT_APPROVED` error, proving
  the failure path surfaces PayPal's actual reason rather than a generic
  error.
- **Through Saleor's own `transactionInitialize` mutation** against a
  real checkout (not just this service directly): got back the same real
  order id, `CHARGE_ACTION_REQUIRED`, and a working `approvalUrl` — the
  exact response the storefront's `startPaypalCheckout` action consumes.

### Not completed — a real, honest gap

Clicking all the way through PayPal's own hosted guest-checkout form
(via browser automation) did not complete — the form stopped advancing
past the account-creation step for reasons that could not be confirmed
(possibly PayPal's own bot-detection on their hosted page, possibly a
subtle validation issue), and this was not pursued further since it's
testing PayPal's UI robustness, not this integration's code. **The buyer-
approval step itself has not been completed end-to-end** — only the
order-creation and capture-attempt halves have real, direct verification.
This needs either a real PayPal sandbox buyer account (created via the
PayPal developer dashboard's "Sandbox accounts" page) or the user
completing one real checkout themselves to close the loop.
