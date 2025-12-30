
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { comments } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        content: z.string().min(1),
        parentId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(comments).values({
        postId: input.postId,
        authorId: ctx.session.user.id,
        content: input.content,
        parentId: input.parentId,
      });
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
            }
          },
          reactions: true,
        },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      });
      return allComments;
    }),

  edit: protectedProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingComment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (!existingComment || existingComment.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db
        .update(comments)
        .set({ content: input.content })
        .where(eq(comments.id, input.commentId));
    }),

  delete: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingComment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
      });

      if (!existingComment || existingComment.authorId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));
    }),
});
