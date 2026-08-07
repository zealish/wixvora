"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createCategorySchema, updateCategorySchema } from "./validation";
import {
  createCategory,
  updateCategory,
  softDeleteCategory,
  toggleCategoryStatus,
} from "./service";
import type { CategoryActionResult } from "./types";

export async function createCategoryAction(
  data: unknown
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_CREATE);

    const validated = createCategorySchema.parse(data);
    const { id } = await createCategory(validated, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateCategoryAction(
  data: unknown
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_UPDATE);

    const validated = updateCategorySchema.parse(data);
    await updateCategory(validated.id, validated, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_DELETE);

    await softDeleteCategory(id, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleStatusAction(
  id: string,
  status: "active" | "inactive"
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_UPDATE);

    await toggleCategoryStatus(id, status, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
