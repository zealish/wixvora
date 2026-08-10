import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { getWebsiteById, generateUniqueWebsiteSlug } from "./queries";
import { getTemplateById, incrementUsageCount } from "@/features/templates/queries";

export async function createWebsiteFromTemplate(
  templateId: string,
  name: string,
  userId: string
): Promise<{ id: string }> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  const slug = await generateUniqueWebsiteSlug(name);
  
  // Convert template sections to page structure for multi-page support
  const pages = [
    {
      id: 'home',
      title: name,
      slug: slug,
      sections: JSON.parse(JSON.stringify(template.sections)) as any[],
      pageSettings: { ...template.pageSettings },
      isHomePage: true,
      sortOrder: 0,
    }
  ];

  const [created] = await db
    .insert(websites)
    .values({
      name,
      slug,
      ownerId: userId,
      templateId,
      pages, // Use pages instead of sections
      status: "draft",
    })
    .returning({ id: websites.id });

  if (!created) throw new Error("Failed to create website");

  await incrementUsageCount(templateId);

  return { id: created.id };
}

export async function updateWebsiteSections(
  id: string,
  pages: any[], // Array of Page objects with full structure
  _legacyPageSettings?: any, // Legacy parameter for backwards compatibility - not used anymore
  userId?: string
): Promise<void> {
  const existing = await getWebsiteById(id);
  if (!existing) throw new Error("Website not found");
  if (userId && existing.ownerId !== userId) throw new Error("Forbidden");

  await db
    .update(websites)
    .set({
      pages, // Store full multi-page data
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
