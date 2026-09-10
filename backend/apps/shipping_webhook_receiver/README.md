# Shipping webhook receiver (Saleor Shipping App for EasyPost)

Implements `SHIPPING_LIST_METHODS_FOR_CHECKOUT` — called whenever a
checkout's available shipping methods are fetched. Contract verified
against Saleor's shipping-events docs and the live schema before writing.

## Setup (already done once for local dev)

Created the app (`identifier: "custom.shipping.easypost"`, permission
`MANAGE_SHIPPING`) and registered the webhook with a subscription query
selecting the checkout's address, channel, and line quantities/weights.
Unlike the tax app, **no extra channel configuration was needed** —
external shipping methods from a registered shipping app appear
automatically alongside internal ones in `checkout.shippingMethods`.

## Verified live (2026-09-10)

- Called directly with a real destination (179 N Harbor Dr, Redondo
  Beach, CA) and a temporary test origin (123 Main St, Springfield, IL,
  reverted after — see `backend/shipping.env`): got back 11 real rates
  from EasyPost's sandbox — real USPS and FedEx services, real prices,
  real delivery-day estimates.
- **Through Saleor's own checkout**, not just this service directly: a
  real checkout's `shippingMethods` list included both the internal
  "Default" method and every EasyPost rate, each with Saleor's real
  `app:<app-id>:<rate-id>` composite id.
- Selected one of those external rates via `checkoutDeliveryMethodUpdate`
  and confirmed the checkout's `shippingPrice` updated to the exact real
  EasyPost quote ($10.01 for USPS GroundAdvantage).
- Origin reverted to empty afterward — with no `SHIP_FROM_*` configured,
  the receiver returns an empty rate list rather than fabricate an
  origin, so real checkouts show only the internal "Default" method
  until a real warehouse address is supplied.

## Not built

- Multi-parcel/multi-warehouse shipments (only one parcel, one origin).
- Real per-product dimensions — only weight is used (falls back to 1 lb
  for any variant with no weight set); length/width/height aren't tracked
  in the catalog yet, so EasyPost prices this as a generic small parcel.
