import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    scope: text("scope"),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    keyIdx: index("permissions_key_idx").on(table.key),
  })
);
