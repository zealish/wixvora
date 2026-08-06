import { z } from "zod";

export const updateClientProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateClientProfileInput = z.infer<
  typeof updateClientProfileSchema
>;

export const createClientSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  displayName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
