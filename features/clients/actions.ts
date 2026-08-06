"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createAuditLog } from "@/features/audit/service";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateClientProfileSchema } from "./validation";
import type { ClientActionResult } from "./types";

export async function updateClientProfile(
  data: unknown
): Promise<ClientActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "CLIENT") {
      return { success: false, error: "Forbidden: Client access required" };
    }

    const validated = updateClientProfileSchema.parse(data);

    await db
      .update(clients)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(clients.userId, session.user.id));

    await createAuditLog({
      userId: session.user.id,
      action: "CLIENT_PROFILE_UPDATED",
      entity: "client",
      entityId: session.user.id,
      metadata: validated,
    });

    revalidatePath("/client/profile");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
