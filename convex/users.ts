import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { type Id } from "./_generated/dataModel";

export async function resolveUserId(
  ctx: { db: QueryCtx["db"] | MutationCtx["db"] },
  id: string,
): Promise<Id<"users">> {
  // 1. Check if it's a valid Convex ID
  const validId = ctx.db.normalizeId("users", id);
  if (validId) {
    const user = await ctx.db.get(validId);
    if (user) {
      return user._id;
    }
  }

  // 2. Check if it's an externalId
  const userByExternalId = await ctx.db
    .query("users")
    .withIndex("by_externalId", (q) => q.eq("externalId", id))
    .unique();

  if (userByExternalId) {
    return userByExternalId._id;
  }

  throw new Error(`User not found: ${id}`);
}

export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const createUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    collegeId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      throw new Error("Email already exists");
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.passwordHash,
      collegeId: args.collegeId,
      emailVerified: false,
      isAdmin: false,
      createdAt: Date.now(),
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const syncUser = mutation({
  args: {
    externalId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    collegeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists by externalId
    const userByExternalId = await ctx.db
      .query("users")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (userByExternalId) {
      return userByExternalId._id;
    }

    // Check if user exists by email
    const userByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (userByEmail) {
      // Update the user's externalId
      await ctx.db.patch(userByEmail._id, {
        externalId: args.externalId,
        updatedAt: Date.now(),
      });
      return userByEmail._id;
    }

    // Create a new user
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: "sync_placeholder",
      externalId: args.externalId,
      avatarUrl: args.avatarUrl,
      collegeId: args.collegeId ?? "",
      emailVerified: false,
      isAdmin: false,
      createdAt: Date.now(),
    });
  },
});
