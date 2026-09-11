"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Variant = { id: string; name: string; quantityAvailable?: number | null };

export function AddToCartForm({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  if (variants.length === 0) {
    return <p className="text-sm text-zinc-500">No purchasable variants.</p>;
  }

  function submitAddToCart() {
    setMessage(null);
    startTransition(async () => {
      const result = await addToCart(variantId, quantity);
      setMessage(result.ok ? "Added to cart." : `Could not add to cart: ${result.error}`);
    });
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        submitAddToCart();
      }}
    >
      {variants.length > 1 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="variant" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Variant
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="rounded-md border border-border bg-surface p-2 text-sm text-foreground"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="quantity" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Quantity
        </label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-20"
        />
      </div>
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending && !isBuyingNow ? "Adding…" : "Add to cart"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          setIsBuyingNow(true);
          startTransition(async () => {
            const result = await addToCart(variantId, quantity);
            if (result.ok) {
              router.push("/checkout");
            } else {
              setMessage(`Could not buy now: ${result.error}`);
              setIsBuyingNow(false);
            }
          });
        }}
      >
        {isPending && isBuyingNow ? "Redirecting…" : "Buy now"}
      </Button>
      {message && (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      )}
    </form>
  );
}
