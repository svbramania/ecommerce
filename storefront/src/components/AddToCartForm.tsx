"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/checkout";

type Variant = { id: string; name: string; quantityAvailable?: number | null };

export function AddToCartForm({ variants }: { variants: Variant[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (variants.length === 0) {
    return <p className="text-sm text-zinc-500">No purchasable variants.</p>;
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        startTransition(async () => {
          const result = await addToCart(variantId, quantity);
          setMessage(result.ok ? "Added to cart." : `Could not add to cart: ${result.error}`);
        });
      }}
    >
      {variants.length > 1 && (
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        className="w-20 rounded border border-black/15 p-2 text-sm dark:border-white/15 dark:bg-zinc-900"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "Adding…" : "Add to cart"}
      </button>
      {message && <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}
    </form>
  );
}
