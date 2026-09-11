"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
        <input
          id="auth-email"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          htmlFor="auth-password"
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "…" : mode === "login" ? "Log in" : "Create account"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
