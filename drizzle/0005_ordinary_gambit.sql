ALTER TABLE "ee37_email_verification_code" ADD COLUMN "name" varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_email_verification_code" ADD COLUMN "collegeId" varchar(12) NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_email_verification_code" ADD COLUMN "hashedPassword" varchar(256) NOT NULL;