/**
 * LinguaLoom AI – shared type definitions.
 * These mirror the JSON contract the API route returns.
 */

export type Direction = "en-id" | "id-en";

export type TranslationStyle =
  | "natural"
  | "formal"
  | "casual"
  | "academic"
  | "business"
  | "slang"
  | "romantic"
  | "kids";

export interface StyleOption {
  id: TranslationStyle;
  label: string;
  description: string;
  emoji: string;
}

export interface PhraseBreakdownItem {
  original: string;
  basicMeaning: string;
  contextMeaning: string;
  usageNote: string;
}

export interface LinguisticReasoning {
  coreMeaning: string;
  importantWords: string[];
  structureNotes: string;
  toneNotes: string;
  whyThisTranslationWorks: string;
}

export interface BestCombinations {
  beforeSentence: string[];
  afterSentence: string[];
  possibleReplies: string[];
  naturalVariations: string[];
}

export interface SituationalUsage {
  casual: string;
  formal: string;
  academic: string;
  business: string;
  socialMedia: string;
  sensitiveContext: string;
}

export interface DomainDifferences {
  casual: string;
  formal: string;
  academic: string;
  business: string;
  slang: string;
  internetCulture: string;
  nativeStyle: string;
}

export interface SlangSection {
  slangVersions: string[];
  meaning: string;
  safeToUseWhen: string;
  avoidWhen: string;
  examples: string[];
}

export interface TranslationVariations {
  natural: string;
  formal: string;
  casual: string;
  short: string;
  expressive: string;
}

export interface CulturalNotes {
  politeness: string;
  warmth: string;
  riskOfMisunderstanding: string;
  naturalnessScore: string;
}

export interface TranslationResult {
  mainTranslation: string;
  simpleExplanation: string;
  linguisticReasoning: LinguisticReasoning;
  phraseBreakdown: PhraseBreakdownItem[];
  bestCombinations: BestCombinations;
  situationalUsage: SituationalUsage;
  domainDifferences: DomainDifferences;
  slangSection: SlangSection;
  translationVariations: TranslationVariations;
  dialogExamples: string[];
  culturalNotes: CulturalNotes;
}

export interface TranslateRequestBody {
  text: string;
  direction: Direction;
  style: TranslationStyle;
}

export interface TranslateApiError {
  error: string;
  detail?: string;
}
