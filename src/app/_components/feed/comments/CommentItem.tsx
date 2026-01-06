"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CommentForm } from "./CommentForm";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { api } from "~/trpc/react";
import { ReportModal } from "../../modals/ReportModal";
import { ReactionBar } from "../ReactionBar";
import { useToast } from "../../ui/Toast";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date | null;
  parentId: string | null;
  author: {
    id: string;
    name: string;
    profile: {
      avatarUrl: string | null;
    } | null;
  };
  children: Comment[];
  reactions: {
    userId: string;
    reactionType:
      | "like"
      | "dislike"
      | "heart"
      | "angry"
      | "laugh"
      | "wow"
      | "sad";
  }[];
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId: string;
}

export function CommentItem({
  comment,
  postId,
  currentUserId,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editError, setEditError] = useState(false);

  const utils = api.useUtils();
  const toast = useToast();

  const deleteComment = api.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التعليق بنجاح");
      void utils.comments.getByPostId.invalidate({ postId });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف التعليق");
    },
  });

  const editComment = api.comments.edit.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setEditError(false);
      toast.success("تم تعديل التعليق بنجاح");
      void utils.comments.getByPostId.invalidate({ postId });
    },
    onError: () => {
      setEditError(true);
      toast.error("حدث خطأ أثناء تعديل التعليق");
    },
  });

  const isAuthor = comment.author.id === currentUserId;

  const timeAgo = getTimeAgo(new Date(comment.createdAt));

  const reactionsObj: Record<string, number> = {
    like: 0,
    dislike: 0,
    heart: 0,
    angry: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
  };

  let userReaction: string | undefined = undefined;

  if (comment.reactions) {
    for (const r of comment.reactions) {
      reactionsObj[r.reactionType] = (reactionsObj[r.reactionType] ?? 0) + 1;
      if (r.userId === currentUserId) {
        userReaction = r.reactionType;
      }
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-2 flex gap-3 duration-300">
      <Link href={`/profile/${comment.author.id}`} className="shrink-0 pt-1">
        <div className="bg-gold/20 relative h-8 w-8 overflow-hidden rounded-full border border-white shadow-sm">
          {comment.author.profile?.avatarUrl ? (
            <Image
              src={comment.author.profile.avatarUrl}
              alt={comment.author.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-gold flex h-full w-full items-center justify-center text-xs font-bold">
              {comment.author.name.charAt(0)}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="group relative rounded-2xl border border-gray-200/50 bg-gray-100/80 p-3 px-4 transition-all hover:bg-gray-100 hover:shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-4">
            <Link
              href={`/profile/${comment.author.id}`}
              className="text-midnight hover:text-gold truncate text-sm font-bold transition-colors"
            >
              {comment.author.name}
            </Link>

            {/* Menu */}
            {!isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                  aria-controls="comment-menu"
                  aria-label="خيارات التعليق"
                  className="rounded-full p-1 text-gray-400 hover:bg-black/5 hover:text-gray-600"
                >
                  <MoreHorizontal size={16} aria-hidden="true" />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowMenu(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      id="comment-menu"
                      role="menu"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-full left-0 z-50 mt-1 min-w-[120px] rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5"
                    >
                      {isAuthor ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            aria-label="تعديل التعليق"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={14} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(true);
                              setShowMenu(false);
                            }}
                            disabled={deleteComment.isPending}
                            aria-label="حذف التعليق"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                          >
                            {deleteComment.isPending ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600" />
                            ) : (
                              <Trash2 size={14} />
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
                          aria-label="إبلاغ عن التعليق"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-orange-600 hover:bg-orange-50"
                        >
                          <AlertTriangle size={14} />
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
            targetId={comment.id}
            targetType="comment"
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
                    حذف التعليق
                  </h3>
                  <p className="mb-6 text-gray-600">
                    هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا
                    الإجراء.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleteComment.isPending}
                      className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => {
                        void deleteComment.mutate({ commentId: comment.id });
                        setShowDeleteConfirm(false);
                      }}
                      disabled={deleteComment.isPending}
                      className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleteComment.isPending && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                      حذف
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}

          {isEditing ? (
            <div className="mt-2">
              {editError && (
                <div className="mb-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  <span>حدث خطأ. يرجى المحاولة مرة أخرى.</span>
                  <button
                    onClick={() => setEditError(false)}
                    className="hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <textarea
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  setEditError(false);
                }}
                className="min-h-[60px] w-full resize-none rounded-lg border border-gray-200 bg-white p-2 text-sm focus:border-[#D4AF37] focus:outline-none"
                autoFocus
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={editComment.isPending}
                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => {
                    void editComment.mutate({
                      commentId: comment.id,
                      content: editContent,
                    });
                  }}
                  disabled={editComment.isPending || !editContent.trim()}
                  className="rounded-md bg-[#D4AF37] p-1 text-white hover:bg-[#C5A028] disabled:opacity-50"
                >
                  {editComment.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-midnight/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        <div className="mt-1 flex items-center gap-4 px-4">
          <span className="text-[11px] font-medium text-gray-600">
            {timeAgo}
            {comment.updatedAt &&
              new Date(comment.updatedAt).getTime() >
                new Date(comment.createdAt).getTime() + 1000 && (
                <span className="text-midnight/40 mr-1 text-[9px] font-normal italic">
                  (معدل)
                </span>
              )}
          </span>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="hover:text-gold text-midnight cursor-pointer text-[11px] font-bold transition-colors"
          >
            رد
          </button>
          <div className="origin-right scale-75">
            <ReactionBar
              targetId={comment.id}
              type="comment"
              _userId={currentUserId}
              initialReactions={reactionsObj}
              userReaction={userReaction}
            />
          </div>
        </div>

        {isReplying && (
          <div className="animate-in fade-in zoom-in-95 mt-3 mr-2 duration-200">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}

        {comment.children && comment.children.length > 0 && (
          <div className="mt-3 mr-3 space-y-4 border-r-2 border-gray-200/80 pr-3">
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                postId={postId}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
