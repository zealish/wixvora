import { z } from "zod";
import type { Section, PageSettings } from "@/components/website-editor/lib/block-types";

const sectionSchema = z.custom<Section>();
const pageSettingsSchema = z.custom<PageSettings>();

export const createWebsiteSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(255),
});

export type CreateWebsiteInput = z.infer<typeof createWebsiteSchema>;

export const updateWebsiteSectionsSchema = z.object({
  sections: z.array(sectionSchema).optional(),
  pageSettings: pageSettingsSchema.optional(),
  pages: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        sections: z.array(sectionSchema),
        pageSettings: pageSettingsSchema,
        isHomePage: z.boolean(),
        sortOrder: z.number(),
        navigationSettings: z
          .object({
            layout: z.enum(["horizontal", "vertical", "hamburger"]),
            position: z.enum(["top", "left", "right"]),
            bgColor: z.string(),
            textColor: z.string(),
            activeColor: z.string(),
            logo: z.string().optional(),
            showLogo: z.boolean(),
            showCTAButton: z.boolean(),
            ctaText: z.string(),
            ctaUrl: z.string(),
          })
          .optional(),
      })
    )
    .optional(),
});

export type UpdateWebsiteSectionsInput = z.infer<typeof updateWebsiteSectionsSchema>;
