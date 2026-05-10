"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  icon: ReactNode;
  label: string;
  title: string;
  description?: string;
  accent?:
    | "brand"
    | "violet"
    | "teal"
    | "rose"
    | "amber"
    | "emerald"
    | "sky"
    | "indigo";
  badge?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
  headerRight?: ReactNode;
}

const ACCENT_STYLES: Record<
  NonNullable<ResultCardProps["accent"]>,
  { icon: string; ring: string; bar: string }
> = {
  brand: {
    icon: "bg-brand-100 text-brand-700",
    ring: "ring-brand-200/60",
    bar: "from-brand-500 to-brand-300",
  },
  violet: {
    icon: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200/60",
    bar: "from-violet-500 to-violet-300",
  },
  teal: {
    icon: "bg-teal-100 text-teal-700",
    ring: "ring-teal-200/60",
    bar: "from-teal-500 to-teal-300",
  },
  rose: {
    icon: "bg-rose-100 text-rose-700",
    ring: "ring-rose-200/60",
    bar: "from-rose-500 to-rose-300",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200/60",
    bar: "from-amber-500 to-amber-300",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-200/60",
    bar: "from-emerald-500 to-emerald-300",
  },
  sky: {
    icon: "bg-sky-100 text-sky-700",
    ring: "ring-sky-200/60",
    bar: "from-sky-500 to-sky-300",
  },
  indigo: {
    icon: "bg-indigo-100 text-indigo-700",
    ring: "ring-indigo-200/60",
    bar: "from-indigo-500 to-indigo-300",
  },
};

export function ResultCard({
  icon,
  label,
  title,
  description,
  accent = "brand",
  badge,
  collapsible = false,
  defaultOpen = true,
  children,
  headerRight,
}: ResultCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const tone = ACCENT_STYLES[accent];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-card backdrop-blur-xl transition-shadow hover:shadow-soft"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-80",
          tone.bar,
        )}
        aria-hidden
      />
      <div className="flex items-start gap-3 p-5 sm:p-6">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
            tone.icon,
            tone.ring,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            {badge && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {badge}
              </span>
            )}
          </div>
          <h3 className="mt-0.5 font-display text-base font-semibold text-slate-900 sm:text-lg">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {headerRight}
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
              aria-label={open ? "Tutup bagian" : "Buka bagian"}
              aria-expanded={open}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={
              collapsible ? { height: 0, opacity: 0 } : { opacity: 1 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 py-5 sm:px-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
