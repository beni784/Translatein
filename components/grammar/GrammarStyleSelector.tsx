"use client";

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrammarStyle } from "./GrammarShell";

const STYLES: Array<{ id: GrammarStyle; label: string; emoji: string }> = [
  { id: "standard", label: "Standard", emoji: "✅" },
  { id: "casual", label: "Casual", emoji: "💬" },
  { id: "formal", label: "Formal", emoji: "🎩" },
  { id: "academic", label: "Academic", emoji: "🎓" },
  { id: "business", label: "Business", emoji: "💼" },
  { id: "friendly", label: "Friendly", emoji: "🤗" },
  { id: "native", label: "Native", emoji: "🗣️" },
];

interface Props {
  value: GrammarStyle;
  onChange: (v: GrammarStyle) => void;
  disabled?: boolean;
}

export function GrammarStyleSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Palette className="h-3 w-3" />
        Gaya Koreksi
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLES.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(s.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span aria-hidden>{s.emoji}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
