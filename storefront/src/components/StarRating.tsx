import { Star } from "lucide-react";

// Saleor's Product.rating is a real field, but this instance has no backing
// review system to ever populate it (no Review type/mutation anywhere in
// the schema — see docs/phase-1-mvp.md's rebuild notes). Rendering "No
// ratings yet" instead of silently hiding the slot is the same honesty
// pattern used for the empty product catalog elsewhere in this app.
export function StarRating({
  rating,
  reviewCount,
  size = 16,
}: {
  rating?: number | null;
  reviewCount?: number;
  size?: number;
}) {
  if (rating == null) {
    return <span className="text-xs text-zinc-500">No ratings yet</span>;
  }

  const rounded = Math.round(rating);

  return (
    <span className="flex items-center gap-1">
      <span className="flex" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            className={i < rounded ? "fill-rating-star text-rating-star" : "text-border"}
          />
        ))}
      </span>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      <span className="text-xs text-zinc-500">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </span>
  );
}
