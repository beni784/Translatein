"use client";

import { Table2 } from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { PhraseBreakdownItem } from "@/lib/types";

export function PhraseBreakdownCard({
  items,
}: {
  items: PhraseBreakdownItem[];
}) {
  if (!items.length) return null;

  return (
    <ResultCard
      icon={<Table2 className="h-5 w-5" />}
      label="D · Breakdown Kata & Frasa"
      title="Apa arti setiap bagian kalimat"
      description="Tabel per kata/frasa: arti dasar, arti kontekstual, dan catatan pemakaian."
      accent="sky"
      collapsible
      badge={`${items.length} item`}
    >
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Kata / Frasa</th>
              <th className="px-4 py-3">Arti Dasar</th>
              <th className="px-4 py-3">Arti Dalam Konteks</th>
              <th className="px-4 py-3">Catatan Penggunaan</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={`${item.original}-${i}`}
                className="border-t border-slate-100 align-top hover:bg-sky-50/30"
              >
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-sky-50 px-2 py-1 font-mono text-xs font-semibold text-sky-800">
                    {item.original}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{item.basicMeaning}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.contextMeaning}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {item.usageNote}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {items.map((item, i) => (
          <div
            key={`${item.original}-m-${i}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4"
          >
            <div className="mb-2">
              <span className="rounded-lg bg-sky-50 px-2 py-1 font-mono text-xs font-semibold text-sky-800">
                {item.original}
              </span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase text-slate-500">
                  Arti dasar
                </dt>
                <dd className="text-slate-700">{item.basicMeaning}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase text-slate-500">
                  Dalam konteks
                </dt>
                <dd className="font-medium text-slate-900">
                  {item.contextMeaning}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase text-slate-500">
                  Catatan
                </dt>
                <dd className="text-xs text-slate-500">{item.usageNote}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}
