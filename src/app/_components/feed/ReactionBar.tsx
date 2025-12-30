"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTION_ICONS, type ReactionType } from "../icons/ReactionIcons";
import { api } from "~/trpc/react";

interface ReactionBarProps {
  targetId: string;
  type: "post" | "comment";
  userId: string;
  initialReactions: Record<string, number>;
  userReaction?: string | null;
}

export function ReactionBar({
  targetId,
  type,
  userId,
  initialReactions,
  userReaction: initialUserReaction,
}: ReactionBarProps) {
  /* ... existing imports ... */

  const [reactions, setReactions] = useState<Record<string, number>>(
    initialReactions ?? {
      like: 0,
      dislike: 0,
      heart: 0,
      angry: 0,
      laugh: 0,
      wow: 0,
      sad: 0,
    },
  );
  const [userReaction, setUserReaction] = useState<string | null>(
    initialUserReaction ?? null,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with props when they change (e.g. from polling)
  useEffect(() => {
    if (initialReactions) {
      setReactions(initialReactions);
    }
  }, [initialReactions]);

  useEffect(() => {
    if (initialUserReaction !== undefined) {
      setUserReaction(initialUserReaction);
    }
  }, [initialUserReaction]);

  const addPostReaction = api.reactions.addReaction.useMutation();
  const removePostReaction = api.reactions.removeReaction.useMutation();
  const addCommentReaction = api.reactions.addCommentReaction.useMutation();
  const removeCommentReaction =
    api.reactions.removeCommentReaction.useMutation();

  const handleReaction = useCallback(
    async (reactionType: ReactionType) => {
      if (userReaction === reactionType) {
        // Remove reaction
        setReactions((prev) => ({
          ...prev,
          [reactionType]: Math.max(0, (prev[reactionType] ?? 0) - 1),
        }));
        setUserReaction(null);

        if (type === "post") {
          await removePostReaction.mutateAsync({ postId: targetId, userId });
        } else {
          await removeCommentReaction.mutateAsync({
            commentId: targetId,
            userId,
          });
        }
      } else {
        // Add or change reaction
        if (userReaction) {
          setReactions((prev) => ({
            ...prev,
            [userReaction]: Math.max(0, (prev[userReaction] ?? 0) - 1),
          }));
        }
        setReactions((prev) => ({
          ...prev,
          [reactionType]: (prev[reactionType] ?? 0) + 1,
        }));
        setUserReaction(reactionType);

        if (type === "post") {
          await addPostReaction.mutateAsync({
            postId: targetId,
            userId,
            reactionType,
          });
        } else {
          await addCommentReaction.mutateAsync({
            commentId: targetId,
            userId,
            reactionType,
          });
        }
      }
    },
    [
      userReaction,
      targetId,
      userId,
      type,
      addPostReaction,
      removePostReaction,
      addCommentReaction,
      removeCommentReaction,
    ],
  );

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  const popularReaction = Object.entries(reactions).reduce(
    (max, [type, count]) => (count > max.count ? { type, count } : max),
    { type: "like", count: 0 },
  );
  const PopularIcon =
    REACTION_ICONS[popularReaction.type as ReactionType]?.Icon;

  return (
    <div className="relative">
      {/* Compact view - click to expand */}
      <motion.button
        className="text-midnight/70 hover:text-midnight border-midnight/5 flex items-center gap-2 rounded-xl border bg-gray-50/80 px-4 py-2 shadow-sm transition-all hover:bg-white hover:shadow-md"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {PopularIcon && totalReactions > 0 && (
          <PopularIcon
            size={20}
            className={
              REACTION_ICONS[popularReaction.type as ReactionType].color
            }
            filled
          />
        )}
        <span className="text-midnight text-sm font-medium">
          {totalReactions > 0 ? totalReactions : "تفاعل"}
        </span>
      </motion.button>

      {/* Expanded reaction picker */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full right-0 z-50 mt-2 flex w-[280px] flex-wrap justify-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lg backdrop-blur-sm sm:right-auto sm:left-1/2 sm:w-auto sm:-translate-x-1/2 sm:flex-nowrap sm:gap-1"
          >
            {(
              Object.entries(REACTION_ICONS) as [
                ReactionType,
                (typeof REACTION_ICONS)[ReactionType],
              ][]
            ).map(([type, { Icon, label, color }]) => (
              <motion.button
                key={type}
                onClick={() => {
                  void handleReaction(type);
                  setIsExpanded(false);
                }}
                className={`group relative flex flex-col items-center rounded-xl p-2 transition-colors ${
                  userReaction === type ? "bg-gold/20" : "hover:bg-gray-100"
                }`}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  size={24}
                  className={`${color} transition-transform`}
                  filled={userReaction === type}
                />
                <span className="text-midnight/60 mt-1 text-xs">
                  {reactions[type] ?? 0}
                </span>
                {/* Tooltip */}
                <span className="bg-midnight absolute -top-8 right-1/2 translate-x-1/2 rounded-lg px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
