"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "solid";
  successMessage?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "ghost",
  successMessage = "Tersalin ke clipboard!",
}: CopyButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast(successMessage, "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Browser memblokir clipboard.", "error");
    }
  };

  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all";
  const variants = {
    ghost:
      "border border-slate-200 bg-white/80 text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
    solid:
      "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-soft hover:shadow-glow hover:scale-[1.03]",
  } as const;

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={cn(base, variants[variant], "disabled:opacity-50", className)}
      aria-label={copied ? "Tersalin" : `Salin ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Tersalin
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
