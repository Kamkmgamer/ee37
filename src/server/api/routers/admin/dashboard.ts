import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  users,
  socialPosts,
  comments,
  reports,
  userRestrictions,
} from "~/server/db/schema";
import { eq, sql, gte } from "drizzle-orm";

export const adminDashboardRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalUsers,
      newUsers7d,
      totalPosts,
      newPosts24h,
      totalComments,
      newComments24h,
      pendingReports,
      activeBans,
    ] = await Promise.all([
      ctx.db.select({ count: sql<number>`count(*)::int` }).from(users),
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(gte(users.createdAt, sevenDaysAgo)),
      ctx.db.select({ count: sql<number>`count(*)::int` }).from(socialPosts),
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(socialPosts)
        .where(gte(socialPosts.createdAt, yesterday)),
      ctx.db.select({ count: sql<number>`count(*)::int` }).from(comments),
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(comments)
        .where(gte(comments.createdAt, yesterday)),
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(reports)
        .where(eq(reports.status, "pending")),
      ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(userRestrictions)
        .where(eq(userRestrictions.type, "ban")),
    ]);

    return {
      totalUsers: totalUsers[0]?.count ?? 0,
      newUsers7d: newUsers7d[0]?.count ?? 0,
      totalPosts: totalPosts[0]?.count ?? 0,
      newPosts24h: newPosts24h[0]?.count ?? 0,
      totalComments: totalComments[0]?.count ?? 0,
      newComments24h: newComments24h[0]?.count ?? 0,
      pendingReports: pendingReports[0]?.count ?? 0,
      activeBans: activeBans[0]?.count ?? 0,
    };
  }),
});
