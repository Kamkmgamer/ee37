"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PostCard } from "../_components/feed/PostCard";
import { api } from "~/trpc/react";

import { type RouterOutputs } from "~/trpc/react";

type Post = RouterOutputs["feed"]["getPosts"]["posts"][number];

interface FeedClientProps {
  initialPosts: Post[];
  initialNextCursor?: string;
  initialUserReactions: Record<string, string>;
  currentUserId: string;
}

export function FeedClient({
  initialPosts,
  initialNextCursor,
  initialUserReactions,
  currentUserId,
}: FeedClientProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.feed.getPosts.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialData: {
          pages: [
            {
              posts: initialPosts,
              nextCursor: initialNextCursor,
            },
          ],
          pageParams: [undefined],
        },
        refetchInterval: 3000, // Poll every 3 seconds for new posts/reactions
      },
    );

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );

  // Collect all post IDs to fetch user reactions
  const allPostIds = useMemo(() => posts.map((p) => p.id), [posts]);

  // Poll for user reactions for ALL visible posts
  const { data: userReactionsData } =
    api.reactions.getUserReactionsForPosts.useQuery(
      { postIds: allPostIds, userId: currentUserId },
      {
        refetchInterval: 3000,
        enabled: allPostIds.length > 0,
        placeholderData: (prev) => prev,
      },
    );

  // Merge initial and fetched user reactions
  const userReactions = useMemo(
    () => ({
      ...initialUserReactions,
      ...userReactionsData,
    }),
    [initialUserReactions, userReactionsData],
  );

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, fetchNextPage]);

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="elegant-card rounded-2xl p-12 text-center"
      >
        <p className="text-midnight/60 text-lg">لا توجد منشورات بعد</p>
        <p className="text-midnight/40 mt-2">كن أول من ينشر!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            userReaction={userReactions[post.id]}
          />
        ))}
      </AnimatePresence>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <Loader2 className="text-gold h-6 w-6 animate-spin" />
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-midnight/40 text-center">
            تم تحميل جميع المنشورات
          </p>
        )}
      </div>
    </div>
  );
}
