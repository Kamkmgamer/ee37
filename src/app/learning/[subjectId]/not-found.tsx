"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  BookOpen,
  XCircle,
  Home,
  Search,
  FileText,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function SubjectNotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-midnight)] font-sans text-[var(--color-sand)] selection:bg-[var(--color-gold)] selection:text-[var(--color-midnight)]">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] rounded-full bg-[var(--color-gold)] opacity-10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-[var(--color-copper)] opacity-10 blur-[100px]"
        />
      </div>

      {/* Header - Matches Subject Page Structure */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-gold)]/10 bg-[var(--color-midnight)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/learning"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)]/20"
            >
              <ChevronRight size={20} />
            </Link>
            <div>
              <h1 className="font-display text-xl font-bold text-[var(--color-sand)]">
                المادة غير موجودة
              </h1>
              <p className="font-mono text-xs tracking-widest text-[var(--color-gold)]/40">
                ERR_SUBJECT_NOT_FOUND
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl p-2 text-[var(--color-sand)]/60 transition-all duration-300 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
            >
              <Home size={20} />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-8">
        {/* Course Info Card - Luxurious 404 Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-[var(--color-gold)]/20 bg-[var(--color-ink)]/40 p-8 text-[var(--color-sand)] shadow-[0_0_50px_-20px_rgba(212,168,83,0.15)] backdrop-blur-xl"
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, var(--color-gold) 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />

          {/* Shimmer Effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "linear",
            }}
            className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-[var(--color-gold)]/5 to-transparent"
          />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400"
                >
                  خطأ في الوصول
                </motion.span>
                <span className="font-mono text-xs tracking-widest text-[var(--color-sand)]/30">
                  ID: ████████
                </span>
              </div>
              <h2 className="font-display mb-3 bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-sand)] to-[var(--color-gold)] bg-clip-text text-4xl font-bold text-transparent">
                المادة التي تبحث عنها غير متوفرة
              </h2>
              <p className="max-w-xl text-lg leading-relaxed text-[var(--color-sand)]/60">
                يبدو أن هذا المساق قد تم نقله أو حذفه، أو أنك تتبع رابطاً
                قديماً. يمكنك استكشاف المواد المتاحة عبر الدليل التعليمي.
              </p>
            </div>

            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-2 border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 shadow-[0_0_30px_-5px_rgba(212,168,83,0.3)]"
            >
              <XCircle size={48} className="text-[var(--color-gold)]/50" />
            </motion.div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/learning" className="min-w-[200px] flex-1">
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-gold)] px-6 py-4 font-bold text-[var(--color-midnight)] transition-all hover:bg-[#d4af37] hover:shadow-[0_0_30px_-5px_rgba(212,168,83,0.5)]">
                <BookOpen size={20} />
                <span>تصفح كل المواد</span>
              </button>
            </Link>
            <Link href="/search" className="min-w-[200px] flex-1">
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-gold)]/30 px-6 py-4 font-bold text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)]/10">
                <Search size={20} />
                <span>البحث في المنصة</span>
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Ghost Materials List */}
        <div className="space-y-6">
          <h3 className="font-display mb-6 px-2 text-xl font-bold text-[var(--color-sand)] opacity-40">
            محتوى مفقود
          </h3>

          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group relative flex items-center gap-5 overflow-hidden rounded-2xl border border-[var(--color-gold)]/5 bg-[var(--color-ink)]/20 p-5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-sand)]/5">
                <FileText className="text-[var(--color-sand)]/10" size={28} />
              </div>

              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 rounded-full bg-[var(--color-sand)]/5" />
                <div className="h-3 w-1/2 rounded-full bg-[var(--color-sand)]/5 opacity-50" />
              </div>

              {/* Shimmer Overlay */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i,
                }}
                className="pointer-events-none absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-[var(--color-sand)]/5 to-transparent"
              />
            </motion.div>
          ))}
        </div>

        {/* Decorative footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-4 opacity-20"
        >
          <div className="h-[1px] w-16 bg-[var(--color-gold)]" />
          <div className="h-1.5 w-1.5 rotate-45 bg-[var(--color-gold)]" />
          <div className="h-[1px] w-16 bg-[var(--color-gold)]" />
        </motion.div>
      </main>
    </div>
  );
}
