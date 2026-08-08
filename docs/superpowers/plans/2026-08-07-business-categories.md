# Business Categories Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hierarchical business category management system with expandable DataTable, Lucide icon picker, and full RBAC integration.

**Architecture:** Single unified `business_categories` table with self-referential `parentId` (NULL = root). Two-level max enforced in service layer. Soft delete with cascade logic. Feature-based architecture following existing project patterns.

**Tech Stack:** Next.js 14 App Router, Drizzle ORM (PostgreSQL), Zod validation, TanStack React Table v8, Shadcn UI, Lucide React icons, better-auth, server actions.

## Global Constraints

- Maximum hierarchy depth: 2 levels (enforced in service layer)
- `UNIQUE(parent_id, display_order)` - no duplicate order within same parent
- `CHECK(display_order > 0)` - positive integers only
- Soft delete with application-level cascade (no `ON DELETE CASCADE`)
- All mutations create audit log entries
- RBAC permissions: CATEGORIES_VIEW, CATEGORIES_CREATE, CATEGORIES_UPDATE, CATEGORIES_DELETE
- Slugs globally unique, auto-generated from name
- Icon field: Lucide React icon name strings

---

## File Structure

### New Files to Create

| File                                                               | Responsibility                  |
| ------------------------------------------------------------------ | ------------------------------- |
| `lib/db/schema/business-categories.ts`                             | Drizzle schema, enum, relations |
| `features/business-categories/types.ts`                            | TypeScript types                |
| `features/business-categories/validation.ts`                       | Zod schemas                     |
| `features/business-categories/queries.ts`                          | Data fetching                   |
| `features/business-categories/service.ts`                          | Business logic                  |
| `features/business-categories/actions.ts`                          | Server actions                  |
| `features/business-categories/components/category-form.tsx`        | Unified create/edit form        |
| `features/business-categories/components/category-data-table.tsx`  | DataTable with expandable rows  |
| `features/business-categories/components/category-icon-picker.tsx` | Lucide icon selector            |
| `features/business-categories/table/category-columns.tsx`          | Column definitions              |
| `features/business-categories/table/category-filters.ts`           | Filter configuration            |
| `features/business-categories/table/category-bulk-actions.tsx`     | Bulk operations                 |
| `app/(staff)/staff/business-categories/page.tsx`                   | List page                       |
| `app/(staff)/staff/business-categories/create/page.tsx`            | Create root category page       |
| `app/(staff)/staff/business-categories/[id]/edit/page.tsx`         | Edit category page              |
| `app/(staff)/staff/business-categories/[id]/create-sub/page.tsx`   | Create sub-category page        |

### Files to Modify

| File                      | Change                               |
| ------------------------- | ------------------------------------ |
| `lib/db/schema/index.ts`  | Add businessCategories export        |
| `lib/auth/permissions.ts` | Add CATEGORIES_* permissions         |
| `config/navigation.ts`    | Add Business Categories nav item     |
| `types/rbac.ts`           | Add PermissionKey values (if needed) |

---

## Tasks

### Task 1: Database Schema & Permissions Setup

**Files:**

- Create: `lib/db/schema/business-categories.ts`
- Modify: `lib/db/schema/index.ts`
- Modify: `lib/auth/permissions.ts`

**Interfaces:**

- Consumes: existing `db` from `@/lib/db`, existing `PermissionKey` type
- Produces: `businessCategories` table, `categoryStatusEnum`, `businessCategoriesRelations`

**Step 1: Create the Drizzle schema file**

```typescript
// lib/db/schema/business-categories.ts
import {
  pgTable,
  varchar,
  integer,
  timestamp,
  uuid,
  pgEnum,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
]);

export const businessCategories = pgTable(
  "business_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    icon: varchar("icon", { length: 100 }),
    displayOrder: integer("display_order").notNull(),
    status: categoryStatusEnum("status").notNull().default("active"),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueOrderPerParent: unique("uq_category_order_parent").on(
      table.parentId,
      table.displayOrder
    ),
    checkPositiveOrder: check(
      "ck_category_order_positive",
      sql`${table.displayOrder} > 0`
    ),
    parentIdx: index("idx_categories_parent").on(table.parentId),
    statusIdx: index("idx_categories_status").on(table.status),
    orderIdx: index("idx_categories_order").on(
      table.parentId,
      table.displayOrder
    ),
  })
);

export const businessCategoriesRelations = relations(
  businessCategories,
  ({ one, many }) => ({
    parent: one(businessCategories, {
      fields: [businessCategories.parentId],
      references: [businessCategories.id],
      relationName: "categoryChildren",
    }),
    children: many(businessCategories, { relationName: "categoryChildren" }),
  })
);
```

**Step 2: Add to schema index**

```typescript
// Add to lib/db/schema/index.ts
export { businessCategories, categoryStatusEnum } from "./business-categories";
```

**Step 3: Add permissions**

```typescript
// Add to lib/auth/permissions.ts inside PERMISSIONS object
CATEGORIES_VIEW: "categories.view" as PermissionKey,
CATEGORIES_CREATE: "categories.create" as PermissionKey,
CATEGORIES_UPDATE: "categories.update" as PermissionKey,
CATEGORIES_DELETE: "categories.delete" as PermissionKey,
```

**Step 4: Commit**

```bash
git add lib/db/schema/business-categories.ts lib/db/schema/index.ts lib/auth/permissions.ts
git commit -m "feat(categories): add business_categories schema and permissions"
```

---

### Task 2: Types & Validation Schemas

**Files:**

- Create: `features/business-categories/types.ts`
- Create: `features/business-categories/validation.ts`

**Interfaces:**

- Consumes: `businessCategories` schema from Task 1
- Produces: `CreateCategoryInput`, `UpdateCategoryInput`, `CategoryWithChildren`

**Step 1: Create types file**

```typescript
// features/business-categories/types.ts
export type CategoryStatus = "active" | "inactive";

export interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  status: CategoryStatus;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryWithChildren[];
}

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  status: CategoryStatus;
  parentId: string | null;
  childrenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryActionResult {
  success: boolean;
  error?: string;
  data?: { id: string };
}
```

**Step 2: Create validation schemas**

```typescript
// features/business-categories/validation.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120, "Slug must be 120 characters or less"),
  icon: z.string().max(100).optional().nullable(),
  displayOrder: z.number().int().min(1, "Display order must be at least 1"),
  status: z.enum(["active", "inactive"]).default("active"),
  parentId: z.string().uuid().optional().nullable(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
```

**Step 3: Commit**

```bash
mkdir -p features/business-categories
git add features/business-categories/types.ts features/business-categories/validation.ts
git commit -m "feat(categories): add types and validation schemas"
```

---

### Task 3: Queries & Service Layer

**Files:**

- Create: `features/business-categories/queries.ts`
- Create: `features/business-categories/service.ts`

**Interfaces:**

- Consumes: schema from Task 1, types from Task 2
- Produces: `getCategoriesTree()`, `getCategoryById()`, `getNextDisplayOrder()`, `validateDisplayOrder()`, `createCategory()`, `updateCategory()`, `softDeleteCategory()`, `generateUniqueSlug()`, `validateHierarchyDepth()`

**Step 1: Create queries file**

```typescript
// features/business-categories/queries.ts
import { db } from "@/lib/db";
import { businessCategories } from "@/lib/db/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { CategoryWithChildren, CategoryListItem } from "./types";

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
    ...result[0],
    children: children.map((child) => ({ ...child, children: [] })),
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
  return tree.find((cat) => cat.id === id) ?? null;
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

  return result.length > 0 ? result[0].maxOrder + 1 : 1;
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
      (excludeId && existing.length === 1 && existing[0].id === excludeId);

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

function buildTree(categories: any[]): CategoryWithChildren[] {
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
```

**Step 2: Create service file**

```typescript
// features/business-categories/service.ts
import { db } from "@/lib/db";
import { businessCategories } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { CreateCategoryInput, UpdateCategoryInput } from "./validation";
import {
  generateUniqueSlug,
  validateDisplayOrder,
  getNextDisplayOrder,
} from "./queries";
import { createAuditLog } from "@/features/audit/service";

export async function createCategory(
  data: CreateCategoryInput,
  userId: string
): Promise<{ id: string }> {
  await validateHierarchyDepth(data.parentId);

  const slug = await generateUniqueSlug(data.name);
  const orderValid = await validateDisplayOrder(
    data.parentId,
    data.displayOrder
  );
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
      icon: data.icon,
      displayOrder: data.displayOrder,
      status: data.status,
      parentId: data.parentId,
    })
    .returning({ id: businessCategories.id });

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

  if (
    data.displayOrder !== undefined &&
    data.displayOrder !== existing.displayOrder
  ) {
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
        throw new Error(
          "Cannot change parent: this category has children. Moving it would exceed the maximum depth of 2 levels."
        );
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
  if (data.displayOrder !== undefined)
    updateData.displayOrder = data.displayOrder;
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

  if (status === "inactive") {
    const activeChildren = await db
      .select({ id: businessCategories.id })
      .from(businessCategories)
      .where(
        and(
          eq(businessCategories.parentId, id),
          eq(businessCategories.status, "active"),
          isNull(businessCategories.deletedAt)
        )
      );

    if (activeChildren.length > 0) {
      throw new Error(
        `Cannot set status to inactive while ${activeChildren.length} sub-categories are still active.`
      );
    }
  }

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

async function validateHierarchyDepth(parentId: string | null): Promise<void> {
  if (parentId === null) return;

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
```

**Step 3: Commit**

```bash
git add features/business-categories/queries.ts features/business-categories/service.ts
git commit -m "feat(categories): add queries and service layer"
```

---

### Task 4: Server Actions

**Files:**

- Create: `features/business-categories/actions.ts`

**Interfaces:**

- Consumes: service from Task 3, validation from Task 2
- Produces: `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`, `toggleStatusAction`

**Step 1: Create actions file**

```typescript
// features/business-categories/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createCategorySchema, updateCategorySchema } from "./validation";
import {
  createCategory,
  updateCategory,
  softDeleteCategory,
  toggleCategoryStatus,
} from "./service";
import type { CategoryActionResult } from "./types";

export async function createCategoryAction(
  data: unknown
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_CREATE);

    const validated = createCategorySchema.parse(data);
    const { id } = await createCategory(validated, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateCategoryAction(
  data: unknown
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_UPDATE);

    const validated = updateCategorySchema.parse(data);
    await updateCategory(validated.id, validated, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_DELETE);

    await softDeleteCategory(id, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function toggleStatusAction(
  id: string,
  status: "active" | "inactive"
): Promise<CategoryActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CATEGORIES_UPDATE);

    await toggleCategoryStatus(id, status, session.user.id);

    revalidatePath("/staff/business-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

**Step 2: Commit**

```bash
git add features/business-categories/actions.ts
git commit -m "feat(categories): add server actions"
```

---

### Task 5: Icon Picker Component

**Files:**

- Create: `features/business-categories/components/category-icon-picker.tsx`

**Interfaces:**

- Consumes: Lucide React icons
- Produces: `CategoryIconPicker` component with search, grid display, selection

**Step 1: Create icon picker**

```typescript
// features/business-categories/components/category-icon-picker.tsx
"use client";

import { useState } from "react";
import {
  Search,
  X,
  Store,
  ShoppingCart,
  Package,
  Utensils,
  Coffee,
  Briefcase,
  Wrench,
  Car,
  Home,
  Heart,
  BookOpen,
  Laptop,
  Palette,
  Music,
  Camera,
  Star,
  Zap,
  Globe,
  Shield,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  FolderTree,
  Tag,
  Gift,
  Truck,
  CreditCard,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Check,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const POPULAR_ICONS = [
  Store,
  ShoppingCart,
  Package,
  Utensils,
  Coffee,
  Briefcase,
  Wrench,
  Car,
  Home,
  Heart,
  BookOpen,
  Laptop,
  Palette,
  Music,
  Camera,
  Star,
  Zap,
  Globe,
  Shield,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  FolderTree,
  Tag,
  Gift,
  Truck,
  CreditCard,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
];

const ALL_ICONS = [
  ...POPULAR_ICONS,
  Check,
  XIcon,
];

interface CategoryIconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function CategoryIconPicker({
  value,
  onChange,
}: CategoryIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const SelectedIcon = value
    ? ALL_ICONS.find((icon) => icon.displayName === value)
    : null;

  const filteredIcons = search
    ? ALL_ICONS.filter((icon) =>
        icon.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_ICONS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button" className="w-full justify-start gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon className="h-4 w-4" />
              {value}
            </>
          ) : (
            "Select icon..."
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
            {filteredIcons.map((Icon) => (
              <Button
                key={Icon.displayName}
                variant={value === Icon.displayName ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                type="button"
                onClick={() => {
                  onChange(Icon.displayName ?? null);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onChange(null)}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add features/business-categories/components/category-icon-picker.tsx
git commit -m "feat(categories): add icon picker component"
```

---

### Task 6: Category Form Component

**Files:**

- Create: `features/business-categories/components/category-form.tsx`

**Interfaces:**

- Consumes: `CategoryIconPicker` from Task 5, `createCategorySchema`/`updateCategorySchema` from Task 2
- Produces: `CategoryForm` component with all form fields

**Step 1: Create form component**

```typescript
// features/business-categories/components/category-form.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CategoryIconPicker } from "./category-icon-picker";
import { createCategorySchema, updateCategorySchema } from "../validation";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validation";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: UpdateCategoryInput & { id: string };
  parentName?: string;
  parentId?: string;
  suggestedOrder?: number;
}

export function CategoryForm({
  mode,
  initialData,
  parentName,
  parentId,
  suggestedOrder = 1,
}: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const schema = mode === "create" ? createCategorySchema : updateCategorySchema;

  const form = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      icon: initialData?.icon ?? null,
      displayOrder: initialData?.displayOrder ?? suggestedOrder,
      status: initialData?.status ?? "active",
      parentId: initialData?.parentId ?? parentId ?? null,
    },
  });

  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");

  useEffect(() => {
    if (mode === "create" && watchName && !form.getValues("slug")) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  }, [watchName, mode, form]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const action =
        mode === "create" ? createCategoryAction : updateCategoryAction;
      const result = await action(
        mode === "edit" ? { ...data, id: initialData?.id } : data
      );

      if (result.success) {
        toast({
          title: "Success",
          description:
            mode === "create"
              ? parentName
                ? `Sub-category created under ${parentName}`
                : "Category created successfully"
              : "Category updated successfully",
        });
        router.push("/staff/business-categories");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Category name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...form.register("slug")}
          placeholder="category-slug"
        />
        {watchSlug && (
          <p className="text-sm text-muted-foreground">
            Preview: /categories/{watchSlug}
          </p>
        )}
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <CategoryIconPicker
          value={form.watch("icon")}
          onChange={(icon) => form.setValue("icon", icon)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          min={1}
          {...form.register("displayOrder", { valueAsNumber: true })}
        />
        {form.formState.errors.displayOrder && (
          <p className="text-sm text-destructive">
            {form.formState.errors.displayOrder.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          value={form.watch("status")}
          onValueChange={(value) =>
            form.setValue("status", value as "active" | "inactive")
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="inactive" />
            <Label htmlFor="inactive">Inactive</Label>
          </div>
        </RadioGroup>
      </div>

      {parentName && (
        <div className="space-y-2">
          <Label>Parent Category</Label>
          <Input value={parentName} disabled />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/business-categories")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add features/business-categories/components/category-form.tsx
git commit -m "feat(categories): add category form component"
```

---

### Task 7: DataTable Columns & Filters

**Files:**

- Create: `features/business-categories/table/category-columns.tsx`
- Create: `features/business-categories/table/category-filters.ts`

**Interfaces:**

- Consumes: `CategoryWithChildren` type from Task 2
- Produces: column definitions for TanStack Table

**Step 1: Create columns**

```typescript
// features/business-categories/table/category-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { CategoryWithChildren } from "../types";

export function getCategoryColumns(
  expandedIds: Set<string>,
  onToggleExpand: (id: string) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string, hasChildren: boolean) => void,
  onAddSubCategory: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: "active" | "inactive") => void
): ColumnDef<CategoryWithChildren>[] {
  return [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => {
        const category = row.original;
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => hasChildren && onToggleExpand(category.id)}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </Button>
        );
      },
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const category = row.original;
        const IconComponent = getIconComponent(category.icon);

        return (
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span className={category.parentId ? "pl-4 text-muted-foreground" : "font-medium"}>
              {category.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "displayOrder",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.displayOrder}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        const hasChildren = category.children && category.children.length > 0;
        const isRoot = !category.parentId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isRoot && (
                <DropdownMenuItem onClick={() => onAddSubCategory(category.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Sub-Category
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  onToggleStatus(
                    category.id,
                    category.status
                  )
                }
              >
                {category.status === "active" ? (
                  <ToggleRight className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                )}
                Toggle Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category.id, hasChildren)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

function getIconComponent(iconName: string | null) {
  if (!iconName) return null;

  const icons: Record<string, any> = {
    Store: require("lucide-react").Store,
    ShoppingCart: require("lucide-react").ShoppingCart,
    Package: require("lucide-react").Package,
    Utensils: require("lucide-react").Utensils,
    Coffee: require("lucide-react").Coffee,
    Briefcase: require("lucide-react").Briefcase,
    Wrench: require("lucide-react").Wrench,
    Car: require("lucide-react").Car,
    Home: require("lucide-react").Home,
    Heart: require("lucide-react").Heart,
    BookOpen: require("lucide-react").BookOpen,
    Laptop: require("lucide-react").Laptop,
    Palette: require("lucide-react").Palette,
    Music: require("lucide-react").Music,
    Camera: require("lucide-react").Camera,
    Star: require("lucide-react").Star,
    Zap: require("lucide-react").Zap,
    Globe: require("lucide-react").Globe,
    Shield: require("lucide-react").Shield,
    Users: require("lucide-react").Users,
    FileText: require("lucide-react").FileText,
    Settings: require("lucide-react").Settings,
    LayoutDashboard: require("lucide-react").LayoutDashboard,
    FolderTree: require("lucide-react").FolderTree,
    Tag: require("lucide-react").Tag,
    Gift: require("lucide-react").Gift,
    Truck: require("lucide-react").Truck,
    CreditCard: require("lucide-react").CreditCard,
    BarChart3: require("lucide-react").BarChart3,
    MessageSquare: require("lucide-react").MessageSquare,
    Phone: require("lucide-react").Phone,
    Mail: require("lucide-react").Mail,
    MapPin: require("lucide-react").MapPin,
    Calendar: require("lucide-react").Calendar,
    Clock: require("lucide-react").Clock,
  };

  return icons[iconName] ?? null;
}
```

**Step 2: Create filters**

```typescript
// features/business-categories/table/category-filters.ts
import type { FilterConfig } from "@/components/shared/data-table/types";

export const categoryFilters: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "All", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    defaultValue: "all",
  },
  {
    id: "search",
    label: "Search",
    type: "text",
    placeholder: "Search categories...",
  },
];
```

**Step 3: Commit**

```bash
git add features/business-categories/table/category-columns.tsx features/business-categories/table/category-filters.ts
git commit -m "feat(categories): add table columns and filters"
```

---

### Task 8: Category DataTable Component

**Files:**

- Create: `features/business-categories/components/category-data-table.tsx`
- Create: `features/business-categories/table/category-bulk-actions.tsx`

**Interfaces:**

- Consumes: columns from Task 7, types from Task 2
- Produces: `CategoryDataTable` with expandable rows

**Step 1: Create bulk actions**

```typescript
// features/business-categories/table/category-bulk-actions.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Trash2, ToggleLeft } from "lucide-react";

interface BulkActionsProps {
  selectedIds: string[];
  onDelete: (ids: string[]) => void;
  onToggleStatus: (ids: string[], status: "active" | "inactive") => void;
}

export function CategoryBulkActions({
  selectedIds,
  onDelete,
  onToggleStatus,
}: BulkActionsProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(selectedIds, "active")}
      >
        <ToggleLeft className="h-4 w-4 mr-1" />
        Activate
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onToggleStatus(selectedIds, "inactive")}
      >
        <ToggleLeft className="h-4 w-4 mr-1" />
        Deactivate
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(selectedIds)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
    </div>
  );
}
```

**Step 2: Create data table component**

```typescript
// features/business-categories/components/category-data-table.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getCategoryColumns } from "../table/category-columns";
import { CategoryBulkActions } from "../table/category-bulk-actions";
import {
  deleteCategoryAction,
  toggleStatusAction,
} from "../actions";
import type { CategoryWithChildren } from "../types";

interface CategoryDataTableProps {
  data: CategoryWithChildren[];
}

export function CategoryDataTable({ data }: CategoryDataTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    hasChildren: boolean;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const flattenData = useMemo(() => {
    const flat: CategoryWithChildren[] = [];

    const filterCategory = (cat: CategoryWithChildren): boolean => {
      if (statusFilter !== "all" && cat.status !== statusFilter) return false;
      if (searchFilter) {
        const search = searchFilter.toLowerCase();
        if (
          !cat.name.toLowerCase().includes(search) &&
          !cat.slug.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    };

    const traverse = (cats: CategoryWithChildren[], parentId: string | null = null) => {
      for (const cat of cats) {
        if (parentId === null || expandedIds.has(parentId)) {
          if (filterCategory(cat)) {
            flat.push({ ...cat, children: [] });
          }
          if (cat.children && cat.children.length > 0) {
            traverse(cat.children, cat.id);
          }
        }
      }
    };

    traverse(data);
    return flat;
  }, [data, expandedIds, statusFilter, searchFilter]);

  const handleEdit = (id: string) => {
    router.push(`/staff/business-categories/${id}/edit`);
  };

  const handleAddSubCategory = (parentId: string) => {
    router.push(`/staff/business-categories/${parentId}/create-sub`);
  };

  const handleDelete = (id: string, hasChildren: boolean) => {
    setDeleteTarget({ id, hasChildren });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const result = await deleteCategoryAction(deleteTarget.id);
    if (result.success) {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await toggleStatusAction(id, newStatus);
    if (result.success) {
      toast({
        title: "Success",
        description: `Status changed to ${newStatus}`,
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const columns = getCategoryColumns(
    expandedIds,
    toggleExpand,
    handleEdit,
    handleDelete,
    handleAddSubCategory,
    handleToggleStatus
  );

  const table = useReactTable({
    data: flattenData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function"
          ? updater(
              Object.fromEntries(selectedIds.map((id) => [id, true]))
            )
          : updater;
      setSelectedIds(Object.keys(newSelection));
    },
    state: {
      rowSelection: Object.fromEntries(selectedIds.map((id) => [id, true])),
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search categories..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <CategoryBulkActions
          selectedIds={selectedIds}
          onDelete={(ids) => {
            ids.forEach((id) => deleteCategoryAction(id));
            setSelectedIds([]);
          }}
          onToggleStatus={(ids, status) => {
            ids.forEach((id) => toggleStatusAction(id, status));
            setSelectedIds([]);
          }}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.hasChildren
                ? "This category has sub-categories that will also be deleted. This action cannot be undone."
                : "Are you sure you want to delete this category? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add features/business-categories/components/category-data-table.tsx features/business-categories/table/category-bulk-actions.tsx
git commit -m "feat(categories): add category data table with expandable rows"
```

---

### Task 9: Page Components

**Files:**

- Create: `app/(staff)/staff/business-categories/page.tsx`
- Create: `app/(staff)/staff/business-categories/create/page.tsx`
- Create: `app/(staff)/staff/business-categories/[id]/edit/page.tsx`
- Create: `app/(staff)/staff/business-categories/[id]/create-sub/page.tsx`
- Modify: `config/navigation.ts`

**Interfaces:**

- Consumes: queries from Task 3, form from Task 6, DataTable from Task 8
- Produces: all page routes

**Step 1: Create list page**

```typescript
// app/(staff)/staff/business-categories/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCategoriesTree } from "@/features/business-categories/queries";
import { CategoryDataTable } from "@/features/business-categories/components/category-data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Categories",
};

export default async function BusinessCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_VIEW);

  const categories = await getCategoriesTree();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Categories"
        description="Manage business categories and sub-categories"
        actions={
          <Link href="/staff/business-categories/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </Link>
        }
      />

      <CategoryDataTable data={categories} />
    </div>
  );
}
```

**Step 2: Create root category page**

```typescript
// app/(staff)/staff/business-categories/create/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Create Category",
};

export default async function CreateCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_CREATE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Category"
        description="Create a new business category"
      />

      <div className="max-w-2xl">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}
```

**Step 3: Create edit page**

```typescript
// app/(staff)/staff/business-categories/[id]/edit/page.tsx
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCategoryById } from "@/features/business-categories/queries";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Edit Category",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_UPDATE);

  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Category"
        description={`Editing ${category.name}`}
      />

      <div className="max-w-2xl">
        <CategoryForm
          mode="edit"
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            displayOrder: category.displayOrder,
            status: category.status,
            parentId: category.parentId,
          }}
        />
      </div>
    </div>
  );
}
```

**Step 4: Create sub-category page**

```typescript
// app/(staff)/staff/business-categories/[id]/create-sub/page.tsx
import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getCategoryById,
  getNextDisplayOrder,
} from "@/features/business-categories/queries";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Create Sub-Category",
};

interface CreateSubCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CreateSubCategoryPage({
  params,
}: CreateSubCategoryPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_CREATE);

  const parent = await getCategoryById(id);
  if (!parent) notFound();

  const suggestedOrder = await getNextDisplayOrder(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Sub-Category"
        description={`Create a sub-category under ${parent.name}`}
      />

      <div className="max-w-2xl">
        <CategoryForm
          mode="create"
          parentId={id}
          parentName={parent.name}
          suggestedOrder={suggestedOrder}
        />
      </div>
    </div>
  );
}
```

**Step 5: Update navigation**

```typescript
// Add to config/navigation.ts in staffNavGroups Management items array
{
  title: "Business Categories",
  href: "/staff/business-categories",
  icon: "FolderTree",
  permission: PERMISSIONS.CATEGORIES_VIEW,
},
```

**Step 6: Commit**

```bash
mkdir -p app/\(staff\)/staff/business-categories/create
mkdir -p app/\(staff\)/staff/business-categories/\[id\]/edit
mkdir -p app/\(staff\)/staff/business-categories/\[id\]/create-sub
git add app/\(staff\)/staff/business-categories/ config/navigation.ts
git commit -m "feat(categories): add page components and navigation"
```

---

### Task 10: Final Integration & Verification

**Files:**

- Verify all imports and dependencies
- Run type checks
- Test the complete flow

**Step 1: Run type check**

```bash
pnpm typecheck
```

**Step 2: Run lint**

```bash
pnpm lint
```

**Step 3: Start dev server and verify**

```bash
pnpm dev
```

**Step 4: Manual verification checklist**

- [ ] Navigate to /staff/business-categories
- [ ] Create a root category with icon
- [ ] Create a sub-category under the root
- [ ] Verify expand/collapse works
- [ ] Edit a category
- [ ] Toggle status
- [ ] Delete a category with children (cascade)
- [ ] Verify audit logs are created
- [ ] Verify permission enforcement

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(categories): complete business categories management feature"
```

---

## Success Criteria

- ✅ Database schema created with all constraints and indexes
- ✅ Permissions integrated with existing RBAC system
- ✅ Server actions with full validation and audit logging
- ✅ Expandable DataTable showing hierarchy
- ✅ Icon picker for Lucide icons
- ✅ Auto-generated slugs
- ✅ Display order validation
- ✅ Soft delete with cascade
- ✅ All page routes working
- ✅ Navigation item added
- ✅ Type check passes
- ✅ Lint passes
