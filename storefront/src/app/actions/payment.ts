"use server";

import { saleorClient } from "@/lib/saleor-client";
import { getStoredCheckoutId, clearStoredCheckoutId } from "@/lib/checkout";
import {
  CheckoutCompleteDocument,
  PaymentGatewayInitializeDocument,
  TransactionInitializeDocument,
  TransactionProcessDocument,
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
  | { ok: false; error: string }
  // 3D Secure: Stripe needs the client to confirm the PaymentIntent
  // itself (a modal/redirect it drives) before the charge can complete.
  | { ok: false; requiresAction: true; clientSecret: string; transactionId: string };

async function completeCheckout(checkoutId: string): Promise<ChargeResult> {
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
  const transactionId = txnResult.data?.transactionInitialize?.transaction?.id;

  if (eventType === "CHARGE_ACTION_REQUIRED") {
    const clientSecret = (txnResult.data?.transactionInitialize?.data as
      | { clientSecret?: string }
      | null)?.clientSecret;
    if (!clientSecret || !transactionId) {
      return { ok: false, error: "3D Secure required but no client secret was returned." };
    }
    return { ok: false, requiresAction: true, clientSecret, transactionId };
  }

  if (eventType !== "CHARGE_SUCCESS") {
    const message = txnResult.data?.transactionInitialize?.transactionEvent?.message;
    return { ok: false, error: message || `Unexpected transaction result: ${eventType}` };
  }

  return completeCheckout(checkoutId);
}

// Called after the storefront has driven Stripe.js's confirmCardPayment
// (the 3D Secure modal) client-side — this tells Saleor's payment app to
// re-check the PaymentIntent and, if it now shows succeeded, complete the
// order. See PaymentForm.tsx.
export async function completeAfterAction(transactionId: string): Promise<ChargeResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const processResult = await saleorClient
    .mutation(TransactionProcessDocument, { transactionId })
    .toPromise();

  const processErrors = processResult.data?.transactionProcess?.errors ?? [];
  if (processErrors.length) {
    return { ok: false, error: processErrors[0].message ?? "Payment confirmation failed." };
  }
  if (processResult.data?.transactionProcess?.transactionEvent?.type !== "CHARGE_SUCCESS") {
    const message = processResult.data?.transactionProcess?.transactionEvent?.message;
    return { ok: false, error: message || "Payment was not completed." };
  }

  return completeCheckout(checkoutId);
}
