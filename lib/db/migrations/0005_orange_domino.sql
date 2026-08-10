ALTER TABLE "templates" ADD COLUMN "pages" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "websites" ADD COLUMN "pages" jsonb DEFAULT '[]'::jsonb NOT NULL;