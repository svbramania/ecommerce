"use client";

import { useState, useTransition } from "react";
import { addPromoCode, removePromoCode } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 text-sm text-foreground">
        <span>
          Code <span className="font-medium">{voucherCode}</span> applied
        </span>
        <Button
          type="button"
          variant="danger-ghost"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await removePromoCode(voucherCode);
              setMessage(result.ok ? null : `Error: ${result.error}`);
            })
          }
        >
          Remove
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await addPromoCode(code);
          setMessage(result.ok ? "Applied." : `Error: ${result.error}`);
          if (result.ok) setCode("");
        });
      }}
    >
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          {/* Visible, not sr-only — same reasoning as CheckoutForm's
              email field: a placeholder alone disappears once you type,
              leaving nothing to confirm what the field was. */}
          <label htmlFor="promo-code" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Discount code
          </label>
          <Input id="promo-code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" disabled={isPending || !code}>
          Apply
        </Button>
      </div>
      {message && (
        <p role="status" className="text-xs text-zinc-500">
          {message}
        </p>
      )}
    </form>
  );
}
