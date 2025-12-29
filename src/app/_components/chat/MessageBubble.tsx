"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { arMA } from "date-fns/locale";
import { CheckCheck, PlayCircle, ArrowRight } from "lucide-react";
import { REACTION_ICONS, type ReactionType } from "../icons/ReactionIcons";
import { motion, type PanInfo, useAnimation } from "framer-motion";
import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showSenderName?: boolean;
  className?: string;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onReact?: (messageId: string, type: string) => void;
  onEdit?: (message: Message) => void;
  onContextMenu?: (
    message: Message,
    position: { x: number; y: number },
  ) => void;
}

export function MessageBubble({
  message,
  isMe,
  showSenderName,
  className,
  onReply,
  onForward,
  onContextMenu,
}: MessageBubbleProps) {
  const controls = useAnimation();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset > 100) {
      onReply?.(message);
    } else if (offset < -100) {
      onForward?.(message);
    }
    await controls.start({ x: 0 });
  };

  // Handle right-click context menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(message, { x: e.clientX, y: e.clientY });
    },
    [message, onContextMenu],
  );

  // Handle touch start for long-press
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      setIsPressed(true);
      const position = { x: touch.clientX, y: touch.clientY };

      longPressTimer.current = setTimeout(() => {
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        onContextMenu?.(message, position);
        setIsPressed(false);
      }, 500); // 500ms long press
    },
    [message, onContextMenu],
  );

  // Handle touch end - cancel long-press
  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Handle touch move - cancel long-press if moved
  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      setIsPressed(false);
    }
  }, []);

  return (
    <div
      className={`relative flex w-full items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${className ?? ""}`}
    >
      {/* Avatar */}
      {!isMe && (
        <Link
          href={`/profile/${message.senderId}`}
          className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]"
        >
          {message.senderAvatar && (
            <Image
              src={message.senderAvatar}
              alt={message.senderName ?? "Sender"}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          )}
        </Link>
      )}

      {/* Bubble Container */}
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
      >
        {/* Reply Context */}
        {message.replyTo && (
          <div
            className={`mb-1 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-xs text-white/60 ${isMe ? "self-end" : "self-start"}`}
          >
            <div
              className={`h-full w-0.5 rounded-full ${isMe ? "bg-[#D4AF37]" : "bg-white/20"}`}
            />
            <div className="flex flex-col border-r-2 border-[#D4AF37] px-2 py-0.5">
              <span className="text-[10px] font-bold text-[#D4AF37]/80">
                {message.replyTo.senderName ?? "مستخدم"}
              </span>
              <span className="line-clamp-1 max-w-[200px] text-[11px] opacity-80">
                {message.replyTo.content ?? "مرفق"}
              </span>
            </div>
          </div>
        )}

        {/* Sender Name */}
        {showSenderName && !isMe && (
          <span className="px-1 text-[10px] text-[#A0A0A0]">
            {message.senderName ?? "مستخدم"}
          </span>
        )}

        {/* Draggable Bubble */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={controls}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={`relative cursor-pointer overflow-hidden rounded-2xl px-4 py-2 text-sm shadow-sm transition-transform select-none ${
            isMe
              ? "rounded-br-none bg-[#D4AF37] text-black"
              : "rounded-bl-none bg-white/10 text-[#EAEAEA]"
          } ${isPressed ? "scale-95 opacity-90" : ""}`}
        >
          {/* Forwarded Label */}
          {message.isForwarded && (
            <div className="mb-1 flex items-center gap-1 text-[10px] italic opacity-70">
              <ArrowRight size={10} />
              <span>محولة</span>
            </div>
          )}

          {/* Media Attachments */}
          {message.media.length > 0 && (
            <div
              className={`mb-2 gap-1 ${message.media.length > 1 ? "grid grid-cols-2" : "flex"}`}
            >
              {message.media.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-lg"
                >
                  {item.mediaType === "image" ? (
                    <Image
                      src={item.mediaUrl}
                      alt="Attachment"
                      width={200}
                      height={200}
                      className="h-auto w-full object-cover"
                    />
                  ) : (
                    <div className="relative flex h-32 w-full items-center justify-center bg-black/50">
                      <video
                        src={item.mediaUrl}
                        className="h-full w-full object-cover"
                        controls
                      />
                      <PlayCircle
                        className="absolute text-white opacity-80"
                        size={32}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Reactions Display */}
          {message.reactions.length > 0 && (
            <div
              className={`mt-2 flex flex-wrap gap-1 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {Object.entries(
                message.reactions.reduce(
                  (acc, r) => {
                    acc[r.reactionType] = (acc[r.reactionType] ?? 0) + 1;
                    return acc;
                  },
                  {} as Record<string, number>,
                ),
              ).map(([type, count]) => {
                const Icon = REACTION_ICONS[type as ReactionType]?.Icon;
                if (!Icon) return null;
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px]"
                  >
                    <Icon
                      size={12}
                      className={REACTION_ICONS[type as ReactionType].color}
                      filled
                    />
                    <span className="text-white/80">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Timestamp & Status */}
          <div
            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
              isMe ? "text-black/60" : "text-white/40"
            }`}
          >
            <span>
              {format(new Date(message.createdAt), "hh:mm a", {
                locale: arMA,
              })}
            </span>
            {message.updatedAt && message.updatedAt > message.createdAt && (
              <span>(معدل)</span>
            )}
            {isMe && <CheckCheck size={12} />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
