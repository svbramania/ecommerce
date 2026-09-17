"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// A native <select> for the rating (not five icon-only star buttons) —
// same reasoning as AddToRegistryControl's dropdown: a real, labeled form
// control every screen reader and voice-control tool already knows how to
// operate, rather than a custom widget this app would have to make
// accessible itself. Doesn't prefill if this customer already reviewed
// this product — resubmitting still works (the sidecar upserts one review
// per customer per product), it just starts blank rather than showing
// their previous text; a real, known simplification for this first pass.
export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await submitReviewAction(productId, productSlug, Number(rating), title, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setBody("");
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">Write a review</h3>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-rating" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Your rating
        </label>
        <select
          id="review-rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-40 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-title" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Title (optional)
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience"
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-body" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Review (optional)
        </label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={4000}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          placeholder="What did you like or dislike?"
        />
      </div>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit review"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-xs text-stock-ok-fg">
          Thanks — your review has been posted.
        </p>
      )}
    </form>
  );
}
