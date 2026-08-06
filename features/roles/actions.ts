"use server";

import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { createAuditLog } from "@/features/audit/service";
import { updateRolePermissionsSchema } from "./validation";
import { updateRolePermissions } from "./service";
import type { RoleActionResult } from "./types";

export async function updateRolePermissionsAction(
  input: unknown
): Promise<RoleActionResult> {
  try {
    await authorize(PERMISSIONS.ROLES_MANAGE);
    const session = await requireSession();

    const validatedInput = updateRolePermissionsSchema.parse(input);

    await updateRolePermissions(
      validatedInput.roleId,
      validatedInput.permissionIds
    );

    await createAuditLog({
      userId: session.user.id,
      action: "role.permissions.update",
      entity: "role",
      entityId: validatedInput.roleId,
      metadata: {
        permissionIds: validatedInput.permissionIds,
      },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update permissions",
    };
  }
}
