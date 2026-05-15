"use client";

import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrammarLanguage } from "./GrammarShell";

const LANGUAGES: Array<{ id: GrammarLanguage; label: string; emoji: string }> = [
  { id: "auto", label: "Auto Detect", emoji: "🔍" },
  { id: "english", label: "English", emoji: "🇬🇧" },
  { id: "indonesian", label: "Indonesian", emoji: "🇮🇩" },
];

interface Props {
  value: GrammarLanguage;
  onChange: (v: GrammarLanguage) => void;
  disabled?: boolean;
}

export function GrammarLanguageSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Globe2 className="h-3 w-3" />
        Bahasa
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((lang) => {
          const active = value === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(lang.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span aria-hidden>{lang.emoji}</span>
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
