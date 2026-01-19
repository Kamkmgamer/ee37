import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { resolveUserId } from "./users";

export const create = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUserId(ctx, args.userId);

    // Verify post exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: userId,
      content: args.content,
      parentId: args.parentId,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

export const listByPost = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    // Join with users
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                avatarUrl: author.avatarUrl,
                collegeId: author.collegeId,
              }
            : null,
        };
      }),
    );

    return enrichedComments;
  },
});
