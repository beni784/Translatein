"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, MessagesSquare, Languages } from "lucide-react";

const TIPS = [
  {
    icon: BookOpen,
    title: "Tulis kalimat apa pun",
    desc: "Kalimat pendek, panjang, idiom, bahkan slang — semua bisa.",
  },
  {
    icon: Sparkles,
    title: "Pilih gaya terjemahan",
    desc: "Dari Natural sampai Kids. Setiap gaya menghasilkan nuansa berbeda.",
  },
  {
    icon: MessagesSquare,
    title: "Dapatkan penjelasan lengkap",
    desc: "Makna, konteks, slang, dialog, dan nuansa budaya.",
  },
];

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-card backdrop-blur-xl sm:p-12"
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15)_0,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.12)_0,transparent_50%)]" />
      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-teal-400 shadow-glow">
          <Languages className="h-7 w-7 text-white" strokeWidth={2.2} />
        </div>
        <h3 className="mt-5 font-display text-xl font-bold text-slate-900 sm:text-2xl">
          Siap menerjemahkan kalimatmu
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          Ketik kalimat di kolom kiri, pilih gaya terjemahan, lalu tekan
          <span className="mx-1 font-semibold text-brand-700">Translate</span>.
          Hasilnya akan muncul di sini — lengkap dengan penjelasan seperti guru
          bahasa pribadi.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {TIPS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <t.icon className="h-4 w-4" />
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {t.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                {t.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
