CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"seo_settings" jsonb,
	"general_settings" jsonb,
	"email_settings" jsonb,
	"integrations_settings" jsonb,
	"security_settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
