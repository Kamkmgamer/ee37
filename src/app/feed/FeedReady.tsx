"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PostCard } from "../_components/feed/PostCard";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Id } from "../../../convex/_generated/dataModel";

interface FeedReadyProps {
  currentUserId: string;
}

export function FeedReady({ currentUserId }: FeedReadyProps) {
  const toggleReaction = useMutation(api.posts.toggleReaction);

  // All hooks now called unconditionally at the top level
  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.posts.list as any,
    { currentUserId: currentUserId as Id<"users"> },
    { initialNumItems: 10 },
  );

  const isLoading = status === "LoadingFirstPage";

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
      >
        <p className="text-lg text-[#A0A0A0]">لا توجد منشورات بعد</p>
        <p className="mt-2 text-[#A0A0A0]/60">كن أول من ينشر!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={{
              id: post._id,
              content: post.content,
              createdAt: new Date(post.createdAt),
              authorId: post.authorId,
              authorName: post.author?.name ?? "Unknown",
              authorAvatar: post.author?.avatarUrl ?? null,
              media: post.media.map((m: any) => ({ url: m.url, type: m.type })),
              reactions: [],
            }}
            currentUserId={currentUserId}
            userReaction={post.hasLiked ? "like" : undefined}
          />
        ))}
      </AnimatePresence>

      <div className="py-4 text-center">
        {status === "CanLoadMore" ? (
          <button
            onClick={() => loadMore(5)}
            className="text-[#D4AF37] hover:underline"
          >
            تحميل المزيد
          </button>
        ) : status === "LoadingMore" ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#D4AF37]" />
        ) : (
          <p className="text-[#A0A0A0]/60">تم تحميل جميع المنشورات</p>
        )}
      </div>
    </div>
  );
}
