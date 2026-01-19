/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { ChatListReady } from "./ChatListReady";

interface ChatListProps {
  userId: string;
  user: {
    userId: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    collegeId?: string;
  } | null;
}

export function ChatList({ userId, user }: ChatListProps) {
  const [isSynced, setIsSynced] = useState(false);

  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (user && userId) {
      void (async () => {
        await syncUser({
          externalId: user.userId,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          avatarUrl: user.image ?? undefined,
          collegeId: (user as any).collegeId,
        });
        setIsSynced(true);
      })();
    }
  }, [user, userId, syncUser]);

  if (!isSynced) {
    return (
      <div className="flex h-full flex-col">
        {/* Header placeholder */}
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
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-black transition-colors hover:bg-[#C5A028]">
            <Plus size={20} />
          </button>
        </div>

        {/* Loading spinner */}
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
        </div>
      </div>
    );
  }

  return <ChatListReady userId={userId} />;
}
