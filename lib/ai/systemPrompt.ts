import type { Direction, TranslationStyle } from "../types";
import { STYLE_MAP } from "../styles";

/**
 * Core system prompt — defines the persona of BeniYujii AI.
 *
 * OPTIMIZED FOR SPEED:
 * - Kept short & directive — every token in the system prompt gets prepended
 *   to every request, so brevity matters for latency.
 * - Explicit JSON-only output instruction stays; the model follows it reliably.
 */
export const BENIYUJII_SYSTEM_PROMPT = `Kamu adalah BeniYujii AI — ahli penerjemah Inggris⇄Indonesia, guru bahasa yang sabar, linguist, dan pakar budaya.

Tugasmu: menerjemahkan DAN menjelaskan makna, struktur, gaya, nuansa, slang, dan konteks budaya.

ATURAN:
1. Prioritaskan terjemahan NATURAL sesuai konteks, bukan literal.
2. Semua penjelasan dalam Bahasa Indonesia.
3. Jangan menolak slang/kata gaul/kata kasar — jelaskan secara edukatif dengan catatan risiko pemakaian.
4. Output WAJIB JSON valid persis skema. Tanpa markdown fence, tanpa komentar pembuka/penutup.
5. Isi setiap field secara ringkas dan bermakna. Untuk field tidak relevan, tulis "Tidak umum dipakai" — jangan kosong.
6. Array minimal 2 item. Tulis ringkas dan padat — jangan bertele-tele.
7. Jangan menulis chain-of-thought atau proses berpikir. Langsung hasil.`;

const STYLE_INSTRUCTIONS: Record<TranslationStyle, string> = {
  natural: "alami seperti penutur asli sehari-hari",
  formal: "formal, sopan, resmi — cocok email/surat/presentasi",
  casual: "santai dan akrab seperti ngobrol dengan teman",
  academic: "akademik, presisi, terstruktur, tanpa slang",
  business: "profesional bisnis — ringkas, action-oriented",
  slang: "slang/bahasa gaul/internet culture populer",
  romantic: "hangat, puitis, ekspresif, emosional",
  kids: "kata sangat sederhana, pendek, mudah dimengerti anak kecil",
};

/**
 * Builds the per-request user prompt.
 *
 * OPTIMIZED: the JSON schema is heavily compressed — we rely on the model to
 * infer field purpose from concise names plus short hints. This saves ~40% of
 * prompt tokens vs the original verbose schema, which directly reduces
 * latency (fewer tokens to process → faster first token).
 */
export function buildUserPrompt(params: {
  text: string;
  direction: Direction;
  style: TranslationStyle;
}): string {
  const { text, direction, style } = params;
  const styleOption = STYLE_MAP[style];
  const styleHint = STYLE_INSTRUCTIONS[style];

  const directionLine =
    direction === "en-id"
      ? "ARAH: EN→ID. Input = Inggris. mainTranslation & translationVariations HARUS dalam Bahasa Indonesia."
      : "ARAH: ID→EN. Input = Indonesia. mainTranslation & translationVariations HARUS dalam Bahasa Inggris.";

  return `${directionLine}
GAYA: ${styleOption.label} — ${styleHint}

INPUT:
"""
${text}
"""

Kembalikan JSON PERSIS skema ini (tanpa fence, tanpa teks tambahan):

{
  "mainTranslation": "terjemahan utama paling natural sesuai gaya",
  "simpleExplanation": "penjelasan sederhana seperti ke anak kecil (Bahasa Indonesia)",
  "linguisticReasoning": {
    "coreMeaning": "makna inti",
    "importantWords": ["kata kunci 1", "kata kunci 2"],
    "structureNotes": "perubahan struktur antar bahasa",
    "toneNotes": "perubahan nuansa/nada",
    "whyThisTranslationWorks": "alasan pilihan kata cocok"
  },
  "phraseBreakdown": [
    { "original": "kata/frasa asli", "basicMeaning": "arti dasar", "contextMeaning": "arti dalam konteks", "usageNote": "catatan pemakaian singkat" }
  ],
  "bestCombinations": {
    "beforeSentence": ["kalimat sebelum 1", "kalimat sebelum 2"],
    "afterSentence": ["kalimat sesudah 1", "kalimat sesudah 2"],
    "possibleReplies": ["respons 1", "respons 2"],
    "naturalVariations": ["variasi 1", "variasi 2"]
  },
  "situationalUsage": {
    "casual": "", "formal": "", "academic": "", "business": "", "socialMedia": "", "sensitiveContext": "kapan hati-hati"
  },
  "domainDifferences": {
    "casual": "", "formal": "", "academic": "", "business": "", "slang": "", "internetCulture": "", "nativeStyle": "cara native speaker"
  },
  "slangSection": {
    "slangVersions": ["slang 1", "slang 2"],
    "meaning": "arti slang",
    "safeToUseWhen": "aman dipakai saat",
    "avoidWhen": "hindari saat",
    "examples": ["contoh 1", "contoh 2"]
  },
  "translationVariations": {
    "natural": "", "formal": "", "casual": "", "short": "", "expressive": ""
  },
  "dialogExamples": [
    "A: ...\\nB: ...",
    "A: ...\\nB: ..."
  ],
  "culturalNotes": {
    "politeness": "tingkat sopan",
    "warmth": "hangat/dingin",
    "riskOfMisunderstanding": "risiko salah paham",
    "naturalnessScore": "misal '9/10 sangat natural' + alasan singkat"
  }
}

Isi setiap field dengan ringkas (1-2 kalimat per string). Total output ≤ 1800 kata.`;
}
