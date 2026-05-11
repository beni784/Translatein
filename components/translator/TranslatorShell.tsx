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

const CLIENT_FETCH_TIMEOUT_MS = 65_000;

// Minimum interval between submits (client-side debounce).
const MIN_SUBMIT_INTERVAL_MS = 3000;

/**
 * Fetch wrapper with:
 * - AbortController timeout
 * - Single transient retry for mobile network hiccups
 * - Adapted to new API response format {success, data/type/message}
 */
async function fetchTranslate(
  body: unknown,
  attempt = 1,
): Promise<{
  success: boolean;
  status: number;
  data?: unknown;
  type?: string;
  message?: string;
}> {
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
      await new Promise((r) => setTimeout(r, 500));
      return fetchTranslate(body, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Map API error types to user-friendly messages for the ErrorState component.
 */
function getErrorDisplay(type?: string, message?: string): ErrorInfo {
  const msg = message || "Terjadi kesalahan.";

  switch (type) {
    case "RATE_LIMIT":
      return {
        message: "Terlalu cepat!",
        detail: msg,
      };
    case "QUOTA_EXCEEDED":
      return {
        message: "Kuota AI penuh",
        detail: msg,
      };
    case "AUTH_ERROR":
      return {
        message: "Konfigurasi server bermasalah",
        detail: msg,
      };
    case "INVALID_JSON":
      return {
        message: "Respons AI tidak sesuai format",
        detail: msg,
      };
    case "TIMEOUT":
      return {
        message: "AI membutuhkan waktu terlalu lama",
        detail: msg,
      };
    case "NETWORK_ERROR":
      return {
        message: "Koneksi ke AI gagal",
        detail: msg,
      };
    case "EMPTY_RESPONSE":
      return {
        message: "AI tidak menghasilkan hasil",
        detail: msg,
      };
    default:
      return { message: msg };
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

  // Debounce / duplicate prevention.
  const lastSubmitRef = useRef<number>(0);
  const isSubmittingRef = useRef(false);

  // Mounted check to prevent setState after unmount.
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

    // --- Debounce: prevent rapid re-submits ---
    const now = Date.now();
    if (now - lastSubmitRef.current < MIN_SUBMIT_INTERVAL_MS) {
      toast("Tunggu sebentar sebelum menerjemahkan lagi.", "info");
      return;
    }

    // --- Prevent duplicate concurrent requests ---
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    lastSubmitRef.current = now;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetchTranslate({
        text: trimmed,
        direction,
        style,
      });

      if (!mountedRef.current) return;

      if (!response.success) {
        // 401 → session expired.
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

      setResult(response.data as TranslationResult);
      toast("Terjemahan berhasil!", "success");
    } catch (err) {
      if (!mountedRef.current) return;

      const isAbort = err instanceof Error && err.name === "AbortError";
      setError({
        message: isAbort
          ? "AI membutuhkan waktu terlalu lama."
          : "Tidak bisa menghubungi server.",
        detail: isAbort
          ? "Coba pendekkan kalimatmu atau coba lagi."
          : "Periksa koneksi internet kamu.",
      });
      toast(
        isAbort ? "Timeout — coba lagi" : "Gagal menghubungi server",
        "error",
      );
    } finally {
      if (mountedRef.current) setLoading(false);
      isSubmittingRef.current = false;
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
