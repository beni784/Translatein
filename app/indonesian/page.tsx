import type { Metadata } from "next";
import { TranslatorShell } from "@/components/translator/TranslatorShell";

export const metadata: Metadata = {
  title: "Indonesia → English",
  description:
    "Terjemahkan kalimat Bahasa Indonesia ke Bahasa Inggris lengkap dengan penjelasan makna, nuansa, slang, dan gaya native speaker.",
};

export default function IndonesianPage() {
  return (
    <TranslatorShell
      direction="id-en"
      title="Indonesian → English"
      subtitle="Tulis kalimat Bahasa Indonesia — BeniYujii akan menerjemahkannya ke English natural dan menjelaskan nuansanya dalam Bahasa Indonesia."
      inputPlaceholder="Contoh: Aku lagi galau banget sama kerjaan yang numpuk 😭"
      inputLabel="Bahasa Indonesia"
      inputFlag="🇮🇩"
      outputFlag="🇬🇧"
    />
  );
}
