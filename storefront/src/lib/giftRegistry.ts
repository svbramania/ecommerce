// Client for the gift-registry sidecar (backend/apps/gift_registry) — a
// real, shareable registry, deliberately NOT built on Saleor customer
// metadata (a stranger can't read another customer's metadata via
// Saleor's public API — confirmed live) or a model merged into Saleor's
// own backend. Plain fetch, no GraphQL — this service speaks small JSON
// over REST, matching its own README.
const GIFT_REGISTRY_API_URL = process.env.GIFT_REGISTRY_API_URL ?? "http://localhost:8094";

export type RegistryProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnail: { url: string; altText: string | null } | null;
  pricing: { priceRange: { start: { gross: { amount: number; currency: string } } | null } | null } | null;
};

export type RegistryItem = {
  id: string;
  productId: string;
  variantId: string | null;
  quantityWanted: number;
  quantityPurchased: number;
  product: RegistryProduct | null;
};

export type Registry = {
  id: string;
  title: string;
  eventDate: string | null;
  shareSlug: string;
  items: RegistryItem[];
  ownerEmail?: string;
};

async function request<T>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${GIFT_REGISTRY_API_URL}${path}`, {
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

export async function listMyRegistries(token: string): Promise<Registry[]> {
  const { data } = await request<{ registries: Registry[] }>("/registries/mine", { token });
  return data?.registries ?? [];
}

export async function createRegistry(
  token: string,
  input: { title: string; eventDate?: string },
): Promise<{ ok: boolean; registry?: Registry; error?: string }> {
  const { ok, data } = await request<Registry & { error?: string }>("/registries", {
    method: "POST",
    token,
    body: input,
  });
  if (!ok || !data) return { ok: false, error: (data as { error?: string } | null)?.error ?? "Request failed" };
  return { ok: true, registry: data };
}

export async function deleteRegistry(token: string, registryId: string): Promise<boolean> {
  const { ok } = await request(`/registries/${registryId}`, { method: "DELETE", token });
  return ok;
}

export async function addRegistryItem(
  token: string,
  registryId: string,
  input: { productId: string; variantId?: string; quantity?: number },
): Promise<{ ok: boolean; registry?: Registry; error?: string }> {
  const { ok, data } = await request<Registry & { error?: string }>(`/registries/${registryId}/items`, {
    method: "POST",
    token,
    body: input,
  });
  if (!ok || !data) return { ok: false, error: (data as { error?: string } | null)?.error ?? "Request failed" };
  return { ok: true, registry: data };
}

export async function removeRegistryItem(
  token: string,
  registryId: string,
  itemId: string,
): Promise<boolean> {
  const { ok } = await request(`/registries/${registryId}/items/${itemId}`, {
    method: "DELETE",
    token,
  });
  return ok;
}

export async function getPublicRegistry(slug: string): Promise<Registry | null> {
  const { ok, data } = await request<Registry>(`/registries/public/${slug}`);
  return ok ? data : null;
}

export async function purchaseRegistryItem(
  slug: string,
  itemId: string,
  quantity: number,
): Promise<{ ok: boolean; registry?: Registry }> {
  const { ok, data } = await request<Registry>(`/registries/public/${slug}/items/${itemId}/purchase`, {
    method: "POST",
    body: { quantity },
  });
  return { ok, registry: data ?? undefined };
}
