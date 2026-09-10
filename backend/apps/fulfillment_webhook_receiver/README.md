# Fulfillment webhook receiver (reference 3PL connector)

This is the concrete implementation of the "fulfillment-service" pattern
described in `docs/architecture.md`: a 3PL's system receives `ORDER_CREATED`
from Saleor via webhook, prepares the shipment on its own side, then calls
back into Saleor to create a fulfillment and (once shipped) a tracking
number. `receiver.py` is that contract in its simplest real form — a real
3PL connector replaces the placeholder "fulfill everything immediately"
logic with its own warehouse/stock decisions, but the webhook receipt,
signature verification, and the two callback mutations
(`orderFulfill`, `orderFulfillmentUpdateTracking`) are the reusable part.

## Setup (already done once for local dev — see below for the exact commands)

1. Create a Saleor App representing the connector (staff-authenticated):
   ```graphql
   mutation {
     appCreate(input: {
       name: "Default 3PL Fulfillment Connector"
       permissions: [MANAGE_ORDERS, MANAGE_SHIPPING]
     }) { app { id } authToken errors { field message } }
   }
   ```
   Save `authToken` as `FULFILLMENT_CONNECTOR_APP_TOKEN` in `.env` — never
   committed (it's a real credential for this Saleor instance, even though
   it's local-only).

2. Register the webhook, using a subscription query so the payload shape
   is explicit rather than relying on Saleor's legacy fixed payload:
   ```graphql
   mutation($q: String!) {
     webhookCreate(input: {
       name: "order-created-fulfillment"
       targetUrl: "http://fulfillment-webhook:8080/webhooks/order-created"
       asyncEvents: [ORDER_CREATED]
       app: "<the app id from step 1>"
       isActive: true
       secretKey: "<a real random secret — matches FULFILLMENT_WEBHOOK_SECRET>"
       query: $q
     }) { webhook { id } errors { field message code } }
   }
   ```
   with `$q` set to:
   ```graphql
   subscription {
     event {
       ... on OrderCreated {
         order { id lines { id quantity } }
       }
     }
   }
   ```

Both steps verified live against the local stack while building this.

## Known real gap — needs your decision, not made for you

Verified live: the App and webhook were created successfully, the
receiver container runs and passed its signature-verification code path,
and a real order was placed (via `draftOrderCreate`/`draftOrderComplete` —
Saleor's manual-order flow, which doesn't need a payment gateway, so this
didn't wait on Stripe). **The webhook delivery itself is currently
blocked** by Saleor's own SSRF protection: the worker logs show a real
`Forbidden IP address ... Invalid IP address` failure when it tries to
reach `http://fulfillment-webhook:8080` — Saleor's `HTTP_IP_FILTER_ENABLED`
setting refuses to call webhook targets on private/internal IP ranges by
default, and the docker-compose internal network address this receiver
lives at counts as one.

Saleor's own config docs describe exactly this: `HTTP_IP_FILTER_ENABLED`
should be set to `False` "to enable local apps development using docker
host" (recommended `True` for production, where a real 3PL's endpoint is
a public HTTPS URL, not a private IP, so the setting wouldn't need to
relax there anyway). That's a one-line change in `backend/common.env` —
deliberately not made here, since disabling a security filter (even a
narrowly-scoped, well-documented, dev-only one) is exactly the kind of
change this project treats as needing an explicit decision rather than
being made silently. Once approved: set `HTTP_IP_FILTER_ENABLED=False` in
`backend/common.env`, restart `api`/`worker`, and this whole chain
(order created → webhook delivered → fulfillment created → tracking
number set) can be verified live end-to-end.
