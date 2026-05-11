/**
 * Shared Gemini API caller with:
 * - Configurable model (defaults to gemini-2.5-flash-lite)
 * - Timeout via Promise.race
 * - Retry with exponential backoff (max 1 retry for 429/503)
 * - Clean error classification (never leaks raw messages)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Default model: flash-lite is much cheaper and faster.
// Full mode can override to gemini-2.5-flash via env if desired for premium.
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export interface GeminiCallOptions {
  systemInstruction: string;
  userPrompt: string;
  /** Override model name. Falls back to GEMINI_MODEL env → DEFAULT_MODEL. */
  model?: string;
  /** Max output tokens. Default 1000 for quick, 2000 for full. */
  maxOutputTokens?: number;
  /** Temperature. Default 0.3. */
  temperature?: number;
  /** Response MIME type. Default "application/json". */
  responseMimeType?: "application/json" | "text/plain";
  /** Timeout in ms. Default 30000. */
  timeoutMs?: number;
}

export interface GeminiCallResult {
  ok: true;
  text: string;
}

export interface GeminiCallError {
  ok: false;
  error: Error;
}

export type GeminiResult = GeminiCallResult | GeminiCallError;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("Request timed out");
      err.name = "AbortError";
      reject(err);
    }, ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function isRetryable(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("service unavailable") ||
    msg.includes("too many requests")
  );
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Call Gemini with retry (max 1 retry for retryable errors).
 * Returns either { ok: true, text } or { ok: false, error }.
 */
export async function callGemini(opts: GeminiCallOptions): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: new Error("401: GEMINI_API_KEY not configured"),
    };
  }

  const modelName = opts.model || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const maxOutputTokens = opts.maxOutputTokens ?? 1000;
  const temperature = opts.temperature ?? 0.3;
  const responseMimeType = opts.responseMimeType ?? "application/json";
  const timeoutMs = opts.timeoutMs ?? 30_000;

  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature,
    topP: 0.85,
    topK: 40,
    maxOutputTokens,
    responseMimeType,
    thinkingConfig: { thinkingBudget: 0 },
  } as unknown as Parameters<typeof genAI.getGenerativeModel>[0]["generationConfig"];

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: opts.systemInstruction,
    generationConfig,
  });

  const maxAttempts = 2; // 1 initial + 1 retry

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await withTimeout(
        model.generateContent({
          contents: [{ role: "user", parts: [{ text: opts.userPrompt }] }],
        }),
        timeoutMs,
      );

      const text = result.response.text();
      if (!text || text.trim().length === 0) {
        return { ok: false, error: new Error("Empty response from model") };
      }

      return { ok: true, text: text.trim() };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Only retry on retryable errors, and only once.
      if (attempt < maxAttempts && isRetryable(error)) {
        // Exponential backoff: 2s on first retry.
        await sleep(2000 * attempt);
        continue;
      }

      return { ok: false, error };
    }
  }

  // Should never reach here, but TypeScript needs it.
  return { ok: false, error: new Error("Unexpected retry loop exit") };
}
