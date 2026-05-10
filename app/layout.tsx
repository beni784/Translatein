import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "BeniYujii AI";

export const metadata: Metadata = {
  title: {
    default: `${appName} — AI Language Coach`,
    template: `%s · ${appName}`,
  },
  description:
    "Penerjemah cerdas Bahasa Inggris ↔ Indonesia dengan penjelasan makna, slang, nuansa, dan konteks budaya.",
  keywords: [
    "penerjemah",
    "translator",
    "AI",
    "Bahasa Indonesia",
    "English",
    "BeniYujii",
    "language coach",
  ],
  openGraph: {
    title: `${appName} — AI Language Coach`,
    description:
      "Lebih dari sekadar penerjemah. Dapatkan penjelasan makna, slang, nuansa, dan konteks budaya untuk setiap kalimat.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a62ff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        <ToastProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
