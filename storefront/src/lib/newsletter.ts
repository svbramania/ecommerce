// Client for the newsletter sidecar (backend/apps/newsletter) — the real
// email-capture list behind the marketing plan's assumption of an
// audience to send to. Plain fetch, no GraphQL, same shape as
// lib/giftRegistry.ts / lib/reviews.ts. No token needed for the one thing
// the storefront does here — subscribing is a public write, same as the
// service's own README explains.
const NEWSLETTER_API_URL = process.env.NEWSLETTER_API_URL ?? "http://localhost:8096";

export async function subscribeToNewsletter(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${NEWSLETTER_API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  let data: { error?: string } | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) return { ok: false, error: data?.error ?? "Could not subscribe." };
  return { ok: true };
}
