CREATE TYPE "public"."category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "business_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"icon" varchar(100),
	"display_order" integer NOT NULL,
	"status" "category_status" DEFAULT 'active' NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug"),
	CONSTRAINT "uq_category_order_parent" UNIQUE("parent_id","display_order"),
	CONSTRAINT "ck_category_order_positive" CHECK ("business_categories"."display_order" > 0)
);
--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "business_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_categories_status" ON "business_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_categories_order" ON "business_categories" USING btree ("parent_id","display_order");