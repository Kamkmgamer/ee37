"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { arMA } from "date-fns/locale";
import { User, Users } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Conversation {
  id: string;
  type: "private" | "group";
  name: string | null;
  avatarUrl: string | null;
  updatedAt: Date | null;
  lastMessage:
    | {
        content: string | null;
        createdAt: Date;
      }
    | undefined;
  unreadCount: number;
  participants: Participant[];
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
}

export function ConversationItem({
  conversation,
  currentUserId,
}: ConversationItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = searchParams.get("c") === conversation.id;

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId,
  );

  const displayName =
    conversation.type === "group"
      ? conversation.name
      : (otherParticipant?.name ?? "مستخدم محذوف");

  const displayAvatar =
    conversation.type === "group"
      ? conversation.avatarUrl
      : otherParticipant?.avatarUrl;

  const handleSelect = () => {
    router.push(`/chat?c=${conversation.id}`);
  };

  return (
    <button
      onClick={handleSelect}
      className={`relative flex w-full items-center gap-3 rounded-xl p-3 transition-all ${
        isActive
          ? "bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/20"
          : "hover:bg-white/5"
      }`}
    >
      {/* Avatar */}
      {conversation.type === "private" && otherParticipant ? (
        <Link
          href={`/profile/${otherParticipant.id}`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]"
        >
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={displayName ?? "Avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#A0A0A0]">
              <User size={20} />
            </div>
          )}
        </Link>
      ) : (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={displayName ?? "Avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#A0A0A0]">
              {conversation.type === "group" ? (
                <Users size={20} />
              ) : (
                <User size={20} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 text-right">
        <div className="mb-1 flex items-center justify-between">
          <h4
            className={`truncate text-sm font-bold ${isActive ? "text-[#D4AF37]" : "text-[#EAEAEA]"}`}
          >
            {displayName}
          </h4>
          <span className="text-[10px] text-[#A0A0A0]">
            {conversation.lastMessage
              ? formatDistanceToNow(
                  new Date(conversation.lastMessage.createdAt),
                  {
                    addSuffix: false,
                    locale: arMA,
                  },
                )
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="truncate text-xs text-[#A0A0A0]">
            {conversation.lastMessage?.content ?? "بدء محادثة جديدة"}
          </p>
          {conversation.unreadCount > 0 && (
            <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#D4AF37] px-1.5 text-[10px] font-bold text-black">
              {conversation.unreadCount}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
