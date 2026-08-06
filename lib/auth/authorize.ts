import { db } from "@/lib/db";
import {
  staffs,
  staffRoles,
  roles,
  rolePermissions,
  permissions,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getSession } from "./session";
import type { PermissionKey } from "@/types/rbac";

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const permissionCache = new Map<string, Set<string>>();

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const cached = permissionCache.get(userId);
  if (cached) {
    return cached;
  }

  const staff = await db.query.staffs.findFirst({
    where: and(eq(staffs.userId, userId), isNull(staffs.deletedAt)),
  });

  if (!staff) {
    const emptySet = new Set<string>();
    permissionCache.set(userId, emptySet);
    return emptySet;
  }

  const staffRolesList = await db
    .select({
      roleCode: roles.code,
    })
    .from(staffRoles)
    .innerJoin(
      roles,
      and(eq(staffRoles.roleId, roles.id), isNull(roles.deletedAt))
    )
    .where(eq(staffRoles.staffId, staff.id));

  const hasSuperAdmin = staffRolesList.some(
    (sr) => sr.roleCode === "SUPER_ADMIN"
  );

  if (hasSuperAdmin) {
    const wildcardSet = new Set<string>(["*"]);
    permissionCache.set(userId, wildcardSet);
    return wildcardSet;
  }

  const roleIds = staffRolesList.map((sr) => sr.roleCode);

  const permissionKeys = await db
    .select({
      key: permissions.key,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(
      roles,
      and(eq(rolePermissions.roleId, roles.id), isNull(roles.deletedAt))
    )
    .where(and(...roleIds.map((code) => eq(roles.code, code))));

  const permissionSet = new Set<string>(permissionKeys.map((p) => p.key));
  permissionCache.set(userId, permissionSet);
  return permissionSet;
}

export async function authorize(permissionKey: PermissionKey): Promise<void> {
  const session = await getSession();

  if (!session) {
    throw new AuthorizationError("Unauthorized");
  }

  const userPermissions = await getUserPermissions(session.user.id);

  if (!userPermissions.has("*") && !userPermissions.has(permissionKey)) {
    throw new AuthorizationError("Forbidden");
  }
}
