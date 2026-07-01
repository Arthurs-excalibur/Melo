/**
 * Redis-backed rate limiter.
 *
 * Uses a fixed-window counter via INCR + EXPIRE.
 * Falls back to no-op when Redis is unavailable — the app keeps working.
 */

import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
  }
  return redisClient;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms when the window resets
}

/**
 * Check a rate limit for the given identifier + route.
 *
 * @param identifier - Typically `user:<userId>` or `ip:<ip>`
 * @param route      - Route name, e.g. "analysis"
 * @param max        - Max requests in the window (default from env or 5)
 * @param windowMs   - Window duration in ms (default 1 hour)
 */
export async function checkRateLimit(
  identifier: string,
  route: string,
  max: number = parseInt(process.env[`RATE_LIMIT_${route.toUpperCase()}`] ?? "5", 10),
  windowMs: number = 3600 * 1000,
): Promise<RateLimitResult> {
  const r = getRedis();
  if (!r) {
    // Redis unavailable — allow the request
    return { allowed: true, remaining: 999, resetAt: Date.now() + windowMs };
  }

  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `ratelimit:${identifier}:${route}:${windowStart}`;

  try {
    const count = await r.incr(key);
    // Set expiry on first increment so key auto-cleans after the window + 1 minute
    if (count === 1) await r.expire(key, Math.ceil(windowMs / 1000) + 60);

    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      resetAt: windowStart + windowMs,
    };
  } catch {
    return { allowed: true, remaining: 999, resetAt: now + windowMs };
  }
}
