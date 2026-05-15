/**
 * Grammar Check API — premium writing assistant for English & Indonesian.
 *
 * Production hardened:
 * ✅ Default model: gemini-2.5-flash-lite
 * ✅ Rate limiting: 1 request per 5 seconds per IP
 * ✅ In-memory cache: identical inputs return cached result
 * ✅ Structured JSON output via responseMimeType
 * ✅ Safe JSON parsing with fallback
 * ✅ Typed error responses
 * ✅ Retry with backoff for 429/503
 * ✅ Input validation (min 10 chars, max 5000 chars)
 */

import { NextResponse } from "next/server";
import { callGemini } from "@/lib/ai/gemini";
import { extractJson } from "@/lib/ai/normalize";
import { checkRateLimit, getClientId } from "@/lib/ai/rateLimit";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/ai/cache";
import {
  errorResponse,
  successResponse,
  classifyGeminiError,
} from "@/lib/ai/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const MAX_INPUT_CHARS = 5000;
const MIN_INPUT_CHARS = 10;

type GrammarLanguage = "auto" | "english" | "indonesian";
type GrammarStyle =
  | "standard"
  | "casual"
  | "formal"
  | "academic"
  | "business"
  | "friendly"
  | "native";

const VALID_LANGUAGES: GrammarLanguage[] = ["auto", "english", "indonesian"];
const VALID_STYLES: GrammarStyle[] = [
  "standard",
  "casual",
  "formal",
  "academic",
  "business",
  "friendly",
  "native",
];

interface GrammarCheckBody {
  text?: string;
  language?: GrammarLanguage;
  style?: GrammarStyle;
}

const GRAMMAR_SYSTEM_PROMPT = `Kamu adalah writing assistant premium — ahli grammar, gaya bahasa, dan kejelasan tulisan untuk Bahasa Inggris dan Bahasa Indonesia.

ATURAN KETAT:
1. Output WAJIB JSON valid. TIDAK BOLEH ada teks di luar JSON.
2. Perbaiki grammar, typo, struktur kalimat, pilihan kata, dan kejelasan.
3. JANGAN mengubah makna asli teks.
4. JANGAN mengubah nama orang, brand, URL, angka, istilah teknis tanpa alasan.
5. Jika teks sudah benar, tetap berikan versi yang lebih natural jika memungkinkan.
6. Jelaskan perubahan penting dengan bahasa sederhana (dalam Bahasa Indonesia).
7. Sesuaikan hasil dengan gaya koreksi yang diminta.
8. Berikan confidence score 1-100 untuk kualitas teks SETELAH diperbaiki.
9. Tidak ada markdown fence, komentar, atau proses berpikir. Langsung JSON.`;

const STYLE_HINTS: Record<GrammarStyle, string> = {
  standard: "standar dan netral — perbaiki kesalahan tanpa mengubah gaya",
  casual: "santai dan akrab — hasil terdengar seperti chat/ngobrol biasa",
  formal: "formal dan sopan — cocok untuk surat resmi atau email profesional",
  academic: "akademik dan presisi — cocok untuk paper, skripsi, atau jurnal",
  business: "profesional bisnis — ringkas, jelas, action-oriented",
  friendly: "ramah dan hangat — cocok untuk komunikasi interpersonal",
  native: "terdengar seperti native speaker — idiomatik dan natural",
};

function buildGrammarPrompt(
  text: string,
  language: GrammarLanguage,
  style: GrammarStyle,
): string {
  const langHint =
    language === "auto"
      ? "Deteksi bahasa input otomatis (English atau Indonesian)."
      : language === "english"
        ? "Input dalam Bahasa Inggris."
        : "Input dalam Bahasa Indonesia.";

  const styleHint = STYLE_HINTS[style];

  return `${langHint}
Gaya koreksi: ${style} — ${styleHint}

TEKS YANG HARUS DIPERIKSA:
"""
${text}
"""

Kembalikan JSON PERSIS skema ini:
{
  "detectedLanguage": "English atau Indonesian",
  "correctedText": "teks yang sudah diperbaiki secara natural",
  "explanation": "penjelasan perubahan penting dalam Bahasa Indonesia, sederhana dan mudah dipahami",
  "keyImprovements": [
    {"type": "Grammar/Word Choice/Sentence Flow/Clarity/Naturalness/Spelling", "description": "deskripsi singkat perbaikan"}
  ],
  "alternativeVersion": "versi alternatif yang lebih natural/native jika memungkinkan",
  "confidenceScore": 92
}

PENTING:
- keyImprovements minimal 1 item, maksimal 5 item.
- confidenceScore 1-100 berdasarkan kualitas SETELAH diperbaiki.
- Jika teks sudah sempurna, tetap berikan alternativeVersion yang sedikit berbeda.
- JSON VALID SAJA. Tanpa fence, tanpa teks tambahan.`;
}

export async function POST(request: Request) {
  // --- 1. Rate limit ---
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(`grammar:${clientId}`, 5000);
  if (!rateCheck.allowed) {
    return errorResponse("RATE_LIMIT", 429);
  }

  // --- 2. Parse & validate ---
  let body: GrammarCheckBody;
  try {
    body = (await request.json()) as GrammarCheckBody;
  } catch {
    return errorResponse("VALIDATION", 400, "Format request tidak valid.");
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const language = (body.language || "auto") as GrammarLanguage;
  const style = (body.style || "standard") as GrammarStyle;

  if (!text) {
    return errorResponse("VALIDATION", 400, "Teks tidak boleh kosong.");
  }
  if (text.length < MIN_INPUT_CHARS) {
    return errorResponse(
      "VALIDATION",
      400,
      `Teks terlalu pendek. Minimal ${MIN_INPUT_CHARS} karakter.`,
    );
  }
  if (text.length > MAX_INPUT_CHARS) {
    return errorResponse(
      "VALIDATION",
      400,
      `Teks terlalu panjang. Maksimal ${MAX_INPUT_CHARS} karakter.`,
    );
  }
  if (!VALID_LANGUAGES.includes(language)) {
    return errorResponse("VALIDATION", 400, "Bahasa tidak valid.");
  }
  if (!VALID_STYLES.includes(style)) {
    return errorResponse("VALIDATION", 400, "Gaya koreksi tidak valid.");
  }

  // --- 3. Check cache ---
  const cacheKey = makeCacheKey({
    text,
    direction: language,
    style,
    mode: "full" as "full", // reuse the cache key function
  });
  // Prefix to differentiate from translation cache
  const grammarCacheKey = `grammar:${cacheKey}`;
  const cached = cacheGet<GrammarResult>(grammarCacheKey);
  if (cached) {
    return successResponse(cached);
  }

  // --- 4. Check API key ---
  if (!process.env.GEMINI_API_KEY) {
    return errorResponse("AUTH_ERROR", 500);
  }

  // --- 5. Build prompt & call Gemini ---
  const userPrompt = buildGrammarPrompt(text, language, style);

  const result = await callGemini({
    systemInstruction: GRAMMAR_SYSTEM_PROMPT,
    userPrompt,
    maxOutputTokens: 1200,
    temperature: 0.3,
    responseMimeType: "application/json",
    timeoutMs: 40_000,
  });

  if (!result.ok) {
    const classified = classifyGeminiError(result.error);
    return errorResponse(classified.type, classified.status);
  }

  // --- 6. Parse JSON safely ---
  let parsed: unknown;
  try {
    parsed = extractJson(result.text);
  } catch {
    return errorResponse("INVALID_JSON", 502);
  }

  // --- 7. Normalize and validate response ---
  const obj = (parsed && typeof parsed === "object" ? parsed : {}) as Record<
    string,
    unknown
  >;

  const grammarResult: GrammarResult = {
    detectedLanguage: typeof obj.detectedLanguage === "string"
      ? obj.detectedLanguage
      : "Unknown",
    correctedText: typeof obj.correctedText === "string"
      ? obj.correctedText.trim()
      : text, // fallback to original
    explanation: typeof obj.explanation === "string"
      ? obj.explanation.trim()
      : "Tidak ada perubahan signifikan.",
    keyImprovements: normalizeImprovements(obj.keyImprovements),
    alternativeVersion: typeof obj.alternativeVersion === "string"
      ? obj.alternativeVersion.trim()
      : "",
    confidenceScore: normalizeScore(obj.confidenceScore),
  };

  if (!grammarResult.correctedText) {
    return errorResponse("EMPTY_RESPONSE", 502);
  }

  // --- 8. Cache & return ---
  cacheSet(grammarCacheKey, grammarResult);
  return successResponse(grammarResult);
}

export function GET() {
  return NextResponse.json(
    { success: false, type: "VALIDATION", message: "Gunakan POST." },
    { status: 405 },
  );
}

// --- Helper types & functions ---

interface KeyImprovement {
  type: string;
  description: string;
}

interface GrammarResult {
  detectedLanguage: string;
  correctedText: string;
  explanation: string;
  keyImprovements: KeyImprovement[];
  alternativeVersion: string;
  confidenceScore: number;
}

function normalizeImprovements(value: unknown): KeyImprovement[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 5)
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const type = typeof obj.type === "string" ? obj.type.trim() : "";
      const description =
        typeof obj.description === "string" ? obj.description.trim() : "";
      if (!type || !description) return null;
      return { type, description };
    })
    .filter((v): v is KeyImprovement => v !== null);
}

function normalizeScore(value: unknown): number {
  if (typeof value === "number" && value >= 1 && value <= 100) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1 && n <= 100) return n;
  }
  return 85; // safe default
}
