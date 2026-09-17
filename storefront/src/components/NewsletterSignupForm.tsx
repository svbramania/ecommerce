"use client";

import { useState, useTransition } from "react";
import { subscribeToNewsletterAction } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Real double opt-in: a fresh signup isn't actually subscribed yet, so
  // this says so rather than claiming success before the confirmation
  // link (sent to their real inbox — see backend/apps/newsletter) is
  // clicked. Reactivating an already-confirmed address (e.g. after a
  // prior unsubscribe) skips straight to "subscribed" instead.
  const [status, setStatus] = useState<"idle" | "confirmed" | "pending">("idle");
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await subscribeToNewsletterAction(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEmail("");
      setStatus(result.pendingConfirmation ? "pending" : "confirmed");
    });
  }

  if (status === "pending") {
    return (
      <p role="status" className="text-sm text-header-fg">
        Almost there — check your email and click the confirmation link to start receiving news
        and deals.
      </p>
    );
  }

  if (status === "confirmed") {
    return (
      <p role="status" className="text-sm text-header-fg">
        You&apos;re subscribed — thanks for signing up.
      </p>
    );
  }

  return (
    <form action={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="newsletter-email" className="text-xs font-medium text-header-fg/70">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="bg-surface text-foreground"
        />
      </div>
      <Button type="submit" variant="secondary" disabled={isPending} className="sm:mt-5">
        {isPending ? "Signing up…" : "Sign up"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-400 sm:basis-full">
          {error}
        </p>
      )}
    </form>
  );
}
