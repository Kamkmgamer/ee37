import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { subjects, academicMaterials } from "~/server/db/schema";

export const learningRouter = createTRPCRouter({
  getSubjects: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(subjects).orderBy(subjects.semester, subjects.code);
  }),
  getSubjectMaterials: publicProcedure
    .input(z.object({ subjectId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(academicMaterials)
        .where(eq(academicMaterials.subjectId, input.subjectId))
        .orderBy(desc(academicMaterials.createdAt));
    }),

  createSubject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        semester: z.number().int().min(1).max(10),
        icon: z.string(),
        accentColor: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.db.insert(subjects).values(input).returning();
    }),

    uploadMaterial: protectedProcedure
    .input(
        z.object({
            subjectId: z.string().uuid(),
            title: z.string().min(1),
            description: z.string().optional(),
            type: z.enum(["pdf", "video", "link", "other"]),
            fileUrl: z.string().url(),
        })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.db.insert(academicMaterials).values({
            ...input,
            uploaderId: ctx.session.user.id,
        }).returning();
    })
});
