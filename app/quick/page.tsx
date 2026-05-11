import type { Metadata } from "next";
import { QuickTranslatorShell } from "@/components/translator/QuickTranslatorShell";

export const metadata: Metadata = {
  title: "Quick Translate",
  description:
    "Terjemahan cepat English ↔ Indonesia dengan pilihan gaya bahasa, tanpa penjelasan panjang. Hemat token, super responsif.",
};

export default function QuickTranslatePage() {
  return <QuickTranslatorShell />;
}
