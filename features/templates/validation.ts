import { z } from "zod";
import { blockConfigSchema, pageSettingsSchema } from "./lib/block-validator";

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  slug: z.string().min(1).max(220).optional(),
  description: z.string().optional().nullable(),
  previewImageUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  blocks: z.array(blockConfigSchema),
  pageSettings: pageSettingsSchema.optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
