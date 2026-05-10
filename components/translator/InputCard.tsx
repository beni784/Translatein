"use client";

import { Eraser, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleSelector } from "./StyleSelector";
import type { TranslationStyle } from "@/lib/types";

interface InputCardProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading: boolean;
  placeholder: string;
  label: string;
  flag: string;
  style: TranslationStyle;
  onStyleChange: (s: TranslationStyle) => void;
}

const MAX_CHARS = 2000;

export function InputCard({
  value,
  onChange,
  onSubmit,
  onClear,
  loading,
  placeholder,
  label,
  flag,
  style,
  onStyleChange,
}: InputCardProps) {
  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const overLimit = charCount > MAX_CHARS;
  const canSubmit = !loading && value.trim().length > 0 && !overLimit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {flag}
          </span>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
        </div>
        <span
          className={cn(
            "text-[11px] font-medium tabular-nums transition",
            overLimit
              ? "text-rose-600"
              : nearLimit
                ? "text-amber-600"
                : "text-slate-400",
          )}
        >
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          rows={6}
          className={cn(
            "w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400",
            "transition-all focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label={`Masukkan teks ${label}`}
        />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <StyleSelector
          value={style}
          onChange={onStyleChange}
          disabled={loading}
        />
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-400">
          Tekan <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Ctrl</kbd>{" "}
          +{" "}
          <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
            Enter
          </kbd>{" "}
          untuk menerjemahkan
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={loading || value.length === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition",
              "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-700",
            )}
          >
            <Eraser className="h-4 w-4" />
            Clear
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all",
              "hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-soft",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menerjemahkan...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Translate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
