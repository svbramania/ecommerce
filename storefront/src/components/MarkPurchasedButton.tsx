"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { purchaseRegistryItemAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";

export function MarkPurchasedButton({
  slug,
  itemId,
  disabled,
}: {
  slug: string;
  itemId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={disabled ? "secondary" : "primary"}
        disabled={disabled || isPending}
        onClick={() => {
          if (!confirm("Mark this as purchased? Let's make sure this gets to the right place.")) return;
          setError(null);
          startTransition(async () => {
            const result = await purchaseRegistryItemAction(slug, itemId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {disabled ? "Purchased" : isPending ? "Marking…" : "Mark purchased"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
