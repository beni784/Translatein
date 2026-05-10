"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageSquareReply,
  Shuffle,
} from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { BestCombinations } from "@/lib/types";

const GROUPS: Array<{
  key: keyof BestCombinations;
  title: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    key: "beforeSentence",
    title: "Kalimat sebelum",
    hint: "Yang cocok diucapkan tepat sebelumnya.",
    icon: ArrowLeftToLine,
    tone: "text-sky-700 bg-sky-50 border-sky-200",
  },
  {
    key: "afterSentence",
    title: "Kalimat sesudah",
    hint: "Yang cocok dilanjutkan setelahnya.",
    icon: ArrowRightToLine,
    tone: "text-teal-700 bg-teal-50 border-teal-200",
  },
  {
    key: "possibleReplies",
    title: "Respons yang cocok",
    hint: "Kalau kamu yang diajak bicara, ini reply-nya.",
    icon: MessageSquareReply,
    tone: "text-violet-700 bg-violet-50 border-violet-200",
  },
  {
    key: "naturalVariations",
    title: "Variasi natural",
    hint: "Cara lain mengucapkan hal yang sama.",
    icon: Shuffle,
    tone: "text-amber-700 bg-amber-50 border-amber-200",
  },
];

export function BestCombinationsCard({
  combinations,
}: {
  combinations: BestCombinations;
}) {
  const totalItems =
    combinations.beforeSentence.length +
    combinations.afterSentence.length +
    combinations.possibleReplies.length +
    combinations.naturalVariations.length;
  if (totalItems === 0) return null;

  return (
    <ResultCard
      icon={<Shuffle className="h-5 w-5" />}
      label="E · Cocok Dipadukan Dengan"
      title="Kalimat pendamping yang pas"
      description="Contoh kalimat sebelum, sesudah, respons, dan variasi natural."
      accent="teal"
      collapsible
    >
      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map(({ key, title, hint, icon: Icon, tone }) => {
          const items = combinations[key];
          if (!items.length) return null;
          return (
            <div
              key={key}
              className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${tone}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {title}
                  </p>
                  <p className="text-[10px] text-slate-500">{hint}</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5">
                {items.map((s, i) => (
                  <li
                    key={`${key}-${i}`}
                    className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </ResultCard>
  );
}
