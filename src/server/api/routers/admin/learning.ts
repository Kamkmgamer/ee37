import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import {
  subjects,
  academicMaterials,
  adminAuditLog,
  users,
  userProfiles,
} from "~/server/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminLearningRouter = createTRPCRouter({
  listSubjects: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: subjects.id,
        name: subjects.name,
        code: subjects.code,
        semester: subjects.semester,
        icon: subjects.icon,
        accentColor: subjects.accentColor,
        description: subjects.description,
        createdAt: subjects.createdAt,
      })
      .from(subjects)
      .orderBy(subjects.semester, subjects.code);
  }),

  createSubject: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        semester: z.number().int().min(1).max(10),
        icon: z.string(),
        accentColor: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [subject] = await ctx.db.insert(subjects).values(input).returning();

      if (!subject) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subject",
        });
      }

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "create_subject",
        targetType: "subject",
        targetId: subject.id,
        reason: `Created subject: ${input.name}`,
        metadata: input,
      });

      return { success: true, subject };
    }),

  updateSubject: adminProcedure
    .input(
      z.object({
        subjectId: z.string().uuid(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        semester: z.number().int().min(1).max(10).optional(),
        icon: z.string().optional(),
        accentColor: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subjectId, ...data } = input;

      const [subject] = await ctx.db
        .update(subjects)
        .set(data)
        .where(eq(subjects.id, subjectId))
        .returning();

      if (!subject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subject not found",
        });
      }

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "update_subject",
        targetType: "subject",
        targetId: subjectId,
        reason: `Updated subject: ${subject.name}`,
        metadata: data,
      });

      return { success: true, subject };
    }),

  deleteSubject: adminProcedure
    .input(z.object({ subjectId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const subject = await ctx.db.query.subjects.findFirst({
        where: eq(subjects.id, input.subjectId),
      });

      if (!subject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subject not found",
        });
      }

      await ctx.db.delete(subjects).where(eq(subjects.id, input.subjectId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "delete_subject",
        targetType: "subject",
        targetId: input.subjectId,
        reason: `Deleted subject: ${subject.name}`,
        metadata: { subjectName: subject.name },
      });

      return { success: true };
    }),

  listMaterials: adminProcedure
    .input(
      z.object({
        subjectId: z.string().uuid().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = and(
        input.subjectId
          ? eq(academicMaterials.subjectId, input.subjectId)
          : undefined,
        input.status ? eq(academicMaterials.status, input.status) : undefined,
      );

      const materialsResult = await ctx.db
        .select({
          id: academicMaterials.id,
          title: academicMaterials.title,
          description: academicMaterials.description,
          type: academicMaterials.type,
          fileUrl: academicMaterials.fileUrl,
          status: academicMaterials.status,
          subjectId: academicMaterials.subjectId,
          subjectName: subjects.name,
          uploaderId: academicMaterials.uploaderId,
          uploaderName: users.name,
          uploaderAvatar: userProfiles.avatarUrl,
          createdAt: academicMaterials.createdAt,
          reviewedBy: academicMaterials.reviewedBy,
          reviewedAt: academicMaterials.reviewedAt,
          rejectionReason: academicMaterials.rejectionReason,
        })
        .from(academicMaterials)
        .leftJoin(subjects, eq(academicMaterials.subjectId, subjects.id))
        .leftJoin(users, eq(academicMaterials.uploaderId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(academicMaterials.createdAt))
        .limit(input.limit + 1);

      const hasNextPage = materialsResult.length > input.limit;
      const materials = hasNextPage
        ? materialsResult.slice(0, -1)
        : materialsResult;
      const nextCursor = hasNextPage
        ? materials[materials.length - 1]?.id
        : undefined;

      return { materials, nextCursor };
    }),

  approveMaterial: adminProcedure
    .input(z.object({ materialId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const material = await ctx.db.query.academicMaterials.findFirst({
        where: eq(academicMaterials.id, input.materialId),
      });

      if (!material) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Material not found",
        });
      }

      await ctx.db
        .update(academicMaterials)
        .set({
          status: "approved",
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          rejectionReason: null,
        })
        .where(eq(academicMaterials.id, input.materialId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "approve_material",
        targetType: "material",
        targetId: input.materialId,
        reason: "Material approved",
        metadata: { title: material.title },
      });

      return { success: true };
    }),

  rejectMaterial: adminProcedure
    .input(
      z.object({
        materialId: z.string().uuid(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const material = await ctx.db.query.academicMaterials.findFirst({
        where: eq(academicMaterials.id, input.materialId),
      });

      if (!material) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Material not found",
        });
      }

      await ctx.db
        .update(academicMaterials)
        .set({
          status: "rejected",
          reviewedBy: ctx.session.user.id,
          reviewedAt: new Date(),
          rejectionReason: input.reason,
        })
        .where(eq(academicMaterials.id, input.materialId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "reject_material",
        targetType: "material",
        targetId: input.materialId,
        reason: input.reason,
        metadata: { title: material.title },
      });

      return { success: true };
    }),

  deleteMaterial: adminProcedure
    .input(z.object({ materialId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const material = await ctx.db.query.academicMaterials.findFirst({
        where: eq(academicMaterials.id, input.materialId),
      });

      if (!material) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Material not found",
        });
      }

      await ctx.db
        .delete(academicMaterials)
        .where(eq(academicMaterials.id, input.materialId));

      await ctx.db.insert(adminAuditLog).values({
        actorId: ctx.session.user.id,
        actionType: "delete_material",
        targetType: "material",
        targetId: input.materialId,
        reason: "Material deleted by admin",
        metadata: { title: material.title },
      });

      return { success: true };
    }),

  getMaterialStats: adminProcedure.query(async ({ ctx }) => {
    const pending = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(academicMaterials)
      .where(eq(academicMaterials.status, "pending"));

    const approved = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(academicMaterials)
      .where(eq(academicMaterials.status, "approved"));

    const rejected = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(academicMaterials)
      .where(eq(academicMaterials.status, "rejected"));

    return {
      pending: pending[0]?.count ?? 0,
      approved: approved[0]?.count ?? 0,
      rejected: rejected[0]?.count ?? 0,
    };
  }),
});
