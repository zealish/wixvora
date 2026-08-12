"use server";

import { db } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { Section, Page, PageSettings } from "@/components/website-editor/lib/block-types";
import type { Website, WebsiteListItem, WebsiteStatus } from "./types";

type LegacyRow = typeof websites.$inferSelect & { sections?: unknown; pageSettings?: unknown };

function parseSectionsArray(rawSections: unknown): Section[] {
  if (!Array.isArray(rawSections)) return [];
  return rawSections.map((section: Record<string, unknown>) => ({
    ...section,
    elements: Array.isArray(section.elements) ? section.elements : [],
  })) as Section[];
}

function parsePageSettings(rawSettings: unknown): PageSettings {
  if (typeof rawSettings === 'string') {
    try {
      return JSON.parse(rawSettings) as PageSettings;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse pageSettings:", e);
    }
  } else if (rawSettings && typeof rawSettings === 'object') {
    return rawSettings as PageSettings;
  }
  return { title: '', bgColor: '#ffffff', fontFamily: 'font-sans' };
}

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

  const legacyRow = row as LegacyRow;

  let parsedPages: Page[] = [];

  if (typeof legacyRow.pages === 'string') {
    try {
      const rawParsed: unknown = JSON.parse(legacyRow.pages);
      parsedPages = Array.isArray(rawParsed) ? rawParsed.map((page: Record<string, unknown>) => ({
        ...page,
        sections: parseSectionsArray(page.sections),
        pageSettings: parsePageSettings(page.pageSettings),
      })) as Page[] : [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse pages:", e);
      parsedPages = [];
    }
  } else if (Array.isArray(legacyRow.pages)) {
    parsedPages = legacyRow.pages as Page[];
  }

  let allPages = Array.isArray(parsedPages) ? parsedPages : [];

  if (!Array.isArray(allPages) || allPages.length === 0) {
    let homepageSections: Section[] = [];
    if (typeof legacyRow.sections === 'string') {
      try {
        const parsed: unknown = JSON.parse(legacyRow.sections);
        homepageSections = parseSectionsArray(parsed);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse sections:", e);
      }
    } else {
      homepageSections = Array.isArray(legacyRow.sections) ? legacyRow.sections as Section[] : [];
    }

    allPages = [{
      id: 'home',
      title: legacyRow.name,
      slug: legacyRow.slug,
      sections: homepageSections,
      pageSettings: parsePageSettings(legacyRow.pageSettings),
      isHomePage: true,
      sortOrder: 0,
    }] as Page[];
  }

  const homepage = allPages.find((p: Page) => p.isHomePage) || allPages[0];

  const homepageSections = homepage?.sections || [];
  const homepagePageSettings = homepage?.pageSettings;

  const homepageSettings = homepagePageSettings
    || parsePageSettings(legacyRow.pageSettings);

  return {
    id: legacyRow.id,
    name: legacyRow.name,
    slug: legacyRow.slug,
    description: legacyRow.description,
    ownerId: legacyRow.ownerId,
    templateId: legacyRow.templateId,
    status: legacyRow.status as WebsiteStatus,
    isPublished: legacyRow.isPublished,
    publishedAt: legacyRow.publishedAt,
    sections: homepageSections,
    pageSettings: homepageSettings,
    pages: allPages.length > 0 ? allPages : [{
      id: 'home',
      title: legacyRow.name,
      slug: legacyRow.slug,
      sections: Array.isArray(homepageSections) ? homepageSections : [],
      pageSettings: homepageSettings,
      isHomePage: true,
      sortOrder: 0,
    }],
    createdAt: legacyRow.createdAt,
    updatedAt: legacyRow.updatedAt,
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
