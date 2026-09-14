"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRegistryAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";

export function DeleteRegistryButton({ registryId }: { registryId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="danger-ghost"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this registry? This can't be undone.")) return;
        startTransition(async () => {
          await deleteRegistryAction(registryId);
          router.refresh();
        });
      }}
    >
      {isPending ? "Deleting…" : "Delete"}
    </Button>
  );
}
