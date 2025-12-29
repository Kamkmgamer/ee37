CREATE TABLE "ee37_message_reaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"messageId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"reactionType" "reaction_type" NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	CONSTRAINT "message_reaction_unique" UNIQUE("messageId","userId")
);
--> statement-breakpoint
ALTER TABLE "ee37_message" ADD COLUMN "deletedForUserIds" uuid[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "ee37_message" ADD COLUMN "replyToId" uuid;--> statement-breakpoint
ALTER TABLE "ee37_message" ADD COLUMN "isForwarded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ee37_submission" ADD COLUMN "userId" uuid;--> statement-breakpoint
ALTER TABLE "ee37_message_reaction" ADD CONSTRAINT "ee37_message_reaction_messageId_ee37_message_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."ee37_message"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_message_reaction" ADD CONSTRAINT "ee37_message_reaction_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_reaction_message_idx" ON "ee37_message_reaction" USING btree ("messageId");--> statement-breakpoint
CREATE INDEX "message_reaction_user_idx" ON "ee37_message_reaction" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "ee37_message" ADD CONSTRAINT "ee37_message_replyToId_ee37_message_id_fk" FOREIGN KEY ("replyToId") REFERENCES "public"."ee37_message"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ee37_submission" ADD CONSTRAINT "ee37_submission_userId_ee37_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."ee37_user"("id") ON DELETE set null ON UPDATE no action;