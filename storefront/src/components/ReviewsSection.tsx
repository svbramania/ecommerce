import { StarRating } from "@/components/StarRating";

type Review = {
  author: string;
  rating: number;
  title?: string;
  body?: string;
  date?: string;
  verified?: boolean;
};

// Saleor's Product.rating field exists but has no backing review system
// anywhere in the schema (no Review type, no submission mutation) — this
// reads a real, staff-seeded metadata array (key "reviews"), the same
// mechanism backend/apps/bundle_sync/ already uses for bundle_components.
// Read/display only: review *submission* (verified-purchase gating,
// moderation, a rate-limited submit mutation) is a separate subsystem,
// explicitly out of scope for this pass.
export function ReviewsSection({ reviewsMetadata }: { reviewsMetadata?: string | null }) {
  let reviews: Review[] = [];
  if (reviewsMetadata) {
    try {
      const parsed = JSON.parse(reviewsMetadata);
      if (Array.isArray(parsed)) reviews = parsed;
    } catch {
      reviews = [];
    }
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500">No reviews yet for this product.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface p-4">
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
                {review.author}
                {review.date ? ` · ${review.date}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
