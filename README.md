# BeniYujii AI

> **Penerjemah cerdas Bahasa Inggris ↔ Indonesia yang menjelaskan seperti guru bahasa pribadi.**
> Bukan sekadar mengubah kata — BeniYujii menjelaskan makna, konteks, slang, nuansa budaya, dan gaya pemakaian untuk setiap kalimat.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, dan Google Gemini.

---

## ✨ Fitur

- **Dua arah terjemahan** — English → Indonesia dan Indonesia → English.
- **8 gaya terjemahan** — Natural, Formal, Casual, Academic, Business, Slang/Internet, Romantic, Simple for Kids.
- **11 kartu output** per terjemahan:
  - A. Terjemahan utama (dengan tombol dengar & copy)
  - B. Penjelasan super sederhana
  - C. Alasan linguistik (makna inti, kata kunci, struktur, nuansa)
  - D. Breakdown kata & frasa (tabel)
  - E. Kalimat pendamping (sebelum, sesudah, respons, variasi)
  - F. Situasi pemakaian (casual, formal, akademik, bisnis, medsos, sensitif)
  - G. Perbedaan ranah penggunaan (7 domain)
  - H. Slang & versi gaul (kapan aman, kapan dihindari)
  - I. 5 variasi terjemahan (Natural, Formal, Casual, Short, Expressive)
  - J. Contoh dialog (chat bubble)
  - K. Catatan budaya & skor kealamiahan
- **UX premium** — glass cards, gradient mesh background, framer-motion micro-interactions, skeleton shimmer, toast notifications, text-to-speech, copy buttons di setiap section, collapsible panels untuk output panjang.
- **Responsive & mobile-first**.
- **API key aman** — hanya server-side, tidak pernah diekspos ke browser.

---

## 📁 Struktur Project

```
beniyujii-ai/
├── app/
│   ├── api/translate/route.ts     # API route → Gemini
│   ├── english/page.tsx           # Halaman English → Indonesia
│   ├── indonesian/page.tsx        # Halaman Indonesia → English
│   ├── globals.css                # Tailwind + custom utilities
│   ├── layout.tsx                 # Root layout + fonts + ToastProvider
│   └── page.tsx                   # Landing page
├── components/
│   ├── landing/HeroIllustration.tsx
│   ├── layout/
│   │   ├── Header.tsx             # Sticky glass nav (mobile-friendly)
│   │   └── Footer.tsx
│   ├── result/
│   │   ├── CopyButton.tsx
│   │   ├── ResultCard.tsx         # Shared card shell (colored accents)
│   │   └── sections/              # 11 kartu A–K
│   ├── translator/
│   │   ├── TranslatorShell.tsx    # Orkestrator halaman translator
│   │   ├── InputCard.tsx          # Textarea + clear/translate + char count
│   │   ├── StyleSelector.tsx      # 8 pill buttons
│   │   ├── LoadingSkeleton.tsx    # Shimmer state
│   │   ├── EmptyState.tsx         # Empty-but-inviting state
│   │   ├── ErrorState.tsx         # Retry-able error state
│   │   └── ResultView.tsx         # Merangkai semua kartu hasil
│   └── ui/Toaster.tsx             # Context-based toast
├── lib/
│   ├── ai/
│   │   ├── systemPrompt.ts        # Prompt internal BeniYujii
│   │   └── normalize.ts           # Parser JSON + safe coercion
│   ├── styles.ts                  # Daftar 8 gaya terjemahan
│   ├── types.ts                   # Tipe bersama (TranslationResult dll.)
│   └── utils.ts                   # cn(), safeString(), safeStringArray()
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Menjalankan Lokal

### Prasyarat

- **Node.js 18.17+** (rekomendasi 20 atau 22)
- **Google Gemini API key** — gratis dari [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Langkah

```bash
# 1. Clone repo
git clone https://github.com/<user>/<repo>.git
cd <repo>

# 2. Install dependencies
npm install
# atau: pnpm install / yarn install

# 3. Buat file .env.local dari template
cp .env.example .env.local

# 4. Edit .env.local — isi GEMINI_API_KEY=<milikmu>

# 5. Jalankan development server
npm run dev

# 6. Buka http://localhost:3000
```

### Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Jalankan production build |
| `npm run lint` | Lint seluruh source |

---

## 🔑 Environment Variables

Letakkan di `.env.local` (jangan di-commit).

| Variable | Wajib | Default | Keterangan |
|----------|-------|---------|------------|
| `GEMINI_API_KEY` | ✅ | — | API key dari Google AI Studio. Server-side only. |
| `GEMINI_MODEL` | ❌ | `gemini-2.5-flash` | Model Gemini. Gunakan `gemini-2.5-pro` untuk kualitas lebih tinggi atau `gemini-2.5-flash-lite` untuk yang paling hemat. `gemini-1.5-*` sudah di-deprecate Google. |
| `NEXT_PUBLIC_APP_NAME` | ❌ | `BeniYujii AI` | Nama aplikasi di header & footer. |
| `APP_PASSWORD` | ❌ | `lenacantik` | Password untuk membuka aplikasi. Ganti sewaktu-waktu dari Vercel — semua sesi lama otomatis invalid. |

> **⚠️ Keamanan:** `GEMINI_API_KEY` **tidak berawalan `NEXT_PUBLIC_`** — jadi tidak akan bocor ke browser. Semua panggilan ke Gemini terjadi di server (`app/api/translate/route.ts`).

### 🔒 Mengganti password aplikasi

Aplikasi punya **password gate** — user harus masukkan password di `/unlock` sebelum bisa pakai aplikasi. Password defaultnya `lenacantik`.

**Cara ganti password kapan saja (tanpa deploy ulang code):**

1. Buka **Vercel Dashboard** → project kamu → **Settings** → **Environment Variables**
2. Kalau variabel `APP_PASSWORD` **belum ada** → klik **Add New**:
   - Key: `APP_PASSWORD`
   - Value: _password baru_ (misal: `kamucantik2026`)
   - Environments: **Production** dan **Preview**
   - Save
3. Kalau variabel `APP_PASSWORD` **sudah ada** → klik ikon edit → ubah value → Save
4. Trigger redeploy: **Deployments** → deployment terakhir → titik tiga (⋯) → **Redeploy**

Setelah redeploy, semua user yang sudah login sebelumnya akan **otomatis logout** dan diminta masukkan password baru. Ini terjadi karena cookie auth ditandatangani pakai password lama; kalau password berubah, signature tidak akan verify lagi.

**Untuk development lokal:** ganti nilai `APP_PASSWORD` di file `.env.local` lalu restart `npm run dev`.

---

## 🎨 Desain

- **Warna utama** — biru (`brand`), ungu (`violet`), teal. Diatur di `tailwind.config.ts`.
- **Typography** — Inter (body) + Sora (display) via `next/font/google`.
- **Background** — mesh gradient lembut dengan 4 radial blob.
- **Component primitives** — `.glass-card`, `.gradient-text`, `.gradient-border`, `.shimmer` didefinisikan di `globals.css`.
- **Icons** — [lucide-react](https://lucide.dev).
- **Animasi** — [framer-motion](https://www.framer.com/motion/) (layoutId untuk style pills, stagger untuk hasil, AnimatePresence untuk state switching).

---

## 🤖 AI System Prompt

Persona dan instruksi lengkap ada di `lib/ai/systemPrompt.ts`. Ringkasnya:

```
Kamu adalah BeniYujii AI — ahli penerjemah Bahasa Inggris dan Bahasa Indonesia,
guru bahasa yang sabar, linguist, dan pakar konteks budaya.

ATURAN:
- Prioritaskan terjemahan NATURAL, bukan literal.
- Penjelasan ditulis dalam Bahasa Indonesia.
- Jangan menulis chain-of-thought panjang.
- Output WAJIB JSON valid sesuai skema.
- Slang & kata kasar tetap dijelaskan secara edukatif dengan catatan.
```

Setiap request membawa konteks `direction` (arah bahasa) + `style` (8 gaya). Model diset dengan `responseMimeType: "application/json"` dan `temperature: 0.7` untuk variasi yang hidup tapi tetap konsisten.

---

## 🧪 Contoh Request API

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Im feeling under the weather today",
    "direction": "en-id",
    "style": "casual"
  }'
```

**Response (trimmed):**

```json
{
  "mainTranslation": "Aku lagi kurang enak badan hari ini.",
  "simpleExplanation": "Artinya dia lagi merasa sakit atau nggak fit hari ini...",
  "linguisticReasoning": { ... },
  "phraseBreakdown": [ ... ],
  "bestCombinations": { ... },
  "situationalUsage": { ... },
  "domainDifferences": { ... },
  "slangSection": { ... },
  "translationVariations": { ... },
  "dialogExamples": [ ... ],
  "culturalNotes": { ... }
}
```

**Validasi:**
- `text` — wajib, non-empty, maks 2000 karakter.
- `direction` — `"en-id"` atau `"id-en"`.
- `style` — salah satu dari: `natural | formal | casual | academic | business | slang | romantic | kids`.

---

## ☁️ Deploy ke Vercel

1. **Push repo ini ke GitHub** (atau fork langsung).
2. Buka [vercel.com/new](https://vercel.com/new) → pilih repo.
3. Framework **Next.js** akan terdeteksi otomatis. Biarkan build command & output directory default.
4. Tambahkan **Environment Variables**:
   - `GEMINI_API_KEY` = _API key milikmu_
   - (opsional) `GEMINI_MODEL` = `gemini-2.5-flash` (default), `gemini-2.5-flash-lite`, atau `gemini-2.5-pro`
   - (opsional) `NEXT_PUBLIC_APP_NAME` = `BeniYujii AI`
   - (opsional) `APP_PASSWORD` = password custom kamu (default: `lenacantik`)
5. Klik **Deploy**. Selesai dalam ~1 menit.

Untuk update, cukup `git push` ke branch main — Vercel akan auto-redeploy.

### Alternatif platform

| Platform | Kompatibel | Catatan |
|----------|------------|---------|
| Vercel | ✅ Direkomendasikan | Zero-config untuk Next.js |
| Netlify | ✅ | Aktifkan `@netlify/plugin-nextjs` |
| Cloudflare Pages | ⚠️ | Butuh adapter edge; ubah `runtime = "edge"` di route |
| Self-hosted Node | ✅ | `npm run build && npm start` di balik reverse proxy |

---

## 🛡️ Tips Produksi

- **Rate limiting** — tambahkan middleware seperti [`@upstash/ratelimit`](https://github.com/upstash/ratelimit) untuk membatasi request per IP.
- **Caching** — untuk kalimat identik, pertimbangkan cache di-memory atau Redis (hash dari `text+direction+style`).
- **Observability** — log di API route ditahan di server-side. Tambahkan Sentry/Logtail jika perlu.
- **Model fallback** — jika `gemini-1.5-flash` gagal, coba switch ke `gemini-1.5-pro` dari env var.

---

## 📜 Lisensi

MIT — bebas dipakai, di-fork, dan dimodifikasi.

---

Dibuat untuk pembelajar bahasa yang ingin **mengerti**, bukan sekadar **menebak**. 🌿
