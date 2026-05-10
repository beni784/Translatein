import type { Direction, TranslationStyle } from "../types";
import { STYLE_MAP } from "../styles";

/**
 * Core system prompt — defines the persona of BeniYujii AI.
 * Explicitly tells the model not to dump long chain-of-thought.
 */
export const BENIYUJII_SYSTEM_PROMPT = `Kamu adalah BeniYujii AI — ahli penerjemah Bahasa Inggris dan Bahasa Indonesia, guru bahasa yang sabar, seorang linguist, dan pakar konteks budaya.

Tugasmu bukan hanya menerjemahkan, tetapi menjelaskan:
- Makna kalimat dalam konteks yang tepat
- Alasan pemilihan kata dan struktur
- Situasi penggunaan yang cocok
- Variasi formal, informal, slang
- Nuansa budaya antara penutur Inggris dan Indonesia
- Contoh dialog nyata

ATURAN WAJIB:
1. Selalu prioritaskan terjemahan NATURAL sesuai konteks, bukan literal.
2. Jawaban harus ramah, rapi, jelas, dan mudah dipahami pemula.
3. Semua penjelasan ditulis dalam Bahasa Indonesia (apa pun bahasa inputnya).
4. JANGAN menuliskan proses berpikir panjang atau chain-of-thought internal. Berikan hasil yang sudah rapi.
5. JANGAN menolak menerjemahkan kecuali kontennya benar-benar berbahaya. Slang, bahasa gaul, kata kasar, dan kalimat romantis adalah bagian wajar dari bahasa dan harus dijelaskan secara edukatif.
6. Jika input mengandung kata kasar atau sensitif, tetap terjemahkan dengan catatan risiko pemakaian pada bagian culturalNotes & slangSection.
7. Output WAJIB berupa JSON valid persis sesuai skema yang diminta — tanpa markdown fence, tanpa komentar, tanpa teks pembuka/penutup.
8. Setiap field string harus terisi bermakna. Jika sesuatu tidak relevan, isi dengan penjelasan singkat seperti "Tidak umum dipakai dalam konteks ini" — JANGAN biarkan kosong.
9. Untuk array, minimal 2 item kecuali dinyatakan lain.`;

const STYLE_INSTRUCTIONS: Record<TranslationStyle, string> = {
  natural:
    "Terjemahkan sealami mungkin, seperti yang akan diucapkan penutur asli dalam kehidupan sehari-hari.",
  formal:
    "Gunakan register formal, sopan, dan resmi. Cocok untuk email bisnis, surat, atau presentasi.",
  casual:
    "Gunakan gaya santai dan akrab seperti ngobrol dengan teman. Boleh pakai kontraksi dan sapaan ringan.",
  academic:
    "Gunakan gaya akademik, presisi, dan terstruktur. Hindari slang. Pilih kata yang formal dan akurat.",
  business:
    "Gunakan gaya profesional bisnis — ringkas, jelas, action-oriented, dan sopan.",
  slang:
    "Gunakan slang, bahasa gaul, atau internet culture yang sedang populer. Tetap berikan versi natural sebagai pembanding di translationVariations.",
  romantic:
    "Gunakan gaya hangat, puitis, dan ekspresif yang cocok untuk konteks percintaan atau emosional.",
  kids:
    "Gunakan kata-kata yang sangat sederhana, pendek, dan mudah dimengerti anak kecil.",
};

/**
 * Builds the per-request user prompt.
 * The model receives: direction + style + input sentence, and is asked to
 * return the strict JSON schema.
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
      ? "ARAH: Bahasa Inggris → Bahasa Indonesia. Input di bawah adalah Bahasa Inggris. mainTranslation dan semua variasi di translationVariations HARUS dalam Bahasa Indonesia."
      : "ARAH: Bahasa Indonesia → Bahasa Inggris. Input di bawah adalah Bahasa Indonesia. mainTranslation dan semua variasi di translationVariations HARUS dalam Bahasa Inggris.";

  return `${directionLine}

GAYA TERJEMAHAN YANG DIMINTA: ${styleOption.label} (${styleOption.id})
PETUNJUK GAYA: ${styleHint}

INPUT PENGGUNA:
"""
${text}
"""

Kembalikan JSON valid dengan skema berikut PERSIS (tanpa markdown fence):

{
  "mainTranslation": "string — terjemahan utama paling natural sesuai gaya yang diminta",
  "simpleExplanation": "string — penjelasan super sederhana seakan menjelaskan ke anak kecil, dalam Bahasa Indonesia",
  "linguisticReasoning": {
    "coreMeaning": "string — makna inti kalimat",
    "importantWords": ["string", "string"],
    "structureNotes": "string — perubahan struktur kalimat antar bahasa",
    "toneNotes": "string — perubahan nuansa/nada",
    "whyThisTranslationWorks": "string — alasan ringkas kenapa pilihan kata ini cocok"
  },
  "phraseBreakdown": [
    {
      "original": "string — kata/frasa asli dari input",
      "basicMeaning": "string — arti dasar",
      "contextMeaning": "string — arti dalam konteks kalimat ini",
      "usageNote": "string — catatan pemakaian singkat"
    }
  ],
  "bestCombinations": {
    "beforeSentence": ["string", "string"],
    "afterSentence": ["string", "string"],
    "possibleReplies": ["string", "string"],
    "naturalVariations": ["string", "string"]
  },
  "situationalUsage": {
    "casual": "string",
    "formal": "string",
    "academic": "string",
    "business": "string",
    "socialMedia": "string",
    "sensitiveContext": "string — kapan harus hati-hati"
  },
  "domainDifferences": {
    "casual": "string",
    "formal": "string",
    "academic": "string",
    "business": "string",
    "slang": "string",
    "internetCulture": "string",
    "nativeStyle": "string — bagaimana native speaker mengucapkannya"
  },
  "slangSection": {
    "slangVersions": ["string", "string"],
    "meaning": "string",
    "safeToUseWhen": "string",
    "avoidWhen": "string",
    "examples": ["string", "string"]
  },
  "translationVariations": {
    "natural": "string",
    "formal": "string",
    "casual": "string",
    "short": "string",
    "expressive": "string"
  },
  "dialogExamples": [
    "string — dialog 2-4 baris, format: 'A: ...' dan 'B: ...' dipisah newline",
    "string — dialog alternatif berbeda konteks"
  ],
  "culturalNotes": {
    "politeness": "string — seberapa sopan",
    "warmth": "string — seberapa hangat/akrab/dingin",
    "riskOfMisunderstanding": "string — risiko salah paham",
    "naturalnessScore": "string — misal '9/10 sangat natural' dengan alasan singkat"
  }
}

Pastikan JSON valid dan setiap field berisi konten bermakna. Jangan tambahkan field lain di luar skema.`;
}
