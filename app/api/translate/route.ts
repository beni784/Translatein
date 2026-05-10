import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  BENIYUJII_SYSTEM_PROMPT,
  buildUserPrompt,
} from "@/lib/ai/systemPrompt";
import {
  extractJson,
  normalizeTranslationResult,
} from "@/lib/ai/normalize";
import { TRANSLATION_STYLES } from "@/lib/styles";
import type {
  Direction,
  TranslateRequestBody,
  TranslationStyle,
} from "@/lib/types";

export const runtime = "nodejs";
// Don't cache — every request is unique.
export const dynamic = "force-dynamic";
// Give Gemini up to 60s before Vercel kills the function. On Hobby plan this
// is the max; on Pro it can go higher. We also apply our own AbortController
// at ~55s so we can return a clean error message instead of a cold 504.
export const maxDuration = 60;

const MAX_INPUT_CHARS = 2000;
const GENERATE_TIMEOUT_MS = 55_000;
const VALID_DIRECTIONS: Direction[] = ["en-id", "id-en"];
const VALID_STYLES = TRANSLATION_STYLES.map((s) => s.id) as TranslationStyle[];

function jsonError(status: number, error: string, detail?: string) {
  return NextResponse.json({ error, detail }, { status });
}

/**
 * Races `promise` against a timeout. If the timer wins, throws a clean
 * AbortError. We don't actually cancel the underlying fetch here (the SDK's
 * signal support is inconsistent across versions) — but because this runs
 * inside a serverless function that will be torn down at `maxDuration`
 * anyway, nothing leaks.
 */
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

export async function POST(request: Request) {
  let body: Partial<TranslateRequestBody>;
  try {
    body = (await request.json()) as Partial<TranslateRequestBody>;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const direction = body.direction as Direction | undefined;
  const style = body.style as TranslationStyle | undefined;

  if (!text) {
    return jsonError(400, "Teks tidak boleh kosong.");
  }
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
      "GEMINI_API_KEY belum di-set di environment variable.",
    );
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // SPEED OPTIMIZATIONS on the model config:
    // - responseMimeType: "application/json" → model stops wrapping output
    //   in markdown or adding commentary, no post-processing needed.
    // - thinkingConfig.thinkingBudget = 0 → disables Gemini 2.5's "thinking"
    //   phase, which can add 3-10 seconds of latency for short prompts.
    //   For a well-scoped task like translation, thinking doesn't improve
    //   quality enough to justify the wait.
    // - maxOutputTokens lowered from 4096 → 3000. A full translation result
    //   fits comfortably in ~2200-2600 tokens; the old ceiling made the
    //   model budget more time "just in case".
    // - topK added for slightly more decisive sampling = marginally faster.
    //
    // thinkingConfig isn't in the @google/generative-ai TS types yet, but is
    // accepted at runtime. We spread through an untyped object so the code
    // keeps compiling whether or not the SDK adds the field later.
    const generationConfig = {
      temperature: 0.6,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 3000,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
    } as unknown as Parameters<
      typeof genAI.getGenerativeModel
    >[0]["generationConfig"];

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: BENIYUJII_SYSTEM_PROMPT,
      generationConfig,
    });

    const userPrompt = buildUserPrompt({ text, direction, style });

    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
      GENERATE_TIMEOUT_MS,
    );

    const rawText = result.response.text();
    if (!rawText) {
      return jsonError(502, "Model tidak mengembalikan hasil.");
    }

    let parsed: unknown;
    try {
      parsed = extractJson(rawText);
    } catch (err) {
      return jsonError(
        502,
        "Gagal memproses respons AI.",
        err instanceof Error ? err.message : "Unknown parse error",
      );
    }

    const normalized = normalizeTranslationResult(parsed);

    if (!normalized.mainTranslation) {
      return jsonError(
        502,
        "AI tidak menghasilkan terjemahan utama. Coba lagi dengan kalimat berbeda.",
      );
    }

    return NextResponse.json(normalized, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    // Timeout / abort → friendly message instead of raw stack trace.
    if (
      err instanceof Error &&
      (err.name === "AbortError" || /abort/i.test(msg))
    ) {
      return jsonError(
        504,
        "Terjemahan memakan waktu terlalu lama.",
        "AI sedang sibuk. Coba lagi dalam beberapa detik, atau pendekkan kalimatmu.",
      );
    }

    // Avoid leaking stack traces / API keys.
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
