import type { Direction, TranslationStyle } from "../types";
import { STYLE_MAP } from "../styles";

/**
 * Core system prompt — defines the persona of BeniYujii AI.
 *
 * PRODUCTION OPTIMIZED:
 * - Short & directive to minimize input tokens.
 * - Extremely explicit about JSON-only output to prevent invalid responses.
 * - Works with responseMimeType: "application/json" for double enforcement.
 */
export const BENIYUJII_SYSTEM_PROMPT = `Kamu adalah BeniYujii AI — penerjemah ahli Inggris⇄Indonesia, guru bahasa sabar, linguist, dan pakar budaya.

ATURAN KETAT:
1. Output WAJIB JSON valid. TIDAK BOLEH ada teks di luar JSON.
2. Prioritaskan terjemahan NATURAL, bukan literal.
3. Semua penjelasan dalam Bahasa Indonesia, ringkas (1-2 kalimat per field).
4. Slang/kata kasar tetap diterjemahkan dengan catatan pemakaian.
5. Jangan menulis markdown fence, komentar, atau proses berpikir.
6. Untuk field tidak relevan, tulis "Tidak umum dipakai" — jangan kosong.
7. Array minimal 2 item.`;

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
 * Compressed schema — model infers field purpose from names.
 * Total output target: ≤ 1200 kata (ringkas tapi informatif).
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
      ? "ARAH: EN→ID. mainTranslation & translationVariations dalam Bahasa Indonesia."
      : "ARAH: ID→EN. mainTranslation & translationVariations dalam Bahasa Inggris.";

  return `${directionLine}
GAYA: ${styleOption.label} — ${styleHint}

INPUT: "${text}"

Kembalikan JSON PERSIS skema ini:
{
  "mainTranslation": "terjemahan utama sesuai gaya",
  "simpleExplanation": "penjelasan sederhana (Bahasa Indonesia)",
  "linguisticReasoning": {
    "coreMeaning": "makna inti",
    "importantWords": ["kata kunci"],
    "structureNotes": "perubahan struktur",
    "toneNotes": "perubahan nuansa",
    "whyThisTranslationWorks": "alasan singkat"
  },
  "phraseBreakdown": [
    {"original":"kata","basicMeaning":"arti dasar","contextMeaning":"arti konteks","usageNote":"catatan"}
  ],
  "bestCombinations": {
    "beforeSentence": ["contoh"],
    "afterSentence": ["contoh"],
    "possibleReplies": ["contoh"],
    "naturalVariations": ["contoh"]
  },
  "situationalUsage": {
    "casual":"","formal":"","academic":"","business":"","socialMedia":"","sensitiveContext":""
  },
  "domainDifferences": {
    "casual":"","formal":"","academic":"","business":"","slang":"","internetCulture":"","nativeStyle":""
  },
  "slangSection": {
    "slangVersions": ["versi gaul"],
    "meaning": "arti",
    "safeToUseWhen": "aman saat",
    "avoidWhen": "hindari saat",
    "examples": ["contoh"]
  },
  "translationVariations": {
    "natural":"","formal":"","casual":"","short":"","expressive":""
  },
  "dialogExamples": ["A: ...\\nB: ..."],
  "culturalNotes": {
    "politeness":"","warmth":"","riskOfMisunderstanding":"","naturalnessScore":"X/10 alasan"
  }
}

PENTING: Isi RINGKAS (1-2 kalimat per field). Total ≤ 1200 kata. JSON VALID SAJA.`;
}
