"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageSquareText,
  ListChecks,
  Shuffle,
  Gauge,
  GitCompareArrows,
} from "lucide-react";
import { CopyButton } from "@/components/result/CopyButton";
import type { GrammarResult } from "./GrammarShell";

interface Props {
  result: GrammarResult;
  originalText: string;
}

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

export function GrammarResultView({ result, originalText }: Props) {
  const scoreColor =
    result.confidenceScore >= 90
      ? "text-emerald-700"
      : result.confidenceScore >= 70
        ? "text-amber-700"
        : "text-rose-700";

  const scoreBg =
    result.confidenceScore >= 90
      ? "from-emerald-50 to-teal-50 border-emerald-200"
      : result.confidenceScore >= 70
        ? "from-amber-50 to-orange-50 border-amber-200"
        : "from-rose-50 to-pink-50 border-rose-200";

  const scoreBarColor =
    result.confidenceScore >= 90
      ? "from-emerald-500 to-teal-500"
      : result.confidenceScore >= 70
        ? "from-amber-500 to-orange-500"
        : "from-rose-500 to-pink-500";

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* A. Corrected Version */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-emerald-600 via-teal-600 to-brand-600 p-0.5 shadow-glow"
      >
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 text-emerald-700 shadow-sm ring-1 ring-emerald-200/60">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">
                    Corrected Version
                  </p>
                  <p className="text-xs text-slate-500">
                    Bahasa: {result.detectedLanguage}
                  </p>
                </div>
              </div>
              <CopyButton
                value={result.correctedText}
                label="Salin"
                variant="solid"
                successMessage="Hasil koreksi tersalin!"
              />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-900 sm:text-base">
              {result.correctedText}
            </p>
          </div>
        </div>
      </motion.div>

      {/* B. Explanation */}
      {result.explanation && (
        <motion.div
          variants={item}
          className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/60">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Penjelasan
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Apa yang diperbaiki
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {result.explanation}
          </p>
        </motion.div>
      )}

      {/* C. Key Improvements */}
      {result.keyImprovements.length > 0 && (
        <motion.div
          variants={item}
          className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200/60">
              <ListChecks className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Key Improvements
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Poin-poin perbaikan
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {result.keyImprovements.map((imp, i) => (
              <div
                key={`${imp.type}-${i}`}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-3"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-[10px] font-bold text-sky-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">
                    {imp.type}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-700">
                    {imp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* D. Alternative Version */}
      {result.alternativeVersion && (
        <motion.div
          variants={item}
          className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200/60">
                <Shuffle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Alternative Version
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Versi lebih natural
                </p>
              </div>
            </div>
            <CopyButton
              value={result.alternativeVersion}
              label="Salin"
              successMessage="Versi alternatif tersalin!"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {result.alternativeVersion}
          </p>
        </motion.div>
      )}

      {/* E. Confidence Score */}
      <motion.div
        variants={item}
        className={`rounded-3xl border bg-gradient-to-br p-5 shadow-card sm:p-6 ${scoreBg}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 ${scoreColor} ring-1 ring-current/20`}>
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Confidence Score
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Kualitas setelah diperbaiki
              </p>
            </div>
          </div>
          <p className={`font-display text-3xl font-bold ${scoreColor}`}>
            {result.confidenceScore}
            <span className="text-sm font-medium opacity-60">/100</span>
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ${scoreBarColor}`}
            style={{ width: `${result.confidenceScore}%` }}
          />
        </div>
      </motion.div>

      {/* F. Before & After Comparison */}
      <motion.div
        variants={item}
        className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/60">
            <GitCompareArrows className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Perbandingan
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Before & After
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
              Before
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {originalText.length > 500
                ? originalText.slice(0, 500) + "..."
                : originalText}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              After
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {result.correctedText.length > 500
                ? result.correctedText.slice(0, 500) + "..."
                : result.correctedText}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
