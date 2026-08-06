import { db } from "@/lib/db";
import { user, staffs, roles } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import type { UserWithProfile } from "./types";

export async function getAllStaffUsers(): Promise<UserWithProfile[]> {
  const staffUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      createdAt: user.createdAt,
      staffId: staffs.id,
      department: staffs.department,
      position: staffs.position,
      employmentStatus: staffs.employmentStatus,
    })
    .from(user)
    .leftJoin(staffs, eq(user.id, staffs.userId))
    .where(eq(user.accountType, "STAFF"));

  return staffUsers.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    accountType: row.accountType as "CLIENT" | "STAFF",
    createdAt: row.createdAt,
    staff: row.staffId
      ? {
          id: row.staffId,
          department: row.department,
          position: row.position,
          employmentStatus: row.employmentStatus as
            "ACTIVE" | "INACTIVE" | "TERMINATED",
        }
      : null,
  }));
}

export async function getAllRoles() {
  return await db
    .select({
      id: roles.id,
      code: roles.code,
      name: roles.name,
      description: roles.description,
    })
    .from(roles)
    .where(isNull(roles.deletedAt));
}
