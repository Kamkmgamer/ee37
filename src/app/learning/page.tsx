"use client";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Radio,
  Activity,
  BookOpen,
  PenTool,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

const resources = [
  {
    title: "تحليل الدوائر",
    icon: Zap,
    desc: "قوانين كيرشوف والشبكات",
    accent: "#D4A853",
  },
  {
    title: "المنطق الرقمي",
    icon: Cpu,
    desc: "البوابات والجبر البولي",
    accent: "#B87333",
  },
  {
    title: "إشارات ونظم",
    icon: Radio,
    desc: "فورييه ولابلاس",
    accent: "#1A2744",
  },
  {
    title: "المعالجات الدقيقة",
    icon: Activity,
    desc: "8085 والمواجهة البينية",
    accent: "#D4A853",
  },
  {
    title: "نظم التحكم",
    icon: PenTool,
    desc: "الاستقرار والتحكم الآلي",
    accent: "#B87333",
  },
  {
    title: "كهرومغناطيسية",
    icon: BookOpen,
    desc: "ماكسويل والموجات",
    accent: "#1A2744",
  },
];

export default function LearningPage() {
  return (
    <div
      className="noise-texture relative min-h-screen bg-[var(--color-paper)]"
      dir="rtl"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="geometric-pattern absolute inset-0 opacity-20" />
        <div className="bg-gradient-radial absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full from-[var(--color-gold)]/10 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--color-midnight)]/5 bg-[var(--color-paper)]/80 px-6 py-4 backdrop-blur-xl">
        <Link href="/" className="group">
          <motion.div
            whileHover={{ x: 5, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-midnight)] text-[var(--color-sand)] shadow-lg"
          >
            <span className="text-lg font-bold">→</span>
          </motion.div>
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[var(--color-gold)]" />
          <span
            className="font-bold text-[var(--color-midnight)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            المكتبة الأكاديمية
          </span>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-midnight)] shadow-2xl"
          >
            <BookOpen size={36} className="text-[var(--color-gold)]" />
          </motion.div>

          <h1
            className="mb-4 text-4xl font-black text-[var(--color-midnight)] md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            المكتبة الأكاديمية
          </h1>
          <p className="text-lg text-[var(--color-midnight)]/50">
            مصادر ومحاضرات الدفعة ٣٧
          </p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
          />
        </motion.div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {resources.map((res, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <button className="group w-full text-right">
                <div className="elegant-card rounded-3xl p-6 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl">
                  <div className="flex items-start gap-5">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        backgroundColor: `${res.accent}15`,
                        color: res.accent,
                        boxShadow: `0 0 0 0 ${res.accent}30`,
                      }}
                    >
                      <res.icon size={26} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="mb-1 text-xl font-bold text-[var(--color-midnight)] transition-colors group-hover:text-[var(--color-gold)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {res.title}
                      </h3>
                      <p className="truncate text-sm text-[var(--color-midnight)]/50">
                        {res.desc}
                      </p>
                    </div>

                    <ChevronLeft
                      size={20}
                      className="mt-4 translate-x-2 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="elegant-card mt-16 rounded-3xl p-8 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
            <span className="font-medium text-[var(--color-midnight)]/60">
              هل تريد إضافة مادة؟
            </span>
          </div>
          <Link href="/survey">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="shimmer-btn rounded-2xl px-8 py-4 font-bold text-[var(--color-midnight)] shadow-[var(--color-gold)]/20 shadow-xl"
            >
              سجل اقتراحك
            </motion.button>
          </Link>
        </motion.div>

        <footer className="mt-20 text-center">
          <div className="flex items-center justify-center gap-3 text-[var(--color-midnight)]/30">
            <div className="h-[1px] w-12 bg-[var(--color-gold)]/30" />
            <span className="text-xs tracking-widest">
              جامعة السودان للعلوم والتكنولوجيا
            </span>
            <div className="h-[1px] w-12 bg-[var(--color-gold)]/30" />
          </div>
        </footer>
      </main>
    </div>
  );
}
