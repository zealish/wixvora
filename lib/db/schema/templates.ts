import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { businessCategories } from "./business-categories";
import { user } from "./auth";
import type { BlockConfig, PageSettings } from "@/features/templates/lib/block-types";

export const templateStatusEnum = pgEnum("template_status", ["draft", "published"]);

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    description: text("description"),
    previewImageUrl: varchar("preview_image_url", { length: 500 }),
    categoryId: uuid("category_id").references(() => businessCategories.id, {
      onDelete: "set null",
    }),
    blocksJson: jsonb("blocks_json").$type<BlockConfig[]>().notNull(),
    pageSettings: jsonb("page_settings")
      .$type<PageSettings>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    htmlSnapshot: text("html_snapshot").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    status: templateStatusEnum("status").notNull().default("draft"),
    usageCount: integer("usage_count").notNull().default(0),
    lastUsedAt: timestamp("last_used_at"),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    categoryIdx: index("idx_templates_category").on(table.categoryId),
    statusIdx: index("idx_templates_status").on(table.status),
    featuredIdx: index("idx_templates_featured").on(table.isFeatured),
    sortIdx: index("idx_templates_sort").on(table.sortOrder),
    createdByIdx: index("idx_templates_created_by").on(table.createdBy),
  })
);

export const templatesRelations = relations(templates, ({ one }) => ({
  category: one(businessCategories, {
    fields: [templates.categoryId],
    references: [businessCategories.id],
  }),
  creator: one(user, {
    fields: [templates.createdBy],
    references: [user.id],
  }),
}));
