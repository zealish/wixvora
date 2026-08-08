import { db } from "@/lib/db";
import { businessCategories } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { CategoryWithChildren } from "./types";

export async function getCategoriesTree(): Promise<CategoryWithChildren[]> {
  const allCategories = await db
    .select()
    .from(businessCategories)
    .where(isNull(businessCategories.deletedAt))
    .orderBy(businessCategories.displayOrder);

  return buildTree(allCategories);
}

export async function getActiveCategoriesTree(): Promise<
  CategoryWithChildren[]
> {
  const allCategories = await db
    .select()
    .from(businessCategories)
    .where(
      and(
        isNull(businessCategories.deletedAt),
        eq(businessCategories.status, "active")
      )
    )
    .orderBy(businessCategories.displayOrder);

  return buildTree(allCategories);
}

export async function getCategoryById(
  id: string
): Promise<CategoryWithChildren | null> {
  const result = await db
    .select()
    .from(businessCategories)
    .where(
      and(eq(businessCategories.id, id), isNull(businessCategories.deletedAt))
    )
    .limit(1);

  if (result.length === 0) return null;

  const category = result[0]!;

  const children = await db
    .select()
    .from(businessCategories)
    .where(
      and(
        eq(businessCategories.parentId, id),
        isNull(businessCategories.deletedAt)
      )
    )
    .orderBy(businessCategories.displayOrder);

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    displayOrder: category.displayOrder,
    status: category.status,
    parentId: category.parentId,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    children: children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      icon: child.icon,
      displayOrder: child.displayOrder,
      status: child.status,
      parentId: child.parentId,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
      children: [],
    })),
  };
}

export async function getCategoryWithChildren(
  id: string
): Promise<CategoryWithChildren | null> {
  const allCategories = await db
    .select()
    .from(businessCategories)
    .where(isNull(businessCategories.deletedAt))
    .orderBy(businessCategories.displayOrder);

  const tree = buildTree(allCategories);
  return findInTree(tree, id) ?? null;
}

export async function getNextDisplayOrder(
  parentId: string | null
): Promise<number> {
  const conditions = [
    isNull(businessCategories.deletedAt),
    parentId === null
      ? isNull(businessCategories.parentId)
      : eq(businessCategories.parentId, parentId),
  ];

  const result = await db
    .select({ maxOrder: businessCategories.displayOrder })
    .from(businessCategories)
    .where(and(...conditions))
    .orderBy(desc(businessCategories.displayOrder))
    .limit(1);

  return result.length > 0 ? (result[0]?.maxOrder ?? 0) + 1 : 1;
}

export async function validateDisplayOrder(
  parentId: string | null,
  order: number,
  excludeId?: string
): Promise<boolean> {
  const conditions = [
    isNull(businessCategories.deletedAt),
    eq(businessCategories.displayOrder, order),
    parentId === null
      ? isNull(businessCategories.parentId)
      : eq(businessCategories.parentId, parentId),
  ];

  const result = await db
    .select({ id: businessCategories.id })
    .from(businessCategories)
    .where(and(...conditions))
    .limit(excludeId ? 2 : 1);

  if (excludeId) {
    return result.filter((r) => r.id !== excludeId).length === 0;
  }
  return result.length === 0;
}

export async function generateUniqueSlug(
  name: string,
  excludeId?: string
): Promise<string> {
  let slug = createSlug(name);
  let counter = 1;

  while (true) {
    const conditions = [
      isNull(businessCategories.deletedAt),
      eq(businessCategories.slug, slug),
    ];

    const existing = await db
      .select({ id: businessCategories.id })
      .from(businessCategories)
      .where(and(...conditions))
      .limit(excludeId ? 2 : 1);

    const isAvailable =
      existing.length === 0 ||
      (excludeId !== undefined &&
        existing.length === 1 &&
        existing[0]?.id === excludeId);

    if (isAvailable) return slug;
    counter++;
    slug = `${createSlug(name)}-${counter}`;
  }
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildTree(
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    displayOrder: number;
    status: "active" | "inactive";
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>
): CategoryWithChildren[] {
  const map = new Map<string, CategoryWithChildren>();
  const roots: CategoryWithChildren[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function findInTree(
  tree: CategoryWithChildren[],
  id: string
): CategoryWithChildren | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findInTree(node.children, id);
    if (found) return found;
  }
  return null;
}
