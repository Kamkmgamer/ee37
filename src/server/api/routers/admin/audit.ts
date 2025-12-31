import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { adminAuditLog, users, userProfiles } from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const adminAuditRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z.object({
        actorId: z.string().uuid().optional(),
        actionType: z.string().optional(),
        targetType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = and(
        input.actorId ? eq(adminAuditLog.actorId, input.actorId) : undefined,
        input.actionType
          ? eq(adminAuditLog.actionType, input.actionType)
          : undefined,
        input.targetType
          ? eq(adminAuditLog.targetType, input.targetType)
          : undefined,
        input.startDate
          ? sql`${adminAuditLog.createdAt} >= ${input.startDate}`
          : undefined,
        input.endDate
          ? sql`${adminAuditLog.createdAt} <= ${input.endDate}`
          : undefined,
      );

      const logsResult = await ctx.db
        .select({
          id: adminAuditLog.id,
          actorId: adminAuditLog.actorId,
          actorName: users.name,
          actorAvatar: userProfiles.avatarUrl,
          actionType: adminAuditLog.actionType,
          targetType: adminAuditLog.targetType,
          targetId: adminAuditLog.targetId,
          reason: adminAuditLog.reason,
          metadata: adminAuditLog.metadata,
          createdAt: adminAuditLog.createdAt,
        })
        .from(adminAuditLog)
        .leftJoin(users, eq(adminAuditLog.actorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = logsResult.length > input.limit;
      const logs = hasNextPage ? logsResult.slice(0, -1) : logsResult;
      const nextCursor = hasNextPage ? logs[logs.length - 1]?.id : undefined;

      return { logs, nextCursor };
    }),

  getById: adminProcedure
    .input(z.object({ logId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const log = await ctx.db.query.adminAuditLog.findFirst({
        where: eq(adminAuditLog.id, input.logId),
        with: {
          actor: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      });

      return log;
    }),

  getActionTypes: adminProcedure.query(async ({ ctx }) => {
    const types = await ctx.db
      .select({ actionType: adminAuditLog.actionType })
      .from(adminAuditLog)
      .groupBy(adminAuditLog.actionType)
      .orderBy(adminAuditLog.actionType);

    return types.map((t) => t.actionType);
  }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminAuditLog)
      .where(sql`${adminAuditLog.createdAt} >= ${today}`);

    const weekCount = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminAuditLog)
      .where(
        sql`${adminAuditLog.createdAt} >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`,
      );

    const topActions = await ctx.db
      .select({
        actionType: adminAuditLog.actionType,
        count: sql<number>`count(*)::int`,
      })
      .from(adminAuditLog)
      .groupBy(adminAuditLog.actionType)
      .orderBy(sql`count(*)::int desc`)
      .limit(5);

    return {
      today: todayCount[0]?.count ?? 0,
      thisWeek: weekCount[0]?.count ?? 0,
      topActions,
    };
  }),
});
