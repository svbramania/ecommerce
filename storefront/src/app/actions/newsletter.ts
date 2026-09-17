"use server";

import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { subscribeToNewsletter, confirmNewsletterSubscription } from "@/lib/newsletter";

export type ActionResult =
  | { ok: true; pendingConfirmation?: boolean }
  | { ok: false; error: string };

export async function subscribeToNewsletterAction(email: string): Promise<ActionResult> {
  const ip = await getClientIp();
  // No account needed to hit this, unlike most other rate-limited
  // actions in this app — exactly why it needs a limit at all.
  const { allowed } = await rateLimit(`newsletter-subscribe:${ip}`, 10, 60);
  if (!allowed) return { ok: false, error: "Too many requests — please slow down and try again." };

  const result = await subscribeToNewsletter(email);
  if (!result.ok) return { ok: false, error: result.error ?? "Could not subscribe." };
  return { ok: true, pendingConfirmation: result.pendingConfirmation };
}

export async function confirmNewsletterAction(email: string, token: string): Promise<ActionResult> {
  const result = await confirmNewsletterSubscription(email, token);
  if (!result.ok) return { ok: false, error: result.error ?? "Could not confirm your subscription." };
  return { ok: true };
}
