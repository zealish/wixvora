"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createWebsiteSchema, updateWebsiteSectionsSchema } from "./validation";
import type { WebsiteActionResult } from "./types";
import {
  createWebsiteFromTemplate,
  updateWebsiteSections,
  softDeleteWebsite,
  toggleWebsitePublished,
} from "./service";

const DASHBOARD_PATH = "/dashboard";

export async function createWebsiteFromTemplateAction(
  data: unknown
): Promise<WebsiteActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const validated = createWebsiteSchema.parse(data);
    const { id } = await createWebsiteFromTemplate(
      validated.templateId,
      validated.name,
      session.user.id
    );

    revalidatePath(DASHBOARD_PATH);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateWebsiteSectionsAction(
  id: string,
  data: unknown
): Promise<WebsiteActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    const validated = updateWebsiteSectionsSchema.parse(data);
    await updateWebsiteSections(
      id,
      validated.sections,
      validated.pageSettings,
      session.user.id
    );

    revalidatePath(`/website-editor/${id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteWebsiteAction(
  id: string
): Promise<WebsiteActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await softDeleteWebsite(id, session.user.id);

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleWebsitePublishedAction(
  id: string,
  isPublished: boolean
): Promise<WebsiteActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };

    await toggleWebsitePublished(id, isPublished, session.user.id);

    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}
