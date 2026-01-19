/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/prefer-optional-chain, @typescript-eslint/prefer-nullish-coalescing */
import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { api } from "./_generated/api";
import { resolveUserId } from "./users";
import type { Id } from "./_generated/dataModel";

export const createConversation = mutation({
  args: {
    type: v.union(v.literal("private"), v.literal("group")),
    participantIds: v.array(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    const participantIds = await Promise.all(
      args.participantIds.map((id) => resolveUserId(ctx, id)),
    );

    // Basic validation
    if (!participantIds.includes(currentUserId)) {
      throw new Error("Current user must be a participant");
    }

    if (args.type === "private") {
      if (participantIds.length !== 2) {
        throw new Error(
          "Private conversations must have exactly 2 participants",
        );
      }

      // Check for existing private conversation
      const userConversations = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
        .collect();

      const otherUserId = participantIds.find((id) => id !== currentUserId)!;

      for (const p of userConversations) {
        const conv = await ctx.db.get(p.conversationId);
        if (conv && conv.type === "private") {
          const otherPart = await ctx.db
            .query("conversationParticipants")
            .withIndex("by_conversation_user", (q) =>
              q.eq("conversationId", conv._id).eq("userId", otherUserId),
            )
            .first();
          if (otherPart) {
            return conv._id;
          }
        }
      }
    }

    const conversationId = await ctx.db.insert("conversations", {
      type: args.type,
      name: args.name,
      avatarUrl: args.avatarUrl,
      createdBy: currentUserId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    for (const userId of participantIds) {
      await ctx.db.insert("conversationParticipants", {
        conversationId,
        userId,
        joinedAt: Date.now(),
        lastReadAt: userId === currentUserId ? Date.now() : undefined,
      });
    }

    return conversationId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
        }),
      ),
    ),
    replyToId: v.optional(v.id("messages")),
    isForwarded: v.boolean(),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);

    // Verify participant
    const participant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUserId),
      )
      .unique();

    if (!participant) {
      throw new Error("User is not a participant in this conversation");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: currentUserId,
      content: args.content,
      media: args.media ?? [],
      replyToId: args.replyToId,
      isForwarded: args.isForwarded,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedForUserIds: [],
    });

    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });

    // AI Check
    const participants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    let aiUser = null;
    for (const p of participants) {
      const user = await ctx.db.get(p.userId);
      if (user && user.email === "ai@ee37.platform") {
        aiUser = user;
        break;
      }
    }

    if (aiUser) {
      // Schedule AI response
      await ctx.scheduler.runAfter(0, api.ai.generateResponse, {
        conversationId: args.conversationId,
        replyToMessageId: messageId,
      });
    }

    return messageId;
  },
});

export const sendAIMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Find AI User
    const aiUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "ai@ee37.platform"))
      .unique();

    if (!aiUser) {
      console.error("AI user not found");
      return;
    }

    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: aiUser._id,
      content: args.content,
      media: [],
      isForwarded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedForUserIds: [],
    });

    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
  },
});

export const getConversations = query({
  args: {
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    const allParticipations = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .collect();

    const convs = (
      await Promise.all(
        allParticipations.map(async (p) => {
          const c = await ctx.db.get(p.conversationId);
          if (!c) return null;
          return { ...c, lastReadAt: p.lastReadAt };
        }),
      )
    ).filter((c) => c !== null);

    const sortedConvs = convs.sort(
      (a, b) => (b!.updatedAt || 0) - (a!.updatedAt || 0),
    );

    // Enrich
    const enriched = await Promise.all(
      sortedConvs.map(async (c) => {
        const lastMsg = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", c!._id))
          .order("desc")
          .first();

        const unreadCount = c!.lastReadAt
          ? (
              await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                  q.eq("conversationId", c!._id),
                )
                .filter((q) => q.gt(q.field("createdAt"), c!.lastReadAt!))
                .collect()
            ).length
          : (
              await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) =>
                  q.eq("conversationId", c!._id),
                )
                .collect()
            ).length;

        return {
          ...c,
          lastMessage: lastMsg,
          unreadCount: unreadCount,
          participants: (
            await Promise.all(
              (
                await ctx.db
                  .query("conversationParticipants")
                  .withIndex("by_conversationId", (q) =>
                    q.eq("conversationId", c!._id),
                  )
                  .collect()
              ).map(async (p) => {
                const u = await ctx.db.get(p.userId);
                return u
                  ? { id: u._id, name: u.name, avatarUrl: u.avatarUrl }
                  : null;
              }),
            )
          ).filter((u) => u !== null),
        };
      }),
    );

    return enriched;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participants = await Promise.all(
      (
        await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", args.conversationId),
          )
          .collect()
      ).map(async (p) => {
        const u = await ctx.db.get(p.userId);
        return u ? { id: u._id, name: u.name, avatarUrl: u.avatarUrl } : null;
      }),
    );

    return {
      ...conversation,
      participants: participants.filter((p) => p !== null),
    };
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    // Auth check
    const p = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUserId),
      )
      .unique();
    if (!p) throw new Error("Unauthorized");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich
    const enrichedPage = await Promise.all(
      messages.page.map(async (m) => {
        const sender = await ctx.db.get(m.senderId);
        let replyTo = null;
        if (m.replyToId) {
          const replyMsg = await ctx.db.get(m.replyToId);
          if (replyMsg) {
            const replySender = await ctx.db.get(replyMsg.senderId);
            replyTo = {
              ...replyMsg,
              sender: replySender,
            };
          }
        }
        // Reactions
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_messageId", (q) => q.eq("messageId", m._id))
          .collect();

        return {
          ...m,
          sender,
          replyTo,
          reactions,
        };
      }),
    );

    return { ...messages, page: enrichedPage };
  },
});

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const react = mutation({
  args: {
    messageId: v.id("messages"),
    type: v.string(), // "like" | "dislike" etc
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    // Check existing reaction
    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();

    if (existing) {
      if (existing.reactionType === args.type) {
        // Toggle off
        await ctx.db.delete(existing._id as Id<any>);
      } else {
        // Update
        await ctx.db.patch(existing._id, { reactionType: args.type as any });
      }
    } else {
      // Create
      await ctx.db.insert("messageReactions", {
        messageId: args.messageId,
        userId: currentUserId,
        reactionType: args.type as any,
        createdAt: Date.now(),
      });
    }
  },
});

export const deleteMessageForMe = mutation({
  args: {
    messageId: v.id("messages"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    const msg = await ctx.db.get(args.messageId);
    if (!msg) return;
    const deletedFor = msg.deletedForUserIds || [];
    if (!deletedFor.includes(currentUserId)) {
      await ctx.db.patch(args.messageId, {
        deletedForUserIds: [...deletedFor, currentUserId],
      });
    }
  },
});

export const deleteMessageForAll = mutation({
  args: {
    messageId: v.id("messages"),
    currentUserId: v.string(), // For auth check ideally
  },
  handler: async (ctx, args) => {
    // In a real app check if user is sender or admin
    await ctx.db.patch(args.messageId, {
      deletedAt: Date.now(),
      content: undefined,
      media: [],
    });
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    const p = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation_user", (q) =>
        q.eq("conversationId", args.conversationId).eq("userId", currentUserId),
      )
      .unique();

    if (p) {
      await ctx.db.patch(p._id, { lastReadAt: Date.now() });
    }
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
    currentUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await resolveUserId(ctx, args.currentUserId);
    if (!args.query) return [];
    const users = await ctx.db.query("users").collect();
    const lowerQ = args.query.toLowerCase();
    return users
      .filter(
        (u) =>
          u._id !== currentUserId &&
          (u.name.toLowerCase().includes(lowerQ) ||
            u.email.toLowerCase().includes(lowerQ)),
      )
      .slice(0, 20);
  },
});

export const getAIUser = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "ai@ee37.platform"))
      .unique();
  },
});

export const getRecentMessagesForAI = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(20);

    const enriched = await Promise.all(
      messages.map(async (m) => {
        const sender = await ctx.db.get(m.senderId);
        return {
          role:
            sender?.email === "ai@ee37.platform"
              ? ("assistant" as const)
              : ("user" as const),
          content: m.content || "",
        };
      }),
    );

    return enriched.reverse();
  },
});
