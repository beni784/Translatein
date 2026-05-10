"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/english", label: "English → ID", flag: "🇬🇧" },
  { href: "/indonesian", label: "Indonesia → EN", flag: "🇮🇩" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "LinguaLoom AI";

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-teal-400 shadow-soft transition-transform group-hover:scale-105">
            <Languages className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold text-slate-900">
              {appName}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              AI Language Coach
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-soft"
                    : "text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                <span className="mr-1.5">{link.flag}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/40 bg-white/80 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  <span className="mr-2">{link.flag}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
