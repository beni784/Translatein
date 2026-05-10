"use client";

import { motion } from "framer-motion";
import { Languages, Sparkles, Quote, MessagesSquare } from "lucide-react";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md">
      {/* Glow */}
      <div className="absolute inset-10 rounded-full bg-gradient-to-br from-brand-400/30 via-violet-400/30 to-teal-400/30 blur-3xl" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto mt-8 w-full max-w-sm rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500">
              <Languages className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live translation
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
            AI aktif
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">🇬🇧 English</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            &ldquo;I&rsquo;m feeling under the weather today.&rdquo;
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 p-4">
          <p className="text-xs font-medium text-brand-700">🇮🇩 Indonesia</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            &ldquo;Aku lagi kurang enak badan hari ini.&rdquo;
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            💡 &ldquo;Under the weather&rdquo; adalah idiom yang berarti merasa
            tidak enak badan — bukan soal cuaca sungguhan.
          </p>
        </div>
      </motion.div>

      {/* Floating chip 1 */}
      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute -left-4 top-2 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-card backdrop-blur-xl"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase text-slate-500">
            Nuansa
          </p>
          <p className="text-xs font-semibold text-slate-800">Sopan, santai</p>
        </div>
      </motion.div>

      {/* Floating chip 2 */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -right-2 top-24 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-card backdrop-blur-xl"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100">
          <Quote className="h-4 w-4 text-teal-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase text-slate-500">
            Slang
          </p>
          <p className="text-xs font-semibold text-slate-800">&ldquo;Lagi ga fit&rdquo;</p>
        </div>
      </motion.div>

      {/* Floating chip 3 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute -bottom-2 left-6 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-card backdrop-blur-xl"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100">
          <MessagesSquare className="h-4 w-4 text-brand-600" />
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-medium uppercase text-slate-500">
            Dialog
          </p>
          <p className="text-xs font-semibold text-slate-800">
            Contoh percakapan
          </p>
        </div>
      </motion.div>
    </div>
  );
}
