import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  MessagesSquare,
  Languages,
  Wand2,
  GraduationCap,
  Heart,
  Zap,
  SpellCheck,
} from "lucide-react";
import { HeroIllustration } from "@/components/landing/HeroIllustration";

const features = [
  {
    icon: Zap,
    title: "Quick & Full Mode",
    desc: "Quick untuk terjemahan cepat hemat token. Full untuk penjelasan mendalam seperti guru pribadi.",
  },
  {
    icon: SpellCheck,
    title: "Grammar Check",
    desc: "Perbaiki grammar, typo, dan struktur kalimat. Seperti punya editor pribadi.",
  },
  {
    icon: Languages,
    title: "Terjemahan 2 Arah",
    desc: "English → Indonesia dan Indonesia → English dengan kualitas natural.",
  },
  {
    icon: BookOpen,
    title: "Penjelasan Lengkap",
    desc: "Bukan sekadar arti — tapi alasan, nuansa, dan konteks pemakaian.",
  },
  {
    icon: MessagesSquare,
    title: "Slang & Internet",
    desc: "Versi gaul, meme, chat — lengkap dengan kapan aman dipakai.",
  },
  {
    icon: Wand2,
    title: "8 Gaya Terjemahan",
    desc: "Natural, formal, casual, akademik, bisnis, slang, romantis, atau kids.",
  },
  {
    icon: GraduationCap,
    title: "Seperti Guru Pribadi",
    desc: "Breakdown kata, contoh dialog, catatan budaya, dan tingkat kesopanan.",
  },
  {
    icon: Heart,
    title: "UI Yang Menyenangkan",
    desc: "Desain modern, lembut, dan satisfying untuk belajar setiap hari.",
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              AI Language Coach · English ↔ Indonesian
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Belajar bahasa, bukan sekadar{" "}
              <span className="gradient-text">menerjemah.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              BeniYujii AI menjelaskan makna, konteks, slang, dan nuansa budaya
              dari setiap kalimat. Seperti punya guru bahasa pribadi — yang
              sabar, cerdas, dan selalu siap 24/7.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/english"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]"
              >
                🇬🇧 English → Indonesia
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/indonesian"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-card transition-all hover:border-brand-300 hover:shadow-soft hover:scale-[1.02] active:scale-[0.98]"
              >
                🇮🇩 Indonesia → English
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Quick mode highlight */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/quick"
                className="group inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-2 text-xs font-semibold text-amber-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
              >
                <Zap className="h-3.5 w-3.5 fill-amber-400" />
                Quick Translate
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/grammar"
                className="group inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <SpellCheck className="h-3.5 w-3.5" />
                Grammar Check
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[
                { v: "11+", k: "Kartu hasil" },
                { v: "8", k: "Gaya terjemahan" },
                { v: "2", k: "Mode kecepatan" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-white/60 bg-white/60 px-3 py-4 shadow-card backdrop-blur"
                >
                  <dt className="font-display text-2xl font-bold text-slate-900">
                    {s.v}
                  </dt>
                  <dd className="mt-1 text-xs text-slate-500">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dirancang untuk <span className="gradient-text">pembelajar</span>
          </h2>
          <p className="mt-4 text-slate-600">
            Semua yang kamu butuhkan untuk benar-benar mengerti bahasa —
            bukan hanya menebak artinya.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/15 to-violet-500/15 text-brand-700 ring-1 ring-brand-200/50">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.desc}
              </p>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/10 to-violet-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-teal-500 p-10 text-center shadow-soft sm:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_40%),radial-gradient(circle_at_70%_80%,white_0,transparent_40%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Siap memulai perjalanan bahasamu?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Pilih arah terjemahan, ketik kalimat, dan biarkan BeniYujii
              menjelaskannya seperti guru pribadi.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/english"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-md transition hover:scale-[1.02]"
              >
                Mulai dari English
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/indonesian"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Mulai dari Indonesia
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/quick"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400/90 px-6 py-3 text-sm font-semibold text-amber-950 shadow-md transition hover:scale-[1.02] hover:bg-amber-400"
              >
                <Zap className="h-4 w-4 fill-amber-950" />
                Quick Translate
              </Link>
              <Link
                href="/grammar"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400/90 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-md transition hover:scale-[1.02] hover:bg-emerald-400"
              >
                <SpellCheck className="h-4 w-4" />
                Grammar Check
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
