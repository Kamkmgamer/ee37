"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, MoreHorizontal, Play, MessageCircle } from "lucide-react";
import { ReactionBar } from "./ReactionBar";
import { CommentSection } from "./comments/CommentSection";
import { api } from "~/trpc/react";

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

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    authorId: string;
    authorName: string;
    authorAvatar: string | null;
    media: PostMedia[];
    reactions: PostReaction[];
  };
  currentUserId: string;
  userReaction?: string | null;
  variant?: "default" | "compact";
}

export function PostCard({
  post,
  currentUserId,
  userReaction,
  variant = "default",
}: PostCardProps) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const deletePost = api.feed.deletePost.useMutation({
    onSuccess: () => {
      setIsDeleted(true);
    },
  });

  const isAuthor = post.authorId === currentUserId;
  const isCompact = variant === "compact";

  const reactionsObj: Record<string, number> = {};
  for (const r of post.reactions) {
    reactionsObj[r.reactionType] = r.count;
  }

  const timeAgo = getTimeAgo(new Date(post.createdAt));

  if (isDeleted) {
    return null;
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`elegant-card rounded-2xl ${isCompact ? "p-3" : "p-3 sm:p-5"}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <Link
          href={`/profile/${post.authorId}`}
          className="group flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="bg-gold/20 relative h-10 w-10 shrink-0 overflow-hidden rounded-full transition-transform group-hover:scale-105 sm:h-12 sm:w-12">
            {post.authorAvatar ? (
              <Image
                src={post.authorAvatar}
                alt={post.authorName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="text-gold flex h-full w-full items-center justify-center text-lg font-bold">
                {post.authorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-midnight group-hover:text-gold truncate text-base font-semibold transition-colors">
              {post.authorName}
            </h3>
            <p className="text-midnight/50 text-xs sm:text-sm">{timeAgo}</p>
          </div>
        </Link>

        {/* Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="hover:bg-midnight/5 rounded-lg p-2 transition-colors"
            >
              <MoreHorizontal size={20} className="text-midnight/50" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-full left-0 z-50 mt-1 rounded-xl bg-white p-2 shadow-lg"
                >
                  <button
                    onClick={() => {
                      void deletePost.mutateAsync({
                        postId: post.id,
                        userId: currentUserId,
                      });
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span>حذف</span>
                  </button>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p
        className={`text-midnight mb-4 leading-relaxed whitespace-pre-wrap ${isCompact ? "line-clamp-2" : ""}`}
      >
        {post.content}
      </p>

      {/* Media Grid */}
      {post.media.length > 0 && (
        <div
          className={`mb-4 grid gap-2 ${
            post.media.length === 1
              ? "grid-cols-1"
              : post.media.length === 2
                ? "grid-cols-2"
                : post.media.length === 3
                  ? "grid-cols-2"
                  : "grid-cols-2"
          }`}
        >
          {(isCompact ? post.media.slice(0, 1) : post.media).map(
            (media, index) => (
              <div
                key={media.id}
                className={`relative overflow-hidden rounded-xl ${
                  post.media.length === 3 && index === 0 ? "col-span-2" : ""
                } ${post.media.length === 1 ? "aspect-video" : "aspect-square"}`}
              >
                {media.mediaType === "image" ? (
                  <Image
                    src={media.mediaUrl}
                    alt="Post media"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-midnight/10 relative h-full w-full">
                    <video
                      src={media.mediaUrl}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-white/90 p-4">
                        <Play
                          size={24}
                          className="text-midnight"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

      {/* Reactions & Comments Toggle */}
      <div className="border-midnight/10 flex items-center justify-between border-t pt-4">
        <ReactionBar
          targetId={post.id}
          type="post"
          userId={currentUserId}
          initialReactions={reactionsObj}
          userReaction={userReaction}
        />

        {!isCompact && (
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              showComments
                ? "bg-gold/10 text-gold"
                : "text-midnight hover:text-gold bg-white/60 hover:bg-white/80"
            }`}
          >
            <MessageCircle size={20} />
            <span>التعليقات</span>
          </button>
        )}
      </div>

      {/* Comments Section */}
      {!isCompact && showComments && (
        <div className="border-midnight/5 mt-4 border-t pt-4">
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        </div>
      )}
    </motion.article>
  );
}

// Helper function to format time ago in Arabic
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "الآن";
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;

  return date.toLocaleDateString("ar-SA");
}
