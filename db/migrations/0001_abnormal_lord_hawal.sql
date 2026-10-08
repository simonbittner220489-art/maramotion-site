CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"action" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "consent_gdpr" boolean DEFAULT false NOT NULL;