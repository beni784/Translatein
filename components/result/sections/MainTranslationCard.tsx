"use client";

import { motion } from "framer-motion";
import { Sparkles, Volume2 } from "lucide-react";
import { CopyButton } from "../CopyButton";
import { STYLE_MAP } from "@/lib/styles";
import type { TranslationStyle } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MainTranslationCardProps {
  translation: string;
  outputFlag: string;
  style: TranslationStyle;
  lang: "id" | "en";
}

export function MainTranslationCard({
  translation,
  outputFlag,
  style,
  lang,
}: MainTranslationCardProps) {
  const styleInfo = STYLE_MAP[style];
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(translation);
    utter.lang = lang === "en" ? "en-US" : "id-ID";
    utter.rate = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.speak(utter);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 p-0.5 shadow-glow"
    >
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-brand-50 via-white to-violet-50 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-400/30 to-violet-400/30 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 text-brand-700 shadow-sm ring-1 ring-brand-200/60 backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700/80">
                  A · Terjemahan Utama
                </p>
                <p className="text-xs font-medium text-slate-600">
                  <span className="mr-1">{outputFlag}</span>Gaya {styleInfo.emoji}{" "}
                  {styleInfo.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeak}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
                  speaking && "border-brand-300 bg-brand-50 text-brand-700",
                )}
                aria-label="Putar audio"
                title="Dengarkan"
              >
                <Volume2
                  className={cn("h-3.5 w-3.5", speaking && "animate-pulse")}
                />
                {speaking ? "Diputar..." : "Dengarkan"}
              </button>
              <CopyButton value={translation} label="Salin" variant="solid" />
            </div>
          </div>

          <p className="mt-5 font-display text-xl font-semibold leading-relaxed text-slate-900 sm:text-2xl">
            &ldquo;{translation}&rdquo;
          </p>
        </div>
      </div>
    </motion.section>
  );
}
