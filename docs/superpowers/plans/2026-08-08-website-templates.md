# Website Templates Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Website Templates management feature in the staff area — an index page using the shared DataTable, plus create/edit pages running a converted Next.js block editor (from `~/Downloads/block_editor_wix_wordpress (3).html`), with each template linked to a business category (parent or subcategory).

**Architecture:** Standard layered feature following the existing `features/business-categories` pattern: `schema → queries → service → actions → (table/components) → app pages`. Blocks are stored as a typed JSON array (`blocks_json`) plus a pre-generated `html_snapshot` for fast rendering. The block editor is a set of client components held in a `.tsx` shell that renders a preview canvas, a left block palette/layer tree, and a right inspector.

**Tech Stack:** Next.js 16.3.0 (App Router), React 19.2.8, TypeScript, Drizzle ORM + PostgreSQL (JSONB), Tailwind CSS v4, `@tanstack/react-table`, `react-hook-form` + `zod` v4, `lucide-react`, shared DataTable in `components/shared/data-table`.

**Spec:** `docs/superpowers/specs/2026-08-08-website-templates-design.md`

## Global Constraints

- Next.js version floor: **16.3.0**; React floor: **19.2.8**. `params`/`searchParams` in pages are Promises (`await params`).
- **No new dependencies.** Only packages already in `package.json` (drizzle, zod, react-hook-form, @tanstack/react-table, lucide-react, radix UI, shadcn components under `components/ui/`).
- Path alias: `@/*` → project root (e.g. `@/features/templates/...`, `@/lib/db/schema`, `@/components/ui/button`).
- DB schema lives in `lib/db/schema/*.ts` and is exported from `lib/db/schema/index.ts`. Migrations via `pnpm db:generate` + `pnpm db:migrate`.
- Permission keys must be added to both `lib/auth/permissions.ts` (machine) and `lib/db/seed.ts` (database `permissions` rows) — `authorize()` only trusts DB rows.
- Session auth: `getSession()` from `@/lib/auth/session`; permission checks via `authorize(PERMISSIONS.X)` from `@/lib/auth/authorize` (throws `AuthorizationError`).
- Server actions: `"use server"`, mirror `features/business-categories/actions.ts` — wrap in try/catch, return `{ success, error? }`, `revalidatePath` after mutations, check `session.user.accountType === "STAFF"`, then `await authorize(...)`.
- Audit logs via `createAuditLog` from `@/features/audit/service` (uppercase action, entity `"template"`).
- UI string language: **English** (matches existing staff pages). Block editor keeps the dark `slate-900/950` theme from the source HTML.
- Existing auth table is exported as `user` from `lib/db/schema/auth.ts`.
- The `templates` table also stores **`page_settings jsonb`** (`{ title, bgColor, fontFamily }`) — an additive field on top of the approved design, needed to render the HTML snapshot.
- **No `any`** except the server-action catch pattern already used across the codebase and narrow casts where TS unions force them (annotate with a comment).
- Block models use typed discriminated unions; editor dynamic utility classes use static lookup helpers (`gridColsClass`, `textAlignClass`, `justifyAlignClass`) because compiled Tailwind cannot emit `md:grid-cols-${n}` / `text-${align}`.
- Soft delete only (`deleted_at` tombstone); every query filters `isNull(deletedAt)`.
- Verification gates per task: `pnpm types:check` and `pnpm lint`; final task also runs `pnpm build`.

---

## File Structure

```
lib/db/schema/templates.ts              # NEW — drizzle table + relations
lib/db/schema/index.ts                  # MODIFY — export templates schema
lib/auth/permissions.ts                 # MODIFY — add granular template perms
lib/db/seed.ts                          # MODIFY — new permissions/roles/mappings
config/navigation.ts                    # MODIFY — "Website Templates" nav item

features/templates/types.ts             # Template / TemplateListItem / TemplateActionResult
features/templates/validation.ts         # zod schemas (create/update)
features/templates/queries.ts            # getAllTemplates, getTemplateById, generateUniqueSlug, incrementUsageCount
features/templates/service.ts            # CRUD + ownership guard + audits
features/templates/actions.ts            # "use server" actions

features/templates/lib/block-types.ts        # typed unions + helpers + PageSettings + createBlockId
features/templates/lib/block-catalog.ts      # BLOCK_CATALOG + PRESET_TEMPLATES + createBlockFromCatalog
features/templates/lib/block-icons.ts        # icon-name → LucideIcon map (getBlockIcon)
features/templates/lib/block-validator.ts    # zod schemas per block type + discriminated union
features/templates/lib/html-generator.ts     # generateHTMLSnapshot(blocks, settings)

features/templates/table/template-columns.ts
features/templates/table/template-filters.ts
features/templates/table/template-bulk-actions.tsx
features/templates/components/template-data-table.tsx
features/templates/components/template-form.tsx
features/templates/components/index.ts

features/templates/components/block-editor/hooks/use-block-editor.ts
features/templates/components/block-editor/toolbar.tsx
features/templates/components/block-editor/viewport-switcher.tsx
features/templates/components/block-editor/block-palette.tsx
features/templates/components/block-editor/layer-tree.tsx
features/templates/components/block-editor/preset-templates-panel.tsx
features/templates/components/block-editor/page-settings-panel.tsx
features/templates/components/block-editor/canvas.tsx
features/templates/components/block-editor/inspector-panel.tsx
features/templates/components/block-editor/fields.tsx
features/templates/components/block-editor/block-renderer.tsx
features/templates/components/block-editor/index.tsx
features/templates/components/block-editor/blocks/navbar-block.tsx
features/templates/components/block-editor/blocks/hero-block.tsx
features/templates/components/block-editor/blocks/container-block.tsx
features/templates/components/block-editor/blocks/grid-custom-block.tsx
features/templates/components/block-editor/blocks/heading-block.tsx
features/templates/components/block-editor/blocks/paragraph-block.tsx
features/templates/components/block-editor/blocks/image-block.tsx
features/templates/components/block-editor/blocks/pricing-block.tsx
features/templates/components/block-editor/blocks/form-contact-block.tsx
features/templates/components/block-editor/blocks/footer-block.tsx

app/(staff)/staff/templates/page.tsx          # index → DataTable
app/(staff)/staff/templates/create/page.tsx   # create
app/(staff)/staff/templates/[id]/edit/page.tsx # edit
```

---

### Task 1: Template database table + migration

**Files:**

- Create: `lib/db/schema/templates.ts`
- Modify: `lib/db/schema/index.ts`

**Interfaces:**

- Produces: `templateStatusEnum`, `templates` table, `templatesRelations`. Columns: `id, name, slug, description, previewImageUrl, categoryId, blocksJson, pageSettings, htmlSnapshot, isFeatured, sortOrder, status, usageCount, lastUsedAt, createdBy, createdAt, updatedAt, deletedAt`. `blocksJson` is `jsonb.$type<BlockConfig[]>()`, `pageSettings` is `jsonb.$type<PageSettings>()`.

- [ ] **Step 1: Create the schema file**

Create `lib/db/schema/templates.ts`:

```typescript
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
  jsonb,
  index,
  sql,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { businessCategories } from "./business-categories";
import { user } from "./auth";
import type {
  BlockConfig,
  PageSettings,
} from "@/features/templates/lib/block-types";

export const templateStatusEnum = pgEnum("template_status", [
  "draft",
  "published",
]);

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    description: text("description"),
    previewImageUrl: varchar("preview_image_url", { length: 500 }),
    categoryId: uuid("category_id").references(() => businessCategories.id, {
      onDelete: "set null",
    }),
    blocksJson: jsonb("blocks_json").$type<BlockConfig[]>().notNull(),
    pageSettings: jsonb("page_settings")
      .$type<PageSettings>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    htmlSnapshot: text("html_snapshot").notNull(),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    status: templateStatusEnum("status").notNull().default("draft"),
    usageCount: integer("usage_count").notNull().default(0),
    lastUsedAt: timestamp("last_used_at"),
    createdBy: uuid("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    categoryIdx: index("idx_templates_category").on(table.categoryId),
    statusIdx: index("idx_templates_status").on(table.status),
    featuredIdx: index("idx_templates_featured").on(table.isFeatured),
    sortIdx: index("idx_templates_sort").on(table.sortOrder),
    createdByIdx: index("idx_templates_created_by").on(table.createdBy),
  })
);

export const templatesRelations = relations(templates, ({ one }) => ({
  category: one(businessCategories, {
    fields: [templates.categoryId],
    references: [businessCategories.id],
  }),
  creator: one(user, {
    fields: [templates.createdBy],
    references: [user.id],
  }),
}));
```

`import type` is erased at compile time, so there is no runtime cycle between `lib/db/schema` and `features/templates/lib/block-types`.

- [ ] **Step 2: Export from schema index**

In `lib/db/schema/index.ts`, add after the `business-categories` export line:

```typescript
export * from "./templates";
```

- [ ] **Step 3: Generate + apply the migration**

Run: `pnpm db:generate`
Expected: a new `lib/db/migrations/0003_*.sql` containing `CREATE TABLE "templates"` and `CREATE TYPE "template_status"`.

Run: `pnpm db:migrate`
Expected: migration applied to the local database (requires `DATABASE_URL` set in `.env` and a running Postgres).

- [ ] **Step 4: Verify**

Run: `pnpm types:check && pnpm lint`
Expected: no errors (types resolve once Task 3 creates `lib/block-types.ts`).

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema/templates.ts lib/db/schema/index.ts lib/db/migrations/
git commit -m "feat: add templates database schema"
```

---

### Task 2: Template permissions, seed, and navigation

**Files:**

- Modify: `lib/auth/permissions.ts`
- Modify: `lib/db/seed.ts`
- Modify: `config/navigation.ts`

**Interfaces:**

- Produces: `PERMISSIONS.TEMPLATES_UPDATE_OWN`, `PERMISSIONS.TEMPLATES_UPDATE_ANY`, `PERMISSIONS.TEMPLATES_DELETE_OWN`, `PERMISSIONS.TEMPLATES_DELETE_ANY` (existing `TEMPLATES_VIEW/CREATE/PUBLISH` already present). DB rows for those four keys. Roles `TEMPLATE_DESIGNER`, `TEMPLATE_MANAGER` with mappings.
- Consumes: nothing new.

- [ ] **Step 1: Add granular permissions to the constants**

Rewrite `lib/auth/permissions.ts` to:

```typescript
import type { PermissionKey } from "@/types/rbac";

export const PERMISSIONS = {
  USERS_VIEW: "users.view.any" as PermissionKey,
  USERS_CREATE: "users.create.any" as PermissionKey,
  USERS_UPDATE: "users.update.any" as PermissionKey,
  USERS_DELETE: "users.delete.any" as PermissionKey,
  ROLES_VIEW: "roles.view" as PermissionKey,
  ROLES_MANAGE: "roles.manage" as PermissionKey,
  CLIENTS_VIEW: "clients.view.any" as PermissionKey,
  CLIENTS_CREATE: "clients.create.any" as PermissionKey,
  CLIENTS_UPDATE: "clients.update.any" as PermissionKey,
  CLIENTS_DELETE: "clients.delete.any" as PermissionKey,
  BILLING_VIEW: "billing.view" as PermissionKey,
  BILLING_REFUND: "billing.refund" as PermissionKey,
  DASHBOARD_VIEW: "dashboard.view" as PermissionKey,
  SETTINGS_UPDATE: "settings.update" as PermissionKey,
  ANALYTICS_VIEW: "analytics.view" as PermissionKey,
  AUDIT_VIEW: "audit.view" as PermissionKey,
  TEMPLATES_VIEW: "templates.view" as PermissionKey,
  TEMPLATES_CREATE: "templates.create" as PermissionKey,
  TEMPLATES_PUBLISH: "templates.publish" as PermissionKey,
  TEMPLATES_UPDATE_OWN: "templates.update.own" as PermissionKey,
  TEMPLATES_UPDATE_ANY: "templates.update.any" as PermissionKey,
  TEMPLATES_DELETE_OWN: "templates.delete.own" as PermissionKey,
  TEMPLATES_DELETE_ANY: "templates.delete.any" as PermissionKey,
  SITES_MANAGE: "sites.manage" as PermissionKey,
  CATEGORIES_VIEW: "categories.view" as PermissionKey,
  CATEGORIES_CREATE: "categories.create" as PermissionKey,
  CATEGORIES_UPDATE: "categories.update" as PermissionKey,
  CATEGORIES_DELETE: "categories.delete" as PermissionKey,
} as const;
```

- [ ] **Step 2: Add seed permissions**

In `lib/db/seed.ts`, inside the `seedPermissions` array, after the `templates.publish` entry append:

```typescript
  {
    key: "templates.update.own",
    resource: "templates",
    action: "update",
    scope: "own",
    description: "Update own templates",
  },
  {
    key: "templates.update.any",
    resource: "templates",
    action: "update",
    scope: "any",
    description: "Update any template",
  },
  {
    key: "templates.delete.own",
    resource: "templates",
    action: "delete",
    scope: "own",
    description: "Delete own templates",
  },
  {
    key: "templates.delete.any",
    resource: "templates",
    action: "delete",
    scope: "any",
    description: "Delete any template",
  },
```

- [ ] **Step 3: Add roles**

In `lib/db/seed.ts`, inside the `seedRoles` array append:

```typescript
  {
    code: "TEMPLATE_DESIGNER",
    name: "Template Designer",
    description: "Create and manage own templates",
  },
  {
    code: "TEMPLATE_MANAGER",
    name: "Template Manager",
    description: "Create, publish, and manage all templates",
  },
```

- [ ] **Step 4: Map role permissions**

In `lib/db/seed.ts`, inside `rolePermissionMappings`, add:

```typescript
  TEMPLATE_DESIGNER: [
    "templates.view",
    "templates.create",
    "templates.update.own",
    "templates.delete.own",
    "dashboard.view",
  ],
  TEMPLATE_MANAGER: [
    "templates.view",
    "templates.create",
    "templates.update.any",
    "templates.delete.any",
    "templates.publish",
    "dashboard.view",
  ],
```

- [ ] **Step 5: Run the seed**

Run: `pnpm db:seed`
Expected: `... ✅ Database seeded successfully!` (idempotent — `onConflictDoNothing`).

- [ ] **Step 6: Add the sidebar navigation item**

In `config/navigation.ts`, inside the `Management` group's `items` array, after the `Business Categories` entry add:

```typescript
      {
        title: "Website Templates",
        href: "/staff/templates",
        icon: "LayoutTemplate",
        permission: PERMISSIONS.TEMPLATES_VIEW,
      },
```

`LayoutTemplate` is a valid lucide-react icon and is resolved dynamically by `AppSidebar`.

- [ ] **Step 7: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add lib/auth/permissions.ts lib/db/seed.ts config/navigation.ts
git commit -m "feat: add template permissions, roles, and navigation"
```

---

### Task 3: Block domain types + catalog + icon map

**Files:**

- Create: `features/templates/lib/block-types.ts`
- Create: `features/templates/lib/block-catalog.ts`
- Create: `features/templates/lib/block-icons.ts`

**Interfaces:**

- Produces: types `BlockType`, `BlockProps`, `BlockConfig` (discriminated union on `type`), `PageSettings`, `NavLink`, `GridColumn`; constants `DEFAULT_PAGE_SETTINGS`, `BLOCK_CATALOG`, `PRESET_TEMPLATES`; helpers `createBlockId`, `gridColsClass`, `textAlignClass`, `justifyAlignClass`, `createBlockFromCatalog`; icon helper `getBlockIcon(name): LucideIcon`.
- Consumes: `lucide-react` icons.

- [ ] **Step 1: Write `lib/block-types.ts`**

```typescript
export interface NavLink {
  label: string;
  url: string;
}

export interface NavbarProps {
  layerName: string;
  logoText: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  links: NavLink[];
  ctaText: string;
  ctaUrl: string;
}

export interface HeroProps {
  layerName: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  bgColor: string;
  textColor: string;
  bgGradient: string;
  align: "left" | "center" | "right";
}

export interface ContainerProps {
  layerName: string;
  paddingY: string;
  paddingX: string;
  bgColor: string;
  textColor: string;
  bgGradient: string;
  borderRadius: string;
  borderWidth: string;
  borderColor: string;
  content: string;
}

export interface GridColumn {
  icon: string;
  title: string;
  desc: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  btnText: string;
  btnUrl: string;
}

export interface GridCustomProps {
  layerName: string;
  title: string;
  subtitle: string;
  columnsCount: number;
  gap: string;
  columns: GridColumn[];
}

export interface HeadingProps {
  layerName: string;
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
  fontSize: string;
  textColor: string;
  weight: string;
  fontFamily: string;
}

export interface ParagraphProps {
  layerName: string;
  text: string;
  align: "left" | "center" | "right";
  fontSize: string;
  textColor: string;
  maxWidth: string;
}

export interface ImageProps {
  layerName: string;
  url: string;
  alt: string;
  caption: string;
  rounded: string;
  shadow: string;
}

export interface PricingProps {
  layerName: string;
  planName: string;
  badge: string;
  price: string;
  period: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
}

export interface FormContactProps {
  layerName: string;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface FooterProps {
  layerName: string;
  brandName: string;
  copyright: string;
  bgColor: string;
  textColor: string;
}

export type BlockType =
  | "navbar"
  | "hero"
  | "container"
  | "grid_custom"
  | "heading"
  | "paragraph"
  | "image"
  | "pricing"
  | "form_contact"
  | "footer";

export type BlockProps =
  | NavbarProps
  | HeroProps
  | ContainerProps
  | GridCustomProps
  | HeadingProps
  | ParagraphProps
  | ImageProps
  | PricingProps
  | FormContactProps
  | FooterProps;

export type BlockConfig =
  | { id: string; type: "navbar"; hidden: boolean; props: NavbarProps }
  | { id: string; type: "hero"; hidden: boolean; props: HeroProps }
  | { id: string; type: "container"; hidden: boolean; props: ContainerProps }
  | { id: string; type: "grid_custom"; hidden: boolean; props: GridCustomProps }
  | { id: string; type: "heading"; hidden: boolean; props: HeadingProps }
  | { id: string; type: "paragraph"; hidden: boolean; props: ParagraphProps }
  | { id: string; type: "image"; hidden: boolean; props: ImageProps }
  | { id: string; type: "pricing"; hidden: boolean; props: PricingProps }
  | {
      id: string;
      type: "form_contact";
      hidden: boolean;
      props: FormContactProps;
    }
  | { id: string; type: "footer"; hidden: boolean; props: FooterProps };

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  title: "My Website - Wixvora",
  bgColor: "#090d16",
  fontFamily: "font-sans",
};

export function createBlockId(): string {
  return "layer_" + Math.random().toString(36).slice(2, 11);
}

export function gridColsClass(count: number): string {
  const classes = [
    "",
    "grid-cols-1",
    "md:grid-cols-2",
    "md:grid-cols-3",
    "md:grid-cols-4",
  ];
  return classes[count] ?? "md:grid-cols-3";
}

export function textAlignClass(align: "left" | "center" | "right"): string {
  return align === "center"
    ? "text-center"
    : align === "right"
      ? "text-right"
      : "text-left";
}

export function justifyAlignClass(align: "left" | "center" | "right"): string {
  return align === "center"
    ? "justify-center"
    : align === "right"
      ? "justify-end"
      : "justify-start";
}
```

- [ ] **Step 2: Write `lib/block-catalog.ts`**

```typescript
import type {
  BlockConfig,
  BlockType,
  BlockProps,
  NavbarProps,
  HeroProps,
} from "./block-types";
import { createBlockId } from "./block-types";

export interface BlockCatalogItem {
  type: BlockType;
  label: string;
  icon: string;
  defaultProps: BlockProps;
}

export interface BlockCatalogCategory {
  category: string;
  items: BlockCatalogItem[];
}

export const BLOCK_CATALOG: BlockCatalogCategory[] = [
  {
    category: "Container & Section",
    items: [
      {
        type: "container",
        label: "Section Layer (Container)",
        icon: "box",
        defaultProps: {
          layerName: "Custom Main Section",
          paddingY: "py-12",
          paddingX: "px-6",
          bgColor: "#0f172a",
          textColor: "#f8fafc",
          bgGradient: "",
          borderRadius: "rounded-2xl",
          borderWidth: "border-0",
          borderColor: "#334155",
          content:
            "Custom container area. You can add headings, paragraphs, and elements inside.",
        },
      },
      {
        type: "navbar",
        label: "Navigation Bar (Header)",
        icon: "layout",
        defaultProps: {
          layerName: "Navigation Header",
          logoText: "Brand Name",
          bgColor: "#090d16",
          textColor: "#ffffff",
          accentColor: "#2563eb",
          links: [
            { label: "Home", url: "#" },
            { label: "Features", url: "#" },
            { label: "Pricing", url: "#" },
            { label: "Contact", url: "#" },
          ],
          ctaText: "Get Started",
          ctaUrl: "#",
        },
      },
    ],
  },
  {
    category: "Text & Media",
    items: [
      {
        type: "heading",
        label: "Main Heading",
        icon: "type",
        defaultProps: {
          layerName: "Heading Text",
          text: "Design the Future of Your Website",
          level: "h1",
          align: "center",
          fontSize: "text-4xl md:text-5xl",
          textColor: "#ffffff",
          weight: "font-extrabold",
          fontFamily: "font-sans",
        },
      },
      {
        type: "paragraph",
        label: "Paragraph Text",
        icon: "type",
        defaultProps: {
          layerName: "Description Paragraph",
          text: "An interactive website building platform that gives you full flexibility to adjust layout, colors, and styles in real-time.",
          align: "center",
          fontSize: "text-base md:text-lg",
          textColor: "#cbd5e1",
          maxWidth: "max-w-2xl",
        },
      },
      {
        type: "image",
        label: "Image & Media",
        icon: "image",
        defaultProps: {
          layerName: "Visual Image",
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          alt: "Analytics Dashboard",
          caption: "All-purpose analytics management interface",
          rounded: "rounded-2xl",
          shadow: "shadow-2xl shadow-blue-500/10",
        },
      },
    ],
  },
  {
    category: "Grid & Flexible Layout",
    items: [
      {
        type: "grid_custom",
        label: "Custom Column Grid (Features)",
        icon: "grid",
        defaultProps: {
          layerName: "Interactive Features Grid",
          title: "Advantages of Our Product",
          subtitle: "Customize every column fully according to your needs",
          columnsCount: 3,
          gap: "gap-6",
          columns: [
            {
              icon: "sparkles",
              title: "Lightning Performance",
              desc: "Loaded at high speed without heavy library dependencies.",
              bgColor: "#1e293b",
              textColor: "#f8fafc",
              accentColor: "#3b82f6",
              btnText: "Learn More",
              btnUrl: "#",
            },
            {
              icon: "palette",
              title: "Custom Colors",
              desc: "Set custom Hex/RGB colors for each card separately.",
              bgColor: "#0f172a",
              textColor: "#f8fafc",
              accentColor: "#10b981",
              btnText: "Try Colors",
              btnUrl: "#",
            },
            {
              icon: "code",
              title: "Clean Export",
              desc: "Get pure HTML5 & Tailwind CSS results anytime.",
              bgColor: "#18181b",
              textColor: "#f8fafc",
              accentColor: "#f59e0b",
              btnText: "Download Code",
              btnUrl: "#",
            },
          ],
        },
      },
      {
        type: "hero",
        label: "Premium Hero Banner",
        icon: "layout",
        defaultProps: {
          layerName: "Hero Section",
          badge: "Version 3.0 Released",
          title: "Create Your Dream Website Without Limits",
          subtitle:
            "Turn your business idea into a real display visually with the flexibility of a modern block editor.",
          buttonText: "Start Free Trial",
          buttonUrl: "#",
          secondaryButtonText: "View Live Demo",
          secondaryButtonUrl: "#",
          bgColor: "#090d16",
          textColor: "#ffffff",
          bgGradient:
            "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
          align: "center",
        },
      },
    ],
  },
  {
    category: "Marketing & Contact",
    items: [
      {
        type: "pricing",
        label: "Pro Pricing Table",
        icon: "star",
        defaultProps: {
          layerName: "Pricing Table",
          badge: "Recommended",
          planName: "Pro Builder Plan",
          price: "Rp 199.000",
          period: "/month",
          bgColor: "#0f172a",
          accentColor: "#2563eb",
          textColor: "#ffffff",
          features: [
            "Unlimited Block Components",
            "Hex & Gradient Color Customization",
            "Export HTML & JSON Code",
            "24/7 Priority Support",
          ],
          buttonText: "Choose Pro Plan",
          buttonUrl: "#",
        },
      },
      {
        type: "form_contact",
        label: "Contact / Opt-in Form",
        icon: "mail",
        defaultProps: {
          layerName: "Contact Form",
          title: "Subscribe to Our Newsletter",
          subtitle:
            "Get design tips and feature updates straight to your email.",
          placeholder: "Enter your email address...",
          buttonText: "Subscribe Now",
          bgColor: "#1e293b",
          textColor: "#ffffff",
          accentColor: "#2563eb",
        },
      },
      {
        type: "footer",
        label: "Site Footer",
        icon: "layout",
        defaultProps: {
          layerName: "Footer",
          brandName: "Brand Name",
          copyright: "© 2026 Brand Name Inc. All rights reserved.",
          bgColor: "#030712",
          textColor: "#94a3b8",
        },
      },
    ],
  },
];

const saasNavbar: BlockConfig = {
  id: createBlockId(),
  type: "navbar",
  hidden: false,
  props: {
    layerName: "Main Navbar",
    logoText: "WebCraft Pro",
    bgColor: "#090d16",
    textColor: "#ffffff",
    accentColor: "#2563eb",
    links: [
      { label: "Features", url: "#" },
      { label: "Pricing", url: "#" },
      { label: "Documentation", url: "#" },
    ],
    ctaText: "Sign Up Free",
    ctaUrl: "#",
  } as NavbarProps,
};

const saasHero: BlockConfig = {
  id: createBlockId(),
  type: "hero",
  hidden: false,
  props: {
    layerName: "Hero SaaS",
    badge: "Block Builder Re-imagined",
    title: "The Best Visual Block Builder for Modern Teams",
    subtitle:
      "Design, customize colors, and arrange the structure of responsive site pages in minutes.",
    buttonText: "Start Free",
    buttonUrl: "#",
    secondaryButtonText: "View Demo",
    secondaryButtonUrl: "#",
    bgColor: "#090d16",
    textColor: "#ffffff",
    bgGradient: "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
    align: "center",
  } as HeroProps,
};

const saasGrid: BlockConfig = {
  id: createBlockId(),
  type: "grid_custom",
  hidden: false,
  props: {
    layerName: "Features Grid",
    title: "Flexible Key Features",
    subtitle:
      "Each column is fully customizable to match your visual preferences",
    columnsCount: 3,
    gap: "gap-6",
    columns: [
      {
        icon: "grid",
        title: "Dynamic Column Grid",
        desc: "Arrange 1 to 4 columns with independent background styles.",
        bgColor: "#1e293b",
        textColor: "#f8fafc",
        accentColor: "#3b82f6",
        btnText: "Details",
        btnUrl: "#",
      },
      {
        icon: "palette",
        title: "Custom Hex Colors",
        desc: "Full color control for backgrounds, text, and borders per element.",
        bgColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#10b981",
        btnText: "Try",
        btnUrl: "#",
      },
      {
        icon: "layers",
        title: "Clean Layer Tree",
        desc: "Manage layer order and names with an intuitive sidebar.",
        bgColor: "#18181b",
        textColor: "#f8fafc",
        accentColor: "#f59e0b",
        btnText: "Manage",
        btnUrl: "#",
      },
    ],
  },
};

const saasFooter: BlockConfig = {
  id: createBlockId(),
  type: "footer",
  hidden: false,
  props: {
    layerName: "Footer",
    brandName: "WebCraft Studio Pro",
    copyright: "© 2026 WebCraft Studio. Built with limitless flexibility.",
    bgColor: "#030712",
    textColor: "#94a3b8",
  },
};

export const PRESET_TEMPLATES: Record<string, BlockConfig[]> = {
  saas: [saasNavbar, saasHero, saasGrid, saasFooter],
};

export function createBlockFromCatalog(item: BlockCatalogItem): BlockConfig {
  return {
    id: createBlockId(),
    type: item.type,
    hidden: false,
    // deep clone so later edits never mutate the catalog defaults
    props: JSON.parse(JSON.stringify(item.defaultProps)) as BlockProps,
  } as BlockConfig;
}
```

The `as NavbarProps` / `as HeroProps` casts are required: the discriminated union cannot infer `props` from a plain object literal alone.

- [ ] **Step 3: Write `lib/block-icons.ts`**

```tsx
import {
  Box,
  Layout,
  Type,
  Image,
  Grid,
  Star,
  Mail,
  Sparkles,
  Layers,
  Palette,
  Code,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  box: Box,
  layout: Layout,
  type: Type,
  image: Image,
  grid: Grid,
  star: Star,
  mail: Mail,
  sparkles: Sparkles,
  layers: Layers,
  palette: Palette,
  code: Code,
};

export function getBlockIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
```

- [ ] **Step 4: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/lib/block-types.ts features/templates/lib/block-catalog.ts features/templates/lib/block-icons.ts
git commit -m "feat: add template block domain types and catalog"
```

---

### Task 4: HTML snapshot generator + block validators

**Files:**

- Create: `features/templates/lib/html-generator.ts`
- Create: `features/templates/lib/block-validator.ts`

**Interfaces:**

- Produces: `generateHTMLSnapshot(blocks: BlockConfig[], settings: PageSettings): string`; zod schemas `blockConfigSchema` (discriminated union) and `pageSettingsSchema`.
- Consumes: Task 3 types.

- [ ] **Step 1: Write `html-generator.ts`**

```typescript
import type { BlockConfig, PageSettings } from "./block-types";
import { justifyAlignClass, textAlignClass } from "./block-types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlockHTML(block: BlockConfig): string {
  const { type, props } = block;

  switch (type) {
    case "navbar":
      return `        <!-- Navbar -->
        <nav style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-4 px-6 border-b border-gray-800 flex items-center justify-between">
            <div class="font-bold text-xl tracking-tight">${escapeHtml(props.logoText)}</div>
            <div class="hidden md:flex items-center space-x-6 text-sm font-medium">
                ${(props.links || [])
                  .map(
                    (l) =>
                      `<a href="${escapeHtml(l.url)}" class="hover:text-blue-400 transition">${escapeHtml(l.label)}</a>`
                  )
                  .join("")}
            </div>
            <a href="${escapeHtml(props.ctaUrl || "#")}" style="background-color: ${props.accentColor};" class="px-5 py-2 rounded-xl font-semibold text-xs text-white shadow-md">${escapeHtml(props.ctaText)}</a>
        </nav>`;

    case "container":
      return `        <!-- Container Section -->
        <section style="background-color: ${props.bgColor}; color: ${props.textColor}; border-color: ${props.borderColor};" class="${props.paddingY} ${props.paddingX} ${props.borderRadius} ${props.borderWidth} ${props.bgGradient} max-w-6xl mx-auto my-6">
            <p class="leading-relaxed">${escapeHtml(props.content)}</p>
        </section>`;

    case "grid_custom":
      return `        <!-- Grid Custom Section -->
        <section class="py-16 px-6 max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-extrabold text-white">${escapeHtml(props.title)}</h2>
                <p class="text-gray-400 mt-2 text-sm">${escapeHtml(props.subtitle)}</p>
            </div>
            <div class="grid grid-cols-1 ${props.columnsCount > 1 ? `md:grid-cols-${props.columnsCount}` : ""} ${props.gap}">
                ${(props.columns || [])
                  .map(
                    (col) => `
                <div style="background-color: ${col.bgColor}; color: ${col.textColor};" class="p-6 rounded-2xl border border-gray-800/80 shadow-lg flex flex-col justify-between">
                    <div>
                        <div style="color: ${col.accentColor};" class="text-2xl mb-4">★</div>
                        <h3 class="text-lg font-bold mb-2">${escapeHtml(col.title)}</h3>
                        <p class="text-xs opacity-80 leading-relaxed mb-6">${escapeHtml(col.desc)}</p>
                    </div>
                    ${col.btnText ? `<a href="${escapeHtml(col.btnUrl || "#")}" style="background-color: ${col.accentColor};" class="inline-block py-2 px-4 rounded-xl text-xs font-semibold text-white text-center">${escapeHtml(col.btnText)}</a>` : ""}
                </div>`
                  )
                  .join("")}
            </div>
        </section>`;

    case "hero":
      return `        <!-- Hero Section -->
        <section style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-20 px-6 ${props.bgGradient} ${textAlignClass(props.align)}">
            <div class="max-w-4xl mx-auto space-y-6">
                ${props.badge ? `<span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">${escapeHtml(props.badge)}</span>` : ""}
                <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${escapeHtml(props.title)}</h1>
                <p class="text-base md:text-xl opacity-80 max-w-2xl mx-auto">${escapeHtml(props.subtitle)}</p>
                <div class="pt-4 flex flex-wrap ${justifyAlignClass(props.align)} gap-4">
                    ${props.buttonText ? `<a href="${escapeHtml(props.buttonUrl || "#")}" class="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25">${escapeHtml(props.buttonText)}</a>` : ""}
                    ${props.secondaryButtonText ? `<a href="${escapeHtml(props.secondaryButtonUrl || "#")}" class="px-8 py-3.5 rounded-xl bg-gray-800 text-gray-200 font-semibold border border-gray-700">${escapeHtml(props.secondaryButtonText)}</a>` : ""}
                </div>
            </div>
        </section>`;

    case "heading":
      return `        <!-- Heading -->
        <${props.level} style="color: ${props.textColor};" class="${props.fontSize} ${props.weight} ${textAlignClass(props.align)} tracking-tight leading-snug">${escapeHtml(props.text)}</${props.level}>`;

    case "paragraph":
      return `        <!-- Paragraph -->
        <p style="color: ${props.textColor};" class="${props.fontSize} ${textAlignClass(props.align)} ${props.maxWidth} mx-auto leading-relaxed">${escapeHtml(props.text)}</p>`;

    case "image":
      return `        <!-- Image -->
        <div class="py-6 px-4 max-w-4xl mx-auto text-center">
            <img src="${escapeHtml(props.url)}" alt="${escapeHtml(props.alt || "Visual")}" class="w-full h-auto ${props.rounded} ${props.shadow} border border-slate-800 mx-auto max-h-[480px] object-cover" />
            ${props.caption ? `<p class="mt-2 text-xs text-slate-400">${escapeHtml(props.caption)}</p>` : ""}
        </div>`;

    case "pricing":
      return `        <!-- Pricing -->
        <div class="py-10 px-6 max-w-sm mx-auto">
            <div style="background-color: ${props.bgColor}; color: ${props.textColor};" class="p-8 rounded-3xl border border-slate-800 shadow-2xl relative text-center">
                ${props.badge ? `<span style="background-color: ${props.accentColor};" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">${escapeHtml(props.badge)}</span>` : ""}
                <h3 class="text-xl font-bold mt-1">${escapeHtml(props.planName)}</h3>
                <div class="my-4">
                    <span class="text-4xl font-extrabold">${escapeHtml(props.price)}</span>
                    ${props.period ? `<span class="text-xs opacity-70 ml-1">${escapeHtml(props.period)}</span>` : ""}
                </div>
                <ul class="space-y-2.5 text-left my-6 border-t border-b border-slate-800/80 py-4">
                    ${(props.features || [])
                      .map(
                        (f) =>
                          `<li class="flex items-center text-xs opacity-90"><span class="w-3.5 h-3.5 mr-2 text-blue-400">✓</span>${escapeHtml(f)}</li>`
                      )
                      .join("")}
                </ul>
                <a href="${escapeHtml(props.buttonUrl || "#")}" style="background-color: ${props.accentColor};" class="w-full py-3 rounded-xl text-white font-semibold text-xs shadow-lg inline-block text-center">${escapeHtml(props.buttonText)}</a>
            </div>
        </div>`;

    case "form_contact":
      return `        <!-- Contact Form -->
        <div class="py-10 px-6 max-w-2xl mx-auto">
            <div style="background-color: ${props.bgColor}; color: ${props.textColor};" class="p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
                <h3 class="text-xl font-bold">${escapeHtml(props.title)}</h3>
                <p class="text-xs opacity-80 max-w-md mx-auto">${escapeHtml(props.subtitle)}</p>
                <div class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                    <input type="email" placeholder="${escapeHtml(props.placeholder || "Enter your email...")}" class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500" />
                    <button style="background-color: ${props.accentColor};" class="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0">${escapeHtml(props.buttonText)}</button>
                </div>
            </div>
        </div>`;

    case "footer":
      return `        <!-- Footer -->
        <footer style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-8 px-6 border-t border-slate-800 text-center text-xs space-y-2">
            <div class="font-bold text-sm">${escapeHtml(props.brandName)}</div>
            <p class="opacity-70">${escapeHtml(props.copyright)}</p>
        </footer>`;
  }
}

export function generateHTMLSnapshot(
  blocks: BlockConfig[],
  settings: PageSettings
): string {
  const renderedBlocks = blocks
    .filter((b) => !b.hidden)
    .map(renderBlockHTML)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(settings.title)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="background-color: ${settings.bgColor};" class="${settings.fontFamily} text-gray-100 antialiased">
    <main>
${renderedBlocks}
    </main>
</body>
</html>`;
}
```

Notes:

- The `grid_custom` case intentionally emits a template-literal class name (`md:grid-cols-${props.columnsCount}`). This output string is rendered in the standalone snapshot HTML which loads Tailwind via CDN — the CDN scans the DOM at runtime, so the class is generated correctly there. Do NOT swap it for `gridColsClass` (that helper is only for the compiled editor).
- The `switch` covers every member of the `BlockConfig` union, so TypeScript accepts the exhaustive switch without a default case.
- The string uses `<\/script>` inside the template literal so the closing tag is not parsed as an actual script-closer in the generated snapshot.

- [ ] **Step 2: Write `block-validator.ts`**

```typescript
import { z } from "zod";

const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const gridColumnSchema = z.object({
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  btnText: z.string(),
  btnUrl: z.string(),
});

const navbarPropsSchema = z.object({
  layerName: z.string(),
  logoText: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  links: z.array(linkSchema),
  ctaText: z.string(),
  ctaUrl: z.string(),
});

const heroPropsSchema = z.object({
  layerName: z.string(),
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  buttonText: z.string(),
  buttonUrl: z.string(),
  secondaryButtonText: z.string(),
  secondaryButtonUrl: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  bgGradient: z.string(),
  align: z.enum(["left", "center", "right"]),
});

const containerPropsSchema = z.object({
  layerName: z.string(),
  paddingY: z.string(),
  paddingX: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  bgGradient: z.string(),
  borderRadius: z.string(),
  borderWidth: z.string(),
  borderColor: z.string(),
  content: z.string(),
});

const gridCustomPropsSchema = z.object({
  layerName: z.string(),
  title: z.string(),
  subtitle: z.string(),
  columnsCount: z.number().int().min(1).max(4),
  gap: z.string(),
  columns: z.array(gridColumnSchema),
});

const headingPropsSchema = z.object({
  layerName: z.string(),
  text: z.string(),
  level: z.enum(["h1", "h2", "h3", "h4"]),
  align: z.enum(["left", "center", "right"]),
  fontSize: z.string(),
  textColor: z.string(),
  weight: z.string(),
  fontFamily: z.string(),
});

const paragraphPropsSchema = z.object({
  layerName: z.string(),
  text: z.string(),
  align: z.enum(["left", "center", "right"]),
  fontSize: z.string(),
  textColor: z.string(),
  maxWidth: z.string(),
});

const imagePropsSchema = z.object({
  layerName: z.string(),
  url: z.string(),
  alt: z.string(),
  caption: z.string(),
  rounded: z.string(),
  shadow: z.string(),
});

const pricingPropsSchema = z.object({
  layerName: z.string(),
  planName: z.string(),
  badge: z.string(),
  price: z.string(),
  period: z.string(),
  bgColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
  features: z.array(z.string()),
  buttonText: z.string(),
  buttonUrl: z.string(),
});

const formContactPropsSchema = z.object({
  layerName: z.string(),
  title: z.string(),
  subtitle: z.string(),
  placeholder: z.string(),
  buttonText: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
});

const footerPropsSchema = z.object({
  layerName: z.string(),
  brandName: z.string(),
  copyright: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
});

const baseBlock = {
  id: z.string(),
  hidden: z.boolean(),
};

export const blockConfigSchema = z.discriminatedUnion("type", [
  z.object({
    ...baseBlock,
    type: z.literal("navbar"),
    props: navbarPropsSchema,
  }),
  z.object({ ...baseBlock, type: z.literal("hero"), props: heroPropsSchema }),
  z.object({
    ...baseBlock,
    type: z.literal("container"),
    props: containerPropsSchema,
  }),
  z.object({
    ...baseBlock,
    type: z.literal("grid_custom"),
    props: gridCustomPropsSchema,
  }),
  z.object({
    ...baseBlock,
    type: z.literal("heading"),
    props: headingPropsSchema,
  }),
  z.object({
    ...baseBlock,
    type: z.literal("paragraph"),
    props: paragraphPropsSchema,
  }),
  z.object({ ...baseBlock, type: z.literal("image"), props: imagePropsSchema }),
  z.object({
    ...baseBlock,
    type: z.literal("pricing"),
    props: pricingPropsSchema,
  }),
  z.object({
    ...baseBlock,
    type: z.literal("form_contact"),
    props: formContactPropsSchema,
  }),
  z.object({
    ...baseBlock,
    type: z.literal("footer"),
    props: footerPropsSchema,
  }),
]);

export const pageSettingsSchema = z.object({
  title: z.string(),
  bgColor: z.string(),
  fontFamily: z.string(),
});
```

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/lib/html-generator.ts features/templates/lib/block-validator.ts
git commit -m "feat: add template html generator and block validators"
```

---

### Task 5: Feature-level types and zod validation

**Files:**

- Create: `features/templates/types.ts`
- Create: `features/templates/validation.ts`

**Interfaces:**

- Produces: `Template`, `TemplateListItem`, `TemplateActionResult`, `TemplateStatus`, `CreateTemplateInput`, `UpdateTemplateInput`, `createTemplateSchema`, `updateTemplateSchema`.
- Consumes: Task 3/4 types and schemas.

- [ ] **Step 1: Write `types.ts`**

```typescript
import type { BlockConfig, PageSettings } from "./lib/block-types";

export type TemplateStatus = "draft" | "published";

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  categoryId: string | null;
  blocks: BlockConfig[];
  pageSettings: PageSettings;
  htmlSnapshot: string;
  isFeatured: boolean;
  sortOrder: number;
  status: TemplateStatus;
  usageCount: number;
  lastUsedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryParentName: string | null;
  isFeatured: boolean;
  sortOrder: number;
  status: TemplateStatus;
  usageCount: number;
  lastUsedAt: Date | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateActionResult =
  { success: true; data?: { id: string } } | { success: false; error: string };
```

The DTO field is named `blocks` (parsed model); the DB column remains `blocks_json`.

- [ ] **Step 2: Write `validation.ts`**

```typescript
import { z } from "zod";
import { blockConfigSchema, pageSettingsSchema } from "./lib/block-validator";
import type { BlockConfig } from "./lib/block-types";

export const createTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  slug: z.string().min(1).max(220).optional(),
  description: z.string().optional().nullable(),
  previewImageUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  blocks: z.array(blockConfigSchema),
  pageSettings: pageSettingsSchema.optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
```

Note: `z.array(blockConfigSchema)` is inferred as `BlockConfig[]` because `blockConfigSchema` is a discriminated union; the unused `BlockConfig` type import above is **not needed** — omit it.

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/types.ts features/templates/validation.ts
git commit -m "feat: add template types and validation"
```

---

### Task 6: Queries

**Files:**

- Create: `features/templates/queries.ts`

**Interfaces:**

- Produces: `getAllTemplates(): Promise<TemplateListItem[]>`, `getTemplateById(id): Promise<Template | null>`, `generateUniqueSlug(name, excludeId?): Promise<string>`, `incrementUsageCount(id): Promise<void>`.
- Consumes: `@/lib/db`, schema `templates`/`businessCategories`/`user`; Task 5 types.

- [ ] **Step 1: Write `queries.ts`**

```typescript
import { db } from "@/lib/db";
import { templates, businessCategories, user } from "@/lib/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import type { Template, TemplateListItem, TemplateStatus } from "./types";

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
  }));
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const [row] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, id), isNull(templates.deletedAt)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    previewImageUrl: row.previewImageUrl,
    categoryId: row.categoryId,
    blocks: row.blocksJson,
    pageSettings: row.pageSettings,
    htmlSnapshot: row.htmlSnapshot,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    status: row.status as TemplateStatus,
    usageCount: row.usageCount,
    lastUsedAt: row.lastUsedAt,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
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
```

`row.blocksJson` and `row.pageSettings` come back as their `$type<>`-annotated types once Task 1's schema is in the build. `row.status` is a union-typed string and is narrowed with an explicit cast for the DTO.

- [ ] **Step 2: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/queries.ts
git commit -m "feat: add template queries"
```

---

### Task 7: Service layer

**Files:**

- Create: `features/templates/service.ts`

**Interfaces:**

- Produces: `createTemplate(data, userId)`, `updateTemplate(id, data, userId)`, `softDeleteTemplate(id, userId)`, `duplicateTemplate(id, userId)`, `toggleTemplateStatus(id, status, userId)`, `toggleTemplateFeatured(id, isFeatured, userId)`, `assertCanModifyTemplate(templateId, userId, mode)`.
- Consumes: Task 5 inputs, Task 6 queries, `generateHTMLSnapshot`, `createAuditLog`, `getUserPermissions`, `PERMISSIONS`, `DEFAULT_PAGE_SETTINGS`.

- [ ] **Step 1: Write `service.ts`**

```typescript
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
```

- [ ] **Step 2: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/service.ts
git commit -m "feat: add template service layer"
```

---

### Task 8: Server actions

**Files:**

- Create: `features/templates/actions.ts`

**Interfaces:**

- Produces: `createTemplateAction(data): Promise<TemplateActionResult>`, `updateTemplateAction(data)`, `deleteTemplateAction(id)`, `duplicateTemplateAction(id)`, `setTemplateStatusAction(id, status)`, `setTemplateFeaturedAction(id, isFeatured)`.
- Consumes: Task 5 schemas/types, Task 7 services.

- [ ] **Step 1: Write `actions.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createTemplateSchema, updateTemplateSchema } from "./validation";
import type { TemplateActionResult, TemplateStatus } from "./types";
import {
  createTemplate,
  updateTemplate,
  softDeleteTemplate,
  duplicateTemplate,
  toggleTemplateStatus,
  toggleTemplateFeatured,
  assertCanModifyTemplate,
} from "./service";

const TEMPLATES_PATH = "/staff/templates";

export async function createTemplateAction(
  data: unknown
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await authorize(PERMISSIONS.TEMPLATES_CREATE);
    const validated = createTemplateSchema.parse(data);
    const { id } = await createTemplate(validated, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateTemplateAction(
  data: unknown
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    const validated = updateTemplateSchema.parse(data);
    await assertCanModifyTemplate(validated.id, session.user.id, "update");
    await updateTemplate(validated.id, validated, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    revalidatePath(`${TEMPLATES_PATH}/${validated.id}/edit`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteTemplateAction(
  id: string
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await assertCanModifyTemplate(id, session.user.id, "delete");
    await softDeleteTemplate(id, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function duplicateTemplateAction(
  id: string
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await authorize(PERMISSIONS.TEMPLATES_CREATE);
    await assertCanModifyTemplate(id, session.user.id, "update");
    const { id: newId } = await duplicateTemplate(id, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true, data: { id: newId } };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function setTemplateStatusAction(
  id: string,
  status: TemplateStatus
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await authorize(PERMISSIONS.TEMPLATES_PUBLISH);
    await assertCanModifyTemplate(id, session.user.id, "update");
    await toggleTemplateStatus(id, status, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function setTemplateFeaturedAction(
  id: string,
  isFeatured: boolean
): Promise<TemplateActionResult> {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized" };
    if (session.user.accountType !== "STAFF")
      return { success: false, error: "Forbidden: Staff access required" };

    await assertCanModifyTemplate(id, session.user.id, "update");
    await toggleTemplateFeatured(id, isFeatured, session.user.id);

    revalidatePath(TEMPLATES_PATH);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

- [ ] **Step 2: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/actions.ts
git commit -m "feat: add template server actions"
```

---

### Task 9: Data-table layer (columns, filters, bulk actions, table component)

**Files:**

- Create: `features/templates/table/template-columns.tsx`
- Create: `features/templates/table/template-filters.ts`
- Create: `features/templates/table/template-bulk-actions.tsx`
- Create: `features/templates/components/template-data-table.tsx`

**Interfaces:**

- Produces: `createTemplateColumns(opts)`, `templateFilters`, `createTemplateBulkActions(onRefresh)`, `TemplateDataTable({ data })`.
- Consumes: `DataTable` from `@/components/shared/data-table`; Task 5 `TemplateListItem`.

- [ ] **Step 1: Write `template-columns.tsx`**

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  Star,
  StarOff,
  ImageIcon,
  Pencil,
} from "lucide-react";
import type { TemplateListItem } from "../types";

interface TemplateColumnProps {
  onDuplicate: (template: TemplateListItem) => void;
  onDelete: (template: TemplateListItem) => void;
  onToggleFeatured: (template: TemplateListItem) => void;
}

function categoryText(row: TemplateListItem): string {
  if (!row.categoryName) return "-";
  const parent = row.categoryParentName ? `${row.categoryParentName} > ` : "";
  return `${parent}${row.categoryName}`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export function createTemplateColumns(
  opts: TemplateColumnProps
): ColumnDef<TemplateListItem, unknown>[] {
  const { onDuplicate, onDelete, onToggleFeatured } = opts;

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        exportable: false,
        visibleFrom: "always",
        minWidth: 40,
        cellClassName: "w-[40px]",
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-3">
            {t.previewImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.previewImageUrl}
                alt={t.name}
                className="h-10 w-10 rounded-md border object-cover"
              />
            ) : (
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md border">
                <ImageIcon className="text-muted-foreground h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 font-medium">
                {t.name}
                {t.isFeatured && (
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                )}
              </span>
              <span className="text-muted-foreground text-xs">{t.slug}</span>
            </div>
          </div>
        );
      },
      enableSorting: true,
      meta: {
        label: "Name",
        searchable: true,
        exportable: true,
        visibleFrom: "always",
        minWidth: 240,
        truncate: true,
      },
    },
    {
      id: "category",
      accessorFn: (row) => categoryText(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {categoryText(row.original)}
        </span>
      ),
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Category",
        filterVariant: "select",
        exportable: true,
        minWidth: 180,
        truncate: true,
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const published = row.original.status === "published";
        return (
          <Badge variant={published ? "default" : "secondary"}>
            {published ? "Published" : "Draft"}
          </Badge>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        filterVariant: "select",
        exportable: true,
        visibleFrom: "always",
        minWidth: 110,
        align: "center",
      },
    },
    {
      id: "usage",
      accessorKey: "usageCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usage" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.usageCount}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "md",
        minWidth: 90,
        align: "center",
      },
    },
    {
      id: "createdBy",
      accessorKey: "createdByName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.createdByName ?? "-"}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "lg",
        minWidth: 140,
        truncate: true,
      },
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.original.updatedAt)}
        </span>
      ),
      enableSorting: true,
      meta: {
        exportable: true,
        visibleFrom: "lg",
        minWidth: 120,
        exportFormatter: (value) =>
          value instanceof Date ? value.toISOString() : String(value),
      },
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/staff/templates/${t.id}/edit`} />}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFeatured(t)}>
                {t.isFeatured ? (
                  <StarOff className="mr-2 size-4" />
                ) : (
                  <Star className="mr-2 size-4" />
                )}
                {t.isFeatured ? "Remove Featured" : "Mark as Featured"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(t)}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(t)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      meta: {
        exportable: false,
        visibleFrom: "always",
        minWidth: 50,
        cellClassName: "w-[50px]",
      },
    },
  ];
}
```

- [ ] **Step 2: Write `template-filters.ts`**

```typescript
import type { DataTableFilter } from "@/components/shared/data-table";

export const templateFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "faceted",
    column: "status",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ],
  },
];
```

- [ ] **Step 3: Write `template-bulk-actions.tsx`**

```tsx
"use client";

import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { TemplateListItem } from "../types";
import { Rocket, EyeOff, Star, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  setTemplateStatusAction,
  setTemplateFeaturedAction,
  deleteTemplateAction,
} from "../actions";

export const createTemplateBulkActions = (
  onRefresh: () => void
): DataTableBulkAction<TemplateListItem>[] => [
  {
    id: "publish",
    label: "Publish",
    icon: Rocket,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateStatusAction(row.id, "published"))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "published with success",
        onRefresh
      );
    },
  },
  {
    id: "unpublish",
    label: "Unpublish",
    icon: EyeOff,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateStatusAction(row.id, "draft"))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "unpublished",
        onRefresh
      );
    },
  },
  {
    id: "feature",
    label: "Mark as Featured",
    icon: Star,
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => setTemplateFeaturedAction(row.id, true))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "marked as featured",
        onRefresh
      );
    },
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      const results = await Promise.all(
        rows.map((row) => deleteTemplateAction(row.id))
      );
      report(
        results.length,
        results.filter((r) => r.success).length,
        "deleted",
        onRefresh
      );
    },
  },
];

function report(
  total: number,
  succeeded: number,
  verb: string,
  onRefresh: () => void
): void {
  const failed = total - succeeded;
  if (succeeded > 0) {
    toast.add({
      type: "success",
      title: "Success",
      description: `${succeeded} template${succeeded === 1 ? "" : "s"} ${verb}`,
    });
  }
  if (failed > 0) {
    toast.add({
      type: "error",
      title: "Error",
      description: `${failed} template${failed === 1 ? "" : "s"} failed`,
    });
  }
  onRefresh();
}
```

- [ ] **Step 4: Write `template-data-table.tsx`**

```tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { DataTable } from "@/components/shared/data-table";
import { createTemplateColumns } from "../table/template-columns";
import { templateFilters } from "../table/template-filters";
import { createTemplateBulkActions } from "../table/template-bulk-actions";
import {
  deleteTemplateAction,
  duplicateTemplateAction,
  setTemplateFeaturedAction,
} from "../actions";
import type { TemplateListItem } from "../types";

interface TemplateDataTableProps {
  data: TemplateListItem[];
}

export function TemplateDataTable({ data }: TemplateDataTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<TemplateListItem | null>(
    null
  );

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDuplicate = useCallback(
    async (template: TemplateListItem) => {
      const result = await duplicateTemplateAction(template.id);
      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description: "Template duplicated",
        });
        router.refresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to duplicate template",
        });
      }
    },
    [router]
  );

  const handleToggleFeatured = useCallback(
    async (template: TemplateListItem) => {
      const result = await setTemplateFeaturedAction(
        template.id,
        !template.isFeatured
      );
      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description: template.isFeatured
            ? "Removed from featured"
            : "Marked as featured",
        });
        router.refresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error || "Failed to update template",
        });
      }
    },
    [router]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteTemplateAction(deleteTarget.id);
    if (result.success) {
      toast.add({
        type: "success",
        title: "Success",
        description: "Template deleted",
      });
    } else {
      toast.add({
        type: "error",
        title: "Error",
        description: result.error || "Failed to delete template",
      });
    }
    setDeleteTarget(null);
    router.refresh();
  }, [deleteTarget, router]);

  const columns = useMemo(
    () =>
      createTemplateColumns({
        onDuplicate: handleDuplicate,
        onDelete: (t) => setDeleteTarget(t),
        onToggleFeatured: handleToggleFeatured,
      }),
    [handleDuplicate, handleToggleFeatured]
  );

  const bulkActions = useMemo(
    () => createTemplateBulkActions(handleRefresh),
    [handleRefresh]
  );

  return (
    <>
      <DataTable
        tableId="website-templates"
        data={data}
        columns={columns}
        rowId={(row) => row.id}
        search={{ keys: ["name", "slug"], placeholder: "Search templates..." }}
        filters={templateFilters}
        bulkActions={bulkActions}
        exportOptions={{
          csv: true,
          excel: true,
          filename: "website-templates",
        }}
        enabledFeatures={{
          sorting: true,
          filtering: true,
          pagination: true,
          export: true,
          rowSelection: true,
          columnVisibility: true,
        }}
        locale={{
          searchPlaceholder: "Search templates...",
          noResults: "No templates found.",
          rowsSelected: (count) => `${count} selected`,
        }}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              {deleteTarget ? ` "${deleteTarget.name}"` : " this template"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

The `search` prop takes `{ keys: string[]; placeholder? }` — the code above matches the DataTable contract used by `StaffDataTable` and `CategoryDataTable`.

- [ ] **Step 5: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/table/ features/templates/components/template-data-table.tsx
git commit -m "feat: add templates data table"
```

---

### Task 10: Index page (DataTable)

**Files:**

- Create: `app/(staff)/staff/templates/page.tsx`

**Interfaces:**

- Consumes: `getAllTemplates`, `TemplateDataTable`, `PageHeader`, `PERMISSIONS.TEMPLATES_VIEW`, `Button`, `Plus`, `Link`.
- Produces: the `/staff/templates` route.

- [ ] **Step 1: Write the page**

```tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllTemplates } from "@/features/templates/queries";
import { TemplateDataTable } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Templates",
};

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.TEMPLATES_VIEW);

  const templates = await getAllTemplates();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Templates"
        description="Create and manage website templates for clients"
        actions={
          <Link href="/staff/templates/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </Link>
        }
      />

      <TemplateDataTable data={templates} />
    </div>
  );
}
```

- [ ] **Step 2: Create the components barrel**

Create `features/templates/components/index.ts` (will be extended in later tasks):

```typescript
export { TemplateDataTable } from "./template-data-table";
```

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean (the missing `TemplateForm`/`BlockEditor` exports are added in Tasks 16; nothing imports them yet).

```bash
git add features/templates/components/index.ts "app/(staff)/staff/templates/page.tsx"
git commit -m "feat: add templates index page"
```

---

### Task 11: Block renderer components

**Files:**

- Create: `features/templates/components/block-editor/blocks/navbar-block.tsx`
- Create: `features/templates/components/block-editor/blocks/hero-block.tsx`
- Create: `features/templates/components/block-editor/blocks/container-block.tsx`
- Create: `features/templates/components/block-editor/blocks/grid-custom-block.tsx`
- Create: `features/templates/components/block-editor/blocks/heading-block.tsx`
- Create: `features/templates/components/block-editor/blocks/paragraph-block.tsx`
- Create: `features/templates/components/block-editor/blocks/image-block.tsx`
- Create: `features/templates/components/block-editor/blocks/pricing-block.tsx`
- Create: `features/templates/components/block-editor/blocks/form-contact-block.tsx`
- Create: `features/templates/components/block-editor/blocks/footer-block.tsx`
- Create: `features/templates/components/block-editor/block-renderer.tsx`

**Interfaces:**

- Produces: one default-export component per block (each takes `{ props }`), plus `BlockRenderer({ block })`.
- Consumes: Task 3 prop types, `gridColsClass`/`textAlignClass`/`justifyAlignClass`, `getBlockIcon`.

- [ ] **Step 1: Write `blocks/navbar-block.tsx`**

```tsx
"use client";

import type { NavbarProps } from "../../../lib/block-types";

export function NavbarBlock({ props }: { props: NavbarProps }) {
  return (
    <nav
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="flex items-center justify-between border-b border-slate-800 px-6 py-4 transition-all"
    >
      <div className="text-lg font-extrabold tracking-tight">
        {props.logoText}
      </div>
      <div className="hidden items-center space-x-6 text-xs font-semibold md:flex">
        {props.links.map((l, i) => (
          <a
            key={i}
            href={l.url || "#"}
            className="transition hover:text-blue-400"
          >
            {l.label}
          </a>
        ))}
      </div>
      <a
        href={props.ctaUrl || "#"}
        style={{ backgroundColor: props.accentColor }}
        className="inline-block rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md"
      >
        {props.ctaText}
      </a>
    </nav>
  );
}
```

- [ ] **Step 2: Write `blocks/hero-block.tsx`**

```tsx
"use client";

import type { HeroProps } from "../../../lib/block-types";
import { justifyAlignClass, textAlignClass } from "../../../lib/block-types";

export function HeroBlock({ props }: { props: HeroProps }) {
  return (
    <div
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className={`relative px-6 py-16 ${props.bgGradient} ${textAlignClass(props.align)} transition-all`}
    >
      <div className="mx-auto max-w-4xl space-y-5">
        {props.badge && (
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-[11px] font-semibold text-blue-400">
            {props.badge}
          </span>
        )}
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight md:text-5xl">
          {props.title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm opacity-80 md:text-base">
          {props.subtitle}
        </p>
        <div
          className={`flex flex-wrap pt-4 ${justifyAlignClass(props.align)} gap-4`}
        >
          {props.buttonText && (
            <a
              href={props.buttonUrl || "#"}
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
            >
              {props.buttonText}
            </a>
          )}
          {props.secondaryButtonText && (
            <a
              href={props.secondaryButtonUrl || "#"}
              className="inline-block rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {props.secondaryButtonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write `blocks/container-block.tsx`**

```tsx
"use client";

import type { ContainerProps } from "../../../lib/block-types";

export function ContainerBlock({ props }: { props: ContainerProps }) {
  return (
    <div
      style={{
        backgroundColor: props.bgColor,
        color: props.textColor,
        borderColor: props.borderColor,
      }}
      className={`${props.paddingY} ${props.paddingX} ${props.borderRadius} ${props.borderWidth} ${props.bgGradient} mx-auto my-4 max-w-6xl transition-all`}
    >
      <p className="text-sm leading-relaxed">{props.content}</p>
    </div>
  );
}
```

- [ ] **Step 4: Write `blocks/grid-custom-block.tsx`**

```tsx
"use client";

import type { GridCustomProps } from "../../../lib/block-types";
import { gridColsClass } from "../../../lib/block-types";
import { getBlockIcon } from "../../../lib/block-icons";

export function GridCustomBlock({ props }: { props: GridCustomProps }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-2 text-center">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          {props.title}
        </h2>
        <p className="text-xs text-slate-400">{props.subtitle}</p>
      </div>
      <div
        className={`grid grid-cols-1 ${gridColsClass(props.columnsCount)} ${props.gap}`}
      >
        {props.columns.map((col, idx) => {
          const Icon = getBlockIcon(col.icon);
          return (
            <div
              key={idx}
              style={{ backgroundColor: col.bgColor, color: col.textColor }}
              className="flex flex-col justify-between rounded-2xl border border-slate-800/80 p-6 shadow-lg transition-all"
            >
              <div>
                <div
                  style={{ color: col.accentColor }}
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold">{col.title}</h3>
                <p className="mb-6 text-xs leading-relaxed opacity-80">
                  {col.desc}
                </p>
              </div>
              {col.btnText && (
                <a
                  href={col.btnUrl || "#"}
                  style={{ backgroundColor: col.accentColor }}
                  className="inline-block w-full rounded-xl py-2.5 text-center text-xs font-semibold text-white shadow-md"
                >
                  {col.btnText}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write `blocks/heading-block.tsx`**

```tsx
"use client";

import type { HeadingProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";

export function HeadingBlock({ props }: { props: HeadingProps }) {
  const HeadingTag = props.level;
  return (
    <div className={`px-6 py-4 ${textAlignClass(props.align)}`}>
      <HeadingTag
        style={{ color: props.textColor }}
        className={`${props.fontSize} ${props.weight} leading-snug tracking-tight`}
      >
        {props.text}
      </HeadingTag>
    </div>
  );
}
```

- [ ] **Step 6: Write `blocks/paragraph-block.tsx`**

```tsx
"use client";

import type { ParagraphProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";

export function ParagraphBlock({ props }: { props: ParagraphProps }) {
  return (
    <div className="px-6 py-3">
      <p
        style={{ color: props.textColor }}
        className={`${props.fontSize} ${textAlignClass(props.align)} ${props.maxWidth} mx-auto leading-relaxed`}
      >
        {props.text}
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Write `blocks/image-block.tsx`**

```tsx
"use client";

import type { ImageProps } from "../../../lib/block-types";

export function ImageBlock({ props }: { props: ImageProps }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.url}
        alt={props.alt || "Visual"}
        className={`h-auto w-full ${props.rounded} ${props.shadow} mx-auto max-h-[480px] border border-slate-800 object-cover`}
      />
      {props.caption && (
        <p className="mt-2 text-xs text-slate-400">{props.caption}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 8: Write `blocks/pricing-block.tsx`**

```tsx
"use client";

import { Check } from "lucide-react";
import type { PricingProps } from "../../../lib/block-types";

export function PricingBlock({ props }: { props: PricingProps }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-10">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="relative rounded-3xl border border-slate-800 p-8 text-center shadow-2xl"
      >
        {props.badge && (
          <span
            style={{ backgroundColor: props.accentColor }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase"
          >
            {props.badge}
          </span>
        )}
        <h3 className="mt-1 text-xl font-bold">{props.planName}</h3>
        <div className="my-4">
          <span className="text-4xl font-extrabold">{props.price}</span>
          {props.period && (
            <span className="ml-1 text-xs opacity-70">{props.period}</span>
          )}
        </div>
        <ul className="my-6 space-y-2.5 border-t border-b border-slate-800/80 py-4 text-left">
          {props.features.map((f, i) => (
            <li key={i} className="flex items-center text-xs opacity-90">
              <Check className="mr-2 h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href={props.buttonUrl || "#"}
          style={{ backgroundColor: props.accentColor }}
          className="inline-block w-full rounded-xl py-3 text-center text-xs font-semibold text-white shadow-lg"
        >
          {props.buttonText}
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Write `blocks/form-contact-block.tsx`**

```tsx
"use client";

import type { FormContactProps } from "../../../lib/block-types";

export function FormContactBlock({ props }: { props: FormContactProps }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div
        style={{ backgroundColor: props.bgColor, color: props.textColor }}
        className="space-y-4 rounded-3xl border border-slate-800 p-8 text-center shadow-xl"
      >
        <h3 className="text-xl font-bold">{props.title}</h3>
        <p className="mx-auto max-w-md text-xs opacity-80">{props.subtitle}</p>
        <div className="mx-auto flex max-w-md flex-col gap-2 pt-2 sm:flex-row">
          <input
            type="email"
            placeholder={props.placeholder || "Enter your email address..."}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500"
          />
          <button
            type="button"
            style={{ backgroundColor: props.accentColor }}
            className="shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
          >
            {props.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Write `blocks/footer-block.tsx`**

```tsx
"use client";

import type { FooterProps } from "../../../lib/block-types";

export function FooterBlock({ props }: { props: FooterProps }) {
  return (
    <footer
      style={{ backgroundColor: props.bgColor, color: props.textColor }}
      className="space-y-2 border-t border-slate-800 px-6 py-8 text-center text-xs"
    >
      <div className="text-sm font-bold">{props.brandName}</div>
      <p className="opacity-70">{props.copyright}</p>
    </footer>
  );
}
```

- [ ] **Step 11: Write `block-renderer.tsx`**

```tsx
"use client";

import type { BlockConfig } from "../../lib/block-types";
import { NavbarBlock } from "./blocks/navbar-block";
import { HeroBlock } from "./blocks/hero-block";
import { ContainerBlock } from "./blocks/container-block";
import { GridCustomBlock } from "./blocks/grid-custom-block";
import { HeadingBlock } from "./blocks/heading-block";
import { ParagraphBlock } from "./blocks/paragraph-block";
import { ImageBlock } from "./blocks/image-block";
import { PricingBlock } from "./blocks/pricing-block";
import { FormContactBlock } from "./blocks/form-contact-block";
import { FooterBlock } from "./blocks/footer-block";

export function BlockRenderer({ block }: { block: BlockConfig }) {
  switch (block.type) {
    case "navbar":
      return <NavbarBlock props={block.props} />;
    case "hero":
      return <HeroBlock props={block.props} />;
    case "container":
      return <ContainerBlock props={block.props} />;
    case "grid_custom":
      return <GridCustomBlock props={block.props} />;
    case "heading":
      return <HeadingBlock props={block.props} />;
    case "paragraph":
      return <ParagraphBlock props={block.props} />;
    case "image":
      return <ImageBlock props={block.props} />;
    case "pricing":
      return <PricingBlock props={block.props} />;
    case "form_contact":
      return <FormContactBlock props={block.props} />;
    case "footer":
      return <FooterBlock props={block.props} />;
  }
}
```

The `switch` is exhaustive over the `BlockConfig` union, so no default case is needed.

- [ ] **Step 12: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/components/block-editor/blocks/ features/templates/components/block-editor/block-renderer.tsx
git commit -m "feat: add block renderer components"
```

---

### Task 12: Editor state hook (undo/redo, palette, layers)

**Files:**

- Create: `features/templates/components/block-editor/hooks/use-block-editor.ts`

**Interfaces:**

- Produces: `useBlockEditor(initialBlocks, initialPageSettings?)` returning `{ blocks, selectedBlockId, viewport, activeTab, isPreviewMode, dirty, pageSettings, historyIndex, historyLength, addBlock, updateBlockProps, duplicateBlock, moveBlock, toggleBlockVisibility, deleteBlock, setPageSettings, setViewport, setActiveTab, setPreviewMode, undo, redo, loadPreset }`.
- Consumes: Task 3 catalog/types, Task 11 renderers (not directly).

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useCallback, useState } from "react";
import type { BlockConfig, PageSettings } from "../../../lib/block-types";
import { DEFAULT_PAGE_SETTINGS, createBlockId } from "../../../lib/block-types";
import type { BlockCatalogItem } from "../../../lib/block-catalog";
import {
  createBlockFromCatalog,
  PRESET_TEMPLATES,
} from "../../../lib/block-catalog";

export type Viewport = "desktop" | "tablet" | "mobile";
export type EditorTab = "blocks" | "layers" | "templates" | "settings";

export function useBlockEditor(
  initialBlocks: BlockConfig[],
  initialPageSettings?: PageSettings
) {
  const [blocks, setBlocks] = useState<BlockConfig[]>(initialBlocks);
  const [pageSettings, setPageSettingsState] = useState<PageSettings>({
    ...DEFAULT_PAGE_SETTINGS,
    ...initialPageSettings,
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [activeTab, setActiveTab] = useState<EditorTab>("blocks");
  const [isPreviewMode, setPreviewMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [history, setHistory] = useState<BlockConfig[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const commit = useCallback(
    (next: BlockConfig[]) => {
      setBlocks(next);
      setHistory((h) => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex((i) => i + 1);
      setDirty(true);
    },
    [historyIndex]
  );

  const addBlock = useCallback(
    (item: BlockCatalogItem) => {
      const newBlock = createBlockFromCatalog(item);
      commit([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
    },
    [blocks, commit]
  );

  const updateBlockProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      commit(
        blocks.map((b) =>
          b.id === id
            ? ({ ...b, props: { ...b.props, ...patch } } as BlockConfig)
            : b
        )
      );
    },
    [blocks, commit]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const target = blocks[index];

      const copy = {
        id: createBlockId(),
        type: target.type,
        hidden: false,
        props: {
          ...target.props,
          layerName: `${target.props.layerName ?? "Layer"} (Copy)`,
        },
      } as BlockConfig;

      const next = [...blocks];
      next.splice(index + 1, 0, copy);
      commit(next);
      setSelectedBlockId(copy.id);
    },
    [blocks, commit]
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= blocks.length) return;

      const next = [...blocks];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      commit(next);
    },
    [blocks, commit]
  );

  const toggleBlockVisibility = useCallback(
    (id: string) => {
      commit(
        blocks.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b))
      );
    },
    [blocks, commit]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      const next = blocks.filter((b) => b.id !== id);
      commit(next);
      if (selectedBlockId === id) {
        setSelectedBlockId(next[0]?.id ?? null);
      }
    },
    [blocks, commit, selectedBlockId]
  );

  const setPageSettings = useCallback((patch: Partial<PageSettings>) => {
    setPageSettingsState((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
      setDirty(true);
    }
  }, [history, historyIndex]);

  const loadPreset = useCallback(
    (name: string) => {
      const preset = PRESET_TEMPLATES[name];
      if (!preset) return;
      commit(JSON.parse(JSON.stringify(preset)) as BlockConfig[]);
      setSelectedBlockId(preset[0]?.id ?? null);
    },
    [commit]
  );

  const loadBlocks = useCallback(
    (next: BlockConfig[]) => {
      commit(next);
      setSelectedBlockId(next[0]?.id ?? null);
    },
    [commit]
  );

  return {
    setSelectedBlockId,
    blocks,
    pageSettings,
    selectedBlockId,
    viewport,
    activeTab,
    isPreviewMode,
    dirty,
    historyIndex,
    historyLength: history.length,
    addBlock,
    updateBlockProps,
    duplicateBlock,
    moveBlock,
    toggleBlockVisibility,
    deleteBlock,
    setPageSettings,
    setViewport,
    setActiveTab,
    setPreviewMode,
    undo,
    redo,
    loadPreset,
    loadBlocks,
  };
}
```

The `updateBlockProps`/`duplicateBlock` casts are the narrow union-casts the codebase accepts; they are safe because `patch` is applied over the same block's own props.

- [ ] **Step 2: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/components/block-editor/hooks/use-block-editor.ts
git commit -m "feat: add block editor state hook"
```

---

### Task 13: Editor shell + toolbar + viewport + canvas

**Files:**

- Create: `features/templates/components/block-editor/viewport-switcher.tsx`
- Create: `features/templates/components/block-editor/toolbar.tsx`
- Create: `features/templates/components/block-editor/canvas.tsx`
- Create: `features/templates/components/block-editor/index.tsx`

**Interfaces:**

- Produces: `BlockEditor` (forwardRef with `BlockEditorHandle = { getData(): { blocks; pageSettings } }`), `EditorToolbar`, `EditorCanvas`.
- Consumes: Task 11 `BlockRenderer`, Task 12 hook, Task 3 types/catalog/helpers.

- [ ] **Step 1: Write `viewport-switcher.tsx`**

```tsx
"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { Viewport } from "./hooks/use-block-editor";

interface ViewportSwitcherProps {
  viewport: Viewport;
  onChange: (viewport: Viewport) => void;
}

const OPTIONS: { value: Viewport; label: string; Icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "tablet", label: "Tablet", Icon: Tablet },
  { value: "mobile", label: "Mobile", Icon: Smartphone },
];

export function ViewportSwitcher({
  viewport,
  onChange,
}: ViewportSwitcherProps) {
  return (
    <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            viewport === value
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `toolbar.tsx`**

```tsx
"use client";

import { Undo, Redo, Eye, EyeOff, Code, Sparkles } from "lucide-react";
import { ViewportSwitcher } from "./viewport-switcher";
import type { Viewport } from "./hooks/use-block-editor";

interface EditorToolbarProps {
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onExportHTML: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export function EditorToolbar({
  viewport,
  onViewportChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreviewMode,
  onTogglePreview,
  onExportHTML,
  onExportJSON,
  onImportJSON,
}: EditorToolbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/90 px-4 backdrop-blur-md select-none">
      <div className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="hidden lg:block">
          <h2 className="text-sm leading-tight font-bold text-white">
            Block Editor
          </h2>
          <p className="text-[10px] text-slate-400">
            Wix & WordPress style builder
          </p>
        </div>
      </div>

      <ViewportSwitcher viewport={viewport} onChange={onViewportChange} />

      <div className="flex items-center space-x-2">
        <div className="mr-1 flex items-center rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        <label className="flex cursor-pointer items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700">
          Import JSON
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportJSON(file);
              e.target.value = "";
            }}
          />
        </label>

        <button
          type="button"
          onClick={onExportJSON}
          className="flex items-center space-x-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
        >
          Export JSON
        </button>

        <button
          type="button"
          onClick={onTogglePreview}
          className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
            isPreviewMode
              ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
              : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          {isPreviewMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportHTML}
          className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
        >
          <Code className="h-4 w-4" />
          <span>Export HTML</span>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write `canvas.tsx`**

```tsx
"use client";

import type { BlockConfig, PageSettings } from "../../lib/block-types";
import { BlockRenderer } from "./block-renderer";
import { ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";
import type { Viewport } from "./hooks/use-block-editor";

interface EditorCanvasProps {
  blocks: BlockConfig[];
  pageSettings: PageSettings;
  viewport: Viewport;
  selectedBlockId: string | null;
  isPreviewMode: boolean;
  onSelectBlock: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EditorCanvas({
  blocks,
  pageSettings,
  viewport,
  selectedBlockId,
  isPreviewMode,
  onSelectBlock,
  onMove,
  onDuplicate,
  onDelete,
}: EditorCanvasProps) {
  const canvasWidth =
    viewport === "desktop"
      ? "w-full max-w-6xl"
      : viewport === "tablet"
        ? "w-[768px]"
        : "w-[375px]";

  return (
    <main className="canvas-bg-grid flex flex-1 items-start justify-center overflow-y-auto bg-slate-950 p-4 md:p-8">
      <div
        style={{ backgroundColor: pageSettings.bgColor }}
        className={`relative min-h-[85%] rounded-2xl border border-slate-800/80 shadow-2xl transition-all duration-300 ${canvasWidth} ${pageSettings.fontFamily}`}
      >
        <div className="relative py-4">
          {blocks.map((block) => {
            if (block.hidden) return null;
            const isSelected = selectedBlockId === block.id && !isPreviewMode;

            return (
              <div
                key={block.id}
                onClick={() => !isPreviewMode && onSelectBlock(block.id)}
                className={`group relative cursor-pointer transition ${
                  !isPreviewMode ? "block-outline my-1 py-1" : ""
                } ${isSelected ? "is-selected" : ""}`}
              >
                {!isPreviewMode && isSelected && (
                  <div className="absolute -top-3.5 right-4 z-30 flex items-center space-x-1 rounded-lg bg-blue-600 px-2 py-1 text-xs text-white shadow-xl select-none">
                    <span className="px-1 text-[10px] font-bold tracking-wider text-blue-200 uppercase">
                      {block.props.layerName || block.type}
                    </span>
                    <div className="mx-1 h-3 w-px bg-blue-400" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "up");
                      }}
                      title="Move Up"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(block.id, "down");
                      }}
                      title="Move Down"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(block.id);
                      }}
                      title="Duplicate"
                      className="rounded p-1 hover:bg-blue-700"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                      }}
                      title="Delete"
                      className="rounded p-1 text-red-200 hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <BlockRenderer block={block} />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
```

Note: `.canvas-bg-grid`, `.block-outline`, and `.is-selected` are global CSS classes defined in `app/globals.css` (or added to `app/layout` styles). If they do not exist yet, add them to `globals.css`:

```css
.canvas-bg-grid {
  background-size: 28px 28px;
  background-image: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.07) 1px,
    transparent 1px
  );
}
.block-outline {
  outline: 2px solid transparent;
  transition: all 0.15s ease-in-out;
}
.block-outline:hover {
  outline-color: #3b82f6;
}
.block-outline.is-selected {
  outline-color: #2563eb;
  outline-width: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}
```

(These may already exist from the landing-page work — check `globals.css` first and only add what is missing.)

- [ ] **Step 4: Write `index.tsx` (editor shell)**

```tsx
"use client";

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { BlockConfig, PageSettings } from "../../lib/block-types";
import { useBlockEditor } from "./hooks/use-block-editor";
import type { EditorTab } from "./hooks/use-block-editor";
import { EditorToolbar } from "./toolbar";
import { EditorCanvas } from "./canvas";
import { BlockPalette } from "./block-palette";
import { LayerTree } from "./layer-tree";
import { PresetTemplatesPanel } from "./preset-templates-panel";
import { PageSettingsPanel } from "./page-settings-panel";
import { InspectorPanel } from "./inspector-panel";
import { Plus, Layers, Layout, Settings } from "lucide-react";

export interface BlockEditorHandle {
  getData: () => { blocks: BlockConfig[]; pageSettings: PageSettings };
}

interface BlockEditorProps {
  initialBlocks: BlockConfig[];
  initialPageSettings?: PageSettings;
}

const TABS: { value: EditorTab; label: string; Icon: typeof Plus }[] = [
  { value: "blocks", label: "Add", Icon: Plus },
  { value: "layers", label: "Layers", Icon: Layers },
  { value: "templates", label: "Templates", Icon: Layout },
  { value: "settings", label: "Page", Icon: Settings },
];

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(
  function BlockEditor({ initialBlocks, initialPageSettings }, ref) {
    const editor = useBlockEditor(initialBlocks, initialPageSettings);

    useImperativeHandle(
      ref,
      () => ({
        getData: () => ({
          blocks: editor.blocks,
          pageSettings: editor.pageSettings,
        }),
      }),
      [editor.blocks, editor.pageSettings]
    );

    const activeBlock = useMemo(
      () => editor.blocks.find((b) => b.id === editor.selectedBlockId) ?? null,
      [editor.blocks, editor.selectedBlockId]
    );

    const handleExportHTML = useCallback(() => {
      // imported lazily to keep the server bundle lean
      import("../../lib/html-generator").then(({ generateHTMLSnapshot }) => {
        const html = generateHTMLSnapshot(editor.blocks, editor.pageSettings);
        copyToClipboard(html);
      });
    }, [editor.blocks, editor.pageSettings]);

    const handleExportJSON = useCallback(() => {
      downloadFile(
        JSON.stringify(editor.blocks, null, 2),
        `webcraft-layout-${Date.now()}.json`,
        "application/json"
      );
    }, [editor.blocks]);

    const handleImportJSON = useCallback(
      (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(String(e.target?.result ?? "[]"));
            if (Array.isArray(parsed)) {
              editor.loadBlocks(parsed as BlockConfig[]);
            }
          } catch {
            // ignore malformed files; the editor stays untouched
          }
        };
        reader.readAsText(file, "UTF-8");
      },
      [editor.loadBlocks]
    );

    return (
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-gray-100">
        <EditorToolbar
          viewport={editor.viewport}
          onViewportChange={editor.setViewport}
          canUndo={editor.historyIndex > 0}
          canRedo={editor.historyIndex < editor.historyLength - 1}
          onUndo={editor.undo}
          onRedo={editor.redo}
          isPreviewMode={editor.isPreviewMode}
          onTogglePreview={() => editor.setPreviewMode(!editor.isPreviewMode)}
          onExportHTML={handleExportHTML}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />

        <div className="flex flex-1 overflow-hidden">
          {!editor.isPreviewMode && (
            <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-900/90 select-none">
              <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950 p-1 text-[11px]">
                {TABS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => editor.setActiveTab(value)}
                    className={`flex flex-col items-center justify-center space-y-1 rounded-lg py-2 font-medium transition ${
                      editor.activeTab === value
                        ? "border border-blue-500/30 bg-blue-600/20 text-blue-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {editor.activeTab === "blocks" && (
                <BlockPalette onAddBlock={editor.addBlock} />
              )}
              {editor.activeTab === "layers" && (
                <LayerTree
                  blocks={editor.blocks}
                  selectedBlockId={editor.selectedBlockId}
                  onSelect={editor.setSelectedBlockId}
                  onToggleVisibility={editor.toggleBlockVisibility}
                  onMove={editor.moveBlock}
                  onDelete={editor.deleteBlock}
                />
              )}
              {editor.activeTab === "templates" && (
                <PresetTemplatesPanel onLoad={editor.loadPreset} />
              )}
              {editor.activeTab === "settings" && (
                <PageSettingsPanel
                  pageSettings={editor.pageSettings}
                  onChange={editor.setPageSettings}
                />
              )}
            </aside>
          )}

          <EditorCanvas
            blocks={editor.blocks}
            pageSettings={editor.pageSettings}
            viewport={editor.viewport}
            selectedBlockId={editor.selectedBlockId}
            isPreviewMode={editor.isPreviewMode}
            onSelectBlock={editor.setSelectedBlockId}
            onMove={editor.moveBlock}
            onDuplicate={editor.duplicateBlock}
            onDelete={editor.deleteBlock}
          />

          {!editor.isPreviewMode && activeBlock && (
            <aside className="flex w-80 shrink-0 flex-col overflow-hidden border-l border-slate-800/80 bg-slate-900/90 select-none">
              <InspectorPanel
                block={activeBlock}
                onUpdateProps={(patch) =>
                  editor.updateBlockProps(activeBlock.id, patch)
                }
              />
            </aside>
          )}
        </div>
      </div>
    );
  }
);

function copyToClipboard(text: string): void {
  void navigator.clipboard.writeText(text);
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 5: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean (the palette/layer/preset/settings/inspector panels are implemented in Tasks 14–15).

```bash
git add features/templates/components/block-editor/viewport-switcher.tsx features/templates/components/block-editor/toolbar.tsx features/templates/components/block-editor/canvas.tsx features/templates/components/block-editor/index.tsx features/templates/components/block-editor/hooks/use-block-editor.ts
git commit -m "feat: add block editor shell, toolbar, and canvas"
```

---

### Task 14: Left sidebar panels (palette, layer tree, presets, page settings)

**Files:**

- Create: `features/templates/components/block-editor/block-palette.tsx`
- Create: `features/templates/components/block-editor/layer-tree.tsx`
- Create: `features/templates/components/block-editor/preset-templates-panel.tsx`
- Create: `features/templates/components/block-editor/page-settings-panel.tsx`

**Interfaces:**

- Produces: `BlockPalette({ onAddBlock })`, `LayerTree({ blocks, selectedBlockId, onSelect, onToggleVisibility, onMove, onDelete })`, `PresetTemplatesPanel({ onLoad })`, `PageSettingsPanel({ pageSettings, onChange })`.
- Consumes: Task 3 catalog, Task 12 types, `getBlockIcon`.

- [ ] **Step 1: Write `block-palette.tsx`**

```tsx
"use client";

import { BLOCK_CATALOG } from "../../lib/block-catalog";
import type { BlockCatalogItem } from "../../lib/block-catalog";
import { getBlockIcon } from "../../lib/block-icons";

interface BlockPaletteProps {
  onAddBlock: (item: BlockCatalogItem) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-4">
      {BLOCK_CATALOG.map((cat) => (
        <div key={cat.category} className="space-y-3">
          <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {cat.category}
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {cat.items.map((item) => {
              const Icon = getBlockIcon(item.icon);
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onAddBlock(item)}
                  className="group flex items-center space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left shadow-sm transition hover:border-blue-500/50 hover:bg-slate-800/80"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Click to insert a layer
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `layer-tree.tsx`**

```tsx
"use client";

import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Layers } from "lucide-react";
import type { BlockConfig } from "../../lib/block-types";

interface LayerTreeProps {
  blocks: BlockConfig[];
  selectedBlockId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
}

export function LayerTree({
  blocks,
  selectedBlockId,
  onSelect,
  onToggleVisibility,
  onMove,
  onDelete,
}: LayerTreeProps) {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Layer Tree ({blocks.length})</span>
        <span className="text-[10px] text-slate-500">Click to edit</span>
      </div>
      {blocks.map((b, idx) => (
        <div
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition ${
            b.id === selectedBlockId
              ? "border-blue-500 bg-blue-600/20 font-medium text-white"
              : "border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="w-4 text-[10px] text-slate-500">{idx + 1}.</span>
            <Layers className="h-3.5 w-3.5 shrink-0 text-blue-400" />
            <span className="truncate font-medium capitalize">
              {b.props.layerName || b.type}
            </span>
          </div>
          <div className="flex shrink-0 items-center space-x-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(b.id);
              }}
              title={b.hidden ? "Show" : "Hide"}
              className="p-1 text-slate-500 hover:text-white"
            >
              {b.hidden ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "up");
              }}
              title="Move up"
              className="p-1 text-slate-500 hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(b.id, "down");
              }}
              title="Move down"
              className="p-1 text-slate-500 hover:text-white"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(b.id);
              }}
              title="Delete"
              className="p-1 text-slate-500 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `preset-templates-panel.tsx`**

```tsx
"use client";

import { Sparkles } from "lucide-react";

interface PresetTemplatesPanelProps {
  onLoad: (name: string) => void;
}

const PRESETS: { name: string; title: string; description: string }[] = [
  {
    name: "saas",
    title: "SaaS Landing Page",
    description: "Navbar, Hero Banner, Custom Feature Grid, and Footer.",
  },
];

export function PresetTemplatesPanel({ onLoad }: PresetTemplatesPanelProps) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="mb-2 text-xs text-slate-400">
        Load a complete ready-to-use layout structure:
      </div>
      {PRESETS.map((preset) => (
        <button
          key={preset.name}
          type="button"
          onClick={() => onLoad(preset.name)}
          className="group w-full cursor-pointer rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 p-4 text-left transition hover:border-blue-500"
        >
          <h4 className="flex items-center justify-between text-sm font-bold text-white group-hover:text-blue-400">
            {preset.title}
            <Sparkles className="h-4 w-4 text-blue-400" />
          </h4>
          <p className="mt-1 text-xs text-slate-400">{preset.description}</p>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write `page-settings-panel.tsx`**

```tsx
"use client";

import type { PageSettings } from "../../lib/block-types";

interface PageSettingsPanelProps {
  pageSettings: PageSettings;
  onChange: (patch: Partial<PageSettings>) => void;
}

export function PageSettingsPanel({
  pageSettings,
  onChange,
}: PageSettingsPanelProps) {
  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-4 text-xs">
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">Page Title</label>
        <input
          type="text"
          value={pageSettings.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">
          Canvas Background Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={pageSettings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-transparent"
          />
          <input
            type="text"
            value={pageSettings.bgColor}
            onChange={(e) => onChange({ bgColor: e.target.value })}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="font-semibold text-slate-300">Main Page Font</label>
        <select
          value={pageSettings.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-500"
        >
          <option value="font-sans">Plus Jakarta Sans / Inter</option>
          <option value="font-serif">Playfair Display (Serif Classic)</option>
          <option value="font-mono">Fira Code (Developer Mono)</option>
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/components/block-editor/block-palette.tsx features/templates/components/block-editor/layer-tree.tsx features/templates/components/block-editor/preset-templates-panel.tsx features/templates/components/block-editor/page-settings-panel.tsx
git commit -m "feat: add block editor left sidebar panels"
```

---

---

### Task 15: Inspector panel (fields + per-block editors)

**Files:**

- Create: `features/templates/components/block-editor/fields.tsx`
- Create: `features/templates/components/block-editor/inspector-panel.tsx`

**Interfaces:**

- Produces: `FieldShell`, `TextField`, `TextAreaField`, `ColorField`, `SelectField`, `NumberField`; `InspectorPanel({ block, onUpdateProps })`.
- Consumes: Task 3 types/icon helper; lucide-react.

- [ ] **Step 1: Write `fields.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";

interface FieldShellProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function FieldShell({ label, children, hint }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: TextFieldProps) {
  return (
    <FieldShell label={label}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <FieldShell label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
      />
    </FieldShell>
  );
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <FieldShell label={label}>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
        />
      </div>
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <FieldShell label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: NumberFieldProps) {
  return (
    <FieldShell label={label}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
      />
    </FieldShell>
  );
}
```

- [ ] **Step 2: Write `inspector-panel.tsx`**

```tsx
"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BlockConfig, GridColumn, NavLink } from "../../lib/block-types";
import { getBlockIcon } from "../../lib/block-icons";
import {
  ColorField,
  FieldShell,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

type InspectorTab = "content" | "style" | "advanced";

interface InspectorPanelProps {
  block: BlockConfig;
  onUpdateProps: (patch: Record<string, unknown>) => void;
}

const ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const GRADIENT_OPTIONS = [
  { value: "", label: "None (Solid)" },
  {
    value: "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
    label: "Midnight Cyber",
  },
  {
    value: "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600",
    label: "Sunset Gold",
  },
  {
    value: "bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950",
    label: "Emerald Luxe",
  },
  {
    value: "bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-950",
    label: "Royal Violet",
  },
];

const ICON_OPTIONS = [
  { value: "sparkles", label: "Sparkles" },
  { value: "palette", label: "Palette" },
  { value: "code", label: "Code" },
  { value: "grid", label: "Grid" },
  { value: "layers", label: "Layers" },
  { value: "star", label: "Star" },
  { value: "mail", label: "Mail" },
  { value: "box", label: "Box" },
  { value: "layout", label: "Layout" },
];

const ICON_BY_TYPE: Record<BlockConfig["type"], string> = {
  navbar: "layout",
  hero: "layout",
  container: "box",
  grid_custom: "grid",
  heading: "type",
  paragraph: "type",
  image: "image",
  pricing: "star",
  form_contact: "mail",
  footer: "layout",
};

export function InspectorPanel({ block, onUpdateProps }: InspectorPanelProps) {
  const [tab, setTab] = useState<InspectorTab>("content");
  const Icon = getBlockIcon(ICON_BY_TYPE[block.type]);

  const set = (field: string, value: unknown) =>
    onUpdateProps({ [field]: value });

  const renderLinks = (links: NavLink[]) => {
    const updateLink = (index: number, field: "label" | "url", v: string) =>
      set(
        "links",
        links.map((l, i) => (i === index ? { ...l, [field]: v } : l))
      );
    const addLink = () =>
      set("links", [...links, { label: `Menu ${links.length + 1}`, url: "#" }]);
    const removeLink = (index: number) =>
      set(
        "links",
        links.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-3">
        {links.map((link, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Link {i + 1}
              </span>
              <IconButton onClick={() => removeLink(i)} />
            </div>
            <TextField
              label="Label"
              value={link.label}
              onChange={(v) => setLinkField(links, i, "label", v, set)}
            />
            <TextField
              label="URL"
              value={link.url}
              onChange={(v) => setLinkField(links, i, "url", v, set)}
            />
          </div>
        ))}
        <AddRow label="Add Link" onClick={addLink} />
      </div>
    );
  };

  const renderFeatures = (features: string[]) => {
    const updateFeature = (index: number, v: string) =>
      set(
        "features",
        features.map((f, i) => (i === index ? v : f))
      );
    const addFeature = () =>
      set("features", [...features, `Feature ${features.length + 1}`]);
    const removeFeature = (index: number) =>
      set(
        "features",
        features.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="text"
              value={feature}
              onChange={(e) => updateFeature(i, e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
            />
            <IconButton onClick={() => removeFeature(i)} />
          </div>
        ))}
        <AddButton label="Add Feature" onClick={addFeature} />
      </div>
    );
  };

  const renderColumns = (
    columns: {
      icon: string;
      title: string;
      desc: string;
      bgColor: string;
      textColor: string;
      accentColor: string;
      btnText: string;
      btnUrl: string;
    }[]
  ) => {
    const updateColumn = (
      index: number,
      field: string,
      v: unknown,
      current: typeof columns
    ) =>
      set(
        "columns",
        current.map((c, i) => (i === index ? { ...c, [field]: v } : c))
      );
    const addColumn = () =>
      set("columns", [
        ...columns,
        {
          icon: "sparkles",
          title: `New Feature ${columns.length + 1}`,
          desc: "Short description of the new feature.",
          bgColor: "#1e293b",
          textColor: "#f8fafc",
          accentColor: "#3b82f6",
          btnText: "Learn More",
          btnUrl: "#",
        },
      ]);
    const removeColumn = (index: number) =>
      set(
        "columns",
        columns.filter((_, i) => i !== index)
      );

    return (
      <div className="space-y-3">
        {columns.map((col, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-wider text-slate-500 uppercase">
                Column {i + 1}
              </span>
              <IconButton onClick={() => removeColumn(i)} />
            </div>
            <SelectField
              label="Icon"
              value={col.icon}
              onChange={(v) => updateColumn(i, "icon", v, columns)}
              options={ICON_OPTIONS}
            />
            <TextField
              label="Title"
              value={col.title}
              onChange={(v) => updateColumn(i, "title", v, columns)}
            />
            <TextAreaField
              label="Description"
              value={col.desc}
              rows={2}
              onChange={(v) => updateColumn(i, "desc", v, columns)}
            />
            <ColorField
              label="Background"
              value={col.bgColor}
              onChange={(v) => updateColumn(i, "bgColor", v, columns)}
            />
            <ColorField
              label="Text"
              value={col.textColor}
              onChange={(v) => updateColumn(i, "textColor", v, columns)}
            />
            <ColorField
              label="Accent"
              value={col.accentColor}
              onChange={(v) => updateColumn(i, "accentColor", v, columns)}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Button Text"
                value={col.btnText}
                onChange={(v) => updateColumn(i, "btnText", v, columns)}
              />
              <TextField
                label="Button URL"
                value={col.btnUrl}
                onChange={(v) => updateColumn(i, "btnUrl", v, columns)}
              />
            </div>
          </div>
        ))}
        <AddButton label="Add Column" onClick={addColumn} />
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case "navbar":
        return (
          <>
            <TextField
              label="Logo Text"
              value={block.props.logoText}
              onChange={(v) => set("logoText", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="CTA Text"
                value={block.props.ctaText}
                onChange={(v) => set("ctaText", v)}
              />
              <TextField
                label="CTA URL"
                value={block.props.ctaUrl}
                onChange={(v) => set("ctaUrl", v)}
              />
            </div>
          </>
        );
      case "hero":
        return (
          <>
            <TextField
              label="Badge Text"
              value={block.props.badge}
              onChange={(v) => set("badge", v)}
            />
            <TextField
              label="Title"
              value={block.props.title}
              onChange={(v) => set("title", v)}
            />
            <TextAreaField
              label="Subtitle"
              value={block.props.subtitle}
              onChange={(v) => set("subtitle", v)}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Primary Button"
                value={block.props.buttonText}
                onChange={(v) => set("buttonText", v)}
              />
              <TextField
                label="Primary URL"
                value={block.props.buttonUrl}
                onChange={(v) => set("buttonUrl", v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Secondary Button"
                value={block.props.secondaryButtonText}
                onChange={(v) => set("secondaryButtonText", v)}
              />
              <TextField
                label="Secondary URL"
                value={block.props.secondaryButtonUrl}
                onChange={(v) => set("secondaryButtonUrl", v)}
              />
            </div>
          </>
        );
      case "container":
        return (
          <TextAreaField
            label="Container Content"
            value={block.props.content}
            onChange={(v) => set("content", v)}
            rows={4}
          />
        );
      case "grid_custom":
        return (
          <>
            <TextField
              label="Section Title"
              value={block.props.title}
              onChange={(v) => set("title", v)}
            />
            <TextField
              label="Section Subtitle"
              value={block.props.subtitle}
              onChange={(v) => set("subtitle", v)}
            />
          </>
        );
      case "heading":
        return (
          <>
            <SelectField
              label="Heading Level"
              value={block.props.level}
              onChange={(v) => set("level", v as "h1" | "h2" | "h3" | "h4")}
              options={[
                { value: "h1", label: "H1 - Main Heading" },
                { value: "h2", label: "H2 - Large Sub Heading" },
                { value: "h3", label: "H3 - Section Heading" },
                { value: "h4", label: "H4 - Sub Section" },
              ]}
            />
            <TextAreaField
              label="Heading Text"
              value={block.props.text}
              onChange={(v) => set("text", v)}
              rows={3}
            />
          </>
        );
      case "paragraph":
        return (
          <TextAreaField
            label="Paragraph Text"
            value={block.props.text}
            onChange={(v) => set("text", v)}
            rows={4}
          />
        );
      case "image":
        return (
          <>
            <TextField
              label="Image URL"
              value={block.props.url}
              onChange={(v) => set("url", v)}
            />
            <TextField
              label="Alt Text"
              value={block.props.alt}
              onChange={(v) => set("alt", v)}
            />
            <TextField
              label="Caption"
              value={block.props.caption}
              onChange={(v) => set("caption", v)}
            />
          </>
        );
      case "pricing":
        return (
          <>
            <TextField
              label="Plan Name"
              value={block.props.planName}
              onChange={(v) => set("planName", v)}
            />
            <TextField
              label="Badge"
              value={block.props.badge}
              onChange={(v) => set("badge", v)}
            />
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Price"
                value={block.props.price}
                onChange={(v) => set("price", v)}
              />
              <TextField
                label="Period"
                value={block.props.period}
                onChange={(v) => set("period", v)}
              />
            </div>
          </>
        );
      case "form_contact":
        return (
          <>
            <TextField
              label="Title"
              value={block.props.title}
              onChange={(v) => set("title", v)}
            />
            <TextField
              label="Subtitle"
              value={block.props.subtitle}
              onChange={(v) => set("subtitle", v)}
            />
            <TextField
              label="Placeholder"
              value={block.props.placeholder}
              onChange={(v) => set("placeholder", v)}
            />
            <TextField
              label="Button Text"
              value={block.props.buttonText}
              onChange={(v) => set("buttonText", v)}
            />
          </>
        );
      case "footer":
        return (
          <>
            <TextField
              label="Brand Name"
              value={block.props.brandName}
              onChange={(v) => set("brandName", v)}
            />
            <TextField
              label="Copyright"
              value={block.props.copyright}
              onChange={(v) => set("copyright", v)}
            />
          </>
        );
    }
  };

  const renderStyle = () => {
    switch (block.type) {
      case "navbar":
      case "hero":
        return (
          <>
            <ColorField
              label="Background"
              value={block.props.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
            <ColorField
              label="Accent"
              value={block.props.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
            {"bgGradient" in block.props && (
              <SelectField
                label="Background Gradient"
                value={block.props.bgGradient}
                onChange={(v) => set("bgGradient", v)}
                options={GRADIENT_OPTIONS}
              />
            )}
            {"align" in block.props && (
              <SelectField
                label="Alignment"
                value={block.props.align}
                onChange={(v) => set("align", v as "left" | "center" | "right")}
                options={ALIGN_OPTIONS}
              />
            )}
          </>
        );
      case "container":
        return (
          <>
            <ColorField
              label="Background"
              value={block.props.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
            <ColorField
              label="Border"
              value={block.props.borderColor}
              onChange={(v) => set("borderColor", v)}
            />
            <SelectField
              label="Border Radius"
              value={block.props.borderRadius}
              onChange={(v) => set("borderRadius", v)}
              options={[
                { value: "rounded-none", label: "None" },
                { value: "rounded-lg", label: "Small" },
                { value: "rounded-2xl", label: "Large" },
                { value: "rounded-3xl", label: "Extra Large" },
              ]}
            />
            <SelectField
              label="Background Gradient"
              value={block.props.bgGradient}
              onChange={(v) => set("bgGradient", v)}
              options={GRADIENT_OPTIONS}
            />
          </>
        );
      case "grid_custom":
        return (
          <p className="text-xs text-slate-500">
            Colors are configured per column in the Grid / List tab.
          </p>
        );
      case "heading":
        return (
          <>
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
            <SelectField
              label="Font Size"
              value={block.props.fontSize}
              onChange={(v) => set("fontSize", v)}
              options={[
                { value: "text-3xl md:text-4xl", label: "Large" },
                { value: "text-2xl md:text-3xl", label: "Medium" },
                { value: "text-xl", label: "Small" },
              ]}
            />
            <SelectField
              label="Font Weight"
              value={block.props.weight}
              onChange={(v) => set("weight", v)}
              options={[
                { value: "font-extrabold", label: "Extra Bold" },
                { value: "font-bold", label: "Bold" },
                { value: "font-semibold", label: "Semibold" },
              ]}
            />
            <SelectField
              label="Alignment"
              value={block.props.align}
              onChange={(v) => set("align", v as "left" | "center" | "right")}
              options={ALIGN_OPTIONS}
            />
          </>
        );
      case "paragraph":
        return (
          <>
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
            <SelectField
              label="Alignment"
              value={block.props.align}
              onChange={(v) => set("align", v as "left" | "center" | "right")}
              options={ALIGN_OPTIONS}
            />
            <SelectField
              label="Font Size"
              value={block.props.fontSize}
              onChange={(v) => set("fontSize", v)}
              options={[
                { value: "text-lg md:text-xl", label: "Large" },
                { value: "text-base md:text-lg", label: "Medium" },
                { value: "text-sm", label: "Small" },
              ]}
            />
          </>
        );
      case "image":
        return (
          <>
            <SelectField
              label="Border Radius"
              value={block.props.rounded}
              onChange={(v) => set("rounded", v)}
              options={[
                { value: "rounded-none", label: "None" },
                { value: "rounded-lg", label: "Small" },
                { value: "rounded-2xl", label: "Large" },
              ]}
            />
            <SelectField
              label="Shadow"
              value={block.props.shadow}
              onChange={(v) => set("shadow", v)}
              options={[
                { value: "shadow-none", label: "None" },
                { value: "shadow-lg", label: "Soft" },
                { value: "shadow-2xl shadow-blue-500/10", label: "Colored" },
              ]}
            />
          </>
        );
      case "pricing":
        return (
          <>
            <ColorField
              label="Background"
              value={block.props.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorField
              label="Accent"
              value={block.props.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
          </>
        );
      case "form_contact":
        return (
          <>
            <ColorField
              label="Background"
              value={block.props.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorField
              label="Accent"
              value={block.props.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
          </>
        );
      case "footer":
        return (
          <>
            <ColorField
              label="Background"
              value={block.props.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorField
              label="Text"
              value={block.props.textColor}
              onChange={(v) => set("textColor", v)}
            />
          </>
        );
    }
  };

  const renderAdvanced = () => {
    switch (block.type) {
      case "navbar":
        return (
          <div className="space-y-3">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              Navigation Links
            </p>
            {renderLinks(block.props.links)}
          </div>
        );
      case "grid_custom":
        return (
          <div className="space-y-3">
            <NumberField
              label="Columns Count"
              value={block.props.columnsCount}
              min={1}
              max={4}
              onChange={(v) => set("columnsCount", Math.max(1, Math.min(4, v)))}
            />
            <TextField
              label="Column Gap"
              value={block.props.gap}
              onChange={(v) => set("gap", v)}
            />
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              Columns
            </p>
            {renderColumns(block.props.columns)}
          </div>
        );
      case "pricing":
        return (
          <div className="space-y-3">
            <p className="text-[10px] tracking-wider text-slate-500 uppercase">
              Features
            </p>
            {renderFeatures(block.props.features)}
          </div>
        );
      default:
        return (
          <p className="text-xs text-slate-500">
            No advanced fields for this block type.
          </p>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-blue-400" />
          <h2 className="text-xs font-bold tracking-wider text-white uppercase">
            Inspector
          </h2>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 border-b border-slate-800 bg-slate-950/60 p-1 text-[11px]">
        {(["content", "style", "advanced"] as InspectorTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg py-1.5 font-medium transition ${
              tab === t
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "content"
              ? "Content"
              : t === "style"
                ? "Style"
                : "Grid / List"}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {tab === "content" ? (
          <>
            <FieldShell label="Layer Name">
              <input
                type="text"
                value={block.props.layerName || ""}
                onChange={(e) => set("layerName", e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </FieldShell>
            {renderContent()}
          </>
        ) : tab === "style" ? (
          <div className="space-y-3">{renderStyle()}</div>
        ) : (
          renderAdvanced()
        )}
      </div>
    </div>
  );
}

function setLinkField(
  links: NavLink[],
  index: number,
  field: "label" | "url",
  value: string,
  set: (field: string, value: unknown) => void
): void {
  set(
    "links",
    links.map((l, i) => (i === index ? { ...l, [field]: value } : l))
  );
}

function IconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Remove"
      className="p-1.5 text-slate-500 transition hover:text-red-400"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
```

Type-check notes:

- `renderStyle` uses `"bgGradient" in block.props` / `"align" in block.props` guards to narrow the union across the `navbar`/`hero` case group — valid TypeScript narrowing.
- Each `switch` over `block.type` narrows `block.props` to the matching member.
- The `set` helper returns `onUpdateProps` result (`void`), so assigning it as `onChange` handlers (which expect `(v) => void`) is safe.

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/components/block-editor/fields.tsx features/templates/components/block-editor/inspector-panel.tsx
git commit -m "feat: add block inspector panel"
```

---

---

### Task 16: Template form (basic info + block editor integration)

**Files:**

- Create: `features/templates/components/template-form.tsx`
- Modify: `features/templates/components/index.ts`

**Interfaces:**

- Produces: `TemplateForm({ mode, categories, initialData? })` — client form composing a basic-info card with the `BlockEditor`, submitting via server actions.
- Consumes: `BlockEditor`/`BlockEditorHandle` (Task 13), `PRESET_TEMPLATES`/`DEFAULT_PAGE_SETTINGS` (Task 3), `createTemplateAction`/`updateTemplateAction` (Task 8), `CategoryWithChildren` (business-categories types), shadcn UI primitives.

- [ ] **Step 1: Write `template-form.tsx`**

```tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryWithChildren } from "@/features/business-categories/types";
import { DEFAULT_PAGE_SETTINGS } from "../lib/block-types";
import { PRESET_TEMPLATES } from "../lib/block-catalog";
import type { Template } from "../types";
import { createTemplateAction, updateTemplateAction } from "../actions";
import { BlockEditor } from "./block-editor";
import type { BlockEditorHandle } from "./block-editor";

interface TemplateFormProps {
  mode: "create" | "edit";
  categories: CategoryWithChildren[];
  initialData?: Template;
}

interface BasicValues {
  name: string;
  description: string;
  previewImageUrl: string;
  categoryId: string;
  isFeatured: boolean;
  sortOrder: string;
}

export function TemplateForm({
  mode,
  categories,
  initialData,
}: TemplateFormProps) {
  const router = useRouter();
  const editorRef = useRef<BlockEditorHandle>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm<BasicValues>({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      previewImageUrl: initialData?.previewImageUrl ?? "",
      categoryId: initialData?.categoryId ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: String(initialData?.sortOrder ?? 0),
    },
  });

  const persist = useCallback(
    async (values: BasicValues, status: "draft" | "published") => {
      const editorData = editorRef.current?.getData();
      if (!editorData) return;

      const payload = {
        name: values.name,
        description: values.description.trim() || null,
        previewImageUrl: values.previewImageUrl.trim() || null,
        categoryId: values.categoryId ? values.categoryId : null,
        blocks: editorData.blocks,
        pageSettings: editorData.pageSettings,
        isFeatured: values.isFeatured,
        sortOrder: Number(values.sortOrder) || 0,
        status,
      };

      setSubmitting(true);
      try {
        const result =
          mode === "create"
            ? await createTemplateAction(payload)
            : initialData
              ? await updateTemplateAction({ ...payload, id: initialData.id })
              : await createTemplateAction(payload);

        if (!result.success) {
          toast.add({
            type: "error",
            title: "Error",
            description: result.error,
          });
          return;
        }

        toast.add({
          type: "success",
          title: "Success",
          description:
            status === "published" ? "Template published" : "Template saved",
        });

        const target =
          mode === "create" && result.data?.id
            ? `/staff/templates/${result.data.id}/edit`
            : "/staff/templates";
        router.push(target);
        router.refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [mode, initialData, router]
  );

  const onSaveDraft = handleSubmit((values) => persist(values, "draft"));
  const onSavePublished = handleSubmit((values) =>
    persist(values, "published")
  );

  const categoryOptions = categories.flatMap((cat) => [
    { value: cat.id, label: cat.name, indent: false },
    ...cat.children.map((child) => ({
      value: child.id,
      label: child.name,
      indent: true,
    })),
  ]);

  return (
    <form onSubmit={onSaveDraft} className="space-y-6">
      <div className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            placeholder="Template name"
            {...register("name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previewImageUrl">Preview Image URL</Label>
          <Input
            id="previewImageUrl"
            placeholder="https://..."
            {...register("previewImageUrl")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="Short description of this template"
            {...register("description")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Business Category</Label>
          <select
            id="categoryId"
            className="border-input focus-visible:ring-ring block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
            {...register("categoryId")}
          >
            <option value="">No category</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.indent ? "\u00A0\u00A0\u21B3 " : ""}
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register("sortOrder")}
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Checkbox
            id="isFeatured"
            onCheckedChange={(checked) =>
              setValue("isFeatured", checked === true)
            }
          />
          <Label htmlFor="isFeatured">Feature this template</Label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-semibold">Block Editor</h3>
        <BlockEditor
          ref={editorRef}
          initialBlocks={initialData?.blocks ?? PRESET_TEMPLATES.saas}
          initialPageSettings={
            initialData?.pageSettings ?? DEFAULT_PAGE_SETTINGS
          }
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => onSavePublished()}
        >
          Save &amp; Publish
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/staff/templates")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

Notes:

- `register("categoryId")` returns the selected value as a string; `""` is converted to `null` in the payload, which the zod schema accepts (`categoryId: z.string().uuid().optional().nullable()`).
- `sortOrder` is stored as a string in the form and converted with `Number()` before submit.
- `persist` guards on `editorRef.current?.getData()` — the editor must have mounted; it is always rendered below the form.

- [ ] **Step 2: Update the components barrel**

Rewrite `features/templates/components/index.ts` to:

```typescript
export { TemplateDataTable } from "./template-data-table";
export { TemplateForm } from "./template-form";
export { BlockEditor } from "./block-editor";
export type { BlockEditorHandle } from "./block-editor";
```

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add features/templates/components/template-form.tsx features/templates/components/index.ts
git commit -m "feat: add template form with block editor"
```

---

### Task 17: Create and Edit pages

**Files:**

- Create: `app/(staff)/staff/templates/create/page.tsx`
- Create: `app/(staff)/staff/templates/[id]/edit/page.tsx`

**Interfaces:**

- Consumes: `TemplateForm`, `getActiveCategoriesTree`, `getTemplateById`, `assertCanModifyTemplate`, `getSession`, `authorize`, `PERMISSIONS`.
- Produces: `/staff/templates/create` and `/staff/templates/[id]/edit` routes.

- [ ] **Step 1: Write the create page**

`app/(staff)/staff/templates/create/page.tsx`:

```tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";
import { TemplateForm } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Create Template",
};

export default async function CreateTemplatePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.TEMPLATES_CREATE);

  const categories = await getActiveCategoriesTree();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Template"
        description="Build a new website template with the block editor"
        actions={
          <Link href="/staff/templates">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <TemplateForm mode="create" categories={categories} />
    </div>
  );
}
```

- [ ] **Step 2: Write the edit page**

`app/(staff)/staff/templates/[id]/edit/page.tsx`:

```tsx
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";
import { getTemplateById } from "@/features/templates/queries";
import { assertCanModifyTemplate } from "@/features/templates/service";
import { TemplateForm } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Edit Template",
};

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  try {
    await assertCanModifyTemplate(template.id, session.user.id, "update");
  } catch {
    redirect("/staff/access-denied");
  }

  const categories = await getActiveCategoriesTree();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Template: ${template.name}`}
        description={`Last saved ${template.updatedAt.toLocaleDateString()}`}
        actions={
          <Link href="/staff/templates">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />
      <TemplateForm
        mode="edit"
        categories={categories}
        initialData={template}
      />
    </div>
  );
}
```

Notes:

- The ownership/permission gate lives in the page (via `assertCanModifyTemplate`) so managers (who hold `update.any`) and owners (who hold `update.own`) both pass, and anyone else is sent to `/staff/access-denied`. The mutation actions re-check on every save.
- The page intentionally does not use a blanket `authorize(PERMISSIONS.TEMPLATES_UPDATE_OWN)` because a Template Manager holds `update.any` but not `update.own` — `assertCanModifyTemplate` handles both paths.

- [ ] **Step 3: Verify + commit**

Run: `pnpm types:check && pnpm lint`
Expected: clean.

```bash
git add "app/(staff)/staff/templates/create/page.tsx" "app/(staff)/staff/templates/[id]/edit/page.tsx"
git commit -m "feat: add template create and edit pages"
```

---

### Task 18: Full verification and smoke test

**Files:**

- None new (verification pass over all Tasks 1-17).

- [ ] **Step 1: Full static checks**

Run: `pnpm types:check`
Expected: no TypeScript errors.

Run: `pnpm lint`
Expected: no lint errors.

Run: `pnpm format:check`
Expected: formatting clean (or run `pnpm format` first, then re-check).

- [ ] **Step 2: Full production build**

Run: `pnpm build`
Expected: build succeeds; `/staff/templates*` routes compile as dynamic routes (they call `getSession()` which opts them out of static prerendering).

- [ ] **Step 3: Runtime smoke test**

Start the dev server: `pnpm dev`
Login as a Super Admin (or a staff user with `TEMPLATE_*` roles) and verify:

1. **Sidebar:** "Website Templates" appears under Management (config/navigation.ts, requires `templates.view`).
2. **Index** `GET /staff/templates`:
   - Renders the shared DataTable with the action "Create Template".
   - Seed/edit a template and confirm the row shows name, category breadcrumb, status badge, usage, created-by, updated, and the actions dropdown (Edit / Featured / Duplicate / Delete).
   - Search, status filter, export (CSV/Excel), bulk publish/feature/delete all work.
3. **Create** `GET /staff/templates/create`:
   - Basic form fields render; category select shows the parent/sibling hierarchy (children indented with `\u00A0\u00A0\u00A0`).
   - Block editor loads the SaaS preset: canvas shows navbar/hero/grid/footer; left palette inserts new blocks; layer tree reorders/hides/deletes; viewport switch changes canvas width; undo/redo works; inspector edits update the canvas live.
   - "Save as Draft" persists and redirects to the edit page; verify DB row has `status='draft'`, non-empty `blocks_json`, and a valid `html_snapshot`.
4. **Edit** `GET /staff/templates/[id]/edit`:
   - Preloads saved blocks; "Save & Publish" sets `status='published'`.
   - A user without `update.any`/`update.own`+ownership is redirected to `/staff/access-denied` (test by assigning a Support-only role to a second staff account).
5. **Audit logs** `GET /staff/audit-logs` shows `TEMPLATE_CREATED`, `TEMPLATE_UPDATED`, `TEMPLATE_PUBLISHED`, `TEMPLATE_DELETED` rows.

- [ ] **Step 4: Final commit (if any verification fixes were made)**

```bash
git add -A
git commit -m "chore: template feature verification fixes"
```

---

## Self-Review Notes (plan vs spec)

- All approved design pieces are covered: templates table (+ `page_settings` additive column), block JSON + HTML snapshot, granular permissions + roles + navigation, index DataTable, create/edit with the converted block editor, category assignment (parent or subcategory), draft/published workflow, featured flag, duplicate, usage fields, bulk actions, export, and audit logging.
- Phase 3 items (preview modal, full usage analytics UI) are intentionally scoped out of this plan; the usage columns and increment hook are in place so a later task can wire client site creation.
