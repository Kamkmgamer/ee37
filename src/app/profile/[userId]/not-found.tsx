"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ArrowRight,
  XCircle,
  Search,
  MapPin,
  Calendar,
  Globe,
} from "lucide-react";

export default function ProfileNotFound() {
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

      {/* Header - Matches Profile Page Structure */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-gold)]/10 bg-[var(--color-midnight)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="rounded-xl p-2 text-[var(--color-sand)]/60 transition-all duration-300 hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)]"
            >
              <ArrowRight size={20} />
            </Link>
            <h1 className="font-display text-xl font-bold text-[var(--color-sand)]">
              الدليل
            </h1>
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

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-2xl px-4 py-6">
        {/* Profile Card Structure - Luxurious Twist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 overflow-hidden rounded-3xl border border-[var(--color-gold)]/20 bg-[var(--color-ink)]/40 shadow-[0_0_50px_-20px_rgba(212,168,83,0.15)] backdrop-blur-xl"
        >
          {/* Cover Image Area */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-gold)]/10 via-[var(--color-midnight)] to-[var(--color-ink)]" />

            {/* Animated shimmer on cover */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
                ease: "linear",
              }}
              className="absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-[var(--color-gold)]/10 to-transparent"
            />

            {/* Decorative pattern */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, var(--color-gold) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 flex items-end justify-between">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative"
              >
                {/* Pulsing glow behind avatar */}
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-4 rounded-full bg-[var(--color-gold)]/20 blur-xl"
                />

                <div className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--color-midnight)] bg-[var(--color-ink)] shadow-2xl">
                  <XCircle className="h-12 w-12 text-[var(--color-gold)]/40" />

                  {/* Glitch effect on hover */}
                  <div className="absolute inset-0 bg-[var(--color-gold)]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            </div>

            {/* Name and Handle */}
            <div className="mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="font-display mb-1 w-fit bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-sand)] to-[var(--color-gold)] bg-clip-text text-3xl font-bold text-transparent">
                  المستخدم غير موجود
                </h1>
                <p className="font-mono text-sm tracking-widest text-[var(--color-sand)]/40">
                  @UNKNOWN_USER
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 rounded-xl border border-[var(--color-gold)]/10 bg-[var(--color-gold)]/5 p-4"
              >
                <p className="leading-relaxed text-[var(--color-sand)]/80">
                  عذراً، يبدو أن هذا الحساب قد اختفى في ظروف غامضة، أو أنك تحاول
                  الوصول إلى صفحة من بُعد آخر. الرابط قد يكون غير صحيح أو تم حذف
                  الحساب.
                </p>
              </motion.div>
            </div>

            {/* Fake Meta Info (Ghost data) */}
            <div className="mb-6 flex flex-wrap gap-4 text-sm text-[var(--color-sand)]/30">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span className="blur-[2px]">الموقع غير معروف</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe size={14} />
                <span className="blur-[2px]">example.com</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>غير مسجل</span>
              </div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-3"
            >
              <Link href="/feed" className="flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-gold)] px-6 py-3 font-bold text-[var(--color-midnight)] transition-all hover:bg-[#d4af37] hover:shadow-[0_0_20px_-5px_rgba(212,168,83,0.4)]">
                  <ArrowRight size={18} />
                  <span>العودة للرئيسية</span>
                </button>
              </Link>
              <Link href="/search" className="flex-1">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-gold)]/30 px-6 py-3 font-bold text-[var(--color-gold)] transition-all hover:bg-[var(--color-gold)]/10">
                  <Search size={18} />
                  <span>بحث عن أعضاء</span>
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Ghost Posts Section */}
        <div className="space-y-6">
          <h2 className="font-display text-lg font-semibold text-[var(--color-sand)] opacity-60">
            المناشير
          </h2>

          {[1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-[var(--color-gold)]/5 bg-[var(--color-ink)]/20 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[var(--color-sand)]/5" />
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded-full bg-[var(--color-sand)]/5" />
                  <div className="h-2 w-20 rounded-full bg-[var(--color-sand)]/5" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded-full bg-[var(--color-sand)]/5" />
                <div className="h-4 w-1/2 rounded-full bg-[var(--color-sand)]/5" />
              </div>

              {/* Shimmer Overlay */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i,
                }}
                className="pointer-events-none absolute inset-0 skew-x-12 bg-gradient-to-r from-transparent via-[var(--color-sand)]/5 to-transparent"
              />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
