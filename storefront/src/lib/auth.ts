import { cookies } from "next/headers";
import { createClient, cacheExchange, fetchExchange } from "urql";

const SESSION_COOKIE = "customerToken";
const SALEOR_API_URL =
  process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "http://localhost:8000/graphql/";

export async function getCustomerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function storeCustomerToken(token: string): Promise<void> {
  const store = await cookies();
  // Saleor's access token is short-lived by design (see auth-jwt in
  // docs/security-checklist.md) — this cookie's own maxAge is generous,
  // but the token itself expires server-side well before that. No
  // refresh-token rotation wired up yet: a follow-up, not silently faked.
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// A one-off authenticated client per request — same pattern as
// saleorClient in saleor-client.ts, just with the customer's bearer token
// attached, since urql's core client has no per-call header override.
export function authedClient(token: string) {
  return createClient({
    url: SALEOR_API_URL,
    exchanges: [cacheExchange, fetchExchange],
    preferGetMethod: false,
    fetchOptions: { headers: { Authorization: `Bearer ${token}` } },
  });
}
