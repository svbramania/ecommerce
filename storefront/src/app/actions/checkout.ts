"use server";

import { revalidatePath } from "next/cache";
import { saleorClient } from "@/lib/saleor-client";
import {
  DEFAULT_CHANNEL,
  clearStoredCheckoutId,
  getStoredCheckoutId,
  storeCheckoutId,
} from "@/lib/checkout";
import {
  CheckoutCreateDocument,
  CheckoutDeliveryMethodUpdateDocument,
  CheckoutEmailUpdateDocument,
  CheckoutLinesAddDocument,
  CheckoutLinesDeleteDocument,
  CheckoutLinesUpdateDocument,
  CheckoutShippingAddressUpdateDocument,
  type AddressInput,
} from "@/gql/generated/graphql";

export type ActionResult = { ok: true } | { ok: false; error: string };

function firstError(errors?: { message?: string | null }[] | null): string | null {
  return errors && errors.length > 0 ? errors[0].message ?? "Unknown error" : null;
}

export async function addToCart(variantId: string, quantity: number): Promise<ActionResult> {
  const existingId = await getStoredCheckoutId();

  if (existingId) {
    const result = await saleorClient
      .mutation(CheckoutLinesAddDocument, { checkoutId: existingId, variantId, quantity })
      .toPromise();
    const errorMsg = firstError(result.data?.checkoutLinesAdd?.errors);
    // A stale/expired checkout id (e.g. completed or too old) fails here —
    // fall through to creating a fresh one rather than surfacing a dead-end error.
    if (!errorMsg) {
      revalidatePath("/cart");
      return { ok: true };
    }
  }

  const created = await saleorClient
    .mutation(CheckoutCreateDocument, { channel: DEFAULT_CHANNEL, variantId, quantity })
    .toPromise();
  const errorMsg = firstError(created.data?.checkoutCreate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  const newId = created.data?.checkoutCreate?.checkout?.id;
  if (!newId) return { ok: false, error: "Checkout was not created." };

  await storeCheckoutId(newId);
  revalidatePath("/cart");
  return { ok: true };
}

export async function updateLineQuantity(lineId: string, quantity: number): Promise<ActionResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(CheckoutLinesUpdateDocument, { checkoutId, lineId, quantity })
    .toPromise();
  const errorMsg = firstError(result.data?.checkoutLinesUpdate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  revalidatePath("/cart");
  return { ok: true };
}

export async function removeLine(lineId: string): Promise<ActionResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(CheckoutLinesDeleteDocument, { checkoutId, lineIds: [lineId] })
    .toPromise();
  const errorMsg = firstError(result.data?.checkoutLinesDelete?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  revalidatePath("/cart");
  return { ok: true };
}

export async function updateEmail(email: string): Promise<ActionResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(CheckoutEmailUpdateDocument, { checkoutId, email })
    .toPromise();
  const errorMsg = firstError(result.data?.checkoutEmailUpdate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  revalidatePath("/checkout");
  return { ok: true };
}

export async function updateShippingAddress(address: AddressInput): Promise<ActionResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(CheckoutShippingAddressUpdateDocument, { checkoutId, address })
    .toPromise();
  const errorMsg = firstError(result.data?.checkoutShippingAddressUpdate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  revalidatePath("/checkout");
  return { ok: true };
}

export async function selectDeliveryMethod(deliveryMethodId: string): Promise<ActionResult> {
  const checkoutId = await getStoredCheckoutId();
  if (!checkoutId) return { ok: false, error: "No active cart." };

  const result = await saleorClient
    .mutation(CheckoutDeliveryMethodUpdateDocument, { checkoutId, deliveryMethodId })
    .toPromise();
  const errorMsg = firstError(result.data?.checkoutDeliveryMethodUpdate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  revalidatePath("/checkout");
  return { ok: true };
}

// No checkoutComplete/payment action yet — Saleor's checkoutComplete needs
// a payment gateway (Stripe) actually configured, which needs the user's
// real test API keys (see .env.example, docs/phase-1-mvp.md). Intentionally
// not built as a fake/no-op "Place order" button.

export async function abandonCart(): Promise<void> {
  await clearStoredCheckoutId();
  revalidatePath("/cart");
}
