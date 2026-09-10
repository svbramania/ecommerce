import { cookies } from "next/headers";
import { saleorClient } from "./saleor-client";
import { CheckoutDetailsDocument, type CheckoutFieldsFragment } from "@/gql/generated/graphql";

export const DEFAULT_CHANNEL = "default-channel";
const CHECKOUT_COOKIE = "checkoutId";
const PAYPAL_TRANSACTION_COOKIE = "paypalTransactionId";

// Saleor has no separate "cart" object — the Checkout object IS the cart
// until checkoutComplete turns it into an Order. We track its id in a
// plain cookie (no auth needed for a guest cart, matches Saleor's own
// model) and re-fetch full details from the API on every read rather than
// caching cart contents client-side, so totals/stock are always current.

export async function getStoredCheckoutId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CHECKOUT_COOKIE)?.value ?? null;
}

export async function storeCheckoutId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CHECKOUT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearStoredCheckoutId(): Promise<void> {
  const store = await cookies();
  store.delete(CHECKOUT_COOKIE);
}

export async function fetchCheckout(id: string): Promise<CheckoutFieldsFragment | null> {
  const result = await saleorClient.query(CheckoutDetailsDocument, { id }).toPromise();
  return result.data?.checkout ?? null;
}

// Bridges the redirect to PayPal's own site and back — the transaction id
// from transactionInitialize is what /paypal-return needs to call
// transactionProcess once the buyer approves there.
export async function storePaypalTransactionId(id: string): Promise<void> {
  const store = await cookies();
  store.set(PAYPAL_TRANSACTION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function getStoredPaypalTransactionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PAYPAL_TRANSACTION_COOKIE)?.value ?? null;
}

export async function clearStoredPaypalTransactionId(): Promise<void> {
  const store = await cookies();
  store.delete(PAYPAL_TRANSACTION_COOKIE);
}
