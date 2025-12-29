
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
});
