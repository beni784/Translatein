"use client";

import { Heart, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "BeniYujii AI";
  const year = new Date().getFullYear();

  // Hide footer on the unlock page — keep that screen focused.
  if (pathname === "/unlock") return null;

  return (
    <footer className="mt-auto border-t border-white/40 bg-white/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          <span>
            {appName} · AI Language Coach · © {year}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Dibuat dengan</span>
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          <span>untuk pembelajar bahasa.</span>
        </div>
      </div>
    </footer>
  );
}
