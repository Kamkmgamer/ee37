"use client";

import { useState } from "react";
import { X, Search, SendHorizontal } from "lucide-react";
import Image from "next/image";
import { api } from "~/trpc/react";

interface ForwardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onForward: (conversationId: string) => void;
  currentUserId: string;
}

export function ForwardDialog({
  isOpen,
  onClose,
  onForward,
  currentUserId,
}: ForwardDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, isLoading } = api.chat.getConversations.useQuery(
    {
      limit: 20,
    },
  );

  const filteredConversations =
    conversations?.conversations.filter((conv) => {
      if (!searchQuery) return true;
      const name =
        conv.type === "group"
          ? conv.name
          : conv.participants.find((p) => p.id !== currentUserId)?.name;

      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    }) ?? [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-lg font-bold text-[#EAEAEA]">
            توجيه الرسالة إلى
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#A0A0A0] hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-10 pl-4 text-sm text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
              placeholder="ابحث في المحادثات..."
            />
            <Search
              className="absolute top-2.5 right-3 text-[#A0A0A0]"
              size={18}
            />
          </div>

          {/* Conversation List */}
          <div className="h-80 space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-[#A0A0A0]">
                <p className="text-sm">لا توجد محادثات</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p) => p.id !== currentUserId,
                );
                const displayName =
                  conv.type === "group"
                    ? conv.name
                    : (otherParticipant?.name ?? "مستخدم");
                const displayAvatar =
                  conv.type === "group"
                    ? conv.avatarUrl
                    : otherParticipant?.avatarUrl;

                return (
                  <button
                    key={conv.id}
                    onClick={() => onForward(conv.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-transparent p-3 transition-colors hover:border-white/10 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10">
                        {displayAvatar ? (
                          <Image
                            src={displayAvatar}
                            alt={displayName ?? ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#D4AF37]/20 font-bold text-[#D4AF37]">
                            {displayName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#EAEAEA]">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {conv.type === "group" ? "مجموعة" : "خاص"}
                        </p>
                      </div>
                    </div>
                    <SendHorizontal size={18} className="text-[#A0A0A0]" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
