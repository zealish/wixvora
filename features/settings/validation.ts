import { z } from "zod";

export const googleAnalyticsSchema = z.object({
  enabled: z.boolean().default(false),
  measurementId: z
    .string()
    .regex(/^G-[A-Za-z0-9]{10}$/, "Invalid GA Measurement ID format (e.g. G-XXXXXXXXXX)")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
});

export const searchConsoleSchema = z.object({
  siteUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
  verificationToken: z
    .string()
    .min(1, "Verification token cannot be empty")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
});

export const seoSettingsSchema = z.object({
  googleAnalytics: googleAnalyticsSchema,
  searchConsole: searchConsoleSchema,
});

export type GoogleAnalyticsSettings = z.infer<typeof googleAnalyticsSchema>;
export type SearchConsoleSettings = z.infer<typeof searchConsoleSchema>;
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
