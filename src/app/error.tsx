"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className="noise-texture relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-midnight)]"
      dir="rtl"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Warning-toned gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-gradient-radial absolute top-1/3 right-1/3 h-[500px] w-[500px] rounded-full from-[var(--color-copper)]/25 via-[var(--color-copper)]/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="bg-gradient-radial absolute bottom-1/3 left-1/3 h-[600px] w-[600px] rounded-full from-[var(--color-dusty-rose)]/20 to-transparent blur-3xl"
        />

        {/* Geometric pattern */}
        <div className="geometric-pattern absolute inset-0 opacity-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        {/* Warning Icon with glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8 inline-flex items-center justify-center"
        >
          {/* Glow behind icon */}
          <div className="absolute h-32 w-32 rounded-full bg-[var(--color-copper)]/20 blur-2xl" />

          {/* Icon container */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--color-copper)]/30 bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-ink)]">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              <AlertTriangle className="h-12 w-12 text-[var(--color-copper)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10"
        >
          <h1
            className="mb-4 text-3xl font-bold text-[var(--color-sand)] sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            حدث خطأ غير متوقع
          </h1>
          <p className="mx-auto max-w-md text-lg text-[var(--color-sand)]/60">
            نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          {/* Try Again button */}
          <button
            onClick={reset}
            className="shimmer-btn group inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-[var(--color-midnight)] shadow-[0_0_40px_rgba(212,168,83,0.3)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(212,168,83,0.5)]"
          >
            <span>حاول مرة أخرى</span>
            <RefreshCw className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
          </button>

          {/* Home button */}
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full border-2 border-[var(--color-sand)]/20 px-8 py-4 text-lg font-semibold text-[var(--color-sand)] transition-all duration-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
          >
            <span>العودة للرئيسية</span>
            <Home className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </motion.div>

        {/* Decorative bottom element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-4"
        >
          <div className="h-[1px] w-8 bg-[var(--color-copper)]/30" />
          <div className="h-2 w-2 rotate-45 border border-[var(--color-copper)]/40" />
          <div className="h-[1px] w-8 bg-[var(--color-copper)]/30" />
        </motion.div>
      </div>
    </main>
  );
}
