"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0) {
            const lastMessage = { ...newMessages[lastIndex]! };
            lastMessage.content += text;
            newMessages[lastIndex] = lastMessage;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-20 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0F0F0F]/95 shadow-2xl backdrop-blur-xl sm:right-10 sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D4AF37]/10 bg-gradient-to-r from-[#D4AF37]/10 to-transparent px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAEAEA]">
                    مساعد الدفعة
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">متصل الآن</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-[#A0A0A0] transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D4AF37]/20 flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="mt-8 text-center text-sm text-[#A0A0A0]">
                    <p>مرحباً بك يا باشمهندس! 👋</p>
                    <p className="mt-2">
                      أنا هنا لمساعدتك. اسألني عن أي شيء يخص الدفعة أو الموقع.
                    </p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-[#D4AF37] text-black"
                          : "bg-white/10 text-[#EAEAEA]"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex h-8 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#D4AF37]">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-[#D4AF37]/10 bg-[#0F0F0F] p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#EAEAEA] placeholder:text-[#A0A0A0] focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/50 focus:outline-none"
                  dir="auto"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-black transition-all hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
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
