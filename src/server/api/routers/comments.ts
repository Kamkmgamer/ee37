import { z } from "zod";
import {
  createTRPCRouter,
  unmutedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { comments, notifications, socialPosts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  create: unmutedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        content: z.string().min(1),
        parentId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newComment] = await ctx.db
        .insert(comments)
        .values({
          postId: input.postId,
          authorId: ctx.session.user.id,
          content: input.content,
          parentId: input.parentId,
        })
        .returning();

      // Notifications Logic
      const post = await ctx.db.query.socialPosts.findFirst({
        where: eq(socialPosts.id, input.postId),
        columns: { authorId: true },
      });

      if (!post) return;

      const notificationsMap = new Map<
        string,
        "new_comment" | "comment_reply"
      >();

      // 1. Potential notification for post author
      if (post.authorId !== ctx.session.user.id) {
        notificationsMap.set(post.authorId, "new_comment");
      }

      // 2. Potential notification for parent comment author
      if (input.parentId) {
        const parentComment = await ctx.db.query.comments.findFirst({
          where: eq(comments.id, input.parentId),
          columns: { authorId: true },
        });

        if (parentComment && parentComment.authorId !== ctx.session.user.id) {
          notificationsMap.set(parentComment.authorId, "comment_reply");
        }
      }

      // 3. Create notifications
      const notificationPromises = Array.from(notificationsMap.entries()).map(
        ([recipientId, type]) => {
          return ctx.db.insert(notifications).values({
            recipientId,
            actorId: ctx.session.user.id,
            type,
            postId: input.postId,
            commentId: newComment?.id,
          });
        },
      );

      await Promise.all(notificationPromises);
    }),

  getByPostId: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const allComments = await ctx.db.query.comments.findMany({
        where: eq(comments.postId, input.postId),
        with: {
          author: {
            with: {
              profile: true,
            },
          },
          reactions: true,
        },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      });
      return allComments;
    }),

  edit: unmutedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingComment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (
        !existingComment ||
        existingComment.authorId !== ctx.session.user.id
      ) {
        throw new Error("Unauthorized");
      }

      await ctx.db
        .update(comments)
        .set({ content: input.content })
        .where(eq(comments.id, input.commentId));
    }),

  delete: unmutedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingComment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (
        !existingComment ||
        existingComment.authorId !== ctx.session.user.id
      ) {
        throw new Error("Unauthorized");
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));
    }),
});
