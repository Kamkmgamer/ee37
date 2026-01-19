/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mediaType, reactionType } from "./schema";
import { resolveUserId } from "./users";
import type { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    content: v.string(),
    media: v.optional(
      v.array(
        v.object({
          url: v.string(),
          type: mediaType,
        }),
      ),
    ),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.userId);
    // In a real app, we would verify ctx.auth.getUserIdentity() matches args.userId
    // or use a session token. For now, trusting the client as requested.

    const postId = await ctx.db.insert("posts", {
      content: args.content,
      media: args.media ?? [],
      authorId: userId,
      createdAt: Date.now(),
    });

    return postId;
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let currentUserId: Id<"users"> | null = null;
    if (args.currentUserId) {
      try {
        currentUserId = await resolveUserId(ctx, args.currentUserId);
      } catch {
        // If invalid ID, treat as anonymous/logged out
        currentUserId = null;
      }
    }

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_hiddenAt", (q) => q.eq("hiddenAt", undefined))
      .order("desc")
      .paginate(args.paginationOpts);

    // Join with users and check reactions
    const enrichedPosts = await Promise.all(
      posts.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);

        // Get reaction stats
        // Note: For high scale, reaction counts should be denormalized on the post object.
        // Doing a count query here is O(N) where N is number of reactions, which is okay for MVP but not scale.
        const reactions = await ctx.db
          .query("postReactions")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .collect();

        const likeCount = reactions.filter(
          (r) => r.reactionType === "like",
        ).length;

        let hasLiked = false;
        if (currentUserId) {
          hasLiked = reactions.some(
            (r) => r.userId === currentUserId && r.reactionType === "like",
          );
        }

        // Get comment count (simple scan for MVP)
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_postId", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                avatarUrl: author.avatarUrl,
                collegeId: author.collegeId,
              }
            : null,
          likeCount,
          commentCount: comments.length,
          hasLiked,
        };
      }),
    );

    return {
      ...posts,
      page: enrichedPosts,
    };
  },
});

export const toggleReaction = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    reactionType: reactionType,
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.userId);
    // Check if reaction exists
    const existingReaction = await ctx.db
      .query("postReactions")
      .withIndex("by_post_user", (q) =>
        q.eq("postId", args.postId).eq("userId", userId),
      )
      .first();

    if (existingReaction) {
      // If it's the same type, remove it (toggle off)
      // If it's a different type, update it (change reaction)
      // Logic: The prompt said "toggleReaction". Usually this means on/off for a specific type like "like".
      // But if I pass "like" and I already have "heart", should it switch or toggle?
      // Standard UX: If I click "Like" and I have "Heart", it usually switches to "Like".
      // If I click "Like" and I have "Like", it removes it.

      if (existingReaction.reactionType === args.reactionType) {
        await ctx.db.delete(existingReaction._id);
        return "removed";
      } else {
        // Delete old, create new (or update) -- deleting is safer for indices
        await ctx.db.delete(existingReaction._id);
        await ctx.db.insert("postReactions", {
          postId: args.postId,
          userId: userId,
          reactionType: args.reactionType as any,
          createdAt: Date.now(),
        });
        return "updated";
      }
    } else {
      await ctx.db.insert("postReactions", {
        postId: args.postId,
        userId: userId,
        reactionType: args.reactionType as any,
        createdAt: Date.now(),
      });
      return "added";
    }
  },
});
