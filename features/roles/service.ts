import { db } from "@/lib/db";
import { roles, rolePermissions } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import type { RoleWithPermissions } from "./types";

export async function getRolesWithPermissions(): Promise<
  RoleWithPermissions[]
> {
  const rolesList = await db.query.roles.findMany({
    where: isNull(roles.deletedAt),
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  return rolesList.map((role) => ({
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    deletedAt: role.deletedAt,
    permissions: role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      key: rp.permission.key,
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.permission.scope,
      description: rp.permission.description,
    })),
  }));
}

export async function getRoleById(
  roleId: string
): Promise<RoleWithPermissions | null> {
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    return null;
  }

  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    deletedAt: role.deletedAt,
    permissions: role.rolePermissions.map((rp) => ({
      id: rp.permission.id,
      key: rp.permission.key,
      resource: rp.permission.resource,
      action: rp.permission.action,
      scope: rp.permission.scope,
      description: rp.permission.description,
    })),
  };
}

export async function getAllPermissions() {
  return db.query.permissions.findMany();
}

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(
        permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        }))
      );
    }
  });
}
