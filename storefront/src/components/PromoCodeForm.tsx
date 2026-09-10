"use client";

import { useState, useTransition } from "react";
import { addPromoCode, removePromoCode } from "@/app/actions/checkout";

export function PromoCodeForm({
  voucherCode,
}: {
  voucherCode?: string | null;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (voucherCode) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span>
          Code <span className="font-medium">{voucherCode}</span> applied
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await removePromoCode(voucherCode);
              setMessage(result.ok ? null : `Error: ${result.error}`);
            })
          }
          className="text-xs text-red-600 underline dark:text-red-400"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await addPromoCode(code);
          setMessage(result.ok ? "Applied." : `Error: ${result.error}`);
          if (result.ok) setCode("");
        });
      }}
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Discount code"
        className="flex-1 rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={isPending || !code}
        className="rounded bg-black px-4 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        Apply
      </button>
      {message && <p className="text-xs text-zinc-500">{message}</p>}
    </form>
  );
}
