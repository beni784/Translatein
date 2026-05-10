import type { StyleOption } from "./types";

export const TRANSLATION_STYLES: StyleOption[] = [
  {
    id: "natural",
    label: "Natural",
    description: "Terdengar paling alami seperti penutur asli.",
    emoji: "🌿",
  },
  {
    id: "formal",
    label: "Formal",
    description: "Sopan, resmi, cocok untuk surat atau presentasi.",
    emoji: "🎩",
  },
  {
    id: "casual",
    label: "Casual",
    description: "Santai, cocok untuk teman dan obrolan sehari-hari.",
    emoji: "💬",
  },
  {
    id: "academic",
    label: "Academic",
    description: "Terstruktur, tepat, cocok untuk tulisan ilmiah.",
    emoji: "🎓",
  },
  {
    id: "business",
    label: "Business",
    description: "Profesional, ringkas, to the point.",
    emoji: "💼",
  },
  {
    id: "slang",
    label: "Slang / Internet",
    description: "Bahasa gaul, meme, chat, media sosial.",
    emoji: "🔥",
  },
  {
    id: "romantic",
    label: "Romantic",
    description: "Hangat, puitis, penuh perasaan.",
    emoji: "💗",
  },
  {
    id: "kids",
    label: "Simple for Kids",
    description: "Kata sederhana, mudah dipahami anak kecil.",
    emoji: "🧸",
  },
];

export const STYLE_MAP = Object.fromEntries(
  TRANSLATION_STYLES.map((s) => [s.id, s]),
) as Record<StyleOption["id"], StyleOption>;
