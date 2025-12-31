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
  Filter,
} from "lucide-react";

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

  const refetch = activeTab === "posts" ? refetchPosts : refetchComments;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="mt-1 text-gray-500">Moderate posts and comments</p>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("posts")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "posts"
                ? "bg-midnight text-white"
                : "border bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="ml-2 inline h-4 w-4" />
            Posts
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "comments"
                ? "bg-midnight text-white"
                : "border bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <MessageSquare className="ml-2 inline h-4 w-4" />
            Comments
          </button>
        </div>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hiddenOnly}
            onChange={(e) => setHiddenOnly(e.target.checked)}
            className="rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
          />
          <span className="text-sm text-gray-600">Hidden only</span>
        </label>
      </div>

      <div className="space-y-4">
        {activeTab === "posts" && (
          <>
            {!postsData?.posts || postsData.posts.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No posts found
                </h3>
              </div>
            ) : (
              postsData.posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-xl bg-white p-6 shadow-sm ${
                    post.hiddenAt ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {post.authorName}
                        </span>
                        {post.hiddenAt && (
                          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{post.content}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {format(new Date(post.createdAt), "d MMMM yyyy HH:mm", {
                          locale: ar,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {post.hiddenAt ? (
                        <button
                          onClick={() =>
                            unhidePostMutation.mutate({ postId: post.id })
                          }
                          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600"
                        >
                          <Eye size={16} />
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
                          className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-600"
                        >
                          <EyeOff size={16} />
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
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "comments" && (
          <>
            {!commentsData?.comments || commentsData.comments.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No comments found
                </h3>
              </div>
            ) : (
              commentsData.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-xl bg-white p-6 shadow-sm ${
                    comment.hiddenAt ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.authorName}
                        </span>
                        {comment.hiddenAt && (
                          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {format(
                          new Date(comment.createdAt),
                          "d MMMM yyyy HH:mm",
                          { locale: ar },
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {comment.hiddenAt ? (
                        <button
                          onClick={() =>
                            unhideCommentMutation.mutate({
                              commentId: comment.id,
                            })
                          }
                          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600"
                        >
                          <Eye size={16} />
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
                          className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-600"
                        >
                          <EyeOff size={16} />
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
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
