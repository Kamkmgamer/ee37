"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { PostCard } from "./PostCard";

interface PostMedia {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  order: number;
}

interface PostReaction {
  postId: string;
  reactionType: string;
  count: number;
}

interface Post {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  media: PostMedia[];
  reactions: PostReaction[];
}

interface FeedPreviewProps {
  posts: Post[];
  currentUserId: string;
  userReactions: Record<string, string>;
}

export function FeedPreview({
  posts,
  currentUserId,
  userReactions,
}: FeedPreviewProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-xl"
    >
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between px-2 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-copper)] text-white shadow-lg">
            <MessageSquare size={20} />
          </div>
          <h2
            className="text-2xl font-bold text-[var(--color-midnight)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            آخر المنشورات
          </h2>
        </div>
      </div>

      {/* Posts Preview */}
      <div className="space-y-4">
        {posts.slice(0, 3).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            userReaction={userReactions[post.id]}
            variant="compact"
          />
        ))}
      </div>

      {/* View All Button */}
      <Link href="/feed" className="group mt-6 block">
        <div className="elegant-card relative overflow-hidden rounded-2xl p-4 transition-all duration-500 hover:shadow-[var(--color-gold)]/10 hover:shadow-2xl">
          <div className="flex items-center justify-center gap-3">
            <span
              className="text-lg font-semibold text-[var(--color-midnight)] transition-colors group-hover:text-[var(--color-gold)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              عرض جميع المنشورات
            </span>
            <ChevronLeft
              size={20}
              className="-translate-x-2 text-[var(--color-gold)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
        </div>
      </Link>
    </motion.section>
  );
}
