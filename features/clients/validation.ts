import { z } from 'zod';

export const updateClientProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateClientProfileInput = z.infer<typeof updateClientProfileSchema>;
