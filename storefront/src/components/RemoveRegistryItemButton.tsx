"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeRegistryItemAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";

export function RemoveRegistryItemButton({
  registryId,
  itemId,
}: {
  registryId: string;
  itemId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="danger-ghost"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await removeRegistryItemAction(registryId, itemId);
          router.refresh();
        });
      }}
    >
      {isPending ? "Removing…" : "Remove"}
    </Button>
  );
}
