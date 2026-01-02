CREATE TABLE "ee37_email_verification_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ee37_submission" ALTER COLUMN "word" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_submission" ADD COLUMN "semester" integer;--> statement-breakpoint
ALTER TABLE "ee37_submission" ADD COLUMN "batchId" uuid;--> statement-breakpoint
ALTER TABLE "ee37_submission" ADD COLUMN "isAnonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_user" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "verification_email_idx" ON "ee37_email_verification_code" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_expires_idx" ON "ee37_email_verification_code" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "submission_user_idx" ON "ee37_submission" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "submission_created_idx" ON "ee37_submission" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "submission_semester_idx" ON "ee37_submission" USING btree ("semester");--> statement-breakpoint
CREATE INDEX "submission_batch_idx" ON "ee37_submission" USING btree ("batchId");