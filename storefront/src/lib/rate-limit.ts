import Redis from "ioredis";
import { headers } from "next/headers";

// Shared fixed-window rate limiter for abuse-prone Server Actions
// (login, register, coupon-apply) — security-checklist item
// api-rate-limit. Backed by the same Redis instance already running in
// docker-compose (`cache`), not a new service. A lone Next.js process
// can't rate-limit correctly with an in-memory counter (multiple
// instances behind a real load balancer would each have their own
// counter), so this always goes through Redis rather than a Map.
const REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: Redis | null = null;

function getClient(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL, {
      lazyConnect: true,
      // Fail fast rather than queueing/retrying forever if Redis is down —
      // a rate limiter that blocks all traffic on a Redis outage would be
      // worse than one that fails open (see rateLimit()'s catch below).
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });
    client.on("error", () => {
      // Swallowed deliberately — rateLimit() below fails open on error;
      // an unhandled 'error' event would otherwise crash the process.
    });
  }
  return client;
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Fixed-window limiter: `key` may make `limit` calls per `windowSeconds`.
 * Fails OPEN (allows the request) if Redis is unreachable — a rate
 * limiter should degrade availability risk, not become a new single
 * point of failure for login/checkout.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const redis = getClient();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const ttl = count === 1 ? windowSeconds : await redis.ttl(key);
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/**
 * Best-effort client IP from proxy headers (`x-forwarded-for` /
 * `x-real-ip`, set by a real reverse proxy/load balancer in front of
 * Next.js in any real deployment). Falls back to a constant, which
 * collapses all direct/local traffic into one bucket — correct enough
 * for local dev, where there's no proxy setting these headers at all.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
