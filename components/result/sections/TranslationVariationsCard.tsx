"use client";

import { Wand2 } from "lucide-react";
import { ResultCard } from "../ResultCard";
import { CopyButton } from "../CopyButton";
import type { TranslationVariations } from "@/lib/types";

const VARIATIONS: Array<{
  key: keyof TranslationVariations;
  title: string;
  emoji: string;
  accent: string;
}> = [
  { key: "natural", title: "Natural", emoji: "🌿", accent: "from-teal-50 to-emerald-50 border-teal-200" },
  { key: "formal", title: "Formal", emoji: "🎩", accent: "from-slate-50 to-slate-100 border-slate-200" },
  { key: "casual", title: "Casual", emoji: "💬", accent: "from-amber-50 to-yellow-50 border-amber-200" },
  { key: "short", title: "Short", emoji: "⚡", accent: "from-sky-50 to-blue-50 border-sky-200" },
  { key: "expressive", title: "Expressive", emoji: "🎭", accent: "from-violet-50 to-pink-50 border-violet-200" },
];

export function TranslationVariationsCard({
  variations,
}: {
  variations: TranslationVariations;
}) {
  const hasAny = Object.values(variations).some((v) => v);
  if (!hasAny) return null;

  return (
    <ResultCard
      icon={<Wand2 className="h-5 w-5" />}
      label="I · Variasi Terjemahan"
      title="5 cara berbeda mengatakannya"
      description="Pilih mana yang paling cocok dengan situasimu."
      accent="violet"
      collapsible
      badge="5 variasi"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {VARIATIONS.map(({ key, title, emoji, accent }) => {
          const value = variations[key];
          if (!value) return null;
          return (
            <div
              key={key}
              className={`group relative rounded-2xl border bg-gradient-to-br p-4 transition hover:-translate-y-0.5 ${accent}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base" aria-hidden>
                    {emoji}
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    {title}
                  </p>
                </div>
                <CopyButton value={value} label="" successMessage={`"${title}" tersalin!`} />
              </div>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-900">
                &ldquo;{value}&rdquo;
              </p>
            </div>
          );
        })}
      </div>
    </ResultCard>
  );
}
