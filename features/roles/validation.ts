import { z } from 'zod';

export const updateRolePermissionsSchema = z.object({
  roleId: z.string().uuid(),
  permissionIds: z.array(z.string().uuid()),
});

export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
