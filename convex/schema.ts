import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Enums
export const mediaType = v.union(v.literal("image"), v.literal("video"));

export const reactionType = v.union(
  v.literal("like"),
  v.literal("dislike"),
  v.literal("heart"),
  v.literal("angry"),
  v.literal("laugh"),
  v.literal("wow"),
  v.literal("sad"),
);

export const conversationType = v.union(
  v.literal("private"),
  v.literal("group"),
);

/**
 * Simplified Convex Schema - Chat Only
 *
 * PostgreSQL is the source of truth for all user data.
 * Convex only stores chat-related data (conversations, messages, reactions).
 * User IDs are PostgreSQL UUIDs (stored as strings).
 */
export default defineSchema({
  // Conversations (private chats and groups)
  conversations: defineTable({
    type: conversationType,
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdBy: v.string(), // PostgreSQL user UUID
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_type", ["type"]),

  // Conversation participants
  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.string(), // PostgreSQL user UUID
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  // Messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // PostgreSQL user UUID
    content: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    deletedForUserIds: v.array(v.string()), // PostgreSQL user UUIDs
    replyToId: v.optional(v.id("messages")),
    isForwarded: v.boolean(),
    // Embedded media
    media: v.array(
      v.object({
        url: v.string(),
        type: mediaType,
      }),
    ),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_senderId", ["senderId"]),

  // Message reactions
  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.string(), // PostgreSQL user UUID
    reactionType: reactionType,
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_userId", ["userId"])
    .index("by_message_user", ["messageId", "userId"]),
});
