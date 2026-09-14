"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addRegistryItemAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";

export function AddToRegistryControl({
  productId,
  isSignedIn,
  registries,
}: {
  productId: string;
  isSignedIn: boolean;
  registries: { id: string; title: string }[];
}) {
  const [selectedId, setSelectedId] = useState(registries[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <p className="text-xs text-zinc-500">
        <Link href="/login" className="text-accent underline">
          Sign in
        </Link>{" "}
        to add this to a gift registry.
      </p>
    );
  }

  if (registries.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        <Link href="/account/registries" className="text-accent underline">
          Create a registry
        </Link>{" "}
        to add this product to it.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        aria-label="Choose a registry"
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground"
      >
        {registries.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
      <Button
        variant="secondary"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await addRegistryItemAction(selectedId, productId);
            setMessage(result.ok ? "Added to registry." : result.error);
          });
        }}
      >
        {isPending ? "Adding…" : "Add to registry"}
      </Button>
      {message && (
        <span role="status" className="text-xs text-zinc-500">
          {message}
        </span>
      )}
    </div>
  );
}
