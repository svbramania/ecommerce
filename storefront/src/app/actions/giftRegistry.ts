"use server";

import { revalidatePath } from "next/cache";
import { getCustomerToken } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createRegistry,
  deleteRegistry,
  addRegistryItem,
  removeRegistryItem,
  purchaseRegistryItem,
} from "@/lib/giftRegistry";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createRegistryAction(title: string, eventDate?: string): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in to create a registry." };
  if (!title.trim()) return { ok: false, error: "Give your registry a title." };

  const result = await createRegistry(token, { title: title.trim(), eventDate });
  if (!result.ok) return { ok: false, error: result.error ?? "Could not create registry." };
  revalidatePath("/account/registries");
  return { ok: true };
}

export async function deleteRegistryAction(registryId: string): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in." };
  const ok = await deleteRegistry(token, registryId);
  if (!ok) return { ok: false, error: "Could not delete registry." };
  revalidatePath("/account/registries");
  return { ok: true };
}

export async function addRegistryItemAction(
  registryId: string,
  productId: string,
): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in." };
  const result = await addRegistryItem(token, registryId, { productId, quantity: 1 });
  if (!result.ok) return { ok: false, error: result.error ?? "Could not add item." };
  revalidatePath(`/account/registries/${registryId}`);
  return { ok: true };
}

export async function removeRegistryItemAction(
  registryId: string,
  itemId: string,
): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in." };
  const ok = await removeRegistryItem(token, registryId, itemId);
  if (!ok) return { ok: false, error: "Could not remove item." };
  revalidatePath(`/account/registries/${registryId}`);
  return { ok: true };
}

// The public purchase endpoint deliberately needs no account (matching
// real registry UX — a gift-giver shouldn't have to sign up just to mark
// something bought), which is exactly why it's the one gift-registry
// action rate-limited here: anyone with the share link could otherwise
// script "mark everything purchased" with no account to attribute it to.
export async function purchaseRegistryItemAction(
  slug: string,
  itemId: string,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const { allowed } = await rateLimit(`registry-purchase:${ip}`, 20, 60);
  if (!allowed) return { ok: false, error: "Too many requests — please slow down and try again." };

  const { ok } = await purchaseRegistryItem(slug, itemId, 1);
  if (!ok) return { ok: false, error: "Could not update this item." };
  revalidatePath(`/registry/${slug}`);
  return { ok: true };
}
