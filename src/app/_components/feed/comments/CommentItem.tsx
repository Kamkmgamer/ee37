"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommentForm } from "./CommentForm";

import { ReactionBar } from "../ReactionBar";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
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
      reactionsObj[r.reactionType] = (reactionsObj[r.reactionType] || 0) + 1;
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
        <div className="rounded-2xl bg-gray-50/80 p-3 px-4 transition-colors hover:bg-gray-50">
          <div className="mb-1 flex items-center justify-between gap-4">
            <Link
              href={`/profile/${comment.author.id}`}
              className="text-midnight hover:text-gold truncate text-sm font-semibold transition-colors"
            >
              {comment.author.name}
            </Link>
          </div>
          <p className="text-midnight/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4 px-4">
          <span className="text-midnight/40 text-[10px]">{timeAgo}</span>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-midnight/60 hover:text-gold cursor-pointer text-[11px] font-medium transition-colors"
          >
            رد
          </button>
          <div className="origin-right scale-75">
            <ReactionBar
              targetId={comment.id}
              type="comment"
              userId={currentUserId}
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
          <div className="mt-3 mr-3 space-y-4 border-r-2 border-gray-100 pr-3">
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
