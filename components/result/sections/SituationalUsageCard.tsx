"use client";

import {
  Coffee,
  Briefcase,
  GraduationCap,
  Building2,
  Instagram,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import { ResultCard } from "../ResultCard";
import type { SituationalUsage } from "@/lib/types";

const SITUATIONS: Array<{
  key: keyof SituationalUsage;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    key: "casual",
    title: "Percakapan santai",
    icon: Coffee,
    tone: "from-amber-50 to-orange-50 text-amber-700 border-amber-200",
  },
  {
    key: "formal",
    title: "Situasi formal",
    icon: Briefcase,
    tone: "from-slate-50 to-slate-100 text-slate-700 border-slate-200",
  },
  {
    key: "academic",
    title: "Sekolah / kuliah",
    icon: GraduationCap,
    tone: "from-violet-50 to-indigo-50 text-violet-700 border-violet-200",
  },
  {
    key: "business",
    title: "Kerja / bisnis",
    icon: Building2,
    tone: "from-teal-50 to-emerald-50 text-teal-700 border-teal-200",
  },
  {
    key: "socialMedia",
    title: "Media sosial / chat",
    icon: Instagram,
    tone: "from-pink-50 to-rose-50 text-rose-700 border-rose-200",
  },
  {
    key: "sensitiveContext",
    title: "Situasi sensitif",
    icon: ShieldAlert,
    tone: "from-red-50 to-rose-50 text-red-700 border-red-200",
  },
];

export function SituationalUsageCard({ usage }: { usage: SituationalUsage }) {
  const hasContent = Object.values(usage).some((v) => v && v.trim().length > 0);
  if (!hasContent) return null;

  return (
    <ResultCard
      icon={<MapPin className="h-5 w-5" />}
      label="F · Digunakan Dalam Situasi Apa"
      title="Kapan kalimat ini cocok dipakai"
      description="Panduan pemakaian di berbagai konteks, dari santai hingga sensitif."
      accent="emerald"
      collapsible
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {SITUATIONS.map(({ key, title, icon: Icon, tone }) => {
          const value = usage[key];
          if (!value) return null;
          return (
            <div
              key={key}
              className={`rounded-2xl border bg-gradient-to-br p-4 ${tone}`}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold">{title}</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </ResultCard>
  );
}
