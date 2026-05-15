"use client";

import { motion } from "framer-motion";
import { SpellCheck, FileText, Sparkles } from "lucide-react";

export function GrammarEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8 text-center backdrop-blur sm:p-10"
    >
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-700 ring-1 ring-emerald-200/50">
        <SpellCheck className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">
        Siap memeriksa tulisanmu
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Paste atau ketik teks di atas — BeniYujii AI akan memperbaiki grammar,
        typo, dan struktur kalimatmu seperti editor profesional.
      </p>

      <div className="mt-6 grid gap-2.5 text-left sm:grid-cols-3">
        {[
          {
            icon: FileText,
            title: "Grammar & Typo",
            desc: "Perbaiki kesalahan grammar dan ketikan.",
          },
          {
            icon: Sparkles,
            title: "Natural Flow",
            desc: "Buat kalimat terdengar lebih natural.",
          },
          {
            icon: SpellCheck,
            title: "Before & After",
            desc: "Lihat perbandingan hasil koreksi.",
          },
        ].map((t) => (
          <div
            key={t.title}
            className="rounded-2xl border border-white/80 bg-white/70 p-3.5 backdrop-blur"
          >
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <t.icon className="h-3.5 w-3.5" />
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-800">{t.title}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
