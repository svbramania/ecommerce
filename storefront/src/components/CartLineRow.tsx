"use client";

import { useTransition } from "react";
import { removeLine, updateLineQuantity } from "@/app/actions/checkout";
import type { CheckoutFieldsFragment } from "@/gql/generated/graphql";

type Line = CheckoutFieldsFragment["lines"][number];

export function CartLineRow({ line }: { line: Line }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div>
        <p className="text-sm font-medium text-black dark:text-zinc-50">
          {line.variant.product.name}
        </p>
        <p className="text-xs text-zinc-500">{line.variant.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <input
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
          className="w-16 rounded border border-black/15 p-1 text-sm dark:border-white/15 dark:bg-zinc-900"
        />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {line.totalPrice.gross.amount} {line.totalPrice.gross.currency}
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => { await removeLine(line.id); })}
          className="text-xs text-red-600 underline dark:text-red-400"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
