"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <main className="noise-texture relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-midnight)]">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Pulsing gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="bg-gradient-radial absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full from-[var(--color-gold)]/30 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="bg-gradient-radial absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full from-[var(--color-copper)]/20 to-transparent blur-3xl"
        />

        {/* Geometric pattern */}
        <div className="geometric-pattern absolute inset-0 opacity-5" />
      </div>

      {/* Loader Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Luxurious Spinner */}
        <div className="relative h-32 w-32">
          {/* Outer ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--color-gold)",
              borderRightColor: "var(--color-gold-light)",
            }}
          />

          {/* Middle ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-3 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--color-copper)",
              borderLeftColor: "var(--color-gold)",
            }}
          />

          {/* Inner ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-6 rounded-full border-2 border-transparent"
            style={{
              borderBottomColor: "var(--color-gold-light)",
              borderRightColor: "var(--color-copper)",
            }}
          />

          {/* Center glow */}
          <motion.div
            animate={{
              scale: [0.8, 1, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] shadow-[0_0_30px_rgba(212,168,83,0.5)]"
          />
        </div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-lg font-medium text-[var(--color-sand)]/80"
            style={{ fontFamily: "var(--font-display)" }}
          >
            جاري التحميل...
          </motion.p>
        </motion.div>

        {/* Decorative dots */}
        <div className="mt-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              className="h-2 w-2 rounded-full bg-[var(--color-gold)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
