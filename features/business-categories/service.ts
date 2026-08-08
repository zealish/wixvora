import { db } from "@/lib/db";
import { businessCategories } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { CreateCategoryInput, UpdateCategoryInput } from "./validation";
import {
  generateUniqueSlug,
  validateDisplayOrder,
} from "./queries";
import { createAuditLog } from "@/features/audit/service";

export async function createCategory(
  data: CreateCategoryInput,
  userId: string
): Promise<{ id: string }> {
  await validateHierarchyDepth(data.parentId);

  const slug = await generateUniqueSlug(data.name);
  const orderValid = await validateDisplayOrder(data.parentId ?? null, data.displayOrder);
  if (!orderValid) {
    throw new Error(
      `Display order ${data.displayOrder} is already used by another category at this level.`
    );
  }

  const [created] = await db
    .insert(businessCategories)
    .values({
      name: data.name,
      slug,
      icon: data.icon ?? null,
      displayOrder: data.displayOrder,
      status: data.status,
      parentId: data.parentId ?? null,
    })
    .returning({ id: businessCategories.id });

  if (!created) {
    throw new Error("Failed to create category");
  }

  await createAuditLog({
    userId,
    action: "CATEGORY_CREATED",
    entity: "business_category",
    entityId: created.id,
    metadata: {
      name: data.name,
      slug,
      icon: data.icon,
      displayOrder: data.displayOrder,
      status: data.status,
      parentId: data.parentId,
    },
  });

  return { id: created.id };
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
  userId: string
): Promise<void> {
  const [existing] = await db
    .select()
    .from(businessCategories)
    .where(
      and(eq(businessCategories.id, id), isNull(businessCategories.deletedAt))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Category not found");
  }

  if (data.displayOrder !== undefined && data.displayOrder !== existing.displayOrder) {
    const orderValid = await validateDisplayOrder(
      data.parentId ?? existing.parentId,
      data.displayOrder,
      id
    );
    if (!orderValid) {
      throw new Error(
        `Display order ${data.displayOrder} is already used by another category at this level.`
      );
    }
  }

  if (data.parentId !== undefined && data.parentId !== existing.parentId) {
    if (existing.parentId === null && data.parentId !== null) {
      const childCount = await countChildren(id);
      if (childCount > 0) {
        throw new Error("Cannot change parent: this category has children. Moving it would exceed the maximum depth of 2 levels.");
      }
    }
  }

  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = await generateUniqueSlug(data.name, id);
  }

  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;

  if (data.name && data.name !== existing.name) {
    updateData.slug = slug;
  }

  await db
    .update(businessCategories)
    .set(updateData)
    .where(eq(businessCategories.id, id));

  await createAuditLog({
    userId,
    action: "CATEGORY_UPDATED",
    entity: "business_category",
    entityId: id,
    metadata: {
      before: {
        name: existing.name,
        slug: existing.slug,
        icon: existing.icon,
        displayOrder: existing.displayOrder,
        status: existing.status,
      },
      after: {
        name: updateData.name ?? existing.name,
        slug: updateData.slug ?? existing.slug,
        icon: updateData.icon ?? existing.icon,
        displayOrder: updateData.displayOrder ?? existing.displayOrder,
        status: updateData.status ?? existing.status,
      },
    },
  });
}

export async function softDeleteCategory(
  id: string,
  userId: string
): Promise<{ deletedCount: number }> {
  const [existing] = await db
    .select()
    .from(businessCategories)
    .where(
      and(eq(businessCategories.id, id), isNull(businessCategories.deletedAt))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Category not found");
  }

  const allChildren = await getAllDescendantIds(id);

  await db.transaction(async (tx) => {
    await tx
      .update(businessCategories)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(businessCategories.id, id));

    if (allChildren.length > 0) {
      for (const childId of allChildren) {
        await tx
          .update(businessCategories)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(eq(businessCategories.id, childId));
      }
    }
  });

  await createAuditLog({
    userId,
    action: "CATEGORY_DELETED",
    entity: "business_category",
    entityId: id,
    metadata: {
      categoryName: existing.name,
      childrenCount: allChildren.length,
      cascadeDeleted: allChildren,
    },
  });

  return { deletedCount: 1 + allChildren.length };
}

export async function toggleCategoryStatus(
  id: string,
  status: "active" | "inactive",
  userId: string
): Promise<void> {
  const [existing] = await db
    .select()
    .from(businessCategories)
    .where(
      and(eq(businessCategories.id, id), isNull(businessCategories.deletedAt))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Category not found");
  }

  // If setting to inactive, cascade to all children
  if (status === "inactive") {
    const children = await db
      .select({ id: businessCategories.id })
      .from(businessCategories)
      .where(
        and(
          eq(businessCategories.parentId, id),
          isNull(businessCategories.deletedAt)
        )
      );

    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Update parent
      await tx
        .update(businessCategories)
        .set({ status, updatedAt: new Date() })
        .where(eq(businessCategories.id, id));

      // Update all children
      if (children.length > 0) {
        for (const child of children) {
          await tx
            .update(businessCategories)
            .set({ status: "inactive", updatedAt: new Date() })
            .where(eq(businessCategories.id, child.id));
        }
      }
    });

    await createAuditLog({
      userId,
      action: "CATEGORY_STATUS_CHANGED",
      entity: "business_category",
      entityId: id,
      metadata: {
        before: { status: existing.status },
        after: { status },
        cascadeCount: children.length,
        cascadeIds: children.map(c => c.id),
      },
    });
  } else {
    // Setting to active - just update the category
    await db
      .update(businessCategories)
      .set({ status, updatedAt: new Date() })
      .where(eq(businessCategories.id, id));

    await createAuditLog({
      userId,
      action: "CATEGORY_STATUS_CHANGED",
      entity: "business_category",
      entityId: id,
      metadata: {
        before: { status: existing.status },
        after: { status },
      },
    });
  }
}

async function validateHierarchyDepth(parentId: string | null | undefined): Promise<void> {
  if (parentId === null || parentId === undefined) return;

  const [parent] = await db
    .select()
    .from(businessCategories)
    .where(eq(businessCategories.id, parentId))
    .limit(1);

  if (!parent) {
    throw new Error("Parent category not found");
  }

  if (parent.parentId !== null) {
    throw new Error(
      "Cannot create sub-category: maximum depth of 2 levels reached."
    );
  }
}

async function countChildren(parentId: string): Promise<number> {
  const result = await db
    .select({ id: businessCategories.id })
    .from(businessCategories)
    .where(
      and(
        eq(businessCategories.parentId, parentId),
        isNull(businessCategories.deletedAt)
      )
    );

  return result.length;
}

async function getAllDescendantIds(parentId: string): Promise<string[]> {
  const children = await db
    .select({ id: businessCategories.id })
    .from(businessCategories)
    .where(
      and(
        eq(businessCategories.parentId, parentId),
        isNull(businessCategories.deletedAt)
      )
    );

  const ids: string[] = children.map((c) => c.id);

  for (const childId of ids) {
    const grandchildren = await getAllDescendantIds(childId);
    ids.push(...grandchildren);
  }

  return ids;
}
