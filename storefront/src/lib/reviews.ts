// Client for the reviews sidecar (backend/apps/reviews) — real,
// customer-submitted reviews with live verified-purchase gating. Plain
// fetch, no GraphQL — same shape as lib/giftRegistry.ts, which this
// mirrors closely (see that file's comment for why product reviews can't
// live in Saleor customer metadata either).
const REVIEWS_API_URL = process.env.REVIEWS_API_URL ?? "http://localhost:8095";

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified: boolean;
  date: string;
};

export type ReviewSummary = { average: number | null; count: number };

async function request<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${REVIEWS_API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  let data: T | null = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function getProductReviews(
  productId: string,
): Promise<{ reviews: Review[] } & ReviewSummary> {
  const { data } = await request<{ reviews: Review[] } & ReviewSummary>(
    `/reviews/${encodeURIComponent(productId)}`,
  );
  return data ?? { reviews: [], average: null, count: 0 };
}

// One request for a whole product grid (homepage, /products) rather than
// one per card — only products with at least one real review come back.
export async function getReviewSummaries(
  productIds: string[],
): Promise<Record<string, ReviewSummary>> {
  if (productIds.length === 0) return {};
  const { data } = await request<{ summaries: Record<string, ReviewSummary> }>(
    `/reviews/summary?ids=${productIds.map(encodeURIComponent).join(",")}`,
  );
  return data?.summaries ?? {};
}

export async function submitReview(
  token: string,
  input: { productId: string; rating: number; title?: string; body?: string },
): Promise<{ ok: boolean; review?: Review; error?: string }> {
  const { ok, data } = await request<Review & { error?: string }>("/reviews", {
    method: "POST",
    token,
    body: input,
  });
  if (!ok || !data) return { ok: false, error: (data as { error?: string } | null)?.error ?? "Request failed" };
  return { ok: true, review: data };
}

export async function deleteReview(token: string, reviewId: string): Promise<boolean> {
  const { ok } = await request(`/reviews/${reviewId}`, { method: "DELETE", token });
  return ok;
}
