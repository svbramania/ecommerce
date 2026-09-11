"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <p role="status" className="max-w-sm text-center text-sm text-zinc-600 dark:text-zinc-400">
        If an account exists for that email, a reset link is on its way. (Deliberately the same
        message either way — see auth-reset in docs/security-checklist.md.)
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await requestPasswordReset(email);
          setSubmitted(true);
        });
      }}
    >
      <label htmlFor="reset-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Email
      </label>
      <input
        id="reset-email"
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        Send reset link
      </button>
    </form>
  );
}
