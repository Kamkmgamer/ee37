import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";

export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const user = await ctx.runQuery(internal.users.getByEmail, {
      email: args.email,
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(args.password, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return user._id;
  },
});

export const signUp = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    collegeId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"users">> => {
    const existing = await ctx.runQuery(internal.users.getByEmail, {
      email: args.email,
    });

    if (existing) {
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(args.password, 10);

    const userId = await ctx.runMutation(internal.users.createUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      collegeId: args.collegeId,
    });

    return userId;
  },
});
