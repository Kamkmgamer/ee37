import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  socialPosts,
  comments,
  adminAuditLog,
  users,
  userProfiles,
} from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminContentRouter = createTRPCRouter({
  listPosts: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
        hiddenOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = input.hiddenOnly
        ? sql`${socialPosts.hiddenAt} IS NOT NULL`
        : undefined;

      const postsResult = await ctx.db
        .select({
          id: socialPosts.id,
          content: socialPosts.content,
          createdAt: socialPosts.createdAt,
          updatedAt: socialPosts.updatedAt,
          authorId: socialPosts.authorId,
          authorName: users.name,
          authorAvatar: userProfiles.avatarUrl,
          hiddenAt: socialPosts.hiddenAt,
          hiddenReason: socialPosts.hiddenReason,
        })
        .from(socialPosts)
        .innerJoin(users, eq(socialPosts.authorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(socialPosts.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = postsResult.length > input.limit;
      const posts = hasNextPage ? postsResult.slice(0, -1) : postsResult;
      const nextCursor = hasNextPage ? posts[posts.length - 1]?.id : undefined;

      return { posts, nextCursor };
    }),

  listComments: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
        hiddenOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = input.hiddenOnly
        ? sql`${comments.hiddenAt} IS NOT NULL`
        : undefined;

      const commentsResult = await ctx.db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          updatedAt: comments.updatedAt,
          postId: comments.postId,
          authorId: comments.authorId,
          authorName: users.name,
          authorAvatar: userProfiles.avatarUrl,
          hiddenAt: comments.hiddenAt,
          hiddenReason: comments.hiddenReason,
        })
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(comments.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = commentsResult.length > input.limit;
      const commentList = hasNextPage
        ? commentsResult.slice(0, -1)
        : commentsResult;
      const nextCursor = hasNextPage
        ? commentList[commentList.length - 1]?.id
        : undefined;

      return { comments: commentList, nextCursor };
    }),

  hidePost: adminProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.socialPosts.findFirst({
        where: eq(socialPosts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await ctx.db
        .update(socialPosts)
        .set({
          hiddenAt: new Date(),
          hiddenBy: ctx.session.user.id,
          hiddenReason: input.reason,
        })
        .where(eq(socialPosts.id, input.postId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "hide_post",
        targetType: "post",
        targetId: input.postId,
        reason: input.reason,
        metadata: { content: post.content?.slice(0, 100) },
      });

      return { success: true };
    }),

  unhidePost: adminProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(socialPosts)
        .set({
          hiddenAt: null,
          hiddenBy: null,
          hiddenReason: null,
        })
        .where(eq(socialPosts.id, input.postId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "unhide_post",
        targetType: "post",
        targetId: input.postId,
        reason: "Content restored by admin",
      });

      return { success: true };
    }),

  deletePost: adminProcedure
    .input(z.object({ postId: z.string().uuid(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.query.socialPosts.findFirst({
        where: eq(socialPosts.id, input.postId),
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      await ctx.db.delete(socialPosts).where(eq(socialPosts.id, input.postId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "delete_post",
        targetType: "post",
        targetId: input.postId,
        reason: input.reason,
        metadata: { content: post.content?.slice(0, 100) },
      });

      return { success: true };
    }),

  hideComment: adminProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      await ctx.db
        .update(comments)
        .set({
          hiddenAt: new Date(),
          hiddenBy: ctx.session.user.id,
          hiddenReason: input.reason,
        })
        .where(eq(comments.id, input.commentId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "hide_comment",
        targetType: "comment",
        targetId: input.commentId,
        reason: input.reason,
        metadata: { content: comment.content?.slice(0, 100) },
      });

      return { success: true };
    }),

  unhideComment: adminProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(comments)
        .set({
          hiddenAt: null,
          hiddenBy: null,
          hiddenReason: null,
        })
        .where(eq(comments.id, input.commentId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "unhide_comment",
        targetType: "comment",
        targetId: input.commentId,
        reason: "Content restored by admin",
      });

      return { success: true };
    }),

  deleteComment: adminProcedure
    .input(
      z.object({ commentId: z.string().uuid(), reason: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "delete_comment",
        targetType: "comment",
        targetId: input.commentId,
        reason: input.reason,
        metadata: { content: comment.content?.slice(0, 100) },
      });

      return { success: true };
    }),
});
