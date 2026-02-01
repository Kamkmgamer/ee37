/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { api } from "./_generated/api";

// Simple in-memory cache with 5-minute TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CachedUser {
  id: string;
  name: string;
  email: string;
  collegeId: string;
  isAdmin: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  cachedAt: number;
}

// Cache storage (will be cleared on function restart)
const userCache = new Map<string, CachedUser>();

function isCacheValid(cachedUser: CachedUser): boolean {
  return Date.now() - cachedUser.cachedAt < CACHE_TTL;
}

/**
 * Internal query to get AI user ID
 */
export const getAIUserId = internalQuery({
  args: {},
  handler: async (ctx): Promise<string | null> => {
    const aiUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "ai@ee37.platform"))
      .first();
    return aiUser ? aiUser._id : null;
  },
});

/**
 * Fetch user data from PostgreSQL via internal API
 * Uses 5-minute caching to reduce API calls
 */
export const getUsersByIds = action({
  args: {
    userIds: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<CachedUser[]> => {
    const { userIds } = args;

    if (userIds.length === 0) {
      return [];
    }

    // Check cache first
    const cachedUsers: CachedUser[] = [];
    const missingIds: string[] = [];

    for (const userId of userIds) {
      const cached = userCache.get(userId);
      if (cached && isCacheValid(cached)) {
        cachedUsers.push(cached);
      } else {
        missingIds.push(userId);
      }
    }

    // Fetch missing users from PostgreSQL API
    if (missingIds.length > 0) {
      const apiUrl = `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/internal/users`;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
          },
          body: JSON.stringify({ userIds: missingIds }),
        });

        if (!response.ok) {
          throw new Error(
            `API error: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            const cachedUser: CachedUser = {
              ...user,
              cachedAt: Date.now(),
            };
            userCache.set(user.id, cachedUser);
            cachedUsers.push(cachedUser);
          }
        }
      } catch (error) {
        console.error("Failed to fetch users from internal API:", error);
        // Return cached users even if some are stale, better than nothing
        for (const userId of missingIds) {
          const stale = userCache.get(userId);
          if (stale) {
            cachedUsers.push(stale);
          }
        }
      }
    }

    // Return users in the order requested
    const result: CachedUser[] = [];
    for (const userId of userIds) {
      const user = cachedUsers.find((u) => u.id === userId);
      if (user) {
        result.push(user);
      }
    }

    return result;
  },
});

/**
 * Get a single user by ID (convenience wrapper)
 */
export const getUserById = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<CachedUser | null> => {
    const users = await ctx.runAction(api.users.getUsersByIds, {
      userIds: [args.userId],
    });
    return users[0] || null;
  },
});
