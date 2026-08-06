import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    companyName: text("company_name"),
    phone: text("phone"),
    timezone: text("timezone"),
    locale: text("locale"),
    status: text("status", { enum: ["ACTIVE", "SUSPENDED", "INACTIVE"] })
      .notNull()
      .default("ACTIVE"),
    preferences: jsonb("preferences"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    userIdIdx: index("clients_user_id_idx").on(table.userId),
  })
);

export const clientsRelations = relations(clients, ({ one }) => ({
  user: one(user, {
    fields: [clients.userId],
    references: [user.id],
  }),
}));
