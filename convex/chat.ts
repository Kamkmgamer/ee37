/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars, @typescript-eslint/prefer-optional-chain, @typescript-eslint/prefer-nullish-coalescing */
import { v } from "convex/values";
import {
  mutation,
  query,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// ============================================================================
// MUTATIONS - Basic chat operations that don't need user data enrichment
// ============================================================================

export const createConversation = mutation({
  args: {
    type: v.union(v.literal("private"), v.literal("group")),
    participantIds: v.array(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    currentUserId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"conversations">> => {
    const currentUserId = args.currentUserId;
    const participantIds = args.participantIds;

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

// Internal mutation that does the actual message insertion
export const sendMessageInternal = internalMutation({
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
  handler: async (ctx, args): Promise<Id<"messages">> => {
    const currentUserId = args.currentUserId;

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

    return messageId;
  },
});

// Public action wrapper that handles AI detection
export const sendMessage = action({
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
  handler: async (ctx, args): Promise<Id<"messages">> => {
    // Call internal mutation via API
    const messageId = await ctx.runMutation(
      api.internal.chat.sendMessageInternal,
      {
        conversationId: args.conversationId,
        content: args.content,
        media: args.media,
        replyToId: args.replyToId,
        isForwarded: args.isForwarded,
        currentUserId: args.currentUserId,
      },
    );

    // Get participants via query
    const participants = await ctx.runQuery(
      api.chat.getConversationParticipants,
      {
        conversationId: args.conversationId,
      },
    );

    const participantIds = participants.map(
      (p: { userId: string }) => p.userId,
    );

    if (participantIds.length > 0) {
      const userData = await ctx.runAction(api.users.getUsersByIds, {
        userIds: participantIds,
      });

      const aiUser = userData.find(
        (u: { email: string }) => u.email === "ai@ee37.platform",
      );

      if (aiUser) {
        // Schedule AI response
        await ctx.scheduler.runAfter(0, api.ai.generateResponse, {
          conversationId: args.conversationId,
          replyToMessageId: messageId,
        });
      }
    }

    return messageId;
  },
});

export const sendAIMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    aiUserId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.aiUserId,
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

export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const react = mutation({
  args: {
    messageId: v.id("messages"),
    type: v.string(),
    currentUserId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const currentUserId = args.currentUserId;
    const existing = await ctx.db
      .query("messageReactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .filter((q) => q.eq(q.field("userId"), currentUserId))
      .unique();

    if (existing) {
      if (existing.reactionType === args.type) {
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, { reactionType: args.type as any });
      }
    } else {
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
  handler: async (ctx, args): Promise<void> => {
    const currentUserId = args.currentUserId;
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
    currentUserId: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
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
  handler: async (ctx, args): Promise<void> => {
    const currentUserId = args.currentUserId;
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

// ============================================================================
// QUERIES - Raw data without user enrichment (client fetches user data separately)
// ============================================================================

// Helper query to get conversation participants
export const getConversationParticipants = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});

// Raw conversation data without user enrichment
export const getConversationsRaw = query({
  args: {
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = args.currentUserId;
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

    // Return raw data with participant IDs only (no user enrichment)
    const result = await Promise.all(
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

        const participantRecords = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", c!._id))
          .collect();

        return {
          ...c,
          lastMessage: lastMsg,
          unreadCount: unreadCount,
          participantIds: participantRecords.map((p) => p.userId),
        };
      }),
    );

    return result;
  },
});

// Action wrapper that enriches with user data
export const getConversations = action({
  args: {
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<any[]> => {
    // Get raw conversations
    const rawConversations: Array<any> = await ctx.runQuery(
      api.chat.getConversationsRaw,
      {
        currentUserId: args.currentUserId,
        paginationOpts: args.paginationOpts,
      },
    );

    // Collect all unique participant IDs
    const allParticipantIds: string[] = [];
    for (const c of rawConversations) {
      for (const userId of c.participantIds) {
        if (!allParticipantIds.includes(userId)) {
          allParticipantIds.push(userId);
        }
      }
    }

    // Fetch user data from PostgreSQL
    const userDataMap = new Map<
      string,
      { id: string; name: string; avatarUrl: string | null }
    >();
    if (allParticipantIds.length > 0) {
      const userData: Array<{
        id: string;
        name: string;
        avatarUrl: string | null;
      }> = await ctx.runAction(api.users.getUsersByIds, {
        userIds: allParticipantIds,
      });
      for (const u of userData) {
        userDataMap.set(u.id, {
          id: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl,
        });
      }
    }

    // Enrich conversations with user data
    return rawConversations.map((c: any) => ({
      ...c,
      participants: c.participantIds
        .map((id: string) => userDataMap.get(id))
        .filter((u: any) => u !== undefined),
      participantIds: undefined,
    }));
  },
});

// Raw conversation data without user enrichment
export const getConversationRaw = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participantRecords = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();

    return {
      ...conversation,
      participantIds: participantRecords.map((p) => p.userId),
    };
  },
});

// Action wrapper that enriches with user data
export const getConversation = action({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args): Promise<any> => {
    const rawConversation: any = await ctx.runQuery(
      api.chat.getConversationRaw,
      {
        conversationId: args.conversationId,
      },
    );

    if (!rawConversation) return null;

    // Fetch user data from PostgreSQL
    let participants: Array<{
      id: string;
      name: string;
      avatarUrl: string | null;
    }> = [];
    if (rawConversation.participantIds.length > 0) {
      const userData: Array<{
        id: string;
        name: string;
        avatarUrl: string | null;
      }> = await ctx.runAction(api.users.getUsersByIds, {
        userIds: rawConversation.participantIds,
      });
      participants = userData.map((u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
      }));
    }

    return {
      ...rawConversation,
      participants,
      participantIds: undefined,
    };
  },
});

// Raw messages without user enrichment
export const getMessagesRaw = query({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<PaginationResult<any>> => {
    const currentUserId = args.currentUserId;
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

    // Return raw messages with sender IDs and replyToIds only
    const page = await Promise.all(
      messages.page.map(async (m) => {
        let replyTo: {
          messageId: string;
          senderId: string;
          content: string | null;
          createdAt: number;
        } | null = null;
        if (m.replyToId) {
          const replyMsg = await ctx.db.get(m.replyToId);
          if (replyMsg) {
            replyTo = {
              messageId: replyMsg._id,
              senderId: replyMsg.senderId,
              content: replyMsg.content ?? null,
              createdAt: replyMsg.createdAt,
            };
          }
        }

        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_messageId", (q) => q.eq("messageId", m._id))
          .collect();

        return {
          ...m,
          replyTo,
          reactions,
        };
      }),
    );

    return { ...messages, page };
  },
});

// Action wrapper that enriches with user data
export const getMessages = action({
  args: {
    conversationId: v.id("conversations"),
    currentUserId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args): Promise<any> => {
    const rawMessages: any = await ctx.runQuery(api.chat.getMessagesRaw, {
      conversationId: args.conversationId,
      currentUserId: args.currentUserId,
      paginationOpts: args.paginationOpts,
    });

    // Collect all sender IDs
    const senderIds: string[] = [];
    for (const m of rawMessages.page) {
      if (!senderIds.includes(m.senderId)) {
        senderIds.push(m.senderId);
      }
      if (m.replyTo && !senderIds.includes(m.replyTo.senderId)) {
        senderIds.push(m.replyTo.senderId);
      }
    }

    // Fetch user data from PostgreSQL
    const userDataMap = new Map<
      string,
      { id: string; name: string; avatarUrl: string | null }
    >();
    if (senderIds.length > 0) {
      const userData: Array<{
        id: string;
        name: string;
        avatarUrl: string | null;
      }> = await ctx.runAction(api.users.getUsersByIds, {
        userIds: senderIds,
      });
      for (const u of userData) {
        userDataMap.set(u.id, {
          id: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl,
        });
      }
    }

    // Enrich messages with user data
    const enrichedPage = rawMessages.page.map((m: any) => ({
      ...m,
      sender: userDataMap.get(m.senderId),
      replyTo: m.replyTo
        ? {
            ...m.replyTo,
            sender: userDataMap.get(m.replyTo.senderId),
          }
        : null,
    }));

    return { ...rawMessages, page: enrichedPage };
  },
});

// ============================================================================
// INTERNAL QUERIES - For AI service
// ============================================================================

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

    // Return raw data - AI service should use the action version to get enriched data
    return messages.reverse().map((m) => ({
      role: "user" as const,
      content: m.content || "",
      senderId: m.senderId,
    }));
  },
});

// Action version for AI that can fetch user data
export const getRecentMessagesForAIAction = action({
  args: { conversationId: v.id("conversations") },
  handler: async (
    ctx,
    args,
  ): Promise<Array<{ role: "assistant" | "user"; content: string }>> => {
    const messages: Array<any> = await ctx.runQuery(
      api.chat.getRecentMessagesForAI,
      {
        conversationId: args.conversationId,
      },
    );

    // Collect all sender IDs
    const senderIds: string[] = [];
    for (const m of messages) {
      if (!senderIds.includes(m.senderId)) {
        senderIds.push(m.senderId);
      }
    }

    // Fetch user data from PostgreSQL
    const userDataMap = new Map<string, { email: string }>();
    if (senderIds.length > 0) {
      const userData: Array<{ id: string; email: string }> =
        await ctx.runAction(api.users.getUsersByIds, {
          userIds: senderIds,
        });
      for (const u of userData) {
        userDataMap.set(u.id, { email: u.email });
      }
    }

    return messages.map((m: any) => ({
      role:
        userDataMap.get(m.senderId)?.email === "ai@ee37.platform"
          ? ("assistant" as const)
          : ("user" as const),
      content: m.content || "",
    }));
  },
});
