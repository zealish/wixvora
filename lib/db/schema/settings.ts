import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  seoSettings: jsonb("seo_settings"),
  generalSettings: jsonb("general_settings"),
  emailSettings: jsonb("email_settings"),
  integrationsSettings: jsonb("integrations_settings"),
  securitySettings: jsonb("security_settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
