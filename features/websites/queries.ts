import { db } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { Website, WebsiteListItem, WebsiteStatus } from "./types";

export async function getWebsitesByUserId(userId: string): Promise<WebsiteListItem[]> {
  const rows = await db
    .select({
      id: websites.id,
      name: websites.name,
      slug: websites.slug,
      description: websites.description,
      templateId: websites.templateId,
      status: websites.status,
      isPublished: websites.isPublished,
      publishedAt: websites.publishedAt,
      createdAt: websites.createdAt,
      updatedAt: websites.updatedAt,
    })
    .from(websites)
    .where(and(eq(websites.ownerId, userId), isNull(websites.deletedAt)))
    .orderBy(websites.createdAt);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    templateId: row.templateId,
    status: row.status as WebsiteStatus,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function getWebsiteById(id: string): Promise<Website | null> {
  const [row] = await db
    .select()
    .from(websites)
    .where(and(eq(websites.id, id), isNull(websites.deletedAt)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    ownerId: row.ownerId,
    templateId: row.templateId,
    status: row.status as WebsiteStatus,
    isPublished: row.isPublished,
    publishedAt: row.publishedAt,
    sections: (row.sections as any[]) || [],
    pageSettings: (row.pageSettings as any) || { title: row.name, bgColor: '#ffffff', fontFamily: 'font-sans' },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function canUserEditWebsite(websiteId: string, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ ownerId: websites.ownerId })
    .from(websites)
    .where(and(eq(websites.id, websiteId), isNull(websites.deletedAt)))
    .limit(1);

  if (!row) return false;
  return row.ownerId === userId;
}

export async function generateUniqueWebsiteSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  let slug = base || "website";
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: websites.id })
      .from(websites)
      .where(and(isNull(websites.deletedAt), eq(websites.slug, slug)))
      .limit(2);

    const isAvailable =
      !existing || (excludeId !== undefined && existing.id === excludeId);
    if (isAvailable) return slug;

    counter += 1;
    slug = `${base}-${counter}`;
  }
}
