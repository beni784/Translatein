/**
 * Full Translate API — detailed translation with 11 explanation sections.
 *
 * Production hardened:
 * ✅ Default model: gemini-2.5-flash-lite (via shared gemini.ts)
 * ✅ Rate limiting: 1 request per 5 seconds per IP (full mode is heavier)
 * ✅ In-memory cache: identical inputs return cached result
 * ✅ Structured JSON output via responseMimeType: "application/json"
 * ✅ Safe JSON parsing with multiple fallback strategies
 * ✅ Typed error responses (never exposes raw API errors)
 * ✅ Retry with backoff for 429/503
 * ✅ Input validation
 * ✅ Temperature 0.4 for consistency with some creativity
 * ✅ maxOutputTokens: 2000 (enough for full schema, prevents runaway)
 */

import { NextResponse } from "next/server";
import {
  BENIYUJII_SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/ai/systemPrompt";
import {
  extractJson,
  normalizeTranslationResult,
} from "@/lib/ai/normalize";
import { TRANSLATION_STYLES } from "@/lib/styles";
import { callGemini } from "@/lib/ai/gemini";
import { checkRateLimit, getClientId } from "@/lib/ai/rateLimit";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/ai/cache";
import {
  errorResponse,
  successResponse,
  classifyGeminiError,
} from "@/lib/ai/errors";
import type {
  Direction,
  TranslateRequestBody,
  TranslationStyle,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INPUT_CHARS = 2000;
const VALID_DIRECTIONS: Direction[] = ["en-id", "id-en"];
const VALID_STYLES = TRANSLATION_STYLES.map((s) => s.id) as TranslationStyle[];

export async function POST(request: Request) {
  // --- 1. Rate limit check (5s interval for full mode — it's expensive) ---
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`full:${clientId}`, 5000);
  if (!rateCheck.allowed) {
    return errorResponse("RATE_LIMIT", 429);
  }

  // --- 2. Parse & validate input ---
  let body: Partial<TranslateRequestBody>;
  try {
    body = (await request.json()) as Partial<TranslateRequestBody>;
  } catch {
    return errorResponse("VALIDATION", 400, "Format request tidak valid.");
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const direction = body.direction as Direction | undefined;
  const style = body.style as TranslationStyle | undefined;

  if (!text) {
    return errorResponse("VALIDATION", 400, "Teks tidak boleh kosong.");
  }
  if (text.length > MAX_INPUT_CHARS) {
    return errorResponse(
      "VALIDATION",
      400,
      `Teks terlalu panjang. Maksimal ${MAX_INPUT_CHARS} karakter.`,
    );
  }
  if (!direction || !VALID_DIRECTIONS.includes(direction)) {
    return errorResponse("VALIDATION", 400, "Arah terjemahan tidak valid.");
  }
  if (!style || !VALID_STYLES.includes(style)) {
    return errorResponse("VALIDATION", 400, "Gaya terjemahan tidak valid.");
  }

  // --- 3. Check cache ---
  const cacheKey = makeCacheKey({ text, direction, style, mode: "full" });
  const cached = cacheGet<ReturnType<typeof normalizeTranslationResult>>(cacheKey);
  if (cached) {
    return successResponse(cached);
  }

  // --- 4. Check API key ---
  if (!process.env.GEMINI_API_KEY) {
    return errorResponse("AUTH_ERROR", 500);
  }

  // --- 5. Build prompt ---
  const userPrompt = buildUserPrompt({ text, direction, style });

  // --- 6. Call Gemini ---
  const result = await callGemini({
    systemInstruction: BENIYUJII_SYSTEM_PROMPT,
    userPrompt,
    maxOutputTokens: 2000,
    temperature: 0.4,
    responseMimeType: "application/json",
    timeoutMs: 50_000,
  });

  if (!result.ok) {
    const classified = classifyGeminiError(result.error);
    return errorResponse(classified.type, classified.status);
  }

  // --- 7. Parse JSON safely ---
  let parsed: unknown;
  try {
    parsed = extractJson(result.text);
  } catch {
    return errorResponse("INVALID_JSON", 502);
  }

  // --- 8. Normalize (fills in missing fields with safe defaults) ---
  const normalized = normalizeTranslationResult(parsed);

  if (!normalized.mainTranslation) {
    return errorResponse("EMPTY_RESPONSE", 502);
  }

  // --- 9. Cache & return ---
  cacheSet(cacheKey, normalized);
  return successResponse(normalized);
}

export function GET() {
  return NextResponse.json(
    { success: false, type: "VALIDATION", message: "Gunakan POST." },
    { status: 405 },
  );
}
