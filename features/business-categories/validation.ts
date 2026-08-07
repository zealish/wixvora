import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").max(120, "Slug must be 120 characters or less"),
  icon: z.string().max(100).optional().nullable(),
  displayOrder: z.number().int().min(1, "Display order must be at least 1"),
  status: z.enum(["active", "inactive"]).default("active"),
  parentId: z.string().uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
