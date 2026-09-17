"use server";

import { revalidatePath } from "next/cache";
import { getCustomerToken } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { submitReview, deleteReview } from "@/lib/reviews";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  rating: number,
  title: string,
  body: string,
): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in to leave a review." };

  // A signed-in customer could otherwise script repeated submissions —
  // the sidecar's own upsert means this can't spam duplicate reviews, but
  // it could still hammer the endpoint (and the live Saleor order lookup
  // it triggers) without this.
  const ip = await getClientIp();
  const { allowed } = await rateLimit(`review-submit:${ip}`, 10, 60);
  if (!allowed) return { ok: false, error: "Too many requests — please slow down and try again." };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a star rating from 1 to 5." };
  }

  const result = await submitReview(token, { productId, rating, title, body });
  if (!result.ok) return { ok: false, error: result.error ?? "Could not submit your review." };
  revalidatePath(`/products/${productSlug}`);
  return { ok: true };
}

export async function deleteReviewAction(reviewId: string, productSlug: string): Promise<ActionResult> {
  const token = await getCustomerToken();
  if (!token) return { ok: false, error: "You need to be signed in." };
  const ok = await deleteReview(token, reviewId);
  if (!ok) return { ok: false, error: "Could not delete your review." };
  revalidatePath(`/products/${productSlug}`);
  return { ok: true };
}
