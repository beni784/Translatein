"use client";

import { Baby } from "lucide-react";
import { ResultCard } from "../ResultCard";

export function SimpleExplanationCard({
  explanation,
}: {
  explanation: string;
}) {
  return (
    <ResultCard
      icon={<Baby className="h-5 w-5" />}
      label="B · Penjelasan Super Sederhana"
      title="Kalau dijelasin ke anak kecil"
      description="Intinya seperti ini, dalam bahasa yang sangat mudah dipahami."
      accent="amber"
    >
      <p className="text-[15px] leading-relaxed text-slate-700">
        {explanation || "Penjelasan tidak tersedia untuk kalimat ini."}
      </p>
    </ResultCard>
  );
}
