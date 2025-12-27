"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Zap, Camera, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <main
      className="noise-texture relative min-h-screen overflow-hidden bg-[var(--color-paper)]"
      dir="rtl"
    >
      {/* Decorative Background Elements */}
      <div className="geometric-pattern pointer-events-none absolute inset-0 opacity-30" />
      <div className="bg-gradient-radial absolute top-0 right-0 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/2 rounded-full from-[var(--color-gold)]/10 to-transparent blur-3xl" />
      <div className="bg-gradient-radial absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full from-[var(--color-copper)]/10 to-transparent blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header Bar */}
        <header className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-midnight)]/40">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-gold)]" />
            <span>2025</span>
          </div>
          <span className="text-xs tracking-[0.3em] text-[var(--color-midnight)]/40 uppercase">
            SUST
          </span>
        </header>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-center"
          >
            {/* Decorative Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mx-auto mb-8 h-[2px] w-16 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent"
            />

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-midnight)] px-4 py-2 text-sm text-[var(--color-sand)] shadow-xl"
            >
              <Zap size={14} />
              <span>هندسة كهربائية</span>
            </motion.div>

            {/* Main Title */}
            <h1
              className="mb-6 text-6xl leading-[1.1] font-black tracking-tighter text-[var(--color-midnight)] md:text-8xl lg:text-9xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              EE
              <span className="text-[var(--color-gold)] drop-shadow-[0_4px_20px_rgba(212,168,83,0.4)]">
                37
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-4 max-w-lg text-xl leading-relaxed text-[var(--color-midnight)]/60 md:text-2xl">
              جامعة السودان للعلوم والتكنولوجيا
            </p>

            {/* Decorative */}
            <div className="mt-8 flex items-center justify-center gap-4 text-[var(--color-gold)]/50">
              <div className="h-[1px] w-12 bg-current" />
              <div className="h-2 w-2 rounded-full bg-current" />
              <div className="h-[1px] w-12 bg-current" />
            </div>
          </motion.div>

          {/* Navigation Cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 w-full max-w-xl space-y-4"
          >
            {/* Survey Card - Primary */}
            <Link href="/survey" className="group block">
              <div className="elegant-card relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl md:p-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] text-white shadow-[var(--color-gold)]/30 shadow-lg transition-transform duration-500 group-hover:scale-110">
                    <Camera size={28} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="mb-1 text-2xl font-bold text-[var(--color-midnight)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      سجل ذكرياتك
                    </h3>
                    <p className="text-[var(--color-midnight)]/50">
                      شارك لحظاتك بكلمة وصورة
                    </p>
                  </div>
                  <ChevronLeft
                    size={24}
                    className="-translate-x-4 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>

            {/* Gallery Card */}
            <Link href="/gallery" className="group block">
              <div className="elegant-card relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl md:p-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-midnight)] text-[var(--color-gold)] shadow-lg transition-transform duration-500 group-hover:scale-110">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="mb-1 text-2xl font-bold text-[var(--color-midnight)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      معرض الذكريات
                    </h3>
                    <p className="text-[var(--color-midnight)]/50">
                      تصفح لحظات الدفعة
                    </p>
                  </div>
                  <ChevronLeft
                    size={24}
                    className="-translate-x-4 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>

            {/* Learning Card */}
            <Link href="/learning" className="group block">
              <div className="elegant-card relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl md:p-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--color-midnight)]/10 text-[var(--color-midnight)]/60 transition-all duration-500 group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-gold)]">
                    <GraduationCap size={28} />
                  </div>
                  <div className="flex-1">
                    <h3
                      className="mb-1 text-2xl font-bold text-[var(--color-midnight)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      المكتبة الأكاديمية
                    </h3>
                    <p className="text-[var(--color-midnight)]/50">
                      المحاضرات والمراجع
                    </p>
                  </div>
                  <ChevronLeft
                    size={24}
                    className="-translate-x-4 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="space-y-2"
          >
            <p className="text-sm tracking-widest text-[var(--color-midnight)]/30">
              KHARTOUM • SUDAN
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-8 bg-[var(--color-gold)]/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]/50" />
              <div className="h-[1px] w-8 bg-[var(--color-gold)]/30" />
            </div>
          </motion.div>
        </footer>
      </div>
    </main>
  );
}
