-- Migration 0005: Add multipage support
ALTER TABLE "templates" ADD COLUMN "pages" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "websites" ADD COLUMN "pages" jsonb DEFAULT '[]'::jsonb;
