"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createAuditLog } from "@/features/audit/service";
import { createStaffWithRoles, updateStaffProfile } from "./service";
import { createStaffSchema } from "./validation";
import type { UserActionResult } from "./types";
import { z } from "zod";

const updateStaffSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  department: z.string().optional(),
  position: z.string().optional(),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "TERMINATED"]),
});

export async function createStaffAction(
  data: unknown
): Promise<UserActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.USERS_CREATE);

    const validated = createStaffSchema.parse(data);

    const { userId, staffId } = await createStaffWithRoles(
      validated,
      session.user.id
    );

    await createAuditLog({
      userId: session.user.id,
      action: "STAFF_CREATED",
      entity: "user",
      entityId: userId,
      metadata: {
        email: validated.email,
        staffId,
        roleIds: validated.roleIds,
      },
    });

    revalidatePath("/staff/staffs");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateStaffAction(
  data: unknown
): Promise<UserActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.USERS_UPDATE);

    const validated = updateStaffSchema.parse(data);

    await updateStaffProfile({
      id: validated.id,
      name: validated.name,
      email: validated.email,
      department: validated.department ?? "",
      position: validated.position ?? "",
      employmentStatus: validated.employmentStatus,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "STAFF_UPDATED",
      entity: "user",
      entityId: validated.id,
      metadata: {
        email: validated.email,
        department: validated.department,
        position: validated.position,
        employmentStatus: validated.employmentStatus,
      },
    });

    revalidatePath("/staff/staffs");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

