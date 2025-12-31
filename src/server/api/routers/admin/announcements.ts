import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { notifications, users, adminAuditLog } from "~/server/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminAnnouncementsRouter = createTRPCRouter({
  broadcast: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(1000),
        type: z
          .enum(["announcement", "alert", "maintenance"])
          .default("announcement"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const allUsers = await ctx.db.select({ id: users.id }).from(users);

      if (allUsers.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No users found" });
      }

      const notificationData = allUsers.map((user) => ({
        recipientId: user.id,
        actorId: ctx.session.user.id,
        type: "post_reaction" as const,
        message: input.message,
      }));

      await ctx.db.insert(notifications).values(
        notificationData.map((n) => ({
          recipientId: n.recipientId,
          actorId: n.actorId,
          type: n.type,
          details: JSON.stringify({
            title: input.title,
            message: input.message,
            announcementType: input.type,
          }),
        })),
      );

      const [auditLog] = await ctx.db
        .insert(adminAuditLog)
        .values({
          actorId: ctx.session.user.id,
          actionType: "broadcast_announcement",
          targetType: "announcement",
          targetId: crypto.randomUUID(),
          reason: `Broadcast: ${input.title}`,
          metadata: {
            title: input.title,
            message: input.message,
            type: input.type,
            recipientCount: allUsers.length,
          },
        })
        .returning();

      return {
        success: true,
        recipientCount: allUsers.length,
        announcementId: auditLog?.id,
      };
    }),

  getRecentAnnouncements: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db
        .select({
          id: adminAuditLog.id,
          actionType: adminAuditLog.actionType,
          reason: adminAuditLog.reason,
          metadata: adminAuditLog.metadata,
          createdAt: adminAuditLog.createdAt,
        })
        .from(adminAuditLog)
        .where(eq(adminAuditLog.actionType, "broadcast_announcement"))
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(input.limit);

      return logs;
    }),
});
