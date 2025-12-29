"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Search, Plus, Users, User, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ConversationItem } from "./ConversationItem";
import { NewChatDialog } from "./NewChatDialog";
import { AI_USER_ID } from "~/lib/constants";
import { useRouter } from "next/navigation";

interface ChatListProps {
  userId: string;
}

export function ChatList({ userId }: ChatListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "private" | "group">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const { data, isLoading } = api.chat.getConversations.useQuery({
    limit: 20,
  });

  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      router.push(`/chat?c=${data.conversationId}`);
    },
  });

  const handleStartAIChat = () => {
    createConversationMutation.mutate({
      type: "private",
      participantIds: [AI_USER_ID],
    });
  };

  const conversations = data?.conversations ?? [];

  const filteredConversations = conversations.filter((conv) => {
    // Filter by tab
    if (activeTab !== "all" && conv.type !== activeTab) return false;

    // Filter by search
    if (searchQuery) {
      const name =
        conv.type === "group"
          ? conv.name
          : conv.participants.find((p) => p.id !== userId)?.name;

      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <NewChatDialog
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        currentUserId={userId}
      />

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
          onClick={() => setIsNewChatOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-black transition-colors hover:bg-[#C5A028]"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-10 pl-4 text-sm text-[#EAEAEA] placeholder:text-[#A0A0A0] focus:border-[#D4AF37]/50 focus:outline-none"
          />
          <Search
            className="absolute top-2.5 right-3 text-[#A0A0A0]"
            size={18}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-3 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "all"
              ? "bg-white/10 text-[#EAEAEA]"
              : "text-[#A0A0A0] hover:text-[#EAEAEA]"
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setActiveTab("private")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "private"
              ? "bg-white/10 text-[#EAEAEA]"
              : "text-[#A0A0A0] hover:text-[#EAEAEA]"
          }`}
        >
          <User size={12} />
          خاص
        </button>
        <button
          onClick={() => setActiveTab("group")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "group"
              ? "bg-white/10 text-[#EAEAEA]"
              : "text-[#A0A0A0] hover:text-[#EAEAEA]"
          }`}
        >
          <Users size={12} />
          مجموعات
        </button>
      </div>

      {/* AI Bot Quick Access */}
      <div className="px-3 pb-3">
        <button
          onClick={handleStartAIChat}
          disabled={createConversationMutation.isPending}
          className="group flex w-full items-center gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3 transition-all hover:bg-[#D4AF37]/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-110">
            <Sparkles size={20} />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#EAEAEA]">
              مساعد الدفعة الذكي
            </p>
            <p className="text-[10px] text-[#A0A0A0]">
              {createConversationMutation.isPending
                ? "جاري التحميل..."
                : "اسأل أي سؤال عن الدفعة أو المواد"}
            </p>
          </div>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#A0A0A0]">
            <p className="text-sm">لا توجد محادثات</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={userId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
