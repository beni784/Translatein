"use client";

import { Brain, KeyRound } from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { LinguisticReasoning } from "@/lib/types";

const ROWS: Array<{
  key: keyof Omit<LinguisticReasoning, "importantWords">;
  title: string;
  hint: string;
}> = [
  { key: "coreMeaning", title: "Makna inti", hint: "Apa yang sebenarnya disampaikan." },
  { key: "structureNotes", title: "Perubahan struktur", hint: "Perbedaan susunan kalimat antar bahasa." },
  { key: "toneNotes", title: "Nuansa yang berubah", hint: "Rasa / nada yang mungkin bergeser." },
  { key: "whyThisTranslationWorks", title: "Kenapa terjemahan ini cocok", hint: "Alasan pemilihan kata & gaya." },
];

export function LinguisticReasoningCard({
  reasoning,
}: {
  reasoning: LinguisticReasoning;
}) {
  return (
    <ResultCard
      icon={<Brain className="h-5 w-5" />}
      label="C · Alasan Linguistik"
      title="Kenapa diterjemahkan seperti ini"
      description="Alasan ringkas dan terstruktur — bukan proses berpikir panjang."
      accent="violet"
      collapsible
    >
      <div className="space-y-4">
        {reasoning.importantWords.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <KeyRound className="h-3.5 w-3.5" />
              Kata kunci penting
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {reasoning.importantWords.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}

        <dl className="grid gap-3 sm:grid-cols-2">
          {ROWS.map((row) => {
            const value = reasoning[row.key];
            if (!value) return null;
            return (
              <div
                key={row.key}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {row.title}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {value}
                </dd>
                <p className="mt-1 text-[11px] italic text-slate-400">
                  {row.hint}
                </p>
              </div>
            );
          })}
        </dl>
      </div>
    </ResultCard>
  );
}
