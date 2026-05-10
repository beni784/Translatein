"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toaster";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
  onDone?: () => void;
}

export function LogoutButton({
  className,
  iconOnly = false,
  onDone,
}: LogoutButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast("Kamu sudah logout 👋", "info");
      onDone?.();
      router.replace("/unlock");
      router.refresh();
    } catch {
      toast("Gagal logout, coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50",
        className,
      )}
      title="Logout"
      aria-label="Logout"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <LogOut className="h-3.5 w-3.5" />
      )}
      {!iconOnly && <span>Logout</span>}
    </button>
  );
}
