"use client";

import { useMemo } from "react";
import { api } from "~/trpc/react";
import { CommentForm } from "./CommentForm";
import { CommentItem, type Comment } from "./CommentItem";
import { Loader2, MessageCircle } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  currentUserId: string;
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const { data: comments, isLoading } = api.comments.getByPostId.useQuery(
    {
      postId,
    },
    {
      refetchInterval: 3000,
    },
  );

  const commentTree = useMemo(() => {
    if (!comments) return [];

    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    // Initialize map
    comments.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });

    // Link children
    comments.forEach((c) => {
      const node = map.get(c.id);
      if (!node) return;

      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl bg-gray-50/50 p-8">
        <Loader2 className="text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-1 pt-2">
      <div className="mb-6">
        <CommentForm postId={postId} />
      </div>

      <div className="space-y-6">
        {commentTree.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            <MessageCircle className="mx-auto mb-2 opacity-20" size={32} />
            <p>كن أول من يعلق!</p>
          </div>
        ) : (
          commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
