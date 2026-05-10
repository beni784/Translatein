"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InputCard } from "./InputCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { ResultView } from "./ResultView";
import { useToast } from "@/components/ui/Toaster";
import type {
  Direction,
  TranslationResult,
  TranslationStyle,
} from "@/lib/types";
import { STYLE_MAP } from "@/lib/styles";

interface TranslatorShellProps {
  direction: Direction;
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  inputLabel: string;
  inputFlag: string;
  outputFlag: string;
}

interface ErrorInfo {
  message: string;
  detail?: string;
}

export function TranslatorShell({
  direction,
  title,
  subtitle,
  inputPlaceholder,
  inputLabel,
  inputFlag,
  outputFlag,
}: TranslatorShellProps) {
  const { toast } = useToast();

  const [text, setText] = useState("");
  const [style, setStyle] = useState<TranslationStyle>("natural");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, direction, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError({
          message: data?.error || "Terjadi kesalahan.",
          detail: data?.detail,
        });
        toast(data?.error || "Gagal menerjemahkan", "error");
        return;
      }

      setResult(data as TranslationResult);
      toast("Terjemahan berhasil!", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Koneksi bermasalah.";
      setError({
        message: "Tidak bisa menghubungi server.",
        detail: message,
      });
      toast("Gagal menghubungi server", "error");
    } finally {
      setLoading(false);
    }
  }, [text, direction, style, toast]);

  const styleInfo = STYLE_MAP[style];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Title block */}
      <div className="mb-8 max-w-3xl animate-fade-in">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          Mode: {styleInfo.emoji} {styleInfo.label}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <InputCard
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            onClear={handleClear}
            loading={loading}
            placeholder={inputPlaceholder}
            label={inputLabel}
            flag={inputFlag}
            style={style}
            onStyleChange={setStyle}
          />
        </div>

        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ErrorState
                  message={error.message}
                  detail={error.detail}
                  onRetry={handleSubmit}
                />
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ResultView
                  result={result}
                  outputFlag={outputFlag}
                  direction={direction}
                  style={style}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
