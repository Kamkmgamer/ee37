import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { userProfiles, users } from "~/server/db/schema";

export const profileRouter = createTRPCRouter({
  // Get profile by user ID
  getProfile: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          collegeId: users.collegeId,
          bio: userProfiles.bio,
          avatarUrl: userProfiles.avatarUrl,
          coverUrl: userProfiles.coverUrl,
          location: userProfiles.location,
          website: userProfiles.website,
          createdAt: users.createdAt,
          isAdmin: users.isAdmin,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(users.id, input.userId))
        .limit(1);

      return result[0] ?? null;
    }),

  // Get current user's profile (requires session in headers)
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        collegeId: users.collegeId,
        bio: userProfiles.bio,
        avatarUrl: userProfiles.avatarUrl,
        coverUrl: userProfiles.coverUrl,
        location: userProfiles.location,
        website: userProfiles.website,
        createdAt: users.createdAt,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, ctx.session.user.id))
      .limit(1);

    return result[0] ?? null;
  }),

  // Update profile information
  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(500).optional(),
        location: z.string().max(256).optional(),
        website: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const data = input;

      // Upsert profile
      await ctx.db
        .insert(userProfiles)
        .values({
          userId,
          bio: data.bio ?? null,
          location: data.location ?? null,
          website: data.website ?? null,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            bio: data.bio ?? null,
            location: data.location ?? null,
            website: data.website ?? null,
          },
        });

      return { success: true };
    }),

  // Update avatar URL
  updateAvatar: protectedProcedure
    .input(
      z.object({
        avatarUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .insert(userProfiles)
        .values({
          userId,
          avatarUrl: input.avatarUrl,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            avatarUrl: input.avatarUrl,
          },
        });

      return { success: true };
    }),

  // Update cover image URL
  updateCover: protectedProcedure
    .input(
      z.object({
        coverUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .insert(userProfiles)
        .values({
          userId,
          coverUrl: input.coverUrl,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            coverUrl: input.coverUrl,
          },
        });

      return { success: true };
    }),

  // Get all users (for profile browsing)
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        userId: users.id,
        name: users.name,
        avatarUrl: userProfiles.avatarUrl,
        bio: userProfiles.bio,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .orderBy(users.name);

    return result;
  }),
});
