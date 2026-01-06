"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trash2,
  MoreHorizontal,
  Play,
  MessageCircle,
  Pencil,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { ReactionBar } from "./ReactionBar";
import { CommentSection } from "./comments/CommentSection";
import { ReportModal } from "../modals/ReportModal";
import { useToast } from "../ui/Toast";
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
    updatedAt?: Date | null;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const utils = api.useUtils();
  const toast = useToast();

  const [isDeleted, setIsDeleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState(false);

  const handleMediaClick = (media: PostMedia) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("media", "true");
    newParams.set("mediaUrl", media.mediaUrl);
    newParams.set("mediaType", media.mediaType);
    newParams.set("postId", post.id);
    newParams.set("authorName", post.authorName);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const deletePost = api.feed.deletePost.useMutation({
    onSuccess: () => {
      setIsDeleted(true);
      toast.success("تم حذف المنشور بنجاح");
      void utils.feed.getPosts.invalidate();
      void utils.feed.getPostsByUser.invalidate({ userId: post.authorId });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف المنشور");
    },
  });

  const editPost = api.feed.editPost.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setEditError(false);
      setShowMenu(false);
      toast.success("تم تعديل المنشور بنجاح");
      void utils.feed.getPosts.invalidate();
      void utils.feed.getPostsByUser.invalidate({ userId: post.authorId });
      void utils.feed.getPost.invalidate({ postId: post.id });
    },
    onError: () => {
      setEditError(true);
      toast.error("حدث خطأ أثناء تعديل المنشور");
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
            <p className="text-xs font-medium text-gray-700 sm:text-sm">
              {timeAgo}
              {post.updatedAt &&
                new Date(post.updatedAt).getTime() >
                  new Date(post.createdAt).getTime() + 1000 && (
                  <span className="text-midnight/40 mr-1.5 text-[10px] font-normal italic">
                    (معدل)
                  </span>
                )}
            </p>
          </div>
        </Link>

        {/* Menu */}
        {!isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-haspopup="menu"
              aria-expanded={showMenu}
              aria-controls="post-menu"
              aria-label="خيارات المنشور"
              className="hover:bg-midnight/5 rounded-lg p-2 transition-colors"
            >
              <MoreHorizontal
                size={20}
                className="text-midnight/50"
                aria-hidden="true"
              />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowMenu(false)}
                  aria-hidden="true"
                />
                <motion.div
                  id="post-menu"
                  role="menu"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
                >
                  {isAuthor ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        aria-label="تعديل المنشور"
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Pencil size={16} />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        disabled={deletePost.isPending}
                        aria-label="حذف المنشور"
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-red-500 transition-colors hover:bg-red-50"
                      >
                        {deletePost.isPending ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>حذف</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-orange-600 transition-colors hover:bg-orange-50"
                    >
                      <AlertTriangle size={16} />
                      <span>إبلاغ</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={post.id}
        targetType="post"
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-midnight mb-2 text-lg font-semibold">
                حذف المنشور
              </h3>
              <p className="mb-6 text-gray-600">
                هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletePost.isPending}
                  className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    void deletePost.mutateAsync({ postId: post.id });
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deletePost.isPending}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                >
                  {deletePost.isPending && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          {editError && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              <span>حدث خطأ. يرجى المحاولة مرة أخرى.</span>
              <button
                onClick={() => setEditError(false)}
                className="hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              setEditError(false);
            }}
            className="min-h-[100px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-right focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
            autoFocus
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(post.content);
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
              disabled={editPost.isPending}
            >
              <X size={16} />
              إلغاء
            </button>
            <button
              onClick={() => {
                void editPost.mutateAsync({
                  postId: post.id,
                  content: editContent,
                });
              }}
              className="flex items-center gap-1 rounded-lg bg-[#D4AF37] px-3 py-1.5 text-sm text-white hover:bg-[#C5A028] disabled:opacity-50"
              disabled={editPost.isPending || !editContent.trim()}
            >
              {editPost.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={16} />
              )}
              حفظ
            </button>
          </div>
        </div>
      ) : (
        <p
          className={`text-midnight mb-4 leading-relaxed whitespace-pre-wrap ${isCompact ? "line-clamp-2" : ""}`}
        >
          {post.content}
        </p>
      )}

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
              <button
                key={media.id}
                onClick={() => handleMediaClick(media)}
                className={`group relative overflow-hidden rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] ${
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
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="rounded-full bg-white/90 p-4 shadow-lg transition-transform"
                      >
                        <Play
                          size={24}
                          className="text-midnight"
                          fill="currentColor"
                        />
                      </motion.div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                {media.mediaType === "image" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="rounded-full bg-white/90 p-4 shadow-lg">
                      <svg
                        className="text-midnight h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </motion.div>
                )}
              </button>
            ),
          )}
        </div>
      )}

      {/* Reactions & Comments Toggle */}
      <div className="border-midnight/10 flex items-center justify-between border-t pt-4">
        <ReactionBar
          targetId={post.id}
          type="post"
          _userId={currentUserId}
          initialReactions={reactionsObj}
          userReaction={userReaction}
        />

        {!isCompact && (
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              showComments
                ? "bg-gold/10 text-gold border-gold/20 border"
                : "text-midnight/70 hover:text-gold hover:border-gold/20 border border-transparent bg-gray-100/80 hover:bg-gray-100"
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
