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

export const notificationType = v.union(
  v.literal("post_reaction"),
  v.literal("comment_reaction"),
  v.literal("new_comment"),
  v.literal("comment_reply"),
);

export const conversationType = v.union(
  v.literal("private"),
  v.literal("group"),
);

export const materialType = v.union(
  v.literal("pdf"),
  v.literal("video"),
  v.literal("link"),
  v.literal("other"),
);

export const academicMaterialStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const reportReason = v.union(
  v.literal("spam"),
  v.literal("harassment"),
  v.literal("hate_speech"),
  v.literal("violence"),
  v.literal("nudity"),
  v.literal("misinformation"),
  v.literal("other"),
);

export const reportStatus = v.union(
  v.literal("pending"),
  v.literal("resolved"),
  v.literal("dismissed"),
);

export const reportTargetType = v.union(
  v.literal("post"),
  v.literal("comment"),
  v.literal("user"),
);

export const reportActionType = v.union(
  v.literal("resolved"),
  v.literal("dismissed"),
  v.literal("content_hidden"),
  v.literal("content_deleted"),
  v.literal("user_warned"),
  v.literal("user_banned"),
  v.literal("user_muted"),
);

export const restrictionType = v.union(
  v.literal("ban"),
  v.literal("mute"),
  v.literal("shadowban"),
);

export default defineSchema({
  users: defineTable({
    name: v.string(),
    collegeId: v.string(),
    email: v.string(),
    password: v.string(), // Hashed
    emailVerified: v.boolean(),
    isAdmin: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Merged profile fields
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    externalId: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_collegeId", ["collegeId"])
    .index("by_externalId", ["externalId"]),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    hiddenAt: v.optional(v.number()),
    hiddenBy: v.optional(v.id("users")),
    hiddenReason: v.optional(v.string()),
    // Embedded media
    media: v.array(
      v.object({
        url: v.string(),
        type: mediaType,
      }),
    ),
  })
    .index("by_authorId", ["authorId"])
    .index("by_hiddenAt", ["hiddenAt"]),

  postReactions: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    reactionType: reactionType,
    createdAt: v.number(),
  })
    .index("by_postId", ["postId"])
    .index("by_userId", ["userId"])
    .index("by_post_user", ["postId", "userId"]), // Unique constraint equivalent

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    hiddenAt: v.optional(v.number()),
    hiddenBy: v.optional(v.id("users")),
    hiddenReason: v.optional(v.string()),
  })
    .index("by_postId", ["postId"])
    .index("by_authorId", ["authorId"])
    .index("by_parentId", ["parentId"]),

  commentReactions: defineTable({
    commentId: v.id("comments"),
    userId: v.id("users"),
    reactionType: reactionType,
    createdAt: v.number(),
  })
    .index("by_commentId", ["commentId"])
    .index("by_userId", ["userId"])
    .index("by_comment_user", ["commentId", "userId"]),

  subjects: defineTable({
    name: v.string(),
    code: v.string(),
    semester: v.number(),
    icon: v.string(),
    accentColor: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  academicMaterials: defineTable({
    subjectId: v.id("subjects"),
    uploaderId: v.optional(v.id("users")),
    title: v.string(),
    description: v.optional(v.string()),
    type: materialType,
    fileUrl: v.string(),
    status: academicMaterialStatus,
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_subjectId", ["subjectId"])
    .index("by_uploaderId", ["uploaderId"])
    .index("by_status", ["status"]),

  conversations: defineTable({
    type: conversationType,
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_type", ["type"]),

  conversationParticipants: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    deletedForUserIds: v.array(v.id("users")),
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

  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    reactionType: reactionType,
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_userId", ["userId"])
    .index("by_message_user", ["messageId", "userId"]),

  notifications: defineTable({
    recipientId: v.id("users"),
    actorId: v.id("users"),
    type: notificationType,
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_recipientId", ["recipientId"])
    .index("by_recipient_read", ["recipientId", "isRead"]),

  reports: defineTable({
    reporterId: v.id("users"),
    targetType: reportTargetType,
    targetId: v.string(), // Generic ID storage
    reason: reportReason,
    status: reportStatus,
    details: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    resolutionNote: v.optional(v.string()),
    actionTaken: v.optional(reportActionType),
  })
    .index("by_reporterId", ["reporterId"])
    .index("by_status", ["status"])
    .index("by_target", ["targetType", "targetId"]),

  auditLogs: defineTable({
    actorId: v.id("users"),
    actionType: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    reason: v.optional(v.string()),
    metadata: v.any(),
    createdAt: v.number(),
  })
    .index("by_actorId", ["actorId"])
    .index("by_actionType", ["actionType"])
    .index("by_target", ["targetType", "targetId"]),

  userRestrictions: defineTable({
    userId: v.id("users"),
    type: restrictionType,
    reason: v.string(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_expiresAt", ["expiresAt"]),

  submissions: defineTable({
    name: v.string(),
    word: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageName: v.optional(v.string()),
    semester: v.optional(v.number()),
    batchId: v.optional(v.string()),
    isAnonymous: v.boolean(),
    createdAt: v.number(),
    userId: v.optional(v.id("users")),
  })
    .index("by_userId", ["userId"])
    .index("by_semester", ["semester"])
    .index("by_batchId", ["batchId"]),

  emailVerificationCodes: defineTable({
    email: v.string(),
    code: v.string(),
    name: v.string(),
    collegeId: v.string(),
    hashedPassword: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  passwordResetTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),
});
