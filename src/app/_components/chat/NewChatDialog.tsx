"use client";

import { useState } from "react";
import { X, Search, Check } from "lucide-react";
import Image from "next/image";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface NewChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export function NewChatDialog({
  isOpen,
  onClose,
  currentUserId: _currentUserId,
}: NewChatDialogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");

  const { data: users, isLoading: isSearching } = api.chat.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 },
  );

  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      onClose();
      router.push(`/chat?c=${data.conversationId}`);
      setSelectedUsers([]);
      setGroupName("");
      setSearchQuery("");
      setIsGroup(false);
    },
  });

  if (!isOpen) return null;

  const handleUserSelect = (userId: string) => {
    if (isGroup) {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    } else {
      // For private chat, select one and create immediately
      createConversationMutation.mutate({
        type: "private",
        participantIds: [userId],
      });
    }
  };

  const handleCreateGroup = () => {
    if (!groupName || selectedUsers.length === 0) return;

    createConversationMutation.mutate({
      type: "group",
      participantIds: selectedUsers,
      name: groupName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-lg font-bold text-[#EAEAEA]">
            {isGroup ? "إنشاء مجموعة جديدة" : "محادثة جديدة"}
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
          {/* Mode Toggle */}
          <div className="mb-4 flex gap-2 rounded-xl bg-white/5 p-1">
            <button
              onClick={() => {
                setIsGroup(false);
                setSelectedUsers([]);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                !isGroup
                  ? "bg-[#D4AF37] text-black"
                  : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              محادثة خاصة
            </button>
            <button
              onClick={() => {
                setIsGroup(true);
                setSelectedUsers([]);
              }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                isGroup
                  ? "bg-[#D4AF37] text-black"
                  : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              مجموعة
            </button>
          </div>

          {/* Group Name Input */}
          {isGroup && (
            <div className="mb-4">
              <label className="mb-1 block text-xs text-[#A0A0A0]">
                اسم المجموعة
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
                placeholder="أدخل اسم المجموعة"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pr-10 pl-4 text-sm text-[#EAEAEA] focus:border-[#D4AF37] focus:outline-none"
              placeholder="ابحث عن مستخدمين..."
            />
            <Search
              className="absolute top-2.5 right-3 text-[#A0A0A0]"
              size={18}
            />
          </div>

          {/* User List */}
          <div className="h-64 space-y-2 overflow-y-auto">
            {searchQuery.length === 0 && !isSearching && (
              <div className="flex h-full flex-col items-center justify-center text-[#A0A0A0]">
                <Search size={32} className="mb-2 opacity-50" />
                <p className="text-sm">ابحث لبدء المحادثة</p>
              </div>
            )}

            {isSearching && (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
              </div>
            )}

            {users?.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`flex w-full items-center justify-between rounded-xl p-3 transition-colors ${
                  selectedUsers.includes(user.id)
                    ? "border border-[#D4AF37]/50 bg-[#D4AF37]/20"
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#D4AF37]/20 font-bold text-[#D4AF37]">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#EAEAEA]">{user.name}</p>
                    <p className="text-xs text-[#A0A0A0]">{user.collegeId}</p>
                  </div>
                </div>
                {selectedUsers.includes(user.id) && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37] text-black">
                    <Check size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isGroup && (
          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleCreateGroup}
              disabled={
                !groupName ||
                selectedUsers.length === 0 ||
                createConversationMutation.isPending
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 font-bold text-black transition-all hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createConversationMutation.isPending
                ? "جاري الإنشاء..."
                : "إنشاء المجموعة"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
