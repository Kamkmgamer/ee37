"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "~/trpc/react";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  autoFocus?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  autoFocus,
}: CommentFormProps) {
  const [content, setContent] = useState("");

  const ctx = api.useUtils();
  const createComment = api.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      onSuccess?.();
      void ctx.comments.getByPostId.invalidate({ postId });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment.mutate({
      postId,
      content,
      parentId,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group relative flex w-full items-start gap-2"
    >
      <div className="relative flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "اكتب ردك..." : "اكتب تعليقاً..."}
          className="focus:ring-gold/50 min-h-[46px] w-full resize-none rounded-2xl bg-gray-50 p-3 pr-4 pl-12 text-right text-sm transition-all focus:ring-2 focus:outline-none"
          rows={1}
          style={{
            height:
              Math.max(
                46,
                Math.min(200, content.split("\n").length * 24 + 24),
              ) + "px",
          }}
          autoFocus={autoFocus}
        />
        <button
          type="submit"
          disabled={createComment.isPending || !content.trim()}
          className="bg-gold absolute bottom-1.5 left-1.5 rounded-xl p-2 text-white transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
        >
          <Send
            size={16}
            className={createComment.isPending ? "animate-pulse" : "ml-0.5"}
          />
        </button>
      </div>
    </form>
  );
}
