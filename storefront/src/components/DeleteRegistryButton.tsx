"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRegistryAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";

export function DeleteRegistryButton({ registryId }: { registryId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="danger-ghost"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Delete this registry? This can't be undone.")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteRegistryAction(registryId);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        {isPending ? "Deleting…" : "Delete"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
