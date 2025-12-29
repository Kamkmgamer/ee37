import { postReactions, commentReactions } from "~/server/db/schema";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const reactionTypeSchema = z.enum([
  "like",
  "dislike",
  "heart",
  "angry",
  "laugh",
  "wow",
  "sad",
]);

export const reactionsRouter = createTRPCRouter({
  // Add or update a reaction to a post
  addReaction: publicProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        userId: z.string().uuid(),
        reactionType: reactionTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert reaction (one reaction per user per post)
      await ctx.db
        .insert(postReactions)
        .values({
          postId: input.postId,
          userId: input.userId,
          reactionType: input.reactionType,
        })
        .onConflictDoUpdate({
          target: [postReactions.postId, postReactions.userId],
          set: {
            reactionType: input.reactionType,
          },
        });

      return { success: true };
    }),

  // Remove a reaction from a post
  removeReaction: publicProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(postReactions)
        .where(
          and(
            eq(postReactions.postId, input.postId),
            eq(postReactions.userId, input.userId),
          ),
        );

      return { success: true };
    }),

  // Add or update a reaction to a comment
  addCommentReaction: publicProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        userId: z.string().uuid(),
        reactionType: reactionTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Upsert reaction (one reaction per user per comment)
      await ctx.db
        .insert(commentReactions)
        .values({
          commentId: input.commentId,
          userId: input.userId,
          reactionType: input.reactionType,
        })
        .onConflictDoUpdate({
          target: [commentReactions.commentId, commentReactions.userId],
          set: {
            reactionType: input.reactionType,
          },
        });

      return { success: true };
    }),

  // Remove a reaction from a comment
  removeCommentReaction: publicProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, input.commentId),
            eq(commentReactions.userId, input.userId),
          ),
        );

      return { success: true };
    }),

  // Get reaction counts for a post
  getReactionsByPost: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const counts = await ctx.db
        .select({
          reactionType: postReactions.reactionType,
          count: sql<number>`count(*)::int`,
        })
        .from(postReactions)
        .where(eq(postReactions.postId, input.postId))
        .groupBy(postReactions.reactionType);

      // Transform to object for easier access
      const result: Record<string, number> = {
        like: 0,
        dislike: 0,
        heart: 0,
        angry: 0,
        laugh: 0,
        wow: 0,
        sad: 0,
      };

      for (const { reactionType, count } of counts) {
        result[reactionType] = count;
      }

      return result;
    }),

  // Get user's reaction on a specific post
  getUserReaction: publicProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [reaction] = await ctx.db
        .select({ reactionType: postReactions.reactionType })
        .from(postReactions)
        .where(
          and(
            eq(postReactions.postId, input.postId),
            eq(postReactions.userId, input.userId),
          ),
        )
        .limit(1);

      return reaction?.reactionType ?? null;
    }),

  // Get all user reactions for multiple posts (optimized for feed)
  getUserReactionsForPosts: publicProcedure
    .input(
      z.object({
        postIds: z.array(z.string().uuid()),
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.postIds.length === 0) return {};

      const reactions = await ctx.db
        .select({
          postId: postReactions.postId,
          reactionType: postReactions.reactionType,
        })
        .from(postReactions)
        .where(
          and(
            sql`${postReactions.postId} IN ${input.postIds}`,
            eq(postReactions.userId, input.userId),
          ),
        );

      // Transform to object for easier access
      const result: Record<string, string> = {};
      for (const { postId, reactionType } of reactions) {
        result[postId] = reactionType;
      }

      return result;
    }),
});
