import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { reports, reportReasonEnum, reportTargetTypeEnum } from "~/server/db/schema";

export const reportsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(reportTargetTypeEnum.enumValues),
        targetId: z.string().uuid(),
        reason: z.enum(reportReasonEnum.enumValues),
        details: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(reports).values({
        reporterId: ctx.session.user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details,
      });

      return { success: true };
    }),

  getPending: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.reports.findMany({
      where: (r, { eq }) => eq(r.status, "pending"),
      with: {
        reporter: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });
  }),

  updateStatus: adminProcedure
    .input(
      z.object({
        reportId: z.string().uuid(),
        status: z.enum(["resolved", "dismissed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(reports)
        .set({ status: input.status })
        .where(eq(reports.id, input.reportId));

      return { success: true };
    }),
});
