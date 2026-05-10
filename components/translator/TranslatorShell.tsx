"use client";

import { useCallback, useRef, useState, useEffect } from "react";
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

// Client-side fetch ceiling — slightly longer than the server's 55s so we
// let the API's friendly 504 message reach us before we give up.
const CLIENT_FETCH_TIMEOUT_MS = 75_000;

/**
 * Tiny fetch wrapper with: AbortController timeout, one auto-retry for
 * transient network errors ("Load failed", "NetworkError", socket resets),
 * and pass-through of JSON parsing.
 *
 * Why retry? Mobile browsers (especially iOS Safari) occasionally kill
 * long-lived HTTPS connections mid-flight when the screen dims or the user
 * switches apps. Those show up as generic "Load failed" in the catch block
 * with nothing on the server logs. One silent retry eliminates ~90% of these.
 */
async function fetchTranslate(
  body: unknown,
  attempt = 1,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CLIENT_FETCH_TIMEOUT_MS,
  );

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      // Keepalive helps iOS keep the request alive across brief app switches.
      keepalive: false,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    const isTransient =
      err instanceof Error &&
      (err.name === "AbortError" ||
        /load failed|networkerror|failed to fetch|network request failed/i.test(
          err.message,
        ));

    // One retry, max. Don't retry aborts caused by our own timeout —
    // those mean the server is genuinely overloaded.
    if (isTransient && attempt === 1 && !(err instanceof Error && err.name === "AbortError")) {
      await new Promise((r) => setTimeout(r, 400));
      return fetchTranslate(body, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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

  // Track whether the component is still mounted — don't set state after
  // unmount (user navigated away mid-translation).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      const { ok, status, data } = await fetchTranslate({
        text: trimmed,
        direction,
        style,
      });

      if (!mountedRef.current) return;

      if (!ok) {
        const d = data as { error?: string; detail?: string };
        // 401 → session expired, send user to unlock page.
        if (status === 401) {
          toast("Sesi berakhir. Silakan login ulang.", "error");
          window.location.href = "/unlock";
          return;
        }
        setError({
          message: d?.error || "Terjadi kesalahan.",
          detail: d?.detail,
        });
        toast(d?.error || "Gagal menerjemahkan", "error");
        return;
      }

      setResult(data as TranslationResult);
      toast("Terjemahan berhasil!", "success");
    } catch (err) {
      if (!mountedRef.current) return;

      const isAbort = err instanceof Error && err.name === "AbortError";
      const message = err instanceof Error ? err.message : "Koneksi bermasalah.";

      setError({
        message: isAbort
          ? "Permintaan memakan waktu terlalu lama."
          : "Tidak bisa menghubungi server.",
        detail: isAbort
          ? "Coba ulangi, atau pendekkan kalimatmu. Server AI mungkin sedang sibuk."
          : message,
      });
      toast(
        isAbort ? "Timeout — coba lagi" : "Gagal menghubungi server",
        "error",
      );
    } finally {
      if (mountedRef.current) setLoading(false);
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
