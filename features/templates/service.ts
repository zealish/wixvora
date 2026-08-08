import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { createAuditLog } from "@/features/audit/service";
import { getUserPermissions } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { PageSettings } from "./lib/block-types";
import { DEFAULT_PAGE_SETTINGS } from "./lib/block-types";
import { generateHTMLSnapshot } from "./lib/html-generator";
import { generateUniqueSlug, getTemplateById } from "./queries";
import type { CreateTemplateInput, UpdateTemplateInput } from "./validation";

type TemplateStatus = "draft" | "published";

function resolvePageSettings(settings?: PageSettings): PageSettings {
  return { ...DEFAULT_PAGE_SETTINGS, ...settings };
}

export async function createTemplate(
  data: CreateTemplateInput,
  userId: string
): Promise<{ id: string }> {
  const pageSettings = resolvePageSettings(data.pageSettings);
  const htmlSnapshot = generateHTMLSnapshot(data.blocks, pageSettings);
  const slug = await generateUniqueSlug(data.name);

  const [created] = await db
    .insert(templates)
    .values({
      name: data.name,
      slug,
      description: data.description ?? null,
      previewImageUrl: data.previewImageUrl ?? null,
      categoryId: data.categoryId ?? null,
      blocksJson: data.blocks,
      pageSettings,
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

export async function updateTemplate(
  id: string,
  data: UpdateTemplateInput,
  userId: string
): Promise<void> {
  const existing = await getTemplateById(id);
  if (!existing) throw new Error("Template not found");

  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = await generateUniqueSlug(data.name, id);
  }

  const effectiveSettings = data.pageSettings
    ? resolvePageSettings(data.pageSettings)
    : existing.pageSettings;

  let htmlSnapshot = existing.htmlSnapshot;
  if (data.blocks) {
    htmlSnapshot = generateHTMLSnapshot(data.blocks, effectiveSettings);
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) patch.name = data.name;
  if (data.name && data.name !== existing.name) patch.slug = slug;
  if (data.description !== undefined) patch.description = data.description;
  if (data.previewImageUrl !== undefined)
    patch.previewImageUrl = data.previewImageUrl;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.blocks !== undefined) {
    patch.blocksJson = data.blocks;
    patch.htmlSnapshot = htmlSnapshot;
  }
  if (data.pageSettings !== undefined) patch.pageSettings = effectiveSettings;
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
      blocksJson: existing.blocks,
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
