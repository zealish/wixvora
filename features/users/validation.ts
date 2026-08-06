import { z } from "zod";

export const createStaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  position: z.string().optional(),
  roleIds: z.array(z.string().uuid()).min(1, "At least one role is required"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
