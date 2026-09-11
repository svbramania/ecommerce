"use client";

import { useTransition } from "react";
import Image from "next/image";
import { removeLine, updateLineQuantity } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import type { CheckoutFieldsFragment } from "@/gql/generated/graphql";

type Line = CheckoutFieldsFragment["lines"][number];

export function CartLineRow({ line }: { line: Line }) {
  const [isPending, startTransition] = useTransition();
  const thumbnail = line.variant.product.thumbnail;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        {thumbnail?.url ? (
          <Image
            src={thumbnail.url}
            alt={thumbnail.alt ?? line.variant.product.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-md bg-surface-muted" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">{line.variant.product.name}</p>
          <p className="text-xs text-zinc-500">{line.variant.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor={`qty-${line.id}`} className="sr-only">
          Quantity for {line.variant.product.name}
        </label>
        <input
          id={`qty-${line.id}`}
          type="number"
          min={0}
          defaultValue={line.quantity}
          disabled={isPending}
          onBlur={(e) => {
            const quantity = Number(e.target.value);
            startTransition(async () => {
              if (quantity <= 0) {
                await removeLine(line.id);
              } else {
                await updateLineQuantity(line.id, quantity);
              }
            });
          }}
          className="w-16 rounded-md border border-border bg-surface p-1 text-sm text-foreground"
        />
        <span className="text-sm font-bold text-price">
          {line.totalPrice.gross.amount} {line.totalPrice.gross.currency}
        </span>
        <Button
          type="button"
          variant="danger-ghost"
          disabled={isPending}
          onClick={() => startTransition(async () => { await removeLine(line.id); })}
          aria-label={`Remove ${line.variant.product.name} from cart`}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
