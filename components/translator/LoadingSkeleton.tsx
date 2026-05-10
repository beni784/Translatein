"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function ShimmerBar({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <ShimmerBar className="h-10 w-10 rounded-2xl" />
        <ShimmerBar className="h-4 w-32" />
      </div>
      <div className="mt-5 space-y-2.5">
        <ShimmerBar className="h-3 w-full" />
        <ShimmerBar className="h-3 w-[92%]" />
        <ShimmerBar className="h-3 w-[78%]" />
      </div>
    </motion.div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-brand-200/60 bg-brand-50/50 px-4 py-3 backdrop-blur">
        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
        <p className="text-sm font-medium text-brand-800">
          BeniYujii sedang menganalisis kalimatmu...
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/60 bg-gradient-to-br from-brand-50/80 to-violet-50/80 p-6 shadow-card backdrop-blur-xl"
      >
        <ShimmerBar className="h-3 w-24" />
        <div className="mt-4 space-y-3">
          <ShimmerBar className="h-5 w-[90%]" />
          <ShimmerBar className="h-5 w-[70%]" />
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.15} />
        <SkeletonCard delay={0.2} />
        <SkeletonCard delay={0.25} />
      </div>
    </div>
  );
}
