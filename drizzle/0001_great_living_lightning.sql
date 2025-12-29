CREATE TYPE "public"."conversation_type" AS ENUM('private', 'group');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike', 'heart', 'angry', 'laugh', 'wow', 'sad');--> statement-breakpoint
CREATE TABLE "ee37_comment_reaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commentId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "comment_reaction_unique" UNIQUE("commentId","userId")
);
--> statement-breakpoint
CREATE TABLE "ee37_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"authorId" uuid NOT NULL,
	"parentId" uuid,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_conversation_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"joinedAt" timestamp with time zone NOT NULL,
	"lastReadAt" timestamp with time zone,
	CONSTRAINT "conversation_participant_unique" UNIQUE("conversationId","userId")
);
--> statement-breakpoint
CREATE TABLE "ee37_conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "conversation_type" NOT NULL,
	"name" varchar(256),
	"avatarUrl" text,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_message_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" uuid NOT NULL,
	"mediaUrl" text NOT NULL,
	"mediaType" "media_type" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ee37_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversationId" uuid NOT NULL,
	"senderId" uuid NOT NULL,
	"content" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_post_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"mediaUrl" text NOT NULL,
	"mediaType" "media_type" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ee37_post_reaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "post_reaction_unique" UNIQUE("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "ee37_social_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"authorId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_user_profile" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"bio" text,
	"avatarUrl" text,
	"coverUrl" text,
	"location" varchar(256),
	"website" varchar(512),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"collegeId" varchar(12) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ee37_comment_reaction" ADD CONSTRAINT "ee37_comment_reaction_commentId_ee37_comment_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."ee37_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_comment_reaction" ADD CONSTRAINT "ee37_comment_reaction_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD CONSTRAINT "ee37_comment_postId_ee37_social_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."ee37_social_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD CONSTRAINT "ee37_comment_authorId_ee37_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD CONSTRAINT "ee37_comment_parentId_ee37_comment_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."ee37_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_conversation_participant" ADD CONSTRAINT "ee37_conversation_participant_conversationId_ee37_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."ee37_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_conversation_participant" ADD CONSTRAINT "ee37_conversation_participant_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_conversation" ADD CONSTRAINT "ee37_conversation_createdBy_ee37_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_message_media" ADD CONSTRAINT "ee37_message_media_messageId_ee37_message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."ee37_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_message" ADD CONSTRAINT "ee37_message_conversationId_ee37_conversation_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."ee37_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_message" ADD CONSTRAINT "ee37_message_senderId_ee37_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_post_media" ADD CONSTRAINT "ee37_post_media_postId_ee37_social_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."ee37_social_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_post_reaction" ADD CONSTRAINT "ee37_post_reaction_postId_ee37_social_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."ee37_social_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_post_reaction" ADD CONSTRAINT "ee37_post_reaction_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_social_post" ADD CONSTRAINT "ee37_social_post_authorId_ee37_user_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_user_profile" ADD CONSTRAINT "ee37_user_profile_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_reaction_comment_idx" ON "ee37_comment_reaction" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "comment_reaction_user_idx" ON "ee37_comment_reaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "comment_post_idx" ON "ee37_comment" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "comment_author_idx" ON "ee37_comment" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "comment_parent_idx" ON "ee37_comment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "conversation_participant_conversation_idx" ON "ee37_conversation_participant" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "conversation_participant_user_idx" ON "ee37_conversation_participant" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "conversation_created_by_idx" ON "ee37_conversation" USING btree ("createdBy");--> statement-breakpoint
CREATE INDEX "conversation_type_idx" ON "ee37_conversation" USING btree ("type");--> statement-breakpoint
CREATE INDEX "message_media_message_idx" ON "ee37_message_media" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "message_conversation_idx" ON "ee37_message" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "message_sender_idx" ON "ee37_message" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "message_created_idx" ON "ee37_message" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "post_media_post_idx" ON "ee37_post_media" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "post_reaction_post_idx" ON "ee37_post_reaction" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "post_reaction_user_idx" ON "ee37_post_reaction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "social_post_author_idx" ON "ee37_social_post" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "social_post_created_idx" ON "ee37_social_post" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "user_college_id_idx" ON "ee37_user" USING btree ("collegeId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "ee37_user" USING btree ("email");