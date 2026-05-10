"use client";

import { motion } from "framer-motion";
import { TRANSLATION_STYLES } from "@/lib/styles";
import type { TranslationStyle } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  value: TranslationStyle;
  onChange: (value: TranslationStyle) => void;
  disabled?: boolean;
}

export function StyleSelector({
  value,
  onChange,
  disabled,
}: StyleSelectorProps) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Gaya terjemahan
      </p>
      <div className="flex flex-wrap gap-2">
        {TRANSLATION_STYLES.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(s.id)}
              title={s.description}
              className={cn(
                "group relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-soft"
                  : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-sm",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <span aria-hidden>{s.emoji}</span>
              <span>{s.label}</span>
              {active && (
                <motion.span
                  layoutId="style-underline"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-600 to-violet-600"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
