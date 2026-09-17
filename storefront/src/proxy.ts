import { NextResponse, type NextRequest } from "next/server";

// Saleor's real, unconfigured defaults (confirmed live: a token's own
// iat/exp claims are exactly 300 seconds apart) — access tokens expire in
// 5 minutes, refresh tokens in 30 days. Before this proxy existed, only
// the 5-minute access token was ever stored (see lib/auth.ts's
// storeCustomerToken) — meaning every signed-in feature (account page,
// order history, gift registries, product reviews) would start throwing
// real "Signature has expired" GraphQL errors 5 minutes after login,
// which is not a cosmetic timing edge case, it's most real sessions.
//
// This runs before every matched request (page loads AND Server Action
// POSTs alike) and silently exchanges a near-expired access token for a
// fresh one using the refresh token — the standard fix, not a warning
// banner papering over a token lifetime that's actually fixable. Cookie
// writes are only legal here or in a Server Action/Route Handler, not in
// a Server Component's render, which is why this couldn't live in
// lib/auth.ts's getCustomerToken() itself. (Named proxy.ts, not
// middleware.ts — Next.js 16 deprecated the middleware file convention
// in favor of this one; same mechanism, new name.)
const ACCESS_COOKIE = "customerToken";
const REFRESH_COOKIE = "customerRefreshToken";
const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL ?? "http://localhost:8000/graphql/";
const REFRESH_MARGIN_MS = 30_000;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function decodeExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.next();

  const expiresAt = accessToken ? decodeExpiry(accessToken) : null;
  const needsRefresh = !accessToken || expiresAt === null || expiresAt < Date.now() + REFRESH_MARGIN_MS;
  if (!needsRefresh) return NextResponse.next();

  try {
    const res = await fetch(SALEOR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "mutation($refreshToken: String!) { tokenRefresh(refreshToken: $refreshToken) { token errors { message } } }",
        variables: { refreshToken },
      }),
    });
    const json = await res.json();
    const newToken: string | undefined = json?.data?.tokenRefresh?.token;
    const errors = json?.data?.tokenRefresh?.errors;

    const response = NextResponse.next();
    if (newToken && (!errors || errors.length === 0)) {
      response.cookies.set(ACCESS_COOKIE, newToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: THIRTY_DAYS,
      });
    } else {
      // The refresh token itself is invalid/expired — a real end of
      // session (30 days idle, or a revoked token), not a bug to retry.
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
    }
    return response;
  } catch {
    // Saleor unreachable — fail open with whatever token already exists
    // rather than lock the user out over a transient network blip.
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
