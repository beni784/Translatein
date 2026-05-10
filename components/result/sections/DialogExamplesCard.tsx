"use client";

import { MessagesSquare } from "lucide-react";
import { ResultCard } from "../ResultCard";

function parseDialog(raw: string): Array<{ speaker: string; line: string }> {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([A-Z][A-Za-z0-9 _-]{0,20})\s*:\s*(.+)$/);
      if (match) {
        return { speaker: match[1].trim(), line: match[2].trim() };
      }
      return { speaker: "", line };
    });
}

export function DialogExamplesCard({ examples }: { examples: string[] }) {
  if (!examples.length) return null;

  return (
    <ResultCard
      icon={<MessagesSquare className="h-5 w-5" />}
      label="J · Contoh Dialog"
      title="Seperti ini kalau dipakai ngobrol"
      description="Dialog pendek agar kamu paham cara memakai kalimat ini dalam percakapan nyata."
      accent="brand"
      collapsible
      badge={`${examples.length} dialog`}
    >
      <div className="space-y-4">
        {examples.map((dlg, i) => {
          const lines = parseDialog(dlg);
          return (
            <div
              key={`dlg-${i}`}
              className="rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-50/40 via-white to-violet-50/40 p-4"
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Dialog {i + 1}
              </p>
              <div className="space-y-2">
                {lines.map((item, idx) => {
                  const isA = !item.speaker || item.speaker === "A" || idx % 2 === 0;
                  return (
                    <div
                      key={`dlg-${i}-l-${idx}`}
                      className={`flex ${isA ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                          isA
                            ? "rounded-tl-sm bg-white text-slate-800"
                            : "rounded-tr-sm bg-gradient-to-br from-brand-600 to-violet-600 text-white"
                        }`}
                      >
                        {item.speaker && (
                          <p
                            className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              isA ? "text-slate-400" : "text-white/70"
                            }`}
                          >
                            {item.speaker}
                          </p>
                        )}
                        <p>{item.line}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ResultCard>
  );
}
