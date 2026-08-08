CREATE TYPE "public"."template_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(220) NOT NULL,
	"description" text,
	"preview_image_url" varchar(500),
	"category_id" uuid,
	"blocks_json" jsonb NOT NULL,
	"page_settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"html_snapshot" text NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "template_status" DEFAULT 'draft' NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_category_id_business_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "templates" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_templates_status" ON "templates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_templates_featured" ON "templates" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_templates_sort" ON "templates" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_templates_created_by" ON "templates" USING btree ("created_by");