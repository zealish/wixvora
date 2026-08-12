import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { createAuditLog } from "@/features/audit/service";
import { getUserPermissions } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { generateMultiPageHTML, generateFullHTML } from "@/components/website-editor/lib/html-generator";
import { generateUniqueSlug, getTemplateById } from "./queries";
import type { CreateTemplateInput } from "./validation";
import type { Section, Page } from "@/components/website-editor/lib/block-types";

type TemplateStatus = "draft" | "published";

export async function createTemplate(
  data: CreateTemplateInput,
  userId: string
): Promise<{ id: string }> {
  const pageSettings = data.pageSettings ?? { title: "My Website", bgColor: "#ffffff", fontFamily: "font-sans" };
  
  let htmlSnapshot = '<!DOCTYPE html><html><head><title>' + data.name + '</title></head><body></body></html>';
  if (data.sections && data.sections.length > 0) {
    htmlSnapshot = generateFullHTML(data.sections as Section[]);
  }
  
  if (htmlSnapshot.length > 10000) {
    htmlSnapshot = htmlSnapshot.substring(0, 10000) + '\n\n<!-- HTML truncated for storage -->';
  }

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
      sections: JSON.stringify(data.sections) as unknown as Section[],
      pageSettings: JSON.stringify(pageSettings) as unknown as typeof pageSettings,
      pages: JSON.stringify([{ 
        id: 'home',
        title: data.name,
        slug: slug,
        sections: [],
        pageSettings: pageSettings,
        isHomePage: true,
        sortOrder: 0,
      }]) as unknown as Page[],
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
  data: Record<string, unknown>,
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = await generateUniqueSlug(String(data.name), id);
  }

  let pageSettings = existing.pageSettings;
  if (data.pageSettings) {
    try {
      pageSettings = typeof data.pageSettings === 'string' 
        ? JSON.parse(data.pageSettings) 
        : data.pageSettings;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse pageSettings:", e);
    }
  }

  let htmlSnapshot = existing.htmlSnapshot;
  
  let pagesData: Page[] = [];
  if (data.pages) {
    try {
      const rawPages: unknown = typeof data.pages === 'string' ? JSON.parse(data.pages) : data.pages;
      pagesData = Array.isArray(rawPages) ? rawPages as Page[] : [];
      
      htmlSnapshot = generateMultiPageHTML(pagesData);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse pages:", e);
      if (data.sections) {
        htmlSnapshot = generateFullHTML(data.sections as Section[]);
      }
    }
  } else if (data.sections) {
    htmlSnapshot = generateFullHTML(data.sections as Section[]);
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
  
  if (pagesData && pagesData.length > 0) {
    patch.pages = JSON.stringify(pagesData);
    const flattenedSections = pagesData.flatMap((p: Page) => p.sections);
    patch.sections = JSON.stringify(flattenedSections);
  } else if (data.sections !== undefined) {
    patch.sections = JSON.stringify(data.sections);
  }
  
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
      sections: existing.sections as unknown as Section[],
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
