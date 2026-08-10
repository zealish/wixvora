import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { getWebsiteById, generateUniqueWebsiteSlug } from "./queries";
import { getTemplateById, incrementUsageCount } from "@/features/templates/queries";
import type { Section, PageSettings } from "@/components/website-editor/lib/block-types";

export async function createWebsiteFromTemplate(
  templateId: string,
  name: string,
  userId: string
): Promise<{ id: string }> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  const slug = await generateUniqueWebsiteSlug(name);
  const sections = JSON.parse(JSON.stringify(template.sections)) as Section[];
  const pageSettings = { ...template.pageSettings } as PageSettings;

  const [created] = await db
    .insert(websites)
    .values({
      name,
      slug,
      ownerId: userId,
      templateId,
      sections,
      pageSettings,
      status: "draft",
    })
    .returning({ id: websites.id });

  if (!created) throw new Error("Failed to create website");

  await incrementUsageCount(templateId);

  return { id: created.id };
}

export async function updateWebsiteSections(
  id: string,
  sections: Section[],
  pageSettings: PageSettings,
  userId: string
): Promise<void> {
  const existing = await getWebsiteById(id);
  if (!existing) throw new Error("Website not found");
  if (existing.ownerId !== userId) throw new Error("Forbidden");

  await db
    .update(websites)
    .set({
      sections,
      pageSettings,
      updatedAt: new Date(),
    })
    .where(eq(websites.id, id));
}

export async function softDeleteWebsite(
  id: string,
  userId: string
): Promise<void> {
  const existing = await getWebsiteById(id);
  if (!existing) throw new Error("Website not found");
  if (existing.ownerId !== userId) throw new Error("Forbidden");

  await db
    .update(websites)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(websites.id, id));
}

export async function toggleWebsitePublished(
  id: string,
  isPublished: boolean,
  userId: string
): Promise<void> {
  const existing = await getWebsiteById(id);
  if (!existing) throw new Error("Website not found");
  if (existing.ownerId !== userId) throw new Error("Forbidden");

  await db
    .update(websites)
    .set({
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      status: isPublished ? "published" : "draft",
      updatedAt: new Date(),
    })
    .where(eq(websites.id, id));
}
