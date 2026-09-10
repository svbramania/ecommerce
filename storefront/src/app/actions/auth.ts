"use server";

import { saleorClient } from "@/lib/saleor-client";
import { clearCustomerToken, storeCustomerToken } from "@/lib/auth";
import { DEFAULT_CHANNEL } from "@/lib/checkout";
import {
  AccountRegisterDocument,
  AccountTokenCreateDocument,
  ConfirmAccountDocument,
  RequestPasswordResetDocument,
} from "@/gql/generated/graphql";
import type { ActionResult } from "./checkout";

function firstError(errors?: { message?: string | null }[] | null): string | null {
  return errors && errors.length > 0 ? errors[0].message ?? "Unknown error" : null;
}

export async function register(email: string, password: string): Promise<ActionResult> {
  const redirectUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") + "/confirm-account";
  const result = await saleorClient
    .mutation(AccountRegisterDocument, { email, password, channel: DEFAULT_CHANNEL, redirectUrl })
    .toPromise();
  const errorMsg = firstError(result.data?.accountRegister?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  // Whether this shop requires email confirmation before login works is a
  // real, testable question, not assumed — see docs/phase-1-mvp.md for
  // what was actually found.
  return login(email, password);
}

export async function login(email: string, password: string): Promise<ActionResult> {
  const result = await saleorClient
    .mutation(AccountTokenCreateDocument, { email, password })
    .toPromise();
  const errorMsg = firstError(result.data?.tokenCreate?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };

  const token = result.data?.tokenCreate?.token;
  if (!token) return { ok: false, error: "No token returned." };

  await storeCustomerToken(token);
  return { ok: true };
}

export async function confirmAccount(email: string, token: string): Promise<ActionResult> {
  const result = await saleorClient
    .mutation(ConfirmAccountDocument, { email, token })
    .toPromise();
  const errorMsg = firstError(result.data?.confirmAccount?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };
  return { ok: true };
}

export async function logout(): Promise<void> {
  await clearCustomerToken();
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const redirectUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") + "/reset-password";
  const result = await saleorClient
    .mutation(RequestPasswordResetDocument, { email, redirectUrl, channel: DEFAULT_CHANNEL })
    .toPromise();
  const errorMsg = firstError(result.data?.requestPasswordReset?.errors);
  if (errorMsg) return { ok: false, error: errorMsg };
  // Deliberately the same success response whether or not the email is a
  // real account (auth-reset: no user-enumeration) — verified live that
  // Saleor's own mutation already behaves this way before relying on it.
  return { ok: true };
}
