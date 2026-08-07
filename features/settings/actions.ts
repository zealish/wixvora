"use server";

import { getSession } from "@/lib/auth/session";
import { createAuditLog } from "@/features/audit/service";
import { getStaffByUserId } from "@/features/users/queries";
import { seoSettingsSchema } from "./validation";
import { getSeoSettings, updateSeoSettings } from "./service";
import type { SettingsActionResult } from "./types";

export async function updateSeoSettingsAction(
  data: unknown
): Promise<SettingsActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    const staff = await getStaffByUserId(session.user.id);
    if (!staff) {
      return { success: false, error: "Staff record not found" };
    }

    const isSuperAdmin = staff.roles.some(
      (role: { code: string }) => role.code === "SUPER_ADMIN"
    );
    if (!isSuperAdmin) {
      return { success: false, error: "Forbidden: SUPER_ADMIN access required" };
    }

    const validated = seoSettingsSchema.parse(data);
    const oldSettings = await getSeoSettings();

    await updateSeoSettings(validated);

    await createAuditLog({
      userId: session.user.id,
      action: "SETTINGS_UPDATE",
      entity: "settings",
      entityId: "1",
      metadata: {
        category: "seo",
        oldValues: oldSettings,
        newValues: validated,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
