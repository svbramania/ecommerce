"use server";

import { saleorClient } from "@/lib/saleor-client";
import { getStoredCheckoutId, clearStoredCheckoutId } from "@/lib/checkout";
import {
  CheckoutCompleteDocument,
  PaymentGatewayInitializeDocument,
  TransactionInitializeDocument,
} from "@/gql/generated/graphql";

// Must match the identifier the payment app was created with
// (backend/apps/payment_webhook_receiver — see its README).
const STRIPE_GATEWAY_ID = "custom.payment.stripe";

export type PaymentInitResult =
  | { ok: true; publishableKey: string }
  | { ok: false; error: string };

export async function initializePayment(): Promise<PaymentInitResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(PaymentGatewayInitializeDocument, { checkoutId, gatewayId: STRIPE_GATEWAY_ID })
    .toPromise();

  const config = result.data?.paymentGatewayInitialize?.gatewayConfigs?.[0];
  const topErrors = result.data?.paymentGatewayInitialize?.errors ?? [];
  const configErrors = config?.errors ?? [];
  if (topErrors.length || configErrors.length) {
    const msg = topErrors[0]?.message ?? configErrors[0]?.message ?? "Payment init failed.";
    return { ok: false, error: msg };
  }

  const publishableKey = (config?.data as { publishableKey?: string } | null)?.publishableKey;
  if (!publishableKey) return { ok: false, error: "No publishable key returned." };

  return { ok: true, publishableKey };
}

export type ChargeResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

export async function chargeAndCompleteCheckout(
  paymentMethodId: string,
  amount: number
): Promise<ChargeResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const txnResult = await saleorClient
    .mutation(TransactionInitializeDocument, {
      checkoutId,
      gatewayId: STRIPE_GATEWAY_ID,
      data: { paymentMethodId },
      amount,
    })
    .toPromise();

  const txnErrors = txnResult.data?.transactionInitialize?.errors ?? [];
  if (txnErrors.length) return { ok: false, error: txnErrors[0].message ?? "Charge failed." };

  const eventType = txnResult.data?.transactionInitialize?.transactionEvent?.type;
  if (eventType !== "CHARGE_SUCCESS") {
    // CHARGE_ACTION_REQUIRED (3D Secure) isn't handled by this storefront
    // yet — a real, documented gap (see docs/phase-1-mvp.md), not silently
    // swallowed.
    const message = txnResult.data?.transactionInitialize?.transactionEvent?.message;
    return { ok: false, error: message || `Unexpected transaction result: ${eventType}` };
  }

  const completeResult = await saleorClient
    .mutation(CheckoutCompleteDocument, { checkoutId })
    .toPromise();

  const completeErrors = completeResult.data?.checkoutComplete?.errors ?? [];
  if (completeErrors.length) {
    return { ok: false, error: completeErrors[0].message ?? "Order completion failed." };
  }

  const order = completeResult.data?.checkoutComplete?.order;
  if (!order) return { ok: false, error: "No order was created." };

  await clearStoredCheckoutId();
  return { ok: true, orderNumber: order.number };
}
