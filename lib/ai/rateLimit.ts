/**
 * Simple in-memory rate limiter for serverless functions.
 *
 * Why not @upstash/ratelimit? To avoid adding a dependency + Redis account
 * for a small app with 3 users. This simple approach works well on Vercel
 * because each serverless function instance keeps its own memory — under
 * low traffic, a single instance handles most requests and the limiter is
 * effective. Under high traffic (many instances), it becomes "per-instance"
 * which is still safe (it can only be MORE permissive, never less).
 *
 * Default: 1 request per 4 seconds per IP.
 */

interface RateLimitEntry {
  lastRequestMs: number;
  count: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 60s to prevent memory leaks.
const CLEANUP_INTERVAL_MS = 60_000;
const ENTRY_TTL_MS = 60_000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.lastRequestMs > ENTRY_TTL_MS) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/**
 * Check if a request from `identifier` (usually IP) is within limits.
 * @param identifier - unique key (IP, session, etc.)
 * @param minIntervalMs - minimum milliseconds between requests (default 4000 = 1 req per 4s)
 */
export function checkRateLimit(
  identifier: string,
  minIntervalMs = 4000,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, { lastRequestMs: now, count: 1 });
    return { allowed: true, retryAfterMs: 0 };
  }

  const elapsed = now - entry.lastRequestMs;

  if (elapsed < minIntervalMs) {
    return {
      allowed: false,
      retryAfterMs: minIntervalMs - elapsed,
    };
  }

  // Update entry.
  entry.lastRequestMs = now;
  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Extract a stable identifier from a Request.
 * On Vercel, `x-forwarded-for` is the real user IP.
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
