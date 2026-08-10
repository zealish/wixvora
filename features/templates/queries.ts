"use server";

import { db } from "@/lib/db";
import { templates, businessCategories, user } from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import type { Template, TemplateListItem, TemplateStatus } from "./types";

// Helper function to deep parse sections array with elements
function parseNestedSections(rawSections: any): any[] {
  if (!Array.isArray(rawSections)) return [];
  
  return rawSections.map((section: any) => {
    let parsedSection = { ...section };
    
    // Parse elements if it's a string
    if (typeof section.elements === 'string') {
      try {
        parsedSection.elements = JSON.parse(section.elements);
      } catch (e) {
        parsedSection.elements = [];
      }
    } else if (!Array.isArray(section.elements)) {
      parsedSection.elements = [];
    }
    
    // Parse nested sections if needed (for deeply nested structures)
    if (typeof section.sections === 'string') {
      try {
        parsedSection.sections = parseNestedSections(JSON.parse(section.sections));
      } catch (e) {
        parsedSection.sections = [];
      }
    } else if (!Array.isArray(section.sections)) {
      parsedSection.sections = [];
    }
    
    return parsedSection as any;
  });
}

export async function getAllTemplates(): Promise<TemplateListItem[]> {
  const rows = await db
    .select({
      id: templates.id,
      name: templates.name,
      slug: templates.slug,
      description: templates.description,
      previewImageUrl: templates.previewImageUrl,
      categoryId: templates.categoryId,
      categoryName: businessCategories.name,
      categoryParentId: businessCategories.parentId,
      isFeatured: templates.isFeatured,
      sortOrder: templates.sortOrder,
      status: templates.status,
      usageCount: templates.usageCount,
      lastUsedAt: templates.lastUsedAt,
      createdBy: templates.createdBy,
      createdByName: user.name,
      createdAt: templates.createdAt,
      updatedAt: templates.updatedAt,
      pages: templates.pages,
    })
    .from(templates)
    .leftJoin(
      businessCategories,
      and(
        eq(templates.categoryId, businessCategories.id),
        isNull(businessCategories.deletedAt)
      )
    )
    .leftJoin(user, eq(templates.createdBy, user.id))
    .where(isNull(templates.deletedAt))
    .orderBy(templates.createdAt);

  const parentIds = rows
    .map((r) => r.categoryParentId)
    .filter((id): id is string => id !== null && id !== undefined);

  const parentNames = new Map<string, string>();
  if (parentIds.length > 0) {
    const parents = await db
      .select({ id: businessCategories.id, name: businessCategories.name })
      .from(businessCategories)
      .where(
        and(
          isNull(businessCategories.deletedAt),
          inArray(businessCategories.id, parentIds)
        )
      );
    for (const p of parents) parentNames.set(p.id, p.name);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    previewImageUrl: row.previewImageUrl,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categoryParentName: row.categoryParentId
      ? (parentNames.get(row.categoryParentId) ?? null)
      : null,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    status: row.status as TemplateStatus,
    usageCount: row.usageCount,
    lastUsedAt: row.lastUsedAt,
    createdBy: row.createdBy,
    createdByName: row.createdByName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    totalPages: Array.isArray(row.pages) ? row.pages.length : 0,
  }));
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const [row] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, id), isNull(templates.deletedAt)))
    .limit(1);

  if (!row) return null;

  // Cast row to any to access all fields including new ones
  const anyRow = row as any;
  
  // Parse JSON strings back to arrays with deep nesting
  let parsedPages: any[] = [];
  
  if (typeof anyRow.pages === 'string') {
    try {
      const rawParsed = JSON.parse(anyRow.pages);
      // Deep parse all nested sections and pageSettings
      parsedPages = Array.isArray(rawParsed) ? rawParsed.map((page: any) => ({
        ...page,
        sections: parseNestedSections(page.sections),
        pageSettings: typeof page.pageSettings === 'string' 
          ? JSON.parse(page.pageSettings) 
          : page.pageSettings || {},
      })) : [];
    } catch (e) {
      parsedPages = [];
    }
  } else if (Array.isArray(anyRow.pages)) {
    parsedPages = anyRow.pages;
  }

  let parsedPageSettings: any = {};
  if (typeof anyRow.pageSettings === 'string') {
    try {
      parsedPageSettings = JSON.parse(anyRow.pageSettings);
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Flatten pages to sections for backward compatibility
  const flattenedSections = parsedPages.flatMap((p: any) => (Array.isArray(p.sections) ? p.sections : []));

  return {
    id: anyRow.id,
    name: anyRow.name,
    slug: anyRow.slug,
    description: anyRow.description,
    previewImageUrl: anyRow.previewImageUrl,
    categoryId: anyRow.categoryId,
    sections: Array.isArray(flattenedSections) ? flattenedSections : [],
    pageSettings: parsedPageSettings || { title: anyRow.name, bgColor: '#ffffff', fontFamily: 'font-sans' },
    pages: Array.isArray(parsedPages) ? parsedPages : [],
    htmlSnapshot: anyRow.htmlSnapshot,
    isFeatured: anyRow.isFeatured,
    sortOrder: anyRow.sortOrder,
    status: anyRow.status as TemplateStatus,
    usageCount: anyRow.usageCount,
    lastUsedAt: anyRow.lastUsedAt,
    createdBy: anyRow.createdBy,
    createdAt: anyRow.createdAt,
    updatedAt: anyRow.updatedAt,
    deletedAt: anyRow.deletedAt,
  } as Template;
}

export async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  const base = createSlug(name);
  let slug = base;
  let counter = 1;

  while (true) {
    const [existing] = await db
      .select({ id: templates.id })
      .from(templates)
      .where(and(isNull(templates.deletedAt), eq(templates.slug, slug)))
      .limit(2);

    const isAvailable =
      !existing || (excludeId !== undefined && existing.id === excludeId);
    if (isAvailable) return slug;

    counter += 1;
    slug = `${base}-${counter}`;
  }
}

export async function incrementUsageCount(id: string): Promise<void> {
  const [existing] = await db
    .select({ usageCount: templates.usageCount })
    .from(templates)
    .where(and(eq(templates.id, id), isNull(templates.deletedAt)))
    .limit(1);

  if (!existing) return;

  await db
    .update(templates)
    .set({
      usageCount: existing.usageCount + 1,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id));
}

function createSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "template";
}
