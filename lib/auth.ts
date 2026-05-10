/**
 * Auth constants & helpers for the app-wide password gate.
 *
 * HOW IT WORKS
 * ------------
 * 1. User opens the app → middleware checks for AUTH_COOKIE_NAME cookie.
 * 2. If missing/invalid → redirect to /unlock.
 * 3. On /unlock, the user submits a password. It's sent to /api/auth/login
 *    which compares it (server-side, never exposed to the browser) against
 *    APP_PASSWORD from env vars.
 * 4. On match, we set an httpOnly signed cookie. The middleware sees it and
 *    allows access to the rest of the app.
 *
 * WHY THIS SHAPE?
 * ---------------
 * - Cookie is httpOnly + sameSite=lax + secure in prod → can't be read by JS,
 *   can't be CSRF'd trivially, and can't be sniffed over HTTP in production.
 * - We sign the cookie (HMAC of a fixed string with the password) so a random
 *   attacker can't just forge one. The signature is recomputed on every request
 *   in the middleware — if the admin rotates APP_PASSWORD, all existing
 *   sessions become invalid automatically. Nice.
 * - No database, no JWT library — keeps this feature zero-dependency and fast
 *   on the edge.
 */

export const AUTH_COOKIE_NAME = "beniyujii_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const UNLOCK_PATH = "/unlock";

/** Default password if APP_PASSWORD env var is missing. */
export const DEFAULT_PASSWORD = "lenacantik";

/**
 * SubtleCrypto-powered HMAC. Works on Node runtime AND edge runtime
 * (middleware runs on the edge by default).
 */
async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  // base64url (cookie-safe), no Node Buffer so this works on the Edge runtime.
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** The value we store in the cookie. Tied to the current password. */
export async function makeAuthToken(password: string): Promise<string> {
  return hmac("beniyujii-ai-unlocked-v1", password);
}

/** Verify a cookie value against the current password. */
export async function isAuthTokenValid(
  token: string | undefined,
  password: string,
): Promise<boolean> {
  if (!token) return false;
  const expected = await makeAuthToken(password);
  // constant-time-ish compare.
  if (token.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) {
    mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Get the currently configured password.
 * Reads APP_PASSWORD env var, falls back to DEFAULT_PASSWORD.
 * Never exposed to the client — only used in middleware / API routes.
 */
export function getConfiguredPassword(): string {
  const p = process.env.APP_PASSWORD;
  return p && p.length > 0 ? p : DEFAULT_PASSWORD;
}
