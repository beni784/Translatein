"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type {
  Direction,
  TranslationResult,
  TranslationStyle,
} from "@/lib/types";
import { MainTranslationCard } from "@/components/result/sections/MainTranslationCard";
import { SimpleExplanationCard } from "@/components/result/sections/SimpleExplanationCard";
import { LinguisticReasoningCard } from "@/components/result/sections/LinguisticReasoningCard";
import { PhraseBreakdownCard } from "@/components/result/sections/PhraseBreakdownCard";
import { BestCombinationsCard } from "@/components/result/sections/BestCombinationsCard";
import { SituationalUsageCard } from "@/components/result/sections/SituationalUsageCard";
import { DomainDifferencesCard } from "@/components/result/sections/DomainDifferencesCard";
import { SlangSectionCard } from "@/components/result/sections/SlangSectionCard";
import { TranslationVariationsCard } from "@/components/result/sections/TranslationVariationsCard";
import { DialogExamplesCard } from "@/components/result/sections/DialogExamplesCard";
import { CulturalNotesCard } from "@/components/result/sections/CulturalNotesCard";
import { CopyButton } from "@/components/result/CopyButton";

interface ResultViewProps {
  result: TranslationResult;
  outputFlag: string;
  direction: Direction;
  style: TranslationStyle;
}

export function ResultView({
  result,
  outputFlag,
  direction,
  style,
}: ResultViewProps) {
  // Target language for the main translation & TTS.
  const targetLang: "id" | "en" = direction === "en-id" ? "id" : "en";

  const fullPlainText = useMemo(() => {
    const lines: string[] = [
      `📝 ${result.mainTranslation}`,
      "",
      result.simpleExplanation && `💡 ${result.simpleExplanation}`,
    ].filter(Boolean) as string[];
    return lines.join("\n");
  }, [result]);

  // Staggered entrance.
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={item}>
        <MainTranslationCard
          translation={result.mainTranslation}
          outputFlag={outputFlag}
          style={style}
          lang={targetLang}
        />
      </motion.div>

      <motion.div variants={item}>
        <SimpleExplanationCard explanation={result.simpleExplanation} />
      </motion.div>

      <motion.div variants={item}>
        <LinguisticReasoningCard reasoning={result.linguisticReasoning} />
      </motion.div>

      <motion.div variants={item}>
        <PhraseBreakdownCard items={result.phraseBreakdown} />
      </motion.div>

      <motion.div variants={item}>
        <TranslationVariationsCard variations={result.translationVariations} />
      </motion.div>

      <motion.div variants={item}>
        <BestCombinationsCard combinations={result.bestCombinations} />
      </motion.div>

      <motion.div variants={item}>
        <SituationalUsageCard usage={result.situationalUsage} />
      </motion.div>

      <motion.div variants={item}>
        <DomainDifferencesCard differences={result.domainDifferences} />
      </motion.div>

      <motion.div variants={item}>
        <SlangSectionCard slang={result.slangSection} />
      </motion.div>

      <motion.div variants={item}>
        <DialogExamplesCard examples={result.dialogExamples} />
      </motion.div>

      <motion.div variants={item}>
        <CulturalNotesCard notes={result.culturalNotes} />
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-4 backdrop-blur"
      >
        <p className="text-xs text-slate-500">
          Butuh semuanya sekaligus? Salin terjemahan utama + penjelasan singkat.
        </p>
        <CopyButton
          value={fullPlainText}
          label="Salin ringkasan"
          variant="solid"
          successMessage="Ringkasan tersalin!"
        />
      </motion.div>
    </motion.div>
  );
}
