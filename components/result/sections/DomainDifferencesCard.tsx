"use client";

import { Layers3 } from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { DomainDifferences } from "@/lib/types";

const DOMAINS: Array<{
  key: keyof DomainDifferences;
  title: string;
  emoji: string;
}> = [
  { key: "casual", title: "Casual", emoji: "☕" },
  { key: "formal", title: "Formal", emoji: "🎩" },
  { key: "academic", title: "Academic", emoji: "🎓" },
  { key: "business", title: "Business", emoji: "💼" },
  { key: "slang", title: "Slang", emoji: "🔥" },
  { key: "internetCulture", title: "Internet Culture", emoji: "🌐" },
  { key: "nativeStyle", title: "Native Speaker Style", emoji: "🗣️" },
];

export function DomainDifferencesCard({
  differences,
}: {
  differences: DomainDifferences;
}) {
  const hasContent = Object.values(differences).some(
    (v) => v && v.trim().length > 0,
  );
  if (!hasContent) return null;

  return (
    <ResultCard
      icon={<Layers3 className="h-5 w-5" />}
      label="G · Perbedaan Ranah Penggunaan"
      title="Bunyinya di berbagai dunia"
      description="Bagaimana kalimat ini terdengar di tiap lingkungan berbeda."
      accent="indigo"
      collapsible
    >
      <div className="space-y-2">
        {DOMAINS.map(({ key, title, emoji }) => {
          const value = differences[key];
          if (!value) return null;
          return (
            <div
              key={key}
              className="group flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg ring-1 ring-slate-200">
                <span aria-hidden>{emoji}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                  {title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-700">
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ResultCard>
  );
}
