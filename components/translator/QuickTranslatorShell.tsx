"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  Loader2,
  Send,
  Eraser,
  Volume2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";
import { StyleSelector } from "./StyleSelector";
import { CopyButton } from "@/components/result/CopyButton";
import { STYLE_MAP } from "@/lib/styles";
import type {
  Direction,
  TranslationStyle,
} from "@/lib/types";

const MAX_CHARS = 2000;
const CLIENT_FETCH_TIMEOUT_MS = 35_000;
const MIN_SUBMIT_INTERVAL_MS = 3000;

/** Lang config per direction. */
const DIR_CONFIG: Record<
  Direction,
  {
    fromFlag: string;
    fromLabel: string;
    toFlag: string;
    toLabel: string;
    inputPlaceholder: string;
    ttsToLang: string;
  }
> = {
  "en-id": {
    fromFlag: "🇬🇧",
    fromLabel: "Bahasa Inggris",
    toFlag: "🇮🇩",
    toLabel: "Bahasa Indonesia",
    inputPlaceholder: "Contoh: Let's grab a coffee later!",
    ttsToLang: "id-ID",
  },
  "id-en": {
    fromFlag: "🇮🇩",
    fromLabel: "Bahasa Indonesia",
    toFlag: "🇬🇧",
    toLabel: "English",
    inputPlaceholder: "Contoh: Nanti ngopi bareng yuk!",
    ttsToLang: "en-US",
  },
};

interface ErrorInfo {
  message: string;
  detail?: string;
}

/**
 * Fetch wrapper adapted to new API format: {success, data, type, message}
 */
async function fetchQuickTranslate(
  body: unknown,
  attempt = 1,
): Promise<{
  success: boolean;
  status: number;
  data?: { translation: string };
  type?: string;
  message?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/quick-translate", {
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
      /load failed|networkerror|failed to fetch|network request failed/i.test(
        err.message,
      );
    if (isTransient && attempt === 1) {
      await new Promise((r) => setTimeout(r, 400));
      return fetchQuickTranslate(body, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function speak(text: string, lang: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth || !text) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  synth.speak(u);
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
      return { message: "AI terlalu lama", detail: msg };
    case "NETWORK_ERROR":
      return { message: "Koneksi gagal", detail: msg };
    default:
      return { message: msg };
  }
}

export function QuickTranslatorShell() {
  const { toast } = useToast();

  const [direction, setDirection] = useState<Direction>("en-id");
  const [style, setStyle] = useState<TranslationStyle>("natural");
  const [text, setText] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [swapping, setSwapping] = useState(false);

  const mountedRef = useRef(true);
  const lastSubmitRef = useRef<number>(0);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const cfg = DIR_CONFIG[direction];
  const styleInfo = STYLE_MAP[style];

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const nearLimit = charCount > MAX_CHARS * 0.85;
  const canSubmit = !loading && text.trim().length > 0 && !overLimit;

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || overLimit || loading) return;

    // Debounce.
    const now = Date.now();
    if (now - lastSubmitRef.current < MIN_SUBMIT_INTERVAL_MS) {
      toast("Tunggu sebentar sebelum menerjemahkan lagi.", "info");
      return;
    }
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    lastSubmitRef.current = now;

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await fetchQuickTranslate({
        text: trimmed,
        direction,
        style,
      });

      if (!mountedRef.current) return;

      if (!response.success) {
        if (response.status === 401 && response.type !== "AUTH_ERROR") {
          toast("Sesi berakhir. Login ulang.", "error");
          window.location.href = "/unlock";
          return;
        }
        const errorDisplay = getErrorDisplay(response.type, response.message);
        setError(errorDisplay);
        toast(errorDisplay.message, "error");
        return;
      }

      const translation = response.data?.translation || "";
      if (!translation) {
        setError({ message: "Hasil kosong — coba lagi." });
        return;
      }

      setResult(translation);
      toast("Selesai!", "success");
    } catch (err) {
      if (!mountedRef.current) return;

      const isAbort = err instanceof Error && err.name === "AbortError";
      setError({
        message: isAbort
          ? "AI terlalu lama."
          : "Tidak bisa menghubungi server.",
        detail: isAbort
          ? "Coba pendekkan kalimatmu."
          : "Periksa koneksi internet.",
      });
      toast(isAbort ? "Timeout" : "Gagal menghubungi server", "error");
    } finally {
      if (mountedRef.current) setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [text, direction, style, loading, overLimit, toast]);

  const handleSwap = () => {
    if (loading) return;
    setSwapping(true);
    setDirection((d) => (d === "en-id" ? "id-en" : "en-id"));
    if (result) {
      setText(result);
      setResult("");
      setError(null);
    }
    setTimeout(() => setSwapping(false), 350);
  };

  const handleClear = () => {
    if (loading) return;
    setText("");
    setResult("");
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Title block */}
      <div className="mb-8 animate-fade-in">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/60 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm backdrop-blur">
          <Zap className="h-3.5 w-3.5 fill-amber-400" />
          Quick Mode — hemat token & super cepat
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          <span className="gradient-text">Quick Translate</span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Terjemahan cepat tanpa penjelasan panjang — cocok untuk kebutuhan
          sehari-hari. Tetap bisa pilih gaya bahasa sesuai kebutuhanmu.
        </p>
      </div>

      {/* Direction toggle */}
      <div className="mb-5 flex items-center justify-center gap-3 rounded-3xl border border-white/60 bg-white/70 p-3 shadow-card backdrop-blur-xl">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5">
          <span className="text-lg" aria-hidden>{cfg.fromFlag}</span>
          <span className="truncate text-sm font-semibold text-slate-800">{cfg.fromLabel}</span>
        </div>

        <motion.button
          type="button"
          onClick={handleSwap}
          disabled={loading}
          whileTap={{ scale: 0.92 }}
          animate={swapping ? { rotate: 180 } : { rotate: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-soft transition",
            "hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50",
          )}
          aria-label="Tukar arah terjemahan"
        >
          <ArrowLeftRight className="h-4 w-4" strokeWidth={2.5} />
        </motion.button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 px-4 py-2.5">
          <span className="text-lg" aria-hidden>{cfg.toFlag}</span>
          <span className="truncate text-sm font-semibold text-slate-800">{cfg.toLabel}</span>
        </div>
      </div>

      {/* Input card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden>{cfg.fromFlag}</span>
            <span className="text-sm font-semibold text-slate-800">{cfg.fromLabel}</span>
          </div>
          <span className={cn(
            "text-[11px] font-medium tabular-nums",
            overLimit ? "text-rose-600" : nearLimit ? "text-amber-600" : "text-slate-400",
          )}>
            {charCount} / {MAX_CHARS}
          </span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={cfg.inputPlaceholder}
          disabled={loading}
          rows={4}
          className={cn(
            "w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400",
            "transition-all focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-200",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          aria-label={`Masukkan teks ${cfg.fromLabel}`}
        />

        <div className="mt-4 border-t border-slate-100 pt-4">
          <StyleSelector value={style} onChange={setStyle} disabled={loading} />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            Gaya: <span className="font-medium text-slate-600">{styleInfo.emoji} {styleInfo.label}</span>
            {" · "}
            <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Ctrl</kbd>
            +<kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Enter</kbd>
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
                "inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all",
                "hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
              )}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Menerjemahkan...</>
              ) : (
                <><Send className="h-4 w-4" />Translate</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="mt-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-card backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menerjemahkan...
              </div>
              <div className="mt-4 space-y-2">
                <div className="shimmer h-4 w-[85%] rounded-lg" />
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
              <p className="font-display text-base font-semibold text-rose-900">{error.message}</p>
              {error.detail && (
                <p className="mt-1 text-sm leading-relaxed text-rose-800/80">{error.detail}</p>
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
              className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 p-0.5 shadow-glow"
            >
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-brand-50 via-white to-violet-50 p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-400/30 to-violet-400/30 blur-3xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>{cfg.toFlag}</span>
                      <div className="leading-tight">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700/80">{cfg.toLabel}</p>
                        <p className="text-xs text-slate-500">Gaya {styleInfo.emoji} {styleInfo.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speak(result, cfg.ttsToLang)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                        aria-label="Dengarkan"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        Dengar
                      </button>
                      <CopyButton value={result} label="Salin" variant="solid" />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl">
                    {result}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8 text-center backdrop-blur"
            >
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-violet-500/15 text-brand-700 ring-1 ring-brand-200/50">
                <Zap className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">Hasil terjemahan akan muncul di sini</p>
              <p className="mt-1 text-xs text-slate-500">Ketik kalimat → pilih gaya → Translate</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Link to full mode */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/40 px-4 py-3 text-xs text-slate-500 backdrop-blur">
        <p>
          Mau penjelasan lengkap + slang + konteks budaya?{" "}
          <a
            href={direction === "en-id" ? "/english" : "/indonesian"}
            className="font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            Pakai Full Translate →
          </a>
        </p>
      </div>
    </section>
  );
}
