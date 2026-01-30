/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { ChatListReady } from "./ChatListReady";
import { NewChatDialog } from "./NewChatDialog";

interface ChatListProps {
  userId: string;
}

export function ChatList({ userId }: ChatListProps) {
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#A0A0A0] transition-colors hover:bg-white/10 hover:text-[#EAEAEA]"
            >
              <ArrowRight size={20} />
            </Link>
            <h2 className="text-xl font-bold text-[#EAEAEA]">المحادثات</h2>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-black transition-colors hover:bg-[#C5A028]"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Chat List Content */}
        <div className="flex-1 overflow-hidden">
          <ChatListReady userId={userId} />
        </div>
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        isOpen={showNewChat}
        currentUserId={userId}
        onClose={() => setShowNewChat(false)}
      />
    </>
  );
}
