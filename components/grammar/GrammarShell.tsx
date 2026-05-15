"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SpellCheck,
  Send,
  Eraser,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";
import { GrammarStyleSelector } from "./GrammarStyleSelector";
import { GrammarLanguageSelector } from "./GrammarLanguageSelector";
import { GrammarResultView } from "./GrammarResultView";
import { GrammarEmptyState } from "./GrammarEmptyState";

export type GrammarLanguage = "auto" | "english" | "indonesian";
export type GrammarStyle =
  | "standard"
  | "casual"
  | "formal"
  | "academic"
  | "business"
  | "friendly"
  | "native";

export interface GrammarResult {
  detectedLanguage: string;
  correctedText: string;
  explanation: string;
  keyImprovements: Array<{ type: string; description: string }>;
  alternativeVersion: string;
  confidenceScore: number;
}

interface ErrorInfo {
  message: string;
  detail?: string;
}

const MAX_CHARS = 5000;
const MIN_CHARS = 10;
const CLIENT_FETCH_TIMEOUT_MS = 50_000;
const MIN_SUBMIT_INTERVAL_MS = 4000;

async function fetchGrammarCheck(
  body: unknown,
  attempt = 1,
): Promise<{
  success: boolean;
  status: number;
  data?: GrammarResult;
  type?: string;
  message?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/grammar-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({
      success: false,
      type: "SERVER_ERROR",
      message: "Respons server tidak bisa dibaca.",
    }));
    return {
      success: json.success === true,
      status: res.status,
      data: json.data,
      type: json.type,
      message: json.message,
    };
  } catch (err) {
    const isTransient =
      err instanceof Error &&
      err.name !== "AbortError" &&
      /load failed|networkerror|failed to fetch/i.test(err.message);
    if (isTransient && attempt === 1) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchGrammarCheck(body, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function getErrorDisplay(type?: string, message?: string): ErrorInfo {
  const msg = message || "Terjadi kesalahan.";
  switch (type) {
    case "RATE_LIMIT":
      return { message: "Terlalu cepat!", detail: msg };
    case "QUOTA_EXCEEDED":
      return { message: "Kuota AI penuh", detail: msg };
    case "INVALID_JSON":
      return { message: "Respons AI tidak sesuai format", detail: msg };
    case "TIMEOUT":
      return { message: "AI terlalu lama merespons", detail: msg };
    default:
      return { message: msg };
  }
}

// Local history helpers
const HISTORY_KEY = "beniyujii_grammar_history";
const MAX_HISTORY = 10;

interface HistoryItem {
  id: string;
  originalText: string;
  correctedText: string;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

function saveToHistory(original: string, corrected: string) {
  if (typeof window === "undefined") return;
  try {
    const history = loadHistory();
    const item: HistoryItem = {
      id: Date.now().toString(36),
      originalText: original.slice(0, 200),
      correctedText: corrected.slice(0, 200),
      timestamp: Date.now(),
    };
    history.unshift(item);
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history.slice(0, MAX_HISTORY)),
    );
  } catch {
    // localStorage full or blocked — silently ignore
  }
}

export function GrammarShell() {
  const { toast } = useToast();

  const [text, setText] = useState("");
  const [language, setLanguage] = useState<GrammarLanguage>("auto");
  const [style, setStyle] = useState<GrammarStyle>("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);

  const lastSubmitRef = useRef<number>(0);
  const isSubmittingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const tooShort = charCount > 0 && charCount < MIN_CHARS;
  const canSubmit = !loading && text.trim().length >= MIN_CHARS && !overLimit;

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < MIN_CHARS || overLimit || loading) return;

    const now = Date.now();
    if (now - lastSubmitRef.current < MIN_SUBMIT_INTERVAL_MS) {
      toast("Tunggu sebentar sebelum memeriksa lagi.", "info");
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    lastSubmitRef.current = now;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchGrammarCheck({
        text: trimmed,
        language,
        style,
      });

      if (!mountedRef.current) return;

      if (!response.success) {
        if (response.status === 401 && response.type !== "AUTH_ERROR") {
          toast("Sesi berakhir. Silakan login ulang.", "error");
          window.location.href = "/unlock";
          return;
        }
        const errorDisplay = getErrorDisplay(response.type, response.message);
        setError(errorDisplay);
        toast(errorDisplay.message, "error");
        return;
      }

      if (response.data) {
        setResult(response.data);
        saveToHistory(trimmed, response.data.correctedText);
        toast("Grammar check selesai!", "success");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const isAbort = err instanceof Error && err.name === "AbortError";
      setError({
        message: isAbort ? "AI terlalu lama." : "Tidak bisa menghubungi server.",
        detail: isAbort ? "Coba pendekkan teksmu." : "Periksa koneksi internet.",
      });
      toast(isAbort ? "Timeout" : "Gagal menghubungi server", "error");
    } finally {
      if (mountedRef.current) setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [text, language, style, loading, overLimit, toast]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Title */}
      <div className="mb-8 animate-fade-in">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur">
          <SpellCheck className="h-3.5 w-3.5" />
          Writing Assistant · English & Indonesian
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 bg-clip-text text-transparent">
            Grammar Check
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Perbaiki grammar, typo, dan struktur kalimat. Buat tulisanmu terdengar
          natural dan profesional — seperti diperiksa editor pribadi.
        </p>
      </div>

      {/* Input Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SpellCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-800">
              Teks yang ingin diperiksa
            </span>
          </div>
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums transition",
              overLimit
                ? "text-rose-600"
                : tooShort
                  ? "text-amber-600"
                  : "text-slate-400",
            )}
          >
            {charCount} / {MAX_CHARS}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your English or Indonesian text here, and I'll polish it naturally..."
          disabled={loading}
          rows={6}
          className={cn(
            "w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400",
            "transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label="Masukkan teks untuk grammar check"
        />

        {tooShort && (
          <p className="mt-1.5 text-xs text-amber-600">
            Minimal {MIN_CHARS} karakter untuk diperiksa.
          </p>
        )}

        {/* Language + Style selectors */}
        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <GrammarLanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={loading}
          />
          <GrammarStyleSelector
            value={style}
            onChange={setStyle}
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              Ctrl
            </kbd>
            +
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
              Enter
            </kbd>
            {" "}untuk memeriksa
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading || (text.length === 0 && !result)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all",
                "hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Check Grammar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-card backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Polishing your sentence...
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="shimmer h-4 w-[90%] rounded-lg" />
                <div className="shimmer h-4 w-[75%] rounded-lg" />
                <div className="shimmer h-4 w-[60%] rounded-lg" />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 shadow-card backdrop-blur-xl sm:p-6"
              role="alert"
            >
              <p className="font-display text-base font-semibold text-rose-900">
                {error.message}
              </p>
              {error.detail && (
                <p className="mt-1 text-sm leading-relaxed text-rose-800/80">
                  {error.detail}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                Coba lagi
              </button>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <GrammarResultView result={result} originalText={text} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GrammarEmptyState />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
