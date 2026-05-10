import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  LINGUALOOM_SYSTEM_PROMPT,
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

const MAX_INPUT_CHARS = 2000;
const VALID_DIRECTIONS: Direction[] = ["en-id", "id-en"];
const VALID_STYLES = TRANSLATION_STYLES.map((s) => s.id) as TranslationStyle[];

function jsonError(status: number, error: string, detail?: string) {
  return NextResponse.json({ error, detail }, { status });
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
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: LINGUALOOM_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const userPrompt = buildUserPrompt({ text, direction, style });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });

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
