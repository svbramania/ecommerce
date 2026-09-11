"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await action(email, password);
          if (result.ok) {
            router.push("/account");
            router.refresh();
          } else {
            setError(result.error ?? "Something went wrong.");
          }
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="auth-email" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Email
        </label>
        <Input
          id="auth-email"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="auth-password"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Password
        </label>
        <Input
          id="auth-password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "…" : mode === "login" ? "Log in" : "Create account"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
