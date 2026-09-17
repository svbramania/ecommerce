"use server";

import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { subscribeToNewsletter } from "@/lib/newsletter";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function subscribeToNewsletterAction(email: string): Promise<ActionResult> {
  const ip = await getClientIp();
  // No account needed to hit this, unlike most other rate-limited
  // actions in this app — exactly why it needs a limit at all.
  const { allowed } = await rateLimit(`newsletter-subscribe:${ip}`, 10, 60);
  if (!allowed) return { ok: false, error: "Too many requests — please slow down and try again." };

  const result = await subscribeToNewsletter(email);
  if (!result.ok) return { ok: false, error: result.error ?? "Could not subscribe." };
  return { ok: true };
}
