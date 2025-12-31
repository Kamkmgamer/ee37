"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Eye,
  EyeOff,
  Trash2,
  FileText,
  MessageSquare,
  Clock,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [hiddenOnly, setHiddenOnly] = useState(false);

  const { data: postsData, refetch: refetchPosts } =
    api.admin.content.listPosts.useQuery({
      hiddenOnly,
      limit: 50,
    });

  const { data: commentsData, refetch: refetchComments } =
    api.admin.content.listComments.useQuery({
      hiddenOnly,
      limit: 50,
    });

  const hidePostMutation = api.admin.content.hidePost.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const unhidePostMutation = api.admin.content.unhidePost.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const hideCommentMutation = api.admin.content.hideComment.useMutation({
    onSuccess: () => refetchComments(),
  });

  const unhideCommentMutation = api.admin.content.unhideComment.useMutation({
    onSuccess: () => refetchComments(),
  });

  const deletePostMutation = api.admin.content.deletePost.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const deleteCommentMutation = api.admin.content.deleteComment.useMutation({
    onSuccess: () => refetchComments(),
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const satisfies Variants;

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  } as const satisfies Variants;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-2 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
            Moderation
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            Content Control
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex rounded-lg border border-[#0a1628]/5 bg-white p-1 shadow-sm">
            {[
              { id: "posts" as const, label: "Posts", icon: FileText },
              {
                id: "comments" as const,
                label: "Comments",
                icon: MessageSquare,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0a1628] text-[#D4AF37] shadow-sm"
                    : "text-[#0a1628]/60 hover:bg-[#faf7f0] hover:text-[#0a1628]"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#0a1628]/10 bg-white px-4 py-2 text-sm font-medium text-[#0a1628]/60 transition-all hover:border-[#D4AF37]/30">
            <input
              type="checkbox"
              checked={hiddenOnly}
              onChange={(e) => setHiddenOnly(e.target.checked)}
              className="rounded border-[#0a1628]/20 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span>Hidden only</span>
          </label>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {activeTab === "posts" && (
          <>
            {!postsData?.posts || postsData.posts.length === 0 ? (
              <motion.div
                variants={item}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0a1628]/10 bg-[#faf7f0]/30 py-16 text-center"
              >
                <div className="mb-4 rounded-full bg-[#0a1628]/5 p-4 text-[#0a1628]/40">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-[#0a1628]">
                  No posts found
                </h3>
                <p className="text-[#0a1628]/50">
                  {hiddenOnly
                    ? "No hidden posts available"
                    : "Try adjusting filters"}
                </p>
              </motion.div>
            ) : (
              postsData.posts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={item}
                  className={`group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md ${
                    post.hiddenAt
                      ? "border-[#D4AF37]/30 bg-[#faf7f0]/50"
                      : "border-[#0a1628]/5"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#faf7f0]">
                          <span className="text-sm font-bold text-[#0a1628]">
                            {post.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-[#0a1628]">
                            {post.authorName}
                          </h3>
                          <span className="flex items-center gap-1 text-xs text-[#0a1628]/40">
                            <Clock size={10} />
                            {format(
                              new Date(post.createdAt),
                              "d MMM yyyy, HH:mm",
                              {
                                locale: ar,
                              },
                            )}
                          </span>
                        </div>
                        {post.hiddenAt && (
                          <span className="ml-2 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-[#0a1628]/80">
                        {post.content}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:self-center">
                      {post.hiddenAt ? (
                        <button
                          onClick={() =>
                            unhidePostMutation.mutate({ postId: post.id })
                          }
                          disabled={unhidePostMutation.isPending}
                          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Eye size={14} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt("Hide reason:");
                            if (reason) {
                              hidePostMutation.mutate({
                                postId: post.id,
                                reason,
                              });
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#faf7f0] px-4 py-2 text-xs font-medium text-[#0a1628] transition-colors hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10"
                        >
                          <EyeOff size={14} />
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete post permanently?")) {
                            deletePostMutation.mutate({
                              postId: post.id,
                              reason: "Deleted by admin",
                            });
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            {!commentsData?.comments || commentsData.comments.length === 0 ? (
              <motion.div
                variants={item}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0a1628]/10 bg-[#faf7f0]/30 py-16 text-center"
              >
                <div className="mb-4 rounded-full bg-[#0a1628]/5 p-4 text-[#0a1628]/40">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-[#0a1628]">
                  No comments found
                </h3>
                <p className="text-[#0a1628]/50">
                  {hiddenOnly
                    ? "No hidden comments available"
                    : "Try adjusting filters"}
                </p>
              </motion.div>
            ) : (
              commentsData.comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  variants={item}
                  className={`group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md ${
                    comment.hiddenAt
                      ? "border-[#D4AF37]/30 bg-[#faf7f0]/50"
                      : "border-[#0a1628]/5"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#faf7f0]">
                          <span className="text-sm font-bold text-[#0a1628]">
                            {comment.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-[#0a1628]">
                            {comment.authorName}
                          </h3>
                          <span className="flex items-center gap-1 text-xs text-[#0a1628]/40">
                            <Clock size={10} />
                            {format(
                              new Date(comment.createdAt),
                              "d MMM yyyy, HH:mm",
                              { locale: ar },
                            )}
                          </span>
                        </div>
                        {comment.hiddenAt && (
                          <span className="ml-2 rounded-full bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-[#0a1628]/80">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:self-center">
                      {comment.hiddenAt ? (
                        <button
                          onClick={() =>
                            unhideCommentMutation.mutate({
                              commentId: comment.id,
                            })
                          }
                          disabled={unhideCommentMutation.isPending}
                          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <Eye size={14} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const reason = prompt("Hide reason:");
                            if (reason) {
                              hideCommentMutation.mutate({
                                commentId: comment.id,
                                reason,
                              });
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/20 bg-[#faf7f0] px-4 py-2 text-xs font-medium text-[#0a1628] transition-colors hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10"
                        >
                          <EyeOff size={14} />
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete comment permanently?")) {
                            deleteCommentMutation.mutate({
                              commentId: comment.id,
                              reason: "Deleted by admin",
                            });
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
