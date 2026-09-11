"use client";

import { useState, useTransition } from "react";
import { startPaypalCheckout } from "@/app/actions/paypal";

export function PaypalButton({ amount }: { amount: number }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startPaypalCheckout(amount);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            // Redirect-based by nature — the buyer approves on PayPal's
            // own site, not something we can complete in a single call
            // (see the note in app/actions/paypal.ts).
            window.location.href = result.approvalUrl;
          })
        }
        className="rounded-full border border-[#0070ba] px-5 py-3 text-sm font-medium text-[#0070ba] disabled:opacity-50"
      >
        {isPending ? "Redirecting to PayPal…" : "Pay with PayPal"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
