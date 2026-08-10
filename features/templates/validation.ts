import { z } from "zod";

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  elements: z.array(z.any()),
  heights: z.object({
    desktop: z.number(),
    tablet: z.number(),
    mobile: z.number(),
  }),
  bgColor: z.string(),
  bgGradient: z.string().optional(),
});

const pageSettingsSchema = z.object({
  title: z.string(),
  bgColor: z.string(),
  fontFamily: z.string(),
});

const pagesSchema = z.array(
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
);

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be 200 characters or less"),
  slug: z.string().min(1).max(220).optional(),
  description: z.string().optional().nullable(),
  previewImageUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  sections: z.array(sectionSchema),
  pageSettings: pageSettingsSchema.optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .extend({
    pages: pagesSchema.optional(),
  });

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
