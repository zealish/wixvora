import {
  pgTable,
  varchar,
  integer,
  timestamp,
  uuid,
  pgEnum,
  unique,
  check,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
]);

export const businessCategories = pgTable(
  "business_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    icon: varchar("icon", { length: 100 }),
    displayOrder: integer("display_order").notNull(),
    status: categoryStatusEnum("status").notNull().default("active"),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueOrderPerParent: unique("uq_category_order_parent").on(
      table.parentId,
      table.displayOrder
    ),
    checkPositiveOrder: check(
      "ck_category_order_positive",
      sql`${table.displayOrder} > 0`
    ),
    parentIdx: index("idx_categories_parent").on(table.parentId),
    statusIdx: index("idx_categories_status").on(table.status),
    orderIdx: index("idx_categories_order").on(
      table.parentId,
      table.displayOrder
    ),
  })
);

export const businessCategoriesRelations = relations(
  businessCategories,
  ({ one, many }) => ({
    parent: one(businessCategories, {
      fields: [businessCategories.parentId],
      references: [businessCategories.id],
      relationName: "categoryChildren",
    }),
    children: many(businessCategories, { relationName: "categoryChildren" }),
  })
);
