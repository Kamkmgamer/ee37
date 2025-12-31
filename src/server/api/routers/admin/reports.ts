import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  reports,
  adminAuditLog,
  users,
  socialPosts,
  comments,
} from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminReportsRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "resolved", "dismissed"]).optional(),
        targetType: z.enum(["post", "comment", "user"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = and(
        input.status ? eq(reports.status, input.status) : undefined,
        input.targetType ? eq(reports.targetType, input.targetType) : undefined,
      );

      const reportsResult = await ctx.db
        .select({
          id: reports.id,
          targetType: reports.targetType,
          targetId: reports.targetId,
          reason: reports.reason,
          status: reports.status,
          details: reports.details,
          createdAt: reports.createdAt,
          reporterId: reports.reporterId,
          reporterName: users.name,
          resolvedBy: reports.resolvedBy,
          resolvedAt: reports.resolvedAt,
          resolutionNote: reports.resolutionNote,
          actionTaken: reports.actionTaken,
        })
        .from(reports)
        .leftJoin(users, eq(reports.reporterId, users.id))
        .where(conditions)
        .orderBy(desc(reports.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = reportsResult.length > input.limit;
      const reportList = hasNextPage
        ? reportsResult.slice(0, -1)
        : reportsResult;
      const nextCursor = hasNextPage
        ? reportList[reportList.length - 1]?.id
        : undefined;

      return { reports: reportList, nextCursor };
    }),

  getById: adminProcedure
    .input(z.object({ reportId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const report = await ctx.db.query.reports.findFirst({
        where: eq(reports.id, input.reportId),
        with: {
          reporter: {
            columns: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      let targetContent = null;
      if (report.targetType === "post") {
        targetContent = await ctx.db.query.socialPosts.findFirst({
          where: eq(socialPosts.id, report.targetId),
          with: {
            author: {
              columns: {
                name: true,
              },
            },
          },
        });
      } else if (report.targetType === "comment") {
        targetContent = await ctx.db.query.comments.findFirst({
          where: eq(comments.id, report.targetId),
          with: {
            author: {
              columns: {
                name: true,
              },
            },
          },
        });
      }

      const relatedReports = await ctx.db
        .select({
          id: reports.id,
          reason: reports.reason,
          status: reports.status,
          createdAt: reports.createdAt,
        })
        .from(reports)
        .where(
          and(
            eq(reports.targetType, report.targetType),
            eq(reports.targetId, report.targetId),
            sql`${reports.id} != ${input.reportId}`,
          ),
        )
        .orderBy(desc(reports.createdAt))
        .limit(10);

      return { report, targetContent, relatedReports };
    }),

  resolve: adminProcedure
    .input(
      z.object({
        reportId: z.string().uuid(),
        status: z.enum(["resolved", "dismissed"]),
        resolutionNote: z.string().optional(),
        actionTaken: z
          .enum([
            "resolved",
            "dismissed",
            "content_hidden",
            "content_deleted",
            "user_warned",
            "user_banned",
            "user_muted",
          ])
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const report = await ctx.db.query.reports.findFirst({
        where: eq(reports.id, input.reportId),
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      await ctx.db
        .update(reports)
        .set({
          status: input.status,
          resolvedBy: ctx.session.user.id,
          resolvedAt: new Date(),
          resolutionNote: input.resolutionNote,
          actionTaken: input.actionTaken,
        })
        .where(eq(reports.id, input.reportId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: `resolve_report_${input.status}`,
        targetType: "report",
        targetId: input.reportId,
        reason: input.resolutionNote ?? `Report ${input.status}`,
        metadata: {
          reportTargetType: report.targetType,
          reportTargetId: report.targetId,
          actionTaken: input.actionTaken,
        },
      });

      return { success: true };
    }),

  getStats: adminProcedure.query(async ({ ctx }) => {
    const pending = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "pending"));

    const resolved = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "resolved"));

    const dismissed = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(reports)
      .where(eq(reports.status, "dismissed"));

    return {
      pending: pending[0]?.count ?? 0,
      resolved: resolved[0]?.count ?? 0,
      dismissed: dismissed[0]?.count ?? 0,
      total:
        (pending[0]?.count ?? 0) +
        (resolved[0]?.count ?? 0) +
        (dismissed[0]?.count ?? 0),
    };
  }),
});
