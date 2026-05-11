import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TRANSLATION_STYLES, STYLE_MAP } from "@/lib/styles";
import type {
  Direction,
  QuickTranslateRequestBody,
  QuickTranslateResult,
  TranslationStyle,
} from "@/lib/types";

/**
 * Quick Translate — lightweight endpoint that returns ONLY the translated
 * sentence, no breakdowns, no explanations.
 *
 * Why a separate route?
 *   The full /api/translate path asks Gemini for an 11-section JSON payload
 *   (~2500 output tokens). This one asks for a single line (~30-80 tokens),
 *   so each request burns roughly 90% fewer output tokens. That stretches
 *   the Gemini free-tier daily quota from ~250 full translations to
 *   several thousand quick ones.
 *
 * Contract:
 *   Input  : { text, direction, style }  (same as full route, so the client
 *                                          can share a style selector)
 *   Output : { translation: string }
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_INPUT_CHARS = 2000;
const GENERATE_TIMEOUT_MS = 25_000;
const VALID_DIRECTIONS: Direction[] = ["en-id", "id-en"];
const VALID_STYLES = TRANSLATION_STYLES.map((s) => s.id) as TranslationStyle[];

/**
 * Minimal system prompt — we don't need the full "language coach" persona
 * here. Just a tiny directive so the model answers with ONLY the translation
 * on a single line, no preamble, no quotes, no commentary.
 */
const QUICK_SYSTEM_PROMPT = `Kamu penerjemah Inggris⇄Indonesia. Balas HANYA dengan terjemahannya — tanpa kutip, tanpa penjelasan, tanpa label, tanpa markdown. Satu baris saja kecuali input memang multi-baris.`;

/** Per-style hint — short phrases the model applies during translation. */
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

function jsonError(status: number, error: string, detail?: string) {
  return NextResponse.json({ error, detail }, { status });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error("Request timed out");
      err.name = "AbortError";
      reject(err);
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/** Strip accidental quotes, trailing "." runs, and leading/trailing
 *  whitespace the model might still add despite our instructions. */
function cleanTranslation(raw: string): string {
  let t = raw.trim();

  // Strip matched outer quotes (straight or curly).
  const quotes = [
    ['"', '"'],
    ["'", "'"],
    ["“", "”"],
    ["‘", "’"],
    ["«", "»"],
  ];
  for (const [a, b] of quotes) {
    if (t.startsWith(a) && t.endsWith(b) && t.length >= 2) {
      t = t.slice(a.length, t.length - b.length).trim();
    }
  }

  // Strip common label prefixes ("Translation:", "Terjemahan:", "- ", etc.)
  t = t.replace(/^(translation|terjemahan|answer|jawaban)\s*:\s*/i, "");
  t = t.replace(/^[-•*]\s+/, "");

  return t.trim();
}

export async function POST(request: Request) {
  let body: Partial<QuickTranslateRequestBody>;
  try {
    body = (await request.json()) as Partial<QuickTranslateRequestBody>;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const direction = body.direction as Direction | undefined;
  const style = body.style as TranslationStyle | undefined;

  if (!text) return jsonError(400, "Teks tidak boleh kosong.");
  if (text.length > MAX_INPUT_CHARS) {
    return jsonError(
      400,
      `Teks terlalu panjang. Maksimal ${MAX_INPUT_CHARS} karakter.`,
    );
  }
  if (!direction || !VALID_DIRECTIONS.includes(direction)) {
    return jsonError(400, "Arah terjemahan tidak valid.");
  }
  if (!style || !VALID_STYLES.includes(style)) {
    return jsonError(400, "Gaya terjemahan tidak valid.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError(
      500,
      "Server belum dikonfigurasi.",
      "GEMINI_API_KEY belum di-set.",
    );
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Aggressive speed/cost tuning:
    // - maxOutputTokens: 512 → plenty for a single-sentence translation,
    //   but hard-caps runaway output.
    // - responseMimeType: "text/plain" → no JSON wrapping overhead.
    // - thinkingBudget: 0 → disable Gemini 2.5's thinking phase.
    // - temperature 0.4 → more deterministic for translation.
    const generationConfig = {
      temperature: 0.4,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 512,
      responseMimeType: "text/plain",
      thinkingConfig: { thinkingBudget: 0 },
    } as unknown as Parameters<
      typeof genAI.getGenerativeModel
    >[0]["generationConfig"];

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: QUICK_SYSTEM_PROMPT,
      generationConfig,
    });

    const styleHint = STYLE_HINTS[style];
    const styleLabel = STYLE_MAP[style].label;
    const dirLine =
      direction === "en-id"
        ? "Terjemahkan dari Bahasa Inggris ke Bahasa Indonesia."
        : "Terjemahkan dari Bahasa Indonesia ke Bahasa Inggris.";

    const userPrompt = `${dirLine}
Gaya: ${styleLabel} — ${styleHint}.

Teks:
${text}`;

    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
      GENERATE_TIMEOUT_MS,
    );

    const rawText = result.response.text();
    if (!rawText) return jsonError(502, "Model tidak mengembalikan hasil.");

    const translation = cleanTranslation(rawText);
    if (!translation) {
      return jsonError(
        502,
        "AI tidak menghasilkan terjemahan. Coba lagi dengan kalimat berbeda.",
      );
    }

    const payload: QuickTranslateResult = { translation };
    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    if (
      err instanceof Error &&
      (err.name === "AbortError" || /abort/i.test(msg))
    ) {
      return jsonError(
        504,
        "Terjemahan memakan waktu terlalu lama.",
        "Coba lagi dalam beberapa detik.",
      );
    }

    return jsonError(
      500,
      "Terjadi kesalahan saat menerjemahkan.",
      msg.slice(0, 300),
    );
  }
}

export function GET() {
  return jsonError(405, "Method Not Allowed. Gunakan POST.");
}
