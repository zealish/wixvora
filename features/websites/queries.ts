"use server";

import { db } from "@/lib/db";
import { websites } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { Website, WebsiteListItem, WebsiteStatus } from "./types";

// Helper function to parse sections with elements
function parseSectionsArray(rawSections: any): any[] {
  if (!Array.isArray(rawSections)) return [];
  return rawSections.map((section: any) => ({
    ...section,
    elements: Array.isArray(section.elements) ? section.elements : [],
  })) as any[];
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

  // Cast row to any to access all fields
  const anyRow = row as any;
  
  // Parse JSON strings back to arrays with deep nesting
  let parsedPages: any[] = [];
  
  if (typeof anyRow.pages === 'string') {
    try {
      const rawParsed = JSON.parse(anyRow.pages);
      // Deep parse all nested sections and pageSettings
      parsedPages = Array.isArray(rawParsed) ? rawParsed.map((page: any) => ({
        ...page,
        sections: parseSectionsArray(page.sections),
        pageSettings: typeof page.pageSettings === 'string' 
          ? JSON.parse(page.pageSettings) 
          : page.pageSettings || {},
      })) : [];
    } catch (e) {
      console.error("Failed to parse pages:", e);
      parsedPages = [];
    }
  } else if (Array.isArray(anyRow.pages)) {
    parsedPages = anyRow.pages;
  }
  
  // Ensure we have an array
  let allPages = Array.isArray(parsedPages) ? parsedPages : [];
  
  // If no pages exist but have homepage sections (legacy website), convert to multi-page format
  if (!Array.isArray(allPages) || allPages.length === 0) {
    // Parse sections if needed
    let homepageSections: any[] = [];
    if (typeof anyRow.sections === 'string') {
      try {
        const parsed = JSON.parse(anyRow.sections);
        homepageSections = parseSectionsArray(parsed);
      } catch (e) {
        console.error("Failed to parse sections:", e);
      }
    } else {
      homepageSections = Array.isArray(anyRow.sections) ? anyRow.sections : [];
    }
    
    allPages = [{
      id: 'home',
      title: anyRow.name,
      slug: anyRow.slug,
      sections: homepageSections,
      pageSettings: typeof anyRow.pageSettings === 'string' 
        ? JSON.parse(anyRow.pageSettings)
        : anyRow.pageSettings || {
            title: anyRow.name,
            bgColor: '#ffffff',
            fontFamily: 'font-sans',
          },
      isHomePage: true,
      sortOrder: 0,
    }];
  }
  
  
  const homepage = allPages.find((p: any) => p.isHomePage) || allPages[0];
  
  const homepageSections = homepage?.sections || [];
  const homepagePageSettings = homepage?.pageSettings;
  
  const homepageSettings = homepagePageSettings || typeof anyRow.pageSettings === 'string'
    ? JSON.parse(anyRow.pageSettings)
    : anyRow.pageSettings || {
        title: anyRow.name,
        bgColor: '#ffffff',
        fontFamily: 'font-sans',
      };

  // For backwards compatibility with old components that expect flat sections
  // But also provide full pages array for multi-page editor
  return {
    id: anyRow.id,
    name: anyRow.name,
    slug: anyRow.slug,
    description: anyRow.description,
    ownerId: anyRow.ownerId,
    templateId: anyRow.templateId,
    status: anyRow.status as WebsiteStatus,
    isPublished: anyRow.isPublished,
    publishedAt: anyRow.publishedAt,
    sections: homepageSections,
    pageSettings: homepageSettings,
    pages: allPages.length > 0 ? allPages : [{ // Include all pages data too
      id: 'home',
      title: anyRow.name,
      slug: anyRow.slug,
      sections: Array.isArray(homepageSections) ? homepageSections : [],
      pageSettings: homepageSettings,
      isHomePage: true,
      sortOrder: 0,
    }],
    createdAt: anyRow.createdAt,
    updatedAt: anyRow.updatedAt,
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
