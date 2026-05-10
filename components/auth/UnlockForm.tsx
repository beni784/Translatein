"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Stars,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UnlockFormProps {
  nextPath: string;
}

export function UnlockForm({ nextPath }: UnlockFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !password.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Password salah. Coba lagi ya!");
        setShake((n) => n + 1);
        setPassword("");
        setTimeout(() => inputRef.current?.focus(), 200);
        return;
      }

      // Success! Play celebration, then navigate.
      setSuccess(true);
      setTimeout(() => {
        router.replace(nextPath || "/");
        router.refresh();
      }, 900);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
      setShake((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating decorations */}
      <FloatingDecorations />

      <motion.div
        key={shake}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={
          shake > 0 && !success
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
                x: [0, -10, 10, -8, 8, -4, 4, 0],
              }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{ duration: shake > 0 ? 0.5 : 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-pink-400/30 via-violet-400/30 to-brand-400/30 blur-3xl" />

        <div className="gradient-border relative overflow-hidden rounded-3xl bg-white/85 p-8 shadow-glow backdrop-blur-xl sm:p-10">
          {/* Logo / Mascot */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="relative"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-400 via-violet-500 to-brand-500 shadow-glow">
                <Lock
                  className="h-9 w-9 text-white drop-shadow"
                  strokeWidth={2.2}
                />
              </div>
              {/* Sparkle top-right */}
              <motion.div
                className="absolute -right-2 -top-2"
                animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.15, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-5 w-5 fill-amber-300 text-amber-400" />
              </motion.div>
              {/* Heart bottom-left */}
              <motion.div
                className="absolute -bottom-1 -left-1"
                animate={{
                  y: [0, -4, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              Halo, sayang! <span className="inline-block">👋</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm leading-relaxed text-slate-600"
            >
              Masukkan password rahasia kita untuk membuka{" "}
              <span className="gradient-text font-semibold">BeniYujii AI</span>{" "}
              💗
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="password"
              className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Password
            </label>

            <div
              className={cn(
                "group relative flex items-center overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition-all",
                error
                  ? "border-rose-300 bg-rose-50/50"
                  : "border-slate-200 focus-within:border-brand-400 focus-within:shadow-soft",
              )}
            >
              <input
                id="password"
                ref={inputRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="ketik passwordnya..."
                autoComplete="current-password"
                disabled={loading || success}
                className="flex-1 bg-transparent px-4 py-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading || success}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="mr-2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key={error + shake}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"
                >
                  <span>🥺</span>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || success || !password.trim()}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all",
                "bg-gradient-to-r from-pink-500 via-violet-600 to-brand-600",
                "hover:shadow-glow hover:scale-[1.01]",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
              )}
            >
              {/* Shimmer */}
              <span
                aria-hidden
                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]"
              />
              <span className="relative flex items-center gap-2">
                {success ? (
                  <>
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      💗
                    </motion.span>
                    Berhasil! Bentar yaa...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengecek password...
                  </>
                ) : (
                  <>
                    <Stars className="h-4 w-4" />
                    Buka Kunci
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-[11px] text-slate-400"
          >
            Jangan kasih tau sembarang orang ya 🤫
          </motion.p>
        </div>

        {/* Success celebration overlay */}
        <AnimatePresence>
          {success && <Celebration />}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Decorative bits                                                            */
/* -------------------------------------------------------------------------- */

function FloatingDecorations() {
  const items = [
    { emoji: "💗", top: "10%", left: "8%", delay: 0 },
    { emoji: "✨", top: "20%", right: "12%", delay: 0.6 },
    { emoji: "🌸", bottom: "18%", left: "14%", delay: 1.2 },
    { emoji: "💫", bottom: "12%", right: "10%", delay: 0.3 },
    { emoji: "🎀", top: "50%", left: "4%", delay: 0.9 },
    { emoji: "🌿", top: "55%", right: "6%", delay: 1.5 },
  ];

  return (
    <>
      {items.map((item, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute select-none text-2xl opacity-60 sm:text-3xl"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.7, 0.5, 0.7],
            scale: [0, 1, 1.1, 1],
            y: [0, -12, 0, -8, 0],
            rotate: [0, 10, -8, 0],
          }}
          transition={{
            delay: item.delay,
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </>
  );
}

function Celebration() {
  // Simple confetti burst using emojis — no extra library.
  const pieces = Array.from({ length: 18 }).map((_, i) => {
    const emojis = ["💗", "✨", "💖", "⭐", "🌸", "🎀"];
    return {
      emoji: emojis[i % emojis.length],
      x: (Math.random() - 0.5) * 600,
      y: -100 - Math.random() * 300,
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.2,
    };
  });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            rotate: p.rotate,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.1,
            ease: "easeOut",
            delay: p.delay,
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </motion.div>
  );
}
