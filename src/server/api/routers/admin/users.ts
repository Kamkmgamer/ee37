import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  users,
  userProfiles,
  userRestrictions,
  reports,
  adminAuditLog,
} from "~/server/db/schema";
import { eq, desc, like, or, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminUsersRouter = createTRPCRouter({
  search: adminProcedure
    .input(
      z.object({
        query: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = input.query
        ? or(
            like(users.name, `%${input.query}%`),
            like(users.email, `%${input.query}%`),
            like(users.collegeId, `%${input.query}%`),
          )
        : undefined;

      // Build the base query and only apply WHERE when we actually have conditions.
      const baseQuery = ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          collegeId: users.collegeId,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
          avatarUrl: userProfiles.avatarUrl,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId));

      const userList = await (conditions
        ? baseQuery.where(conditions)
        : baseQuery)
        .orderBy(desc(users.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = userList.length > input.limit;
      const usersResult = hasNextPage ? userList.slice(0, -1) : userList;
      const nextCursor = hasNextPage
        ? usersResult[usersResult.length - 1]?.id
        : undefined;

      // Fetch restrictions for the fetched users
      const userIds = usersResult.map((u) => u.id);
      
      let restrictionsMap: Record<string, typeof userRestrictions.$inferSelect[]> = {};
      
      if (userIds.length > 0) {
        const restrictions = await ctx.db
          .select()
          .from(userRestrictions)
          .where(inArray(userRestrictions.userId, userIds))
          .orderBy(desc(userRestrictions.createdAt));

        restrictionsMap = restrictions.reduce((acc, r) => {
          acc[r.userId] ??= [];
          acc[r.userId]!.push(r);
          return acc;
        }, {} as Record<string, typeof userRestrictions.$inferSelect[]>);
      }

      const formattedUsers = usersResult.map((user) => ({
        ...user,
        restrictions: restrictionsMap[user.id] ?? [],
      }));

      return { users: formattedUsers, nextCursor };
    }),

  getById: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        with: {
          profile: true,
          restrictions: {
            orderBy: (r, { desc }) => [desc(r.createdAt)],
          },
          filedReports: {
            limit: 5,
            orderBy: (r, { desc }) => [desc(r.createdAt)],
          },
          posts: {
            limit: 5,
            orderBy: (p, { desc }) => [desc(p.createdAt)],
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const reportCount = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(reports)
        .where(eq(reports.targetId, input.userId));

      return { ...user, reportCount: reportCount[0]?.count ?? 0 };
    }),

  ban: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        reason: z.string().min(1),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [restriction] = await ctx.db
        .insert(userRestrictions)
        .values({
          userId: input.userId,
          type: "ban",
          reason: input.reason,
          createdBy: ctx.session.user.id,
          expiresAt: input.expiresAt ?? null,
        })
        .returning();

      if (!restriction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create restriction",
        });
      }

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "ban_user",
        targetType: "user",
        targetId: input.userId,
        reason: input.reason,
        metadata: { expiresAt: input.expiresAt, restrictionId: restriction.id },
      });

      return { success: true, restriction };
    }),

  unban: adminProcedure
    .input(z.object({ restrictionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const restriction = await ctx.db.query.userRestrictions.findFirst({
        where: eq(userRestrictions.id, input.restrictionId),
      });

      if (!restriction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restriction not found",
        });
      }

      await ctx.db
        .delete(userRestrictions)
        .where(eq(userRestrictions.id, input.restrictionId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "unban_user",
        targetType: "user",
        targetId: restriction.userId,
        reason: "Manual unban by admin",
        metadata: { restrictionId: input.restrictionId },
      });

      return { success: true };
    }),

  mute: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        reason: z.string().min(1),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [restriction] = await ctx.db
        .insert(userRestrictions)
        .values({
          userId: input.userId,
          type: "mute",
          reason: input.reason,
          createdBy: ctx.session.user.id,
          expiresAt: input.expiresAt ?? null,
        })
        .returning();

      if (!restriction) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create restriction",
        });
      }

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "mute_user",
        targetType: "user",
        targetId: input.userId,
        reason: input.reason,
        metadata: { expiresAt: input.expiresAt, restrictionId: restriction.id },
      });

      return { success: true, restriction };
    }),

  setAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        isAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ isAdmin: input.isAdmin })
        .where(eq(users.id, input.userId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: input.isAdmin ? "promote_admin" : "demote_admin",
        targetType: "user",
        targetId: input.userId,
        reason: `Admin status changed to ${input.isAdmin}`,
      });

      return { success: true };
    }),
});
