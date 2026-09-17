import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import type { Review } from "@/lib/reviews";

// Real customer reviews from the reviews sidecar (backend/apps/reviews) —
// replaces the earlier staff-seeded-metadata-only version now that a real
// submission path (with live verified-purchase gating) exists. Read-only
// display here; ReviewForm below does the writing.
export function ReviewsSection({
  reviews,
  productId,
  productSlug,
  isSignedIn,
}: {
  reviews: Review[];
  productId: string;
  productSlug: string;
  isSignedIn: boolean;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-foreground">Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500">No reviews yet for this product.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {review.verified && (
                  <span className="text-xs font-medium text-stock-ok-fg">Verified purchase</span>
                )}
              </div>
              {review.title && (
                <p className="mt-1 font-medium text-foreground">{review.title}</p>
              )}
              {review.body && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{review.body}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                {review.author} · {review.date}
              </p>
            </li>
          ))}
        </ul>
      )}

      {isSignedIn ? (
        <ReviewForm productId={productId} productSlug={productSlug} />
      ) : (
        <p className="text-sm text-zinc-500">
          <Link href="/login" className="text-accent underline">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      )}
    </section>
  );
}
