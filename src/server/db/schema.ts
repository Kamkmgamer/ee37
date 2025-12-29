// Database schema for EE37
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import { index, pgTableCreator, pgEnum, unique, type AnyPgColumn } from "drizzle-orm/pg-core";

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

// Survey Submissions Table
export const submissions = createTable(
  "submission",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    word: d.varchar({ length: 50 }).notNull(),
    imageUrl: d.text(),
    imageName: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
  }),
  (t) => [index("submission_name_idx").on(t.name)],
);

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
  }),
  (t) => [
    index("user_college_id_idx").on(t.collegeId),
    index("user_email_idx").on(t.email),
  ],
);

// User Profiles Table - Extended profile information
export const userProfiles = createTable(
  "user_profile",
  (d) => ({
    userId: d.uuid().primaryKey().references(() => users.id, { onDelete: "cascade" }),
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
  }),
);

// Social Posts Table - User-generated content
export const socialPosts = createTable(
  "social_post",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    authorId: d.uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("social_post_author_idx").on(t.authorId),
    index("social_post_created_idx").on(t.createdAt),
  ],
);

// Post Media Table - Images and videos attached to posts
export const postMedia = createTable(
  "post_media",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    postId: d.uuid().notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
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
    postId: d.uuid().notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
    userId: d.uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
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
    postId: d.uuid().notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
    authorId: d.uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    parentId: d.uuid().references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    content: d.text().notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("comment_post_idx").on(t.postId),
    index("comment_author_idx").on(t.authorId),
    index("comment_parent_idx").on(t.parentId),
  ],
);

// Comment Reactions Table - User reactions to comments
export const commentReactions = createTable(
  "comment_reaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    commentId: d.uuid().notNull().references(() => comments.id, { onDelete: "cascade" }),
    userId: d.uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
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

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
}));
