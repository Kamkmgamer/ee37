"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// --- Auth Card Entry Animation ---
export function AuthCardEntry({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}

// --- Success Page Transition ---
export function SuccessPageTransition({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/0"
        >
          {/* Light Burst - Central Orb */}
          <motion.div
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 3, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute h-[50vmin] w-[50vmin] rounded-full bg-[radial-gradient(circle,_#ffffff_0%,_#D4A853_40%,_transparent_70%)] blur-2xl"
          />

          {/* Full Screen Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute inset-0 bg-white mix-blend-overlay"
          />

          {/* Final Whiteout Wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute inset-0 bg-white"
          />

          {/* Text/Message */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative z-10 text-6xl font-black text-[#D4A853] drop-shadow-sm"
          >
            مرحباً بك
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Password Input ---
export function PasswordInput({
  name,
  placeholder = "••••••••",
  error,
}: {
  name: string;
  placeholder?: string;
  error?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <motion.div
        animate={focused ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-lg border bg-[#0A1628]/5 px-4 py-3 text-[#0A1628] transition-colors focus:outline-none ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-[#0A1628]/10 focus:ring-2 focus:ring-[#D4A853]"
          }`}
          placeholder={placeholder}
        />
      </motion.div>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 left-3 -translate-y-1/2 p-1 text-[#0A1628]/40 transition-colors hover:text-[#D4A853] focus:outline-none"
      >
        <AnimatePresence mode="wait" initial={false}>
          {showPassword ? (
            <motion.div
              key="eye-off"
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 20 }}
              transition={{ duration: 0.2 }}
            >
              <EyeOff size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="eye"
              initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Eye size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

// --- Animated Error Handling ---
export function AnimatedError({ children }: { children: React.ReactNode }) {
  if (!children) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: [-10, 10, -5, 5, 0] }} // Shake effect
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="mt-1 text-sm font-medium text-red-500"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
