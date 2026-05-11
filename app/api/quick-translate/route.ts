/**
 * Quick Translate API — lightweight, token-efficient translation.
 *
 * Production hardened:
 * ✅ Default model: gemini-2.5-flash-lite (cheapest, fastest)
 * ✅ Rate limiting: 1 request per 4 seconds per IP
 * ✅ In-memory cache: identical inputs return cached result
 * ✅ Structured JSON output via responseMimeType
 * ✅ Safe JSON parsing with fallback
 * ✅ Typed error responses (never exposes raw API errors)
 * ✅ Retry with backoff for 429/503
 * ✅ Input validation
 * ✅ Low temperature (0.3) for consistency
 * ✅ maxOutputTokens: 300 (translation only = very short)
 */

import { NextResponse } from "next/server";
import { TRANSLATION_STYLES, STYLE_MAP } from "@/lib/styles";
import { callGemini } from "@/lib/ai/gemini";
import { extractJson } from "@/lib/ai/normalize";
import { checkRateLimit, getClientId } from "@/lib/ai/rateLimit";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/ai/cache";
import {
  errorResponse,
  successResponse,
  classifyGeminiError,
} from "@/lib/ai/errors";
import type {
  Direction,
  QuickTranslateRequestBody,
  TranslationStyle,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_INPUT_CHARS = 2000;
const VALID_DIRECTIONS: Direction[] = ["en-id", "id-en"];
const VALID_STYLES = TRANSLATION_STYLES.map((s) => s.id) as TranslationStyle[];

/** Per-style hint — short phrases applied during translation. */
const STYLE_HINTS: Record<TranslationStyle, string> = {
  natural: "alami seperti penutur asli sehari-hari",
  formal: "formal, sopan, resmi",
  casual: "santai seperti ngobrol dengan teman",
  academic: "akademik, presisi, tanpa slang",
  business: "profesional bisnis, ringkas",
  slang: "slang/bahasa gaul populer",
  romantic: "hangat, puitis, ekspresif",
  kids: "sangat sederhana untuk anak kecil",
};

const QUICK_SYSTEM_PROMPT = `Kamu penerjemah Inggris⇄Indonesia. 
ATURAN KETAT:
1. Balas HANYA dengan JSON valid: {"translation":"hasil terjemahan"}
2. Tidak ada teks lain di luar JSON.
3. Tidak ada markdown, tidak ada penjelasan, tidak ada kutip tambahan.
4. Terjemahkan sesuai gaya yang diminta.`;

export async function POST(request: Request) {
  // --- 1. Rate limit check ---
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId, 4000);
  if (!rateCheck.allowed) {
    return errorResponse("RATE_LIMIT", 429);
  }

  // --- 2. Parse & validate input ---
  let body: Partial<QuickTranslateRequestBody>;
  try {
    body = (await request.json()) as Partial<QuickTranslateRequestBody>;
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
  const cacheKey = makeCacheKey({ text, direction, style, mode: "quick" });
  const cached = cacheGet<{ translation: string }>(cacheKey);
  if (cached) {
    return successResponse(cached);
  }

  // --- 4. Check API key ---
  if (!process.env.GEMINI_API_KEY) {
    return errorResponse("AUTH_ERROR", 500);
  }

  // --- 5. Build prompt ---
  const styleHint = STYLE_HINTS[style];
  const styleLabel = STYLE_MAP[style].label;
  const dirLine =
    direction === "en-id"
      ? "Terjemahkan dari Bahasa Inggris ke Bahasa Indonesia."
      : "Terjemahkan dari Bahasa Indonesia ke Bahasa Inggris.";

  const userPrompt = `${dirLine}
Gaya: ${styleLabel} — ${styleHint}.

Teks yang harus diterjemahkan:
${text}

Balas HANYA dengan JSON: {"translation":"hasil terjemahan kamu"}`;

  // --- 6. Call Gemini ---
  const result = await callGemini({
    systemInstruction: QUICK_SYSTEM_PROMPT,
    userPrompt,
    maxOutputTokens: 300,
    temperature: 0.3,
    responseMimeType: "application/json",
    timeoutMs: 25_000,
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
    // If JSON parsing fails, try to extract just the translation text.
    // Sometimes the model returns plain text despite responseMimeType.
    const cleaned = result.text
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    // Last resort: if it's not JSON, use raw text as translation.
    if (cleaned && !cleaned.startsWith("{")) {
      const translation = cleaned
        .replace(/^["']|["']$/g, "")
        .replace(/^(translation|terjemahan)\s*:\s*/i, "")
        .trim();

      if (translation) {
        const data = { translation };
        cacheSet(cacheKey, data);
        return successResponse(data);
      }
    }

    return errorResponse("INVALID_JSON", 502);
  }

  // --- 8. Extract translation from parsed JSON ---
  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;

  const translation =
    typeof obj.translation === "string"
      ? obj.translation.trim()
      : typeof obj.mainTranslation === "string"
        ? obj.mainTranslation.trim()
        : "";

  if (!translation) {
    return errorResponse("EMPTY_RESPONSE", 502);
  }

  // --- 9. Cache & return ---
  const data = { translation };
  cacheSet(cacheKey, data);
  return successResponse(data);
}

export function GET() {
  return NextResponse.json(
    { success: false, type: "VALIDATION", message: "Gunakan POST." },
    { status: 405 },
  );
}
