"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="noise-texture relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-midnight)]"
      dir="rtl"
    >
      {/* Luxurious Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-gradient-radial absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full from-[var(--color-gold)]/20 via-[var(--color-gold)]/5 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="bg-gradient-radial absolute bottom-1/4 left-1/4 h-[600px] w-[600px] rounded-full from-[var(--color-copper)]/15 via-[var(--color-copper)]/5 to-transparent blur-3xl"
        />

        {/* Geometric pattern overlay */}
        <div className="geometric-pattern absolute inset-0 opacity-10" />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-[var(--color-gold)]"
            style={{
              left: `${10 + ((i * 4.2) % 80)}%`,
              top: `${5 + ((i * 4.7) % 90)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: (i % 5) * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        {/* Decorative top element */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[var(--color-gold)]/50" />
          <Compass className="h-5 w-5 text-[var(--color-gold)]" />
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[var(--color-gold)]/50" />
        </motion.div>

        {/* 404 Number with luxurious styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          {/* Glow effect behind number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full bg-[var(--color-gold)]/20 blur-3xl" />
          </div>

          <h1
            className="relative bg-gradient-to-b from-[var(--color-gold)] via-[var(--color-gold-light)] to-[var(--color-copper)] bg-clip-text text-[10rem] leading-none font-black text-transparent sm:text-[14rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            404
          </h1>

          {/* Reflection effect */}
          <div
            className="absolute right-0 -bottom-8 left-0 h-20 bg-gradient-to-b from-[var(--color-gold)]/10 to-transparent opacity-30 blur-sm"
            style={{
              maskImage: "linear-gradient(to bottom, black, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
        </motion.div>

        {/* Arabic message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-12"
        >
          <h2
            className="mb-4 text-3xl font-bold text-[var(--color-sand)] sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            عذراً، الصفحة غير موجودة
          </h2>
          <p className="mx-auto max-w-md text-lg text-[var(--color-sand)]/60">
            يبدو أن هذه الصفحة قد انتقلت إلى مكان آخر أو لم تعد موجودة
          </p>
        </motion.div>

        {/* Home button with shimmer effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link
            href="/"
            className="shimmer-btn group inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-[var(--color-midnight)] shadow-[0_0_40px_rgba(212,168,83,0.3)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(212,168,83,0.5)]"
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
          <div className="h-[1px] w-8 bg-[var(--color-gold)]/30" />
          <div className="h-2 w-2 rotate-45 border border-[var(--color-gold)]/40" />
          <div className="h-[1px] w-8 bg-[var(--color-gold)]/30" />
        </motion.div>
      </div>
    </main>
  );
}
