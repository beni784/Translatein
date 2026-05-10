import { safeString, safeStringArray } from "../utils";
import type {
  PhraseBreakdownItem,
  TranslationResult,
} from "../types";

/**
 * Extracts a JSON object from a raw model response, tolerating markdown
 * fences, leading text, or trailing commentary.
 */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();

  // 1) Direct parse attempt.
  try {
    return JSON.parse(trimmed);
  } catch {
    // fallthrough
  }

  // 2) Strip ```json ... ``` fences.
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fallthrough
    }
  }

  // 3) Greedy balanced extraction from the first `{` to the last `}`.
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = trimmed.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // fallthrough
    }
  }

  throw new Error("Model output did not contain valid JSON.");
}

function normalizePhraseBreakdown(value: unknown): PhraseBreakdownItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      return {
        original: safeString(obj.original),
        basicMeaning: safeString(obj.basicMeaning),
        contextMeaning: safeString(obj.contextMeaning),
        usageNote: safeString(obj.usageNote),
      };
    })
    .filter((v): v is PhraseBreakdownItem => !!v && v.original.length > 0);
}

/**
 * Coerces any shape produced by the model into a safe, fully-populated
 * TranslationResult. Missing fields get empty-but-valid defaults so the UI
 * never crashes on undefined access.
 */
export function normalizeTranslationResult(raw: unknown): TranslationResult {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;

  const reasoning = (obj.linguisticReasoning ?? {}) as Record<string, unknown>;
  const combos = (obj.bestCombinations ?? {}) as Record<string, unknown>;
  const sit = (obj.situationalUsage ?? {}) as Record<string, unknown>;
  const dom = (obj.domainDifferences ?? {}) as Record<string, unknown>;
  const slang = (obj.slangSection ?? {}) as Record<string, unknown>;
  const vars = (obj.translationVariations ?? {}) as Record<string, unknown>;
  const culture = (obj.culturalNotes ?? {}) as Record<string, unknown>;

  return {
    mainTranslation: safeString(obj.mainTranslation),
    simpleExplanation: safeString(obj.simpleExplanation),
    linguisticReasoning: {
      coreMeaning: safeString(reasoning.coreMeaning),
      importantWords: safeStringArray(reasoning.importantWords),
      structureNotes: safeString(reasoning.structureNotes),
      toneNotes: safeString(reasoning.toneNotes),
      whyThisTranslationWorks: safeString(reasoning.whyThisTranslationWorks),
    },
    phraseBreakdown: normalizePhraseBreakdown(obj.phraseBreakdown),
    bestCombinations: {
      beforeSentence: safeStringArray(combos.beforeSentence),
      afterSentence: safeStringArray(combos.afterSentence),
      possibleReplies: safeStringArray(combos.possibleReplies),
      naturalVariations: safeStringArray(combos.naturalVariations),
    },
    situationalUsage: {
      casual: safeString(sit.casual),
      formal: safeString(sit.formal),
      academic: safeString(sit.academic),
      business: safeString(sit.business),
      socialMedia: safeString(sit.socialMedia),
      sensitiveContext: safeString(sit.sensitiveContext),
    },
    domainDifferences: {
      casual: safeString(dom.casual),
      formal: safeString(dom.formal),
      academic: safeString(dom.academic),
      business: safeString(dom.business),
      slang: safeString(dom.slang),
      internetCulture: safeString(dom.internetCulture),
      nativeStyle: safeString(dom.nativeStyle),
    },
    slangSection: {
      slangVersions: safeStringArray(slang.slangVersions),
      meaning: safeString(slang.meaning),
      safeToUseWhen: safeString(slang.safeToUseWhen),
      avoidWhen: safeString(slang.avoidWhen),
      examples: safeStringArray(slang.examples),
    },
    translationVariations: {
      natural: safeString(vars.natural),
      formal: safeString(vars.formal),
      casual: safeString(vars.casual),
      short: safeString(vars.short),
      expressive: safeString(vars.expressive),
    },
    dialogExamples: safeStringArray(obj.dialogExamples),
    culturalNotes: {
      politeness: safeString(culture.politeness),
      warmth: safeString(culture.warmth),
      riskOfMisunderstanding: safeString(culture.riskOfMisunderstanding),
      naturalnessScore: safeString(culture.naturalnessScore),
    },
  };
}
