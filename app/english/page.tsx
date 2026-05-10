import type { Metadata } from "next";
import { TranslatorShell } from "@/components/translator/TranslatorShell";

export const metadata: Metadata = {
  title: "English → Indonesia",
  description:
    "Terjemahkan kalimat Bahasa Inggris ke Bahasa Indonesia lengkap dengan penjelasan makna, nuansa, slang, dan konteks budaya.",
};

export default function EnglishPage() {
  return (
    <TranslatorShell
      direction="en-id"
      title="English → Indonesian"
      subtitle="Tulis kalimat Bahasa Inggris apa pun — BeniYujii akan menjelaskannya seperti guru pribadi dalam Bahasa Indonesia."
      inputPlaceholder="Contoh: I'm really looking forward to our trip next week!"
      inputLabel="Bahasa Inggris"
      inputFlag="🇬🇧"
      outputFlag="🇮🇩"
    />
  );
}
