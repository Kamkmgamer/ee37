"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Forward, Trash2, Users, X } from "lucide-react";
import { REACTION_ICONS, type ReactionType } from "../icons/ReactionIcons";
import type { Message } from "./types";

interface MessageContextMenuProps {
  message: Message | null;
  isOpen: boolean;
  position: { x: number; y: number };
  isMe: boolean;
  onClose: () => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onReact: (messageId: string, type: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForAll: (messageId: string) => void;
}

const QUICK_REACTIONS: ReactionType[] = [
  "heart",
  "like",
  "laugh",
  "wow",
  "sad",
  "angry",
];

export function MessageContextMenu({
  message,
  isOpen,
  position,
  isMe,
  onClose,
  onReply,
  onForward,
  onReact,
  onDeleteForMe,
  onDeleteForAll,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState(position);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (position.x + rect.width > viewportWidth - 10) {
        adjustedX = viewportWidth - rect.width - 10;
      }
      if (position.x < 10) {
        adjustedX = 10;
      }

      if (position.y + rect.height > viewportHeight - 10) {
        adjustedY = position.y - rect.height;
      }
      if (adjustedY < 10) {
        adjustedY = 10;
      }

      setMenuPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleReaction = (type: string) => {
    if (!message) return;
    onReact(message.id, type);
    onClose();
  };

  const handleCustomEmojiSubmit = () => {
    if (customEmoji && message) {
      const emojiToType: Record<string, ReactionType> = {
        "❤️": "heart",
        "💙": "heart",
        "💚": "heart",
        "💜": "heart",
        "🖤": "heart",
        "👍": "like",
        "👎": "dislike",
        "😂": "laugh",
        "🤣": "laugh",
        "😆": "laugh",
        "😮": "wow",
        "😲": "wow",
        "😢": "sad",
        "😭": "sad",
        "😡": "angry",
        "🤬": "angry",
      };

      const reactionType = emojiToType[customEmoji] ?? "like";
      onReact(message.id, reactionType);
      setCustomEmoji("");
      setShowEmojiPicker(false);
      onClose();
    }
  };

  const handleReply = () => {
    if (!message) return;
    onReply(message);
    onClose();
  };

  const handleForward = () => {
    if (!message) return;
    onForward(message);
    onClose();
  };

  const handleDeleteForMe = () => {
    if (!message) return;
    onDeleteForMe(message.id);
    onClose();
  };

  const handleDeleteForAll = () => {
    if (!message) return;
    onDeleteForAll(message.id);
    onClose();
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Context Menu */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              left: menuPosition.x,
              top: menuPosition.y,
              zIndex: 50,
            }}
            className="min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A]/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Quick Reactions Bar */}
            <div className="flex justify-center gap-1 border-b border-white/10 p-3">
              {QUICK_REACTIONS.map((type) => {
                const { Icon, color } = REACTION_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className="group relative p-2 transition-all hover:scale-125"
                    title={REACTION_ICONS[type].label}
                  >
                    <Icon size={24} className={color} />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded bg-black/90 px-2 py-0.5 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {REACTION_ICONS[type].label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Emoji Input (for mobile keyboard emojis) */}
            {showEmojiPicker ? (
              <div className="border-b border-white/10 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    placeholder="أدخل إيموجي..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#D4AF37]/50 focus:outline-none"
                    autoFocus
                    inputMode="text"
                    maxLength={2}
                  />
                  <button
                    onClick={handleCustomEmojiSubmit}
                    disabled={!customEmoji}
                    className="rounded-lg bg-[#D4AF37] px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C5A028] disabled:opacity-50"
                  >
                    إرسال
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="rounded-lg bg-white/10 p-2 text-white/60 transition-colors hover:bg-white/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowEmojiPicker(true)}
                className="w-full border-b border-white/10 px-4 py-3 text-right text-sm text-white/70 transition-colors hover:bg-white/5"
              >
                إيموجي آخر...
              </button>
            )}

            {/* Menu Actions */}
            <div className="py-1">
              {/* Reply */}
              <button
                onClick={handleReply}
                className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-white/5"
              >
                <Reply size={18} className="text-[#D4AF37]" />
                <span className="text-sm text-white">الرد</span>
              </button>

              {/* Forward */}
              <button
                onClick={handleForward}
                className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-white/5"
              >
                <Forward size={18} className="text-[#D4AF37]" />
                <span className="text-sm text-white">توجيه</span>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-white/10" />

              {/* Delete for Me */}
              <button
                onClick={handleDeleteForMe}
                className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-red-500/10"
              >
                <Trash2 size={18} className="text-red-400" />
                <span className="text-sm text-red-400">حذف لي</span>
              </button>

              {/* Delete for Everyone (only for sender) */}
              {isMe && (
                <button
                  onClick={handleDeleteForAll}
                  className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-red-500/10"
                >
                  <Users size={18} className="text-red-400" />
                  <span className="text-sm text-red-400">حذف للجميع</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
