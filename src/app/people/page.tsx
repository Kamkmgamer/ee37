"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, User } from "lucide-react";
import { PageHeader } from "../_components/PageHeader";
import { motion } from "framer-motion";

export default function PeoplePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = api.chat.searchUsers.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 },
  );

  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: (data) => {
      router.push(`/chat?c=${data.conversationId}`);
    },
  });

  const handleMessage = (userId: string) => {
    createConversationMutation.mutate({
      type: "private",
      participantIds: [userId],
    });
  };

  return (
    <div className="bg-paper min-h-screen">
      <PageHeader title="البحث عن الأصدقاء" showBack={true} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full rounded-2xl border-2 border-[var(--color-midnight)]/10 bg-white px-6 py-4 pl-12 text-lg text-[var(--color-midnight)] shadow-sm transition-all focus:border-[var(--color-gold)] focus:shadow-lg focus:outline-none"
          />
          <Search
            className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-midnight)]/30"
            size={24}
          />
        </div>

        {/* Results */}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-gold)] border-t-transparent" />
            </div>
          )}

          {!isLoading && searchQuery && users?.length === 0 && (
            <div className="py-12 text-center text-[var(--color-midnight)]/40">
              لا توجد نتائج مطابقة
            </div>
          )}

          {!searchQuery && (
            <div className="flex flex-col items-center gap-4 py-12 text-center text-[var(--color-midnight)]/40">
              <Search size={48} className="opacity-20" />
              <p>ابحث عن زملائك في الدفعة للتواصل معهم</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {users?.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="elegant-card flex items-center gap-4 rounded-2xl p-4"
              >
                {/* Avatar */}
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-[var(--color-midnight)]/5">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[var(--color-gold)]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-[var(--color-midnight)]">
                    {user.name}
                  </h3>
                  <p className="text-sm text-[var(--color-midnight)]/50">
                    {user.collegeId}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/profile/${user.id}`}>
                    <button className="rounded-xl bg-[var(--color-midnight)]/5 p-3 text-[var(--color-midnight)] transition-colors hover:bg-[var(--color-midnight)]/10">
                      <User size={20} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleMessage(user.id)}
                    disabled={createConversationMutation.isPending}
                    className="rounded-xl bg-[var(--color-gold)] p-3 text-[var(--color-midnight)] transition-colors hover:bg-[#C5A028] disabled:opacity-50"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
