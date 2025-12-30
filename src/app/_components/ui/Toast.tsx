"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const icons = {
    success: <Check className="text-[#D4A853]" size={20} />,
    error: <X className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-orange-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const borders = {
    success: "border-[#D4A853]/20",
    error: "border-red-500/20",
    warning: "border-orange-400/20",
    info: "border-blue-400/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-[#FAF7F0]/90 p-4 shadow-xl backdrop-blur-md ${borders[toast.type]}`}
    >
      <div className={`rounded-full bg-white p-2 shadow-sm`}>
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-medium text-[#0A1628]">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#0A1628]/40 hover:text-[#0A1628]"
      >
        <X size={16} />
      </button>

      {/* Timer Bar (Decorative) */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-[#D4A853]/50"
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
    warning: (message: string) => addToast(message, "warning"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Container */}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 p-4 outline-none md:top-auto md:right-auto md:bottom-4 md:left-4">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
