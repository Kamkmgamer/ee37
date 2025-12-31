// Database schema for EE37
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  pgEnum,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * Multi-project schema feature of Drizzle ORM.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `ee37_${name}`);

// Enums
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);
export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "dislike",
  "heart",
  "angry",
  "laugh",
  "wow",
  "sad",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "post_reaction",
  "comment_reaction",
  "new_comment",
  "comment_reply",
]);
export const conversationTypeEnum = pgEnum("conversation_type", [
  "private",
  "group",
]);
export const materialTypeEnum = pgEnum("material_type", [
  "pdf",
  "video",
  "link",
  "other",
]);
export const academicMaterialStatusEnum = pgEnum("academic_material_status", [
  "pending",
  "approved",
  "rejected",
]);

// Survey Submissions Table
export const submissions = createTable(
  "submission",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    word: d.varchar({ length: 50 }).notNull(),
    imageUrl: d.text(),
    imageName: d.varchar({ length: 256 }),
    isAnonymous: d.boolean().default(false).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    userId: d.uuid().references(() => users.id, { onDelete: "set null" }),
  }),
  (t) => [
    index("submission_name_idx").on(t.name),
    index("submission_user_idx").on(t.userId),
    index("submission_created_idx").on(t.createdAt),
  ],
);

export const submissionsRelations = relations(submissions, ({ one }) => ({
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
}));

// Legacy posts table (kept for reference)
export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const users = createTable(
  "user",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    collegeId: d.varchar({ length: 12 }).notNull(),
    email: d.varchar({ length: 256 }).notNull(),
    password: d.varchar({ length: 256 }).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    isAdmin: d.boolean().default(false).notNull(),
  }),
  (t) => [
    index("user_college_id_idx").on(t.collegeId),
    index("user_email_idx").on(t.email),
  ],
);

// User Profiles Table - Extended profile information
export const userProfiles = createTable("user_profile", (d) => ({
  userId: d
    .uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: d.text(),
  avatarUrl: d.text(),
  coverUrl: d.text(),
  location: d.varchar({ length: 256 }),
  website: d.varchar({ length: 512 }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Social Posts Table - User-generated content
export const socialPosts = createTable(
  "social_post",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    authorId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    hiddenAt: d.timestamp({ withTimezone: true }),
    hiddenBy: d.uuid().references(() => users.id, { onDelete: "set null" }),
    hiddenReason: d.text(),
  }),
  (t) => [
    index("social_post_author_idx").on(t.authorId),
    index("social_post_created_idx").on(t.createdAt),
    index("social_post_hidden_idx").on(t.hiddenAt),
  ],
);

// Post Media Table - Images and videos attached to posts
export const postMedia = createTable(
  "post_media",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    postId: d
      .uuid()
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),
    mediaUrl: d.text().notNull(),
    mediaType: mediaTypeEnum().notNull(),
    order: d.integer().default(0).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("post_media_post_idx").on(t.postId)],
);

// Post Reactions Table - User reactions to posts
export const postReactions = createTable(
  "post_reaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    postId: d
      .uuid()
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionType: reactionTypeEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("post_reaction_post_idx").on(t.postId),
    index("post_reaction_user_idx").on(t.userId),
    unique("post_reaction_unique").on(t.postId, t.userId),
  ],
);

// Comments Table - Threaded comments on posts
export const comments = createTable(
  "comment",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    postId: d
      .uuid()
      .notNull()
      .references(() => socialPosts.id, { onDelete: "cascade" }),
    authorId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: d
      .uuid()
      .references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    hiddenAt: d.timestamp({ withTimezone: true }),
    hiddenBy: d.uuid().references(() => users.id, { onDelete: "set null" }),
    hiddenReason: d.text(),
  }),
  (t) => [
    index("comment_post_idx").on(t.postId),
    index("comment_author_idx").on(t.authorId),
    index("comment_parent_idx").on(t.parentId),
    index("comment_hidden_idx").on(t.hiddenAt),
  ],
);

// Comment Reactions Table - User reactions to comments
export const commentReactions = createTable(
  "comment_reaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    commentId: d
      .uuid()
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionType: reactionTypeEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("comment_reaction_comment_idx").on(t.commentId),
    index("comment_reaction_user_idx").on(t.userId),
    unique("comment_reaction_unique").on(t.commentId, t.userId),
  ],
);

// Academic Library Tables
export const subjects = createTable(
  "subject",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    code: d.varchar({ length: 50 }).notNull(),
    semester: d.integer().notNull(),
    icon: d.varchar({ length: 50 }).notNull(),
    accentColor: d.varchar({ length: 50 }).notNull(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("subject_code_idx").on(t.code)],
);

export const academicMaterials = createTable(
  "academic_material",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    subjectId: d
      .uuid()
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    uploaderId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    type: materialTypeEnum().notNull(),
    fileUrl: d.text().notNull(),
    status: academicMaterialStatusEnum().default("pending").notNull(),
    reviewedBy: d.uuid().references(() => users.id, { onDelete: "set null" }),
    reviewedAt: d.timestamp({ withTimezone: true }),
    rejectionReason: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("material_subject_idx").on(t.subjectId),
    index("material_uploader_idx").on(t.uploaderId),
    index("material_status_idx").on(t.status),
  ],
);

export const subjectsRelations = relations(subjects, ({ many }) => ({
  materials: many(academicMaterials),
}));

export const academicMaterialsRelations = relations(
  academicMaterials,
  ({ one }) => ({
    subject: one(subjects, {
      fields: [academicMaterials.subjectId],
      references: [subjects.id],
    }),
    uploader: one(users, {
      fields: [academicMaterials.uploaderId],
      references: [users.id],
    }),
    reviewer: one(users, {
      fields: [academicMaterials.reviewedBy],
      references: [users.id],
    }),
  }),
);

// Chat System Tables

// Conversations Table - Chat threads (private or group)
export const conversations = createTable(
  "conversation",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    type: conversationTypeEnum().notNull(),
    name: d.varchar({ length: 256 }), // For group chats
    avatarUrl: d.text(), // For group chats
    createdBy: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("conversation_created_by_idx").on(t.createdBy),
    index("conversation_type_idx").on(t.type),
  ],
);

// Conversation Participants Table - Members of conversations
export const conversationParticipants = createTable(
  "conversation_participant",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    conversationId: d
      .uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    lastReadAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("conversation_participant_conversation_idx").on(t.conversationId),
    index("conversation_participant_user_idx").on(t.userId),
    unique("conversation_participant_unique").on(t.conversationId, t.userId),
  ],
);

// Messages Table - Chat messages
export const messages = createTable(
  "message",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    conversationId: d
      .uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    deletedAt: d.timestamp({ withTimezone: true }),
    deletedForUserIds: d.uuid().array().default([]),
    replyToId: d
      .uuid()
      .references((): AnyPgColumn => messages.id, { onDelete: "set null" }),
    isForwarded: d.boolean().default(false).notNull(),
  }),
  (t) => [
    index("message_conversation_idx").on(t.conversationId),
    index("message_sender_idx").on(t.senderId),
    index("message_created_idx").on(t.createdAt),
  ],
);

export const messageMedia = createTable(
  "message_media",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    messageId: d
      .uuid()
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    mediaUrl: d.text().notNull(),
    mediaType: mediaTypeEnum().notNull(),
    order: d.integer().default(0).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("message_media_message_idx").on(t.messageId)],
);

export const messageReactions = createTable(
  "message_reaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    messageId: d
      .uuid()
      .notNull()
      .references(() => messages.id, { onDelete: "cascade" }),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reactionType: reactionTypeEnum().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("message_reaction_message_idx").on(t.messageId),
    index("message_reaction_user_idx").on(t.userId),
    unique("message_reaction_unique").on(t.messageId, t.userId),
  ],
);

// Notifications Table
export const notifications = createTable(
  "notification",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    recipientId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum().notNull(),

    // Optional references for context
    postId: d.uuid().references(() => socialPosts.id, { onDelete: "cascade" }),
    commentId: d.uuid().references(() => comments.id, { onDelete: "cascade" }),

    isRead: d.boolean().default(false).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("notification_recipient_idx").on(t.recipientId),
    index("notification_created_idx").on(t.createdAt),
    index("notification_unread_idx").on(t.recipientId, t.isRead),
  ],
);

// Reports System
export const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "harassment",
  "hate_speech",
  "violence",
  "nudity",
  "misinformation",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "resolved",
  "dismissed",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "post",
  "comment",
  "user",
]);

export const reportActionTypeEnum = pgEnum("report_action_type", [
  "resolved",
  "dismissed",
  "content_hidden",
  "content_deleted",
  "user_warned",
  "user_banned",
  "user_muted",
]);

export const reports = createTable(
  "report",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    reporterId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum().notNull(),
    targetId: d.uuid().notNull(),
    reason: reportReasonEnum().notNull(),
    status: reportStatusEnum().default("pending").notNull(),
    details: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    resolvedBy: d.uuid().references(() => users.id, { onDelete: "set null" }),
    resolvedAt: d.timestamp({ withTimezone: true }),
    resolutionNote: d.text(),
    actionTaken: reportActionTypeEnum(),
  }),
  (t) => [
    index("report_reporter_idx").on(t.reporterId),
    index("report_target_idx").on(t.targetType, t.targetId),
    index("report_status_idx").on(t.status),
  ],
);

// Admin Audit Log
export const adminAuditLog = createTable(
  "admin_audit_log",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    actorId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actionType: d.varchar({ length: 100 }).notNull(),
    targetType: d.varchar({ length: 50 }).notNull(),
    targetId: d.uuid().notNull(),
    reason: d.text(),
    metadata: d.jsonb().default({}),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_target_idx").on(t.targetType, t.targetId),
    index("audit_created_idx").on(t.createdAt),
    index("audit_action_idx").on(t.actionType),
  ],
);

// User Restrictions (bans, mutes, shadowbans)
export const restrictionTypeEnum = pgEnum("restriction_type", [
  "ban",
  "mute",
  "shadowban",
]);

export const userRestrictions = createTable(
  "user_restriction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: restrictionTypeEnum().notNull(),
    reason: d.text().notNull(),
    createdBy: d
      .uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [
    index("restriction_user_idx").on(t.userId),
    index("restriction_type_idx").on(t.type),
    index("restriction_expires_idx").on(t.expiresAt),
  ],
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  posts: many(socialPosts),
  reactions: many(postReactions),
  comments: many(comments),
  commentReactions: many(commentReactions),
  createdConversations: many(conversations),
  conversationParticipations: many(conversationParticipants),
  messages: many(messages),
  filedReports: many(reports),
  resolvedReports: many(reports, {
    relationName: "resolved_reports",
  }),
  restrictions: many(userRestrictions, {
    relationName: "restriction_user",
  }),
  createdRestrictions: many(userRestrictions, {
    relationName: "restriction_creator",
  }),
  auditLogs: many(adminAuditLog),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [reports.resolvedBy],
    references: [users.id],
    relationName: "resolved_reports",
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [socialPosts.authorId],
    references: [users.id],
  }),
  media: many(postMedia),
  reactions: many(postReactions),
  comments: many(comments),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
  post: one(socialPosts, {
    fields: [postMedia.postId],
    references: [socialPosts.id],
  }),
}));

export const postReactionsRelations = relations(postReactions, ({ one }) => ({
  post: one(socialPosts, {
    fields: [postReactions.postId],
    references: [socialPosts.id],
  }),
  user: one(users, {
    fields: [postReactions.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(socialPosts, {
    fields: [comments.postId],
    references: [socialPosts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_children",
  }),
  children: many(comments, {
    relationName: "comment_children",
  }),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(
  commentReactions,
  ({ one }) => ({
    comment: one(comments, {
      fields: [commentReactions.commentId],
      references: [comments.id],
    }),
    user: one(users, {
      fields: [commentReactions.userId],
      references: [users.id],
    }),
  }),
);

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [conversations.createdBy],
      references: [users.id],
    }),
    participants: many(conversationParticipants),
    messages: many(messages),
  }),
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(users, {
      fields: [conversationParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  media: many(messageMedia),
  reactions: many(messageReactions),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
    relationName: "message_replies",
  }),
}));

export const messageReactionsRelations = relations(
  messageReactions,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageReactions.messageId],
      references: [messages.id],
    }),
    user: one(users, {
      fields: [messageReactions.userId],
      references: [users.id],
    }),
  }),
);

export const messageMediaRelations = relations(messageMedia, ({ one }) => ({
  message: one(messages, {
    fields: [messageMedia.messageId],
    references: [messages.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "notification_recipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "notification_actor",
  }),
  post: one(socialPosts, {
    fields: [notifications.postId],
    references: [socialPosts.id],
  }),
  comment: one(comments, {
    fields: [notifications.commentId],
    references: [comments.id],
  }),
}));

// Admin Audit Log Relations
export const adminAuditLogRelations = relations(adminAuditLog, ({ one }) => ({
  actor: one(users, {
    fields: [adminAuditLog.actorId],
    references: [users.id],
  }),
}));

// User Restrictions Relations
export const userRestrictionsRelations = relations(
  userRestrictions,
  ({ one }) => ({
    user: one(users, {
      fields: [userRestrictions.userId],
      references: [users.id],
      relationName: "restriction_user",
    }),
    createdByUser: one(users, {
      fields: [userRestrictions.createdBy],
      references: [users.id],
      relationName: "restriction_creator",
    }),
  }),
);
