"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { updateTemplateSchema } from "./validation";
import type { TemplateActionResult, TemplateStatus } from "./types";
import {
  updateTemplate,
  softDeleteTemplate,
  duplicateTemplate,
  toggleTemplateStatus,
  toggleTemplateFeatured,
  assertCanModifyTemplate,
} from "./service";

const TEMPLATES_PATH = "/staff/templates";

// Note: createTemplate now uses API Route at /api/templates/create
// for better serialization handling with complex objects

export async function updateTemplateAction(
  data: unknown
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    const validated = updateTemplateSchema.parse(data);
    await assertCanModifyTemplate(validated.id, session.user.id, "update");
    await updateTemplate(validated.id, validated, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(`${TEMPLATES_PATH}/${validated.id}/edit`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteTemplateAction(
  id: string
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await assertCanModifyTemplate(id, session.user.id, "delete");
    await softDeleteTemplate(id, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function duplicateTemplateAction(
  id: string
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await authorize(PERMISSIONS.TEMPLATES_CREATE);
    await assertCanModifyTemplate(id, session.user.id, "update");
    const { id: newId } = await duplicateTemplate(id, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true, data: { id: newId } };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function setTemplateStatusAction(
  id: string,
  status: TemplateStatus
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await authorize(PERMISSIONS.TEMPLATES_PUBLISH);
    await assertCanModifyTemplate(id, session.user.id, "update");
    await toggleTemplateStatus(id, status, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function setTemplateFeaturedAction(
  id: string,
  isFeatured: boolean
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await assertCanModifyTemplate(id, session.user.id, "update");
    await toggleTemplateFeatured(id, isFeatured, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateTemplateSectionsAction(
  id: string,
  data: { sections?: any[]; pageSettings?: any; pages?: any[] }
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await assertCanModifyTemplate(id, session.user.id, "update");

    const { sections, pageSettings, pages } = data;
    const updateData: any = {};
    
    // Handle both pages format and legacy sections format
    if (pages && pages.length > 0) {
      updateData.pages = JSON.stringify(pages);
    } else if (sections) {
      updateData.sections = JSON.stringify(sections);
    }
    
    if (pageSettings) updateData.pageSettings = JSON.stringify(pageSettings);
    
    await updateTemplate(id, updateData, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(`/templates-editor/${id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}