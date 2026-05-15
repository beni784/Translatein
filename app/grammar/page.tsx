import type { Metadata } from "next";
import { GrammarShell } from "@/components/grammar/GrammarShell";

export const metadata: Metadata = {
  title: "Grammar Check",
  description:
    "Pemeriksa grammar premium untuk Bahasa Inggris dan Indonesia. Perbaiki grammar, typo, struktur kalimat, dan buat tulisanmu terdengar lebih natural.",
};

export default function GrammarPage() {
  return <GrammarShell />;
}
