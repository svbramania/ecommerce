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
      <label htmlFor="promo-code" className="sr-only">
        Discount code
      </label>
      <Input
        id="promo-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Discount code"
        className="flex-1"
      />
      <Button type="submit" variant="primary" disabled={isPending || !code}>
        Apply
      </Button>
      {message && (
        <p role="status" className="text-xs text-zinc-500">
          {message}
        </p>
      )}
    </form>
  );
}
