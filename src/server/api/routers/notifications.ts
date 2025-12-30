import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { notifications } from "~/server/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const notificationsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      // Refine this later
      const items = await ctx.db.query.notifications.findMany({
        where: eq(notifications.recipientId, ctx.session.user.id),
        orderBy: [desc(notifications.createdAt)],
        limit: limit + 1,
        with: {
          actor: {
            columns: {
              id: true,
              name: true,
            },
            with: {
              profile: {
                columns: {
                  avatarUrl: true,
                }
              }
            }
          },
          post: {
             columns: {
               id: true,
               content: true,
             }
          },
          comment: {
            columns: {
              id: true,
              content: true,
            }
          }
        },
      });

      return items;
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, ctx.session.user.id),
          eq(notifications.isRead, false)
        )
      );
    return result[0]?.count ?? 0;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.recipientId, ctx.session.user.id)
          )
        );
      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.recipientId, ctx.session.user.id));
    return { success: true };
  }),
});
