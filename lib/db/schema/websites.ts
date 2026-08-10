import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { Section, PageSettings, Page } from "@/components/website-editor/lib/block-types";
import { templates } from "./templates";

// ============================================================================
// Enums
// ============================================================================

export const websiteStatusEnum = pgEnum("website_status", [
  "draft",
  "published",
  "archived",
]);

// ============================================================================
// Websites Table Schema
// ============================================================================

export const websites = pgTable("websites", {
  // ==========================================================================
  // Primary Key
  // ==========================================================================
  id: uuid("id").primaryKey().defaultRandom(),

  // ==========================================================================
  // Basic Info
  // ==========================================================================
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),

  // ==========================================================================
  // Owner Reference
  // ==========================================================================
  ownerId: uuid("owner_id").notNull(),

  // ==========================================================================
  // Template Source (optional - for blank sites this is null)
  // ==========================================================================
  templateId: uuid("template_id").references(() => templates.id, {
    onDelete: "set null",
  }),

  // ==========================================================================
  // Status & Publishing
  // ==========================================================================
  status: websiteStatusEnum("status").notNull().default("draft"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),

  // ==========================================================================
  // URLs
  // ==========================================================================
  mainDomain: varchar("main_domain", { length: 512 }),
  subdomain: varchar("subdomain", { length: 255 }),

  // ==========================================================================
  // Custom Domain Configuration
  // ==========================================================================
  customDomain: varchar("custom_domain", { length: 512 }),
  customDomainVerified: boolean("custom_domain_verified")
    .notNull()
    .default(false),
  sslEnabled: boolean("ssl_enabled").notNull().default(false),

  // ==========================================================================
  // Analytics
  // ==========================================================================
  analyticsId: varchar("analytics_id", { length: 255 }),
  analyticsEnabled: boolean("analytics_enabled").notNull().default(false),

  // ==========================================================================
  // Content Data
  // ==========================================================================
  sections: jsonb("sections").$type<Section[]>().notNull().default(sql`'[]'::jsonb`),
  pageSettings: jsonb("page_settings").$type<PageSettings>().notNull().default(sql`'{}'::jsonb`),
  pages: jsonb("pages").$type<Page[]>().default(sql`'[]'::jsonb`),

  // ==========================================================================
  // SEO Settings
  // ==========================================================================
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  seoImage: varchar("seo_image", { length: 512 }),
  seoCanonicalUrl: varchar("seo_canonical_url", { length: 512 }),

  // ==========================================================================
  // Metadata
  // ==========================================================================
  themeSettings: text("theme_settings"), // JSON-like config for theme customization
  layoutSettings: text("layout_settings"), // Layout preferences

  // ==========================================================================
  // Timestamps
  // ==========================================================================
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),

  // ==========================================================================
  // Soft delete
  // ==========================================================================
  deletedAt: timestamp("deleted_at"),
});

// ============================================================================
// Relations
// ============================================================================

export const websitesRelations = relations(websites, ({ one }) => ({
  template: one(templates, {
    fields: [websites.templateId],
    references: [templates.id],
  }),
}));
