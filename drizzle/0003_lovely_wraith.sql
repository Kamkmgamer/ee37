CREATE TYPE "public"."academic_material_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."material_type" AS ENUM('pdf', 'video', 'link', 'other');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('post_reaction', 'comment_reaction', 'new_comment', 'comment_reply');--> statement-breakpoint
CREATE TYPE "public"."report_action_type" AS ENUM('resolved', 'dismissed', 'content_hidden', 'content_deleted', 'user_warned', 'user_banned', 'user_muted');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'misinformation', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('post', 'comment', 'user');--> statement-breakpoint
CREATE TYPE "public"."restriction_type" AS ENUM('ban', 'mute', 'shadowban');--> statement-breakpoint
CREATE TABLE "ee37_academic_material" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subjectId" uuid NOT NULL,
	"uploaderId" uuid NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"type" "material_type" NOT NULL,
	"fileUrl" text NOT NULL,
	"status" "academic_material_status" DEFAULT 'pending' NOT NULL,
	"reviewedBy" uuid,
	"reviewedAt" timestamp with time zone,
	"rejectionReason" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actorId" uuid NOT NULL,
	"actionType" varchar(100) NOT NULL,
	"targetType" varchar(50) NOT NULL,
	"targetId" uuid NOT NULL,
	"reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ee37_notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipientId" uuid NOT NULL,
	"actorId" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"postId" uuid,
	"commentId" uuid,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ee37_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporterId" uuid NOT NULL,
	"targetType" "report_target_type" NOT NULL,
	"targetId" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"details" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone,
	"resolvedBy" uuid,
	"resolvedAt" timestamp with time zone,
	"resolutionNote" text,
	"actionTaken" "report_action_type"
);
--> statement-breakpoint
CREATE TABLE "ee37_subject" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"code" varchar(50) NOT NULL,
	"semester" integer NOT NULL,
	"icon" varchar(50) NOT NULL,
	"accentColor" varchar(50) NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ee37_user_restriction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" "restriction_type" NOT NULL,
	"reason" text NOT NULL,
	"createdBy" uuid NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD COLUMN "hiddenAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD COLUMN "hiddenBy" uuid;--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD COLUMN "hiddenReason" text;--> statement-breakpoint
ALTER TABLE "ee37_social_post" ADD COLUMN "hiddenAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ee37_social_post" ADD COLUMN "hiddenBy" uuid;--> statement-breakpoint
ALTER TABLE "ee37_social_post" ADD COLUMN "hiddenReason" text;--> statement-breakpoint
ALTER TABLE "ee37_user" ADD COLUMN "isAdmin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_academic_material" ADD CONSTRAINT "ee37_academic_material_subjectId_ee37_subject_id_fk" FOREIGN KEY ("subjectId") REFERENCES "public"."ee37_subject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_academic_material" ADD CONSTRAINT "ee37_academic_material_uploaderId_ee37_user_id_fk" FOREIGN KEY ("uploaderId") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_academic_material" ADD CONSTRAINT "ee37_academic_material_reviewedBy_ee37_user_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_admin_audit_log" ADD CONSTRAINT "ee37_admin_audit_log_actorId_ee37_user_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_notification" ADD CONSTRAINT "ee37_notification_recipientId_ee37_user_id_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_notification" ADD CONSTRAINT "ee37_notification_actorId_ee37_user_id_fk" FOREIGN KEY ("actorId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_notification" ADD CONSTRAINT "ee37_notification_postId_ee37_social_post_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."ee37_social_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_notification" ADD CONSTRAINT "ee37_notification_commentId_ee37_comment_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."ee37_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_report" ADD CONSTRAINT "ee37_report_reporterId_ee37_user_id_fk" FOREIGN KEY ("reporterId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_report" ADD CONSTRAINT "ee37_report_resolvedBy_ee37_user_id_fk" FOREIGN KEY ("resolvedBy") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_user_restriction" ADD CONSTRAINT "ee37_user_restriction_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_user_restriction" ADD CONSTRAINT "ee37_user_restriction_createdBy_ee37_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "material_subject_idx" ON "ee37_academic_material" USING btree ("subjectId");--> statement-breakpoint
CREATE INDEX "material_uploader_idx" ON "ee37_academic_material" USING btree ("uploaderId");--> statement-breakpoint
CREATE INDEX "material_status_idx" ON "ee37_academic_material" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "ee37_admin_audit_log" USING btree ("actorId");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "ee37_admin_audit_log" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "ee37_admin_audit_log" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "ee37_admin_audit_log" USING btree ("actionType");--> statement-breakpoint
CREATE INDEX "notification_recipient_idx" ON "ee37_notification" USING btree ("recipientId");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "ee37_notification" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "notification_unread_idx" ON "ee37_notification" USING btree ("recipientId","isRead");--> statement-breakpoint
CREATE INDEX "report_reporter_idx" ON "ee37_report" USING btree ("reporterId");--> statement-breakpoint
CREATE INDEX "report_target_idx" ON "ee37_report" USING btree ("targetType","targetId");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "ee37_report" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subject_code_idx" ON "ee37_subject" USING btree ("code");--> statement-breakpoint
CREATE INDEX "restriction_user_idx" ON "ee37_user_restriction" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "restriction_type_idx" ON "ee37_user_restriction" USING btree ("type");--> statement-breakpoint
CREATE INDEX "restriction_expires_idx" ON "ee37_user_restriction" USING btree ("expiresAt");--> statement-breakpoint
ALTER TABLE "ee37_comment" ADD CONSTRAINT "ee37_comment_hiddenBy_ee37_user_id_fk" FOREIGN KEY ("hiddenBy") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_social_post" ADD CONSTRAINT "ee37_social_post_hiddenBy_ee37_user_id_fk" FOREIGN KEY ("hiddenBy") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_hidden_idx" ON "ee37_comment" USING btree ("hiddenAt");--> statement-breakpoint
CREATE INDEX "social_post_hidden_idx" ON "ee37_social_post" USING btree ("hiddenAt");