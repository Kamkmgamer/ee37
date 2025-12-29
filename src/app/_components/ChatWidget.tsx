"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatList } from "./chat/ChatList";

interface ChatWidgetProps {
  userId: string;
}

export function ChatWidget({ userId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={widgetRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-20 z-50 flex h-[600px] w-[350px] flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0F0F0F]/95 shadow-2xl backdrop-blur-xl sm:right-10 sm:w-[400px]"
          >
            <ChatList userId={userId} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:bg-[#C5A028] sm:right-10 sm:bottom-10"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </>
  );
}
