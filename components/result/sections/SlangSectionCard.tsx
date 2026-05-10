"use client";

import { Flame, Check, Ban } from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { SlangSection } from "@/lib/types";

export function SlangSectionCard({ slang }: { slang: SlangSection }) {
  const hasAny =
    slang.slangVersions.length > 0 ||
    slang.examples.length > 0 ||
    slang.meaning ||
    slang.safeToUseWhen ||
    slang.avoidWhen;
  if (!hasAny) return null;

  return (
    <ResultCard
      icon={<Flame className="h-5 w-5" />}
      label="H · Slang & Versi Gaul"
      title="Kalau mau terdengar lebih gaul"
      description="Versi slang, artinya, kapan aman, kapan sebaiknya dihindari."
      accent="rose"
      collapsible
    >
      <div className="space-y-4">
        {slang.slangVersions.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Versi slang / gaul
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {slang.slangVersions.map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-800"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {slang.meaning && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Arti slang
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
              {slang.meaning}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {slang.safeToUseWhen && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold text-emerald-800">
                  Aman digunakan saat
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {slang.safeToUseWhen}
              </p>
            </div>
          )}
          {slang.avoidWhen && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <Ban className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold text-rose-800">
                  Sebaiknya dihindari saat
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {slang.avoidWhen}
              </p>
            </div>
          )}
        </div>

        {slang.examples.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Contoh pemakaian
            </p>
            <ul className="mt-2 space-y-1.5">
              {slang.examples.map((ex, i) => (
                <li
                  key={`${i}-${ex.slice(0, 10)}`}
                  className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ResultCard>
  );
}
