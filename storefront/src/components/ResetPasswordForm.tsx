"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
      <Input
        id="reset-email"
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" variant="primary" disabled={isPending}>
        Send reset link
      </Button>
    </form>
  );
}
