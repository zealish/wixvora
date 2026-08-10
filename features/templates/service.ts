import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { createAuditLog } from "@/features/audit/service";
import { getUserPermissions } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { generateMultiPageHTML, generateFullHTML } from "@/components/website-editor/lib/html-generator";
import { generateUniqueSlug, getTemplateById } from "./queries";
import type { CreateTemplateInput } from "./validation";

type TemplateStatus = "draft" | "published";

export async function createTemplate(
  data: CreateTemplateInput,
  userId: string
): Promise<{ id: string }> {
  const pageSettings = data.pageSettings ?? { title: "My Website", bgColor: "#ffffff", fontFamily: "font-sans" };
  
  // Generate minimal HTML snapshot for empty sections
  let htmlSnapshot = '<!DOCTYPE html><html><head><title>' + data.name + '</title></head><body></body></html>';
  if (data.sections && data.sections.length > 0) {
    htmlSnapshot = generateFullHTML(data.sections as any);
  }
  
  // Truncate to prevent TEXT field overflow
  if (htmlSnapshot.length > 10000) {
    htmlSnapshot = htmlSnapshot.substring(0, 10000) + '\n\n<!-- HTML truncated for storage -->';
  }

  // Generate unique slug with counter if duplicate
  let slug = await generateUniqueSlug(data.name);
  let counter = 1;
  
  while (await isSlugTaken(slug)) {
    const newSlug = `${slug}-${counter}`;
    if (!(await isSlugTaken(newSlug))) {
      slug = newSlug;
      break;
    }
    counter++;
  }

  const [created] = await db
    .insert(templates)
    .values({
      name: data.name,
      slug,
      description: data.description ?? null,
      previewImageUrl: data.previewImageUrl ?? null,
      categoryId: data.categoryId ?? null,
      // Stringify JSON columns for Postgres jsonb type (auto-parsed by Postgres)
      sections: JSON.stringify(data.sections) as any,
      pageSettings: JSON.stringify(pageSettings) as any,
      // Provide empty pages array (required field)
      pages: JSON.stringify([{ 
        id: 'home',
        title: data.name,
        slug: slug,
        sections: [],
        pageSettings: pageSettings,
        isHomePage: true,
        sortOrder: 0,
      }]) as any,
      htmlSnapshot,
      isFeatured: data.isFeatured ?? false,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? "draft",
      createdBy: userId,
    })
    .returning({ id: templates.id });

  if (!created) throw new Error("Failed to create template");

  await createAuditLog({
    userId,
    action: "TEMPLATE_CREATED",
    entity: "template",
    entityId: created.id,
    metadata: { name: data.name, slug, status: data.status ?? "draft" },
  });

  return { id: created.id };
}

// Helper function to check if slug is taken
async function isSlugTaken(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ slug: templates.slug })
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1);
  return !!existing;
}

export async function updateTemplate(
  id: string,
  data: any, // UpdateTemplateInput but using any for flexibility with JSON strings
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = await generateUniqueSlug(data.name, id);
  }

  // Parse JSON strings if needed
  let pageSettings = existing.pageSettings;
  if (data.pageSettings) {
    try {
      pageSettings = typeof data.pageSettings === 'string' 
        ? JSON.parse(data.pageSettings) 
        : data.pageSettings;
    } catch (e) {
      console.error("Failed to parse pageSettings:", e);
    }
  }

  let htmlSnapshot = existing.htmlSnapshot;
  
  // Handle pages - can be object array or JSON string
  let pagesData = [];
  if (data.pages) {
    try {
      pagesData = Array.isArray(data.pages) 
        ? data.pages
        : JSON.parse(data.pages);
      
      // Generate HTML from pages structure
      htmlSnapshot = generateMultiPageHTML(pagesData);
    } catch (e) {
      console.error("Failed to parse pages:", e);
      // Fallback to sections if pages parsing fails
      if (data.sections) {
        htmlSnapshot = generateFullHTML(data.sections as any[]);
      }
    }
  } else if (data.sections) {
    htmlSnapshot = generateFullHTML(data.sections as any[]);
  }

  const patch: Record<string, unknown> = { 
    updatedAt: new Date(),
    htmlSnapshot,
  };
  if (data.name !== undefined) patch.name = data.name;
  if (data.name && data.name !== existing.name) patch.slug = slug;
  if (data.description !== undefined) patch.description = data.description;
  if (data.previewImageUrl !== undefined)
    patch.previewImageUrl = data.previewImageUrl;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  
  // Save both pages (multi-page) and sections (legacy compatibility)
  if (pagesData && pagesData.length > 0) {
    console.log("💾 [SERVICE] Saving pages:", JSON.stringify(pagesData, null, 2));
    // Stringify pages array for database storage
    patch.pages = JSON.stringify(pagesData);
    // Also flatten to sections for backward compatibility
    const flattenedSections = pagesData.flatMap((p: any) => p.sections);
    patch.sections = JSON.stringify(flattenedSections);
    console.log("💾 [SERVICE] Flattened sections:", flattenedSections.length);
  } else if (data.sections !== undefined) {
    // Stringify sections for database storage  
    const sectionsArray = Array.isArray(data.sections) ? data.sections : [];
    console.log("💾 [SERVICE] Saving sections:", `${sectionsArray.length} sections`);
    patch.sections = JSON.stringify(data.sections);
  }
  
  console.log("📝 [SERVICE] Final patch:", {
    hasPages: !!patch.pages,
    pagesLength: typeof patch.pages === 'string' ? patch.pages.length : 0,
    hasSections: !!patch.sections,
    sectionsLength: typeof patch.sections === 'string' ? patch.sections.length : 0
  });
  
  if (data.pageSettings !== undefined) patch.pageSettings = pageSettings;
  if (data.isFeatured !== undefined) patch.isFeatured = data.isFeatured;
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;
  if (data.status !== undefined) patch.status = data.status;

  await db.update(templates).set(patch).where(eq(templates.id, id));

  await createAuditLog({
    userId,
    action: "TEMPLATE_UPDATED",
    entity: "template",
    entityId: id,
    metadata: {
      name: data.name ?? existing.name,
      changedFields: Object.keys(patch),
    },
  });
}

export async function softDeleteTemplate(
  id: string,
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  await db
    .update(templates)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(templates.id, id));

  await createAuditLog({
    userId,
    action: "TEMPLATE_DELETED",
    entity: "template",
    entityId: id,
    metadata: { name: existing.name },
  });
}

export async function duplicateTemplate(
  id: string,
  userId: string
): Promise<{ id: string }> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  const slug = await generateUniqueSlug(`${existing.name}-copy`);

  const [created] = await db
    .insert(templates)
    .values({
      name: `${existing.name} (Copy)`,
      slug,
      description: existing.description,
      previewImageUrl: existing.previewImageUrl,
      categoryId: existing.categoryId,
      sections: existing.sections as any,
      pageSettings: existing.pageSettings,
      htmlSnapshot: existing.htmlSnapshot,
      isFeatured: false,
      sortOrder: existing.sortOrder,
      status: "draft",
      createdBy: userId,
    })
    .returning({ id: templates.id });

  if (!created) throw new Error("Failed to duplicate template");

  await createAuditLog({
    userId,
    action: "TEMPLATE_DUPLICATED",
    entity: "template",
    entityId: created.id,
    metadata: { sourceTemplateId: id, name: `${existing.name} (Copy)` },
  });

  return { id: created.id };
}

export async function toggleTemplateStatus(
  id: string,
  status: TemplateStatus,
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  await db
    .update(templates)
    .set({ status, updatedAt: new Date() })
    .where(eq(templates.id, id));

  await createAuditLog({
    userId,
    action:
      status === "published" ? "TEMPLATE_PUBLISHED" : "TEMPLATE_UNPUBLISHED",
    entity: "template",
    entityId: id,
    metadata: { name: existing.name },
  });
}

export async function toggleTemplateFeatured(
  id: string,
  isFeatured: boolean,
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  await db
    .update(templates)
    .set({ isFeatured, updatedAt: new Date() })
    .where(eq(templates.id, id));

  await createAuditLog({
    userId,
    action: "TEMPLATE_FEATURED_CHANGED",
    entity: "template",
    entityId: id,
    metadata: { name: existing.name, isFeatured },
  });
}

export async function assertCanModifyTemplate(
  templateId: string,
  userId: string,
  mode: "update" | "delete"
): Promise<void> {
  const perms = await getUserPermissions(userId);
  if (perms.has("*")) return;

  const anyPerm =
    mode === "update"
      ? PERMISSIONS.TEMPLATES_UPDATE_ANY
      : PERMISSIONS.TEMPLATES_DELETE_ANY;
  const ownPerm =
    mode === "update"
      ? PERMISSIONS.TEMPLATES_UPDATE_OWN
      : PERMISSIONS.TEMPLATES_DELETE_OWN;

  if (perms.has(anyPerm)) return;

  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  if (template.createdBy === userId && perms.has(ownPerm)) return;

  throw new Error("Forbidden: you can only modify your own templates");
}
