"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { arMA } from "date-fns/locale";
import {
  CheckCheck,
  PlayCircle,
  Reply,
  ArrowRight,
  ArrowLeft,
  Smile,
  Edit2,
} from "lucide-react";
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
}

export function MessageBubble({
  message,
  isMe,
  showSenderName,
  className,
  onReply,
  onForward,
  onReact,
  onEdit,
}: MessageBubbleProps) {
  const controls = useAnimation();

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset > 100) {
      onReply?.(message);
    } else if (offset < -100) {
      onForward?.(message);
    }
    await controls.start({ x: 0 });
  };

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
          className={`relative overflow-hidden rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isMe
              ? "rounded-br-none bg-[#D4AF37] text-black"
              : "rounded-bl-none bg-white/10 text-[#EAEAEA]"
          }`}
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

        {/* Reactions & Actions */}
        <div className="flex items-center gap-2 text-white/40">
          {/* Reaction Button */}
          <div className="group/reactions relative">
            <button className="hidden rounded-full p-1 group-hover:block hover:bg-white/10">
              <Smile size={16} />
            </button>
            {/* Hover Picker - simplified */}
            <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-[#1A1A1A] p-2 shadow-xl backdrop-blur-md group-hover/reactions:flex">
              {(
                Object.entries(REACTION_ICONS) as [
                  ReactionType,
                  (typeof REACTION_ICONS)[ReactionType],
                ][]
              ).map(([type, { Icon, color }]) => (
                <button
                  key={type}
                  onClick={() => onReact?.(message.id, type)}
                  className="group/icon relative p-1 transition-transform hover:scale-125"
                >
                  <Icon size={20} className={color} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onReply?.(message)}
            className="hidden rounded-full p-1 group-hover:block hover:bg-white/10"
            title="رد"
          >
            <Reply size={16} />
          </button>

          <button
            onClick={() => onForward?.(message)}
            className="hidden rounded-full p-1 group-hover:block hover:bg-white/10"
            title="توجيه"
          >
            <ArrowLeft size={16} />
          </button>

          {isMe && (
            <button
              onClick={() => {
                // Simple prompt for now, essentially triggering edit mode in parent
                onEdit?.(message);
              }}
              className="hidden rounded-full p-1 group-hover:block hover:bg-white/10"
              title="تعديل"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
