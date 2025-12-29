import { z } from "zod";
import { eq, desc, and, lt, sql } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  socialPosts,
  postMedia,
  postReactions,
  users,
  userProfiles,
} from "~/server/db/schema";

export const feedRouter = createTRPCRouter({
  // Create a new post
  createPost: publicProcedure
    .input(
      z.object({
        authorId: z.string().uuid(),
        content: z.string().min(1).max(2000),
        mediaUrls: z
          .array(
            z.object({
              url: z.string().url(),
              type: z.enum(["image", "video"]),
            }),
          )
          .max(4)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Insert the post
      const [newPost] = await ctx.db
        .insert(socialPosts)
        .values({
          authorId: input.authorId,
          content: input.content,
        })
        .returning();

      // Insert media if provided
      if (input.mediaUrls && input.mediaUrls.length > 0 && newPost) {
        await ctx.db.insert(postMedia).values(
          input.mediaUrls.map((media, index) => ({
            postId: newPost.id,
            mediaUrl: media.url,
            mediaType: media.type,
            order: index,
          })),
        );
      }

      return newPost;
    }),

  // Get paginated feed (all posts, newest first)
  getPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      // Build conditions
      const conditions = cursor
        ? lt(socialPosts.createdAt, 
            ctx.db
              .select({ createdAt: socialPosts.createdAt })
              .from(socialPosts)
              .where(eq(socialPosts.id, cursor))
          )
        : undefined;

      // Get posts with author info
      const postsResult = await ctx.db
        .select({
          id: socialPosts.id,
          content: socialPosts.content,
          createdAt: socialPosts.createdAt,
          authorId: socialPosts.authorId,
          authorName: users.name,
          authorAvatar: userProfiles.avatarUrl,
        })
        .from(socialPosts)
        .innerJoin(users, eq(socialPosts.authorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(socialPosts.createdAt))
        .limit(limit + 1);

      // Check if there's a next page
      const hasNextPage = postsResult.length > limit;
      const posts = hasNextPage ? postsResult.slice(0, -1) : postsResult;
      const nextCursor = hasNextPage ? posts[posts.length - 1]?.id : undefined;

      // Get media for all posts
      const postIds = posts.map((p) => p.id);
      const mediaResult =
        postIds.length > 0
          ? await ctx.db
              .select()
              .from(postMedia)
              .where(sql`${postMedia.postId} IN ${postIds}`)
              .orderBy(postMedia.order)
          : [];

      // Get reaction counts for all posts
      const reactionCounts =
        postIds.length > 0
          ? await ctx.db
              .select({
                postId: postReactions.postId,
                reactionType: postReactions.reactionType,
                count: sql<number>`count(*)::int`,
              })
              .from(postReactions)
              .where(sql`${postReactions.postId} IN ${postIds}`)
              .groupBy(postReactions.postId, postReactions.reactionType)
          : [];

      // Combine data
      const postsWithDetails = posts.map((post) => ({
        ...post,
        media: mediaResult.filter((m) => m.postId === post.id),
        reactions: reactionCounts.filter((r) => r.postId === post.id),
      }));

      return {
        posts: postsWithDetails,
        nextCursor,
      };
    }),

  // Get posts by specific user (for their profile)
  getPostsByUser: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input;

      // Build conditions
      const conditions = cursor
        ? and(
            eq(socialPosts.authorId, userId),
            lt(socialPosts.createdAt,
              ctx.db
                .select({ createdAt: socialPosts.createdAt })
                .from(socialPosts)
                .where(eq(socialPosts.id, cursor))
            )
          )
        : eq(socialPosts.authorId, userId);

      // Get posts
      const postsResult = await ctx.db
        .select({
          id: socialPosts.id,
          content: socialPosts.content,
          createdAt: socialPosts.createdAt,
          authorId: socialPosts.authorId,
          authorName: users.name,
          authorAvatar: userProfiles.avatarUrl,
        })
        .from(socialPosts)
        .innerJoin(users, eq(socialPosts.authorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(conditions)
        .orderBy(desc(socialPosts.createdAt))
        .limit(limit + 1);

      const hasNextPage = postsResult.length > limit;
      const posts = hasNextPage ? postsResult.slice(0, -1) : postsResult;
      const nextCursor = hasNextPage ? posts[posts.length - 1]?.id : undefined;

      // Get media
      const postIds = posts.map((p) => p.id);
      const mediaResult =
        postIds.length > 0
          ? await ctx.db
              .select()
              .from(postMedia)
              .where(sql`${postMedia.postId} IN ${postIds}`)
              .orderBy(postMedia.order)
          : [];

      // Get reaction counts
      const reactionCounts =
        postIds.length > 0
          ? await ctx.db
              .select({
                postId: postReactions.postId,
                reactionType: postReactions.reactionType,
                count: sql<number>`count(*)::int`,
              })
              .from(postReactions)
              .where(sql`${postReactions.postId} IN ${postIds}`)
              .groupBy(postReactions.postId, postReactions.reactionType)
          : [];

      const postsWithDetails = posts.map((post) => ({
        ...post,
        media: mediaResult.filter((m) => m.postId === post.id),
        reactions: reactionCounts.filter((r) => r.postId === post.id),
      }));

      return {
        posts: postsWithDetails,
        nextCursor,
      };
    }),

  // Delete a post (only by author)
  deletePost: publicProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deleting
      const [post] = await ctx.db
        .select({ authorId: socialPosts.authorId })
        .from(socialPosts)
        .where(eq(socialPosts.id, input.postId))
        .limit(1);

      if (!post || post.authorId !== input.userId) {
        throw new Error("غير مصرح لك بحذف هذا المنشور");
      }

      await ctx.db.delete(socialPosts).where(eq(socialPosts.id, input.postId));

      return { success: true };
    }),

  // Get single post by ID
  getPost: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db
        .select({
          id: socialPosts.id,
          content: socialPosts.content,
          createdAt: socialPosts.createdAt,
          authorId: socialPosts.authorId,
          authorName: users.name,
          authorAvatar: userProfiles.avatarUrl,
        })
        .from(socialPosts)
        .innerJoin(users, eq(socialPosts.authorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .where(eq(socialPosts.id, input.postId))
        .limit(1);

      if (!post) return null;

      const media = await ctx.db
        .select()
        .from(postMedia)
        .where(eq(postMedia.postId, post.id))
        .orderBy(postMedia.order);

      const reactions = await ctx.db
        .select({
          reactionType: postReactions.reactionType,
          count: sql<number>`count(*)::int`,
        })
        .from(postReactions)
        .where(eq(postReactions.postId, post.id))
        .groupBy(postReactions.reactionType);

      return {
        ...post,
        media,
        reactions,
      };
    }),
});
