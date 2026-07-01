/**
 * Shared cache with Upstash Redis + in-memory fallback.
 *
 * In serverless (Vercel) every cold-start gets a fresh memory cache,
 * so Redis provides the real cross-instance shared cache. The memory
 * fallback keeps the app working if Redis is temporarily unavailable.
 */

import { Redis } from "@upstash/redis";

// ─── TTL Constants (ms) ───────────────────────────────────────────────────────

export const TTL = {
  SPOTIFY_SHORT: 5 * 60 * 1000,
  SPOTIFY_MEDIUM: 60 * 60 * 1000,
  SPOTIFY_LONG: 24 * 60 * 60 * 1000,
  AI_ANALYSIS: 7 * 24 * 60 * 60 * 1000,
  VISUALIZATION: 3 * 60 * 60 * 1000,
  SHARE: 30 * 24 * 60 * 60 * 1000,
} as const;

// ─── In-Memory Fallback ───────────────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null; }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): void { this.store.delete(key); }

  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

// ─── Redis-backed cache (graceful degradation) ────────────────────────────────

let redisClient: Redis | null = null;
let redisAvailable = false;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient = new Redis({ url, token });
    redisAvailable = true;
  }
  return redisClient;
}

const memory = new MemoryCache();

async function redisGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    return await r.get<T>(key);
  } catch { return null; }
}

async function redisSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.set(key, value, { px: ttlMs });
  } catch { /* fallback to memory */ }
}

async function redisDel(key: string): Promise<void> {
  try {
    const r = getRedis();
    if (!r) return;
    await r.del(key);
  } catch { /* ignore */ }
}

// ─── Public Cache API ─────────────────────────────────────────────────────────

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const fromRedis = await redisGet<T>(key);
    if (fromRedis !== null) return fromRedis;
    return memory.get<T>(key);
  },

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    memory.set(key, value, ttlMs);
    await redisSet(key, value, ttlMs);
  },

  async del(key: string): Promise<void> {
    memory.del(key);
    await redisDel(key);
  },

  async invalidate(prefix: string): Promise<void> {
    memory.invalidate(prefix);
    try {
      const r = getRedis();
      if (!r) return;
      const keys = await r.keys(`${prefix}*`);
      if (keys.length > 0) await r.del(...keys);
    } catch { /* ignore */ }
  },

  /** True if Redis is connected and usable */
  get redisConnected(): boolean {
    return redisAvailable;
  },
};

// ─── Typed Cache Helpers ──────────────────────────────────────────────────────

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;

  const value = await fn();
  await cache.set(key, value, ttlMs);
  return value;
}

/** Cache key builders */
export const keys = {
  spotifyMe: (userId: string) => `spotify:me:${userId}`,
  spotifyTopArtists: (userId: string, range: string) => `spotify:top-artists:${userId}:${range}`,
  spotifyTopTracks: (userId: string, range: string) => `spotify:top-tracks:${userId}:${range}`,
  spotifyHistory: (userId: string) => `spotify:history:${userId}`,
  spotifyFeatures: (trackId: string) => `spotify:features:${trackId}`,
  analysisPersonality: (userId: string) => `analysis:personality:${userId}`,
  analysisEmotional: (userId: string) => `analysis:emotional:${userId}`,
  visualizationMoodGraph: (userId: string) => `viz:mood-graph:${userId}`,
  visualizationGenreGalaxy: (userId: string) => `viz:genre-galaxy:${userId}`,
  visualizationAudioDNA: (userId: string) => `viz:audio-dna:${userId}`,
  shareCard: (shareId: string) => `share:card:${shareId}`,
  compatibility: (userA: string, userB: string) =>
    `compat:${[userA, userB].sort().join(":")}`,
};
