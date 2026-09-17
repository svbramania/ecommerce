import { cookies } from "next/headers";
import { createClient, cacheExchange, fetchExchange } from "urql";

const SESSION_COOKIE = "customerToken";
const REFRESH_COOKIE = "customerRefreshToken";
const SALEOR_API_URL =
  process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "http://localhost:8000/graphql/";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getCustomerToken(): Promise<string | null> {
  const store = await cookies();
  // Kept fresh by middleware.ts, which silently exchanges a near-expired
  // access token for a new one on every request using the refresh token
  // stored alongside it — see that file for why this couldn't happen
  // here instead (cookie writes aren't legal during a render).
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Saleor's access token is short-lived by design (5 minutes,
// unconfigured default — confirmed live), which is exactly why the
// refresh token has to be stored too now: middleware.ts is what actually
// keeps a signed-in session alive past that, not this cookie's maxAge.
export async function storeCustomerToken(token: string, refreshToken?: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS,
    });
  }
}

export async function clearCustomerToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(REFRESH_COOKIE);
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
