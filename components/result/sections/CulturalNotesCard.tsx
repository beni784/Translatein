"use client";

import { Globe2, Heart, Snowflake, AlertCircle, Star } from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { CulturalNotes } from "@/lib/types";

function extractScore(text: string): number | null {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (match) return Math.min(10, Math.max(0, parseFloat(match[1])));
  const num = text.match(/(\d+(?:\.\d+)?)/);
  if (num) {
    const v = parseFloat(num[1]);
    if (v <= 10) return v;
  }
  return null;
}

export function CulturalNotesCard({ notes }: { notes: CulturalNotes }) {
  const hasAny = Object.values(notes).some((v) => v && v.trim().length > 0);
  if (!hasAny) return null;

  const score = extractScore(notes.naturalnessScore);
  const scorePct = score !== null ? (score / 10) * 100 : null;

  const rows = [
    {
      key: "politeness" as const,
      label: "Tingkat kesopanan",
      icon: Heart,
      tone: "from-rose-50 to-pink-50 text-rose-700 border-rose-200",
    },
    {
      key: "warmth" as const,
      label: "Kehangatan / keakraban",
      icon: Snowflake,
      tone: "from-sky-50 to-blue-50 text-sky-700 border-sky-200",
    },
    {
      key: "riskOfMisunderstanding" as const,
      label: "Risiko salah paham",
      icon: AlertCircle,
      tone: "from-amber-50 to-orange-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <ResultCard
      icon={<Globe2 className="h-5 w-5" />}
      label="K · Catatan Budaya & Nuansa"
      title="Bagaimana kalimat ini terasa"
      description="Panduan seberapa sopan, hangat, dan natural kalimatmu terdengar."
      accent="violet"
      collapsible
    >
      <div className="space-y-4">
        {scorePct !== null && (
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-brand-50 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-violet-700 ring-1 ring-violet-200">
                  <Star className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-800">
                  Skor kealamiahan
                </p>
              </div>
              <p className="font-display text-2xl font-bold text-violet-900">
                {score?.toFixed(1)}
                <span className="text-sm font-medium text-violet-600">/10</span>
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-teal-500 transition-[width] duration-700"
                style={{ width: `${scorePct}%` }}
              />
            </div>
            {notes.naturalnessScore && (
              <p className="mt-2 text-xs text-violet-800/80">
                {notes.naturalnessScore}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map(({ key, label, icon: Icon, tone }) => {
            const value = notes[key];
            if (!value) return null;
            return (
              <div
                key={key}
                className={`rounded-2xl border bg-gradient-to-br p-4 ${tone}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </ResultCard>
  );
}
