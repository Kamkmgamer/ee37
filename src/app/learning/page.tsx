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
  type LucideIcon,
  Database,
  Globe,
  Server,
  Code,
} from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Cpu,
  Radio,
  Activity,
  PenTool,
  BookOpen,
  Database,
  Globe,
  Server,
  Code,
};

export default function LearningPage() {
  const { data: subjects, isLoading } = api.learning.getSubjects.useQuery();

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
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-gold)] border-t-transparent" />
          </div>
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {subjects.map((sub, i) => {
              const IconComponent = iconMap[sub.icon] ?? BookOpen;
              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={`/learning/${sub.id}`}
                    className="group block w-full text-right"
                  >
                    <div className="elegant-card rounded-3xl p-6 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl">
                      <div className="flex items-start gap-5">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                          style={{
                            backgroundColor: `${sub.accentColor}15`,
                            color: sub.accentColor,
                            boxShadow: `0 0 0 0 ${sub.accentColor}30`,
                          }}
                        >
                          <IconComponent size={26} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            className="mb-1 text-xl font-bold text-[var(--color-midnight)] transition-colors group-hover:text-[var(--color-gold)]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {sub.name}
                          </h3>
                          <p className="truncate font-mono text-sm text-[var(--color-midnight)]/50">
                            {sub.code}
                          </p>
                          {sub.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-[var(--color-midnight)]/40">
                              {sub.description}
                            </p>
                          )}
                        </div>

                        <ChevronLeft
                          size={20}
                          className="mt-4 translate-x-2 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-[var(--color-midnight)]/40">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد مواد مضافة حالياً</p>
          </div>
        )}

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
              هل تريد إضافة مادة أو محاضرة؟
            </span>
          </div>
          {/* Note: In a real app, this would link to a subject creation page or a form */}
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
