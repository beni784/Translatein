/**
 * Simple in-memory LRU-ish translation cache.
 *
 * Purpose: avoid calling Gemini for the exact same (text, direction, style)
 * input. Even with 3 users, repeated queries are common (testing, typo-fix).
 *
 * Memory safe: hard cap at MAX_ENTRIES. Oldest entries evicted first.
 * TTL: entries expire after 10 minutes (model output may vary so we don't
 * cache forever).
 */

import { createHash } from "crypto";

interface CacheEntry<T> {
  value: T;
  createdAt: number;
}

const MAX_ENTRIES = 100;
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const cacheStore = new Map<string, CacheEntry<unknown>>();

/**
 * Generate a deterministic cache key from translation params.
 * Uses SHA-256 so even long texts produce a fixed-length key.
 */
export function makeCacheKey(params: {
  text: string;
  direction: string;
  style: string;
  mode: "full" | "quick";
}): string {
  const raw = `${params.mode}|${params.direction}|${params.style}|${params.text}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 32);
}

/**
 * Get a cached result, or undefined if not found / expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = cacheStore.get(key);
  if (!entry) return undefined;

  // Check TTL.
  if (Date.now() - entry.createdAt > TTL_MS) {
    cacheStore.delete(key);
    return undefined;
  }

  return entry.value as T;
}

/**
 * Store a result in cache. Evicts oldest if at capacity.
 */
export function cacheSet<T>(key: string, value: T): void {
  // Evict oldest if full.
  if (cacheStore.size >= MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey) cacheStore.delete(oldestKey);
  }

  cacheStore.set(key, { value, createdAt: Date.now() });
}
