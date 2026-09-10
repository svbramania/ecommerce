"use server";

import { saleorClient } from "@/lib/saleor-client";
import {
  getStoredCheckoutId,
  storePaypalTransactionId,
  getStoredPaypalTransactionId,
  clearStoredCheckoutId,
  clearStoredPaypalTransactionId,
} from "@/lib/checkout";
import {
  PaypalTransactionInitializeDocument,
  PaypalTransactionProcessDocument,
  CheckoutCompleteDocument,
} from "@/gql/generated/graphql";

export type PaypalStartResult =
  | { ok: true; approvalUrl: string }
  | { ok: false; error: string };

// Real, not fabricated: PayPal's flow is redirect-based by nature (the
// buyer approves on PayPal's own site) — there is no single-call
// equivalent to Stripe's test-card path. See
// backend/apps/payment_webhook_receiver/README.md for what's verified.
export async function startPaypalCheckout(amount: number): Promise<PaypalStartResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(PaypalTransactionInitializeDocument, { checkoutId, amount })
    .toPromise();

  const errors = result.data?.transactionInitialize?.errors ?? [];
  if (errors.length) return { ok: false, error: errors[0].message ?? "PayPal init failed." };

  const eventType = result.data?.transactionInitialize?.transactionEvent?.type;
  const transactionId = result.data?.transactionInitialize?.transaction?.id;
  const approvalUrl = (result.data?.transactionInitialize?.data as { approvalUrl?: string } | null)
    ?.approvalUrl;

  if (eventType !== "CHARGE_ACTION_REQUIRED" || !approvalUrl || !transactionId) {
    const message = result.data?.transactionInitialize?.transactionEvent?.message;
    return { ok: false, error: message || "PayPal did not return an approval URL." };
  }

  await storePaypalTransactionId(transactionId);
  return { ok: true, approvalUrl };
}

export type PaypalCompleteResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

// Called from /paypal-return once the buyer is back from approving on
// PayPal's site.
export async function completePaypalCheckout(): Promise<PaypalCompleteResult> {
  const checkoutId = await getStoredCheckoutId();
  const transactionId = await getStoredPaypalTransactionId();
  if (!checkoutId || !transactionId) return { ok: false, error: "No pending PayPal checkout." };

  const processResult = await saleorClient
    .mutation(PaypalTransactionProcessDocument, { transactionId })
    .toPromise();

  const processErrors = processResult.data?.transactionProcess?.errors ?? [];
  if (processErrors.length) {
    return { ok: false, error: processErrors[0].message ?? "PayPal capture failed." };
  }
  if (processResult.data?.transactionProcess?.transactionEvent?.type !== "CHARGE_SUCCESS") {
    const message = processResult.data?.transactionProcess?.transactionEvent?.message;
    return { ok: false, error: message || "PayPal payment was not completed." };
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
  await clearStoredPaypalTransactionId();
  return { ok: true, orderNumber: order.number };
}
