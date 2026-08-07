# SEO Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable Google Analytics and Search Console settings stored in the database, managed via a SUPER_ADMIN Settings page with tabbed navigation.

**Architecture:** Singleton `settings` table with JSONB columns per category. Service layer with React cache for reads, server actions with SUPER_ADMIN-only authorization and audit logging. Server-side GA script injection in root layout using `next/script`.

**Tech Stack:** Drizzle ORM, PostgreSQL (JSONB), Zod, Next.js App Router, shadcn/ui (Tabs, Card, Switch, Input, Textarea, Label, Button)

## Global Constraints

- Forms use plain React with `useTransition` + FormData (NOT react-hook-form)
- Server actions return `{ success: true } | { success: false; error: string }`
- Authorization uses `getSession()` + role check pattern
- All mutations are audit-logged via `createAuditLog()`
- All imports use `@/` path alias
- Zod schemas live in `features/settings/validation.ts`
- Each table is a separate file under `lib/db/schema/`
- GA script only injected in `process.env.NODE_ENV === "production"`

---

### Task 1: Database Schema & Migration

**Files:**
- Create: `lib/db/schema/settings.ts`
- Modify: `lib/db/schema/index.ts`
- Modify: `types/rbac.ts` (add "settings" to permission types if needed)

**Interfaces:**
- Produces: `settings` Drizzle table object used by Tasks 2, 3, 4

- [ ] **Step 1: Create the settings schema file**

```typescript
// lib/db/schema/settings.ts
import { jsonb, pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  seoSettings: jsonb("seo_settings"),
  generalSettings: jsonb("general_settings"),
  emailSettings: jsonb("email_settings"),
  integrationsSettings: jsonb("integrations_settings"),
  securitySettings: jsonb("security_settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 2: Export from schema index**

Add to `lib/db/schema/index.ts`:

```typescript
export * from "./settings";
```

- [ ] **Step 3: Generate migration**

```bash
npx drizzle-kit generate
```

- [ ] **Step 4: Review generated migration SQL**

Verify the migration creates the `settings` table with all JSONB columns, serial PK, and timestamps.

- [ ] **Step 5: Run migration**

```bash
npx drizzle-kit migrate
```

- [ ] **Step 6: Seed the singleton row**

Add to `lib/db/seed.ts` after existing seed operations:

```typescript
import { settings } from "./schema";

// Seed settings singleton
await db
  .insert(settings)
  .values({
    id: 1,
    seoSettings: {},
    generalSettings: {},
    emailSettings: {},
    integrationsSettings: {},
    securitySettings: {},
  })
  .onConflictDoNothing();
```

Run: `npx tsx lib/db/seed.ts`

- [ ] **Step 7: Verify**

```bash
# Check the row exists
psql $DATABASE_URL -c "SELECT id, seo_settings FROM settings WHERE id = 1;"
```

Expected: One row with empty JSONB `{}` for seo_settings.

- [ ] **Step 8: Commit**

```bash
git add lib/db/schema/settings.ts lib/db/schema/index.ts lib/db/migrations/ lib/db/seed.ts
git commit -m "feat: add settings table with JSONB columns and seed data"
```

---

### Task 2: Validation Schemas

**Files:**
- Create: `features/settings/validation.ts`
- Create: `features/settings/types.ts`

**Interfaces:**
- Produces: `seoSettingsSchema`, `SeoSettings` type used by Tasks 3, 4, 5

- [ ] **Step 1: Create validation schemas**

```typescript
// features/settings/validation.ts
import { z } from "zod";

export const googleAnalyticsSchema = z.object({
  enabled: z.boolean().default(false),
  measurementId: z
    .string()
    .regex(/^G-[A-Z0-9]{10}$/, "Invalid GA Measurement ID format (e.g. G-XXXXXXXXXX)")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
});

export const searchConsoleSchema = z.object({
  siteUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
  verificationToken: z
    .string()
    .min(1, "Verification token cannot be empty")
    .or(z.literal(""))
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null),
});

export const seoSettingsSchema = z.object({
  googleAnalytics: googleAnalyticsSchema,
  searchConsole: searchConsoleSchema,
});

export type GoogleAnalyticsSettings = z.infer<typeof googleAnalyticsSchema>;
export type SearchConsoleSettings = z.infer<typeof searchConsoleSchema>;
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
```

- [ ] **Step 2: Create types file**

```typescript
// features/settings/types.ts
import type { SeoSettings } from "./validation";

export interface SettingsRecord {
  id: number;
  seoSettings: SeoSettings | null;
  generalSettings: Record<string, unknown> | null;
  emailSettings: Record<string, unknown> | null;
  integrationsSettings: Record<string, unknown> | null;
  securitySettings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsActionResult =
  | { success: true }
  | { success: false; error: string };
```

- [ ] **Step 3: Commit**

```bash
git add features/settings/validation.ts features/settings/types.ts
git commit -m "feat: add settings validation schemas and types"
```

---

### Task 3: Service Layer (Queries + Business Logic)

**Files:**
- Create: `features/settings/queries.ts`
- Create: `features/settings/service.ts`

**Interfaces:**
- Consumes: `settings` table from Task 1, `SeoSettings` from Task 2
- Produces: `getSeoSettings()`, `updateSeoSettings()` used by Tasks 4, 6

- [ ] **Step 1: Create queries file**

```typescript
// features/settings/queries.ts
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSettingsRow() {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);

  return result[0] ?? null;
}

export async function updateSeoSettingsRow(
  seoSettings: Record<string, unknown>
) {
  await db
    .update(settings)
    .set({
      seoSettings,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));
}
```

- [ ] **Step 2: Create service file with cached reads**

```typescript
// features/settings/service.ts
import { cache } from "react";
import { revalidateTag } from "next/cache";
import { getSettingsRow, updateSeoSettingsRow } from "./queries";
import { seoSettingsSchema, type SeoSettings } from "./validation";

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  googleAnalytics: { enabled: false, measurementId: null },
  searchConsole: { siteUrl: null, verificationToken: null },
};

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  const row = await getSettingsRow();
  if (!row?.seoSettings) return DEFAULT_SEO_SETTINGS;

  try {
    return seoSettingsSchema.parse(row.seoSettings);
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
});

export async function updateSeoSettings(data: SeoSettings): Promise<void> {
  const validated = seoSettingsSchema.parse(data);
  await updateSeoSettingsRow(validated as unknown as Record<string, unknown>);
  revalidateTag("settings");
}
```

- [ ] **Step 3: Commit**

```bash
git add features/settings/queries.ts features/settings/service.ts
git commit -m "feat: add settings query and service layers with cached reads"
```

---

### Task 4: Server Actions

**Files:**
- Create: `features/settings/actions.ts`

**Interfaces:**
- Consumes: `getSeoSettings()`, `updateSeoSettings()` from Task 3, `getSession()` from auth, `createAuditLog()` from audit
- Produces: `updateSeoSettingsAction()` used by Task 5

- [ ] **Step 1: Create server actions file**

```typescript
// features/settings/actions.ts
"use server";

import { getSession } from "@/lib/auth/session";
import { createAuditLog } from "@/features/audit/service";
import { getStaffByUserId } from "@/features/staffs/queries";
import { seoSettingsSchema } from "./validation";
import { getSeoSettings, updateSeoSettings } from "./service";
import type { SettingsActionResult } from "./types";

export async function updateSeoSettingsAction(
  data: unknown
): Promise<SettingsActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    const staff = await getStaffByUserId(session.user.id);
    if (!staff) {
      return { success: false, error: "Staff record not found" };
    }

    const isSuperAdmin = staff.roles.some(
      (role: { code: string }) => role.code === "SUPER_ADMIN"
    );
    if (!isSuperAdmin) {
      return { success: false, error: "Forbidden: SUPER_ADMIN access required" };
    }

    const validated = seoSettingsSchema.parse(data);
    const oldSettings = await getSeoSettings();

    await updateSeoSettings(validated);

    await createAuditLog({
      userId: session.user.id,
      action: "SETTINGS_UPDATE",
      entity: "settings",
      entityId: "1",
      metadata: {
        category: "seo",
        oldValues: oldSettings,
        newValues: validated,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

- [ ] **Step 2: Verify `getStaffByUserId` exists**

```bash
grep -r "getStaffByUserId" features/staffs/
```

If it doesn't exist, check the staffs queries file for the equivalent function name and update the import in Step 1.

- [ ] **Step 3: Commit**

```bash
git add features/settings/actions.ts
git commit -m "feat: add settings server actions with SUPER_ADMIN auth and audit logging"
```

---

### Task 5: Settings Page UI

**Files:**
- Create: `app/(staff)/staff/settings/page.tsx`
- Create: `app/(staff)/staff/settings/layout.tsx`
- Create: `components/settings/settings-tabs.tsx`
- Create: `components/settings/seo-settings-form.tsx`
- Create: `components/settings/setting-card.tsx`
- Create: `components/settings/toggle-switch.tsx`

**Interfaces:**
- Consumes: `updateSeoSettingsAction()` from Task 4, `getSeoSettings()` from Task 3
- Consumes: shadcn components (Tabs, Card, Input, Label, Button, Textarea)

- [ ] **Step 1: Create the ToggleSwitch component**

The project may not have a `Switch` shadcn component. Create a simple toggle:

```typescript
// components/settings/toggle-switch.tsx
"use client";

interface ToggleSwitchProps {
  id: string;
  name: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleSwitch({
  id,
  name,
  defaultChecked = false,
  disabled = false,
  onChange,
}: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex cursor-pointer items-center"
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rtl:peer-checked:after:-translate-x-full" />
    </label>
  );
}
```

- [ ] **Step 2: Create the SettingCard wrapper**

```typescript
// components/settings/setting-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SettingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingCard({ title, description, children }: SettingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create the SEO settings form (client component)**

```typescript
// components/settings/seo-settings-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "./toggle-switch";
import { SettingCard } from "./setting-card";
import { updateSeoSettingsAction } from "@/features/settings/actions";
import type { SeoSettings } from "@/features/settings/validation";

interface SeoSettingsFormProps {
  initialData: SeoSettings;
}

export function SeoSettingsForm({ initialData }: SeoSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gaEnabled, setGaEnabled] = useState(
    initialData.googleAnalytics.enabled
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: SeoSettings = {
      googleAnalytics: {
        enabled: formData.get("ga_enabled") === "on",
        measurementId: (formData.get("measurement_id") as string) || null,
      },
      searchConsole: {
        siteUrl: (formData.get("site_url") as string) || null,
        verificationToken:
          (formData.get("verification_token") as string) || null,
      },
    };

    startTransition(async () => {
      const result = await updateSeoSettingsAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-700">
          SEO settings updated successfully.
        </div>
      )}

      <SettingCard
        title="Google Analytics"
        description="Track visitor behavior with Google Analytics 4"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ga_enabled">Enable Google Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Inject GA tracking script on all pages
            </p>
          </div>
          <ToggleSwitch
            id="ga_enabled"
            name="ga_enabled"
            defaultChecked={initialData.googleAnalytics.enabled}
            onChange={(checked) => setGaEnabled(checked)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="measurement_id">Measurement ID</Label>
          <Input
            id="measurement_id"
            name="measurement_id"
            placeholder="G-XXXXXXXXXX"
            defaultValue={initialData.googleAnalytics.measurementId ?? ""}
            disabled={!gaEnabled}
          />
          <p className="text-sm text-muted-foreground">
            Format: G-XXXXXXXXXX (10 alphanumeric characters)
          </p>
        </div>
      </SettingCard>

      <SettingCard
        title="Google Search Console"
        description="Verify site ownership for Google Search Console"
      >
        <div className="space-y-2">
          <Label htmlFor="site_url">Site URL</Label>
          <Input
            id="site_url"
            name="site_url"
            type="url"
            placeholder="https://example.com"
            defaultValue={initialData.searchConsole.siteUrl ?? ""}
          />
          <p className="text-sm text-muted-foreground">
            The URL of your property in Search Console
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verification_token">Verification Token</Label>
          <Textarea
            id="verification_token"
            name="verification_token"
            placeholder="Paste the content value from the meta tag"
            defaultValue={initialData.searchConsole.verificationToken ?? ""}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">
            Copy the content attribute value from the verification meta tag
          </p>
        </div>
      </SettingCard>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save SEO Settings"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Create the Settings tabs component (client component)**

```typescript
// components/settings/settings-tabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoSettingsForm } from "./seo-settings-form";
import type { SeoSettings } from "@/features/settings/validation";

interface SettingsTabsProps {
  seoSettings: SeoSettings;
}

export function SettingsTabs({ seoSettings }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="seo" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="integrations">Integrations</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          General settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="seo">
        <SeoSettingsForm initialData={seoSettings} />
      </TabsContent>

      <TabsContent value="email">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Email settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="integrations">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Integration settings coming soon.
        </div>
      </TabsContent>

      <TabsContent value="security">
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Security settings coming soon.
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 5: Create the Settings page (server component)**

```typescript
// app/(staff)/staff/settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getStaffByUserId } from "@/features/staffs/queries";
import { getSeoSettings } from "@/features/settings/service";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata = {
  title: "Settings | Staff",
};

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.accountType !== "STAFF") {
    redirect("/staff/access-denied");
  }

  const staff = await getStaffByUserId(session.user.id);
  if (!staff) {
    redirect("/staff/access-denied");
  }

  const isSuperAdmin = staff.roles.some(
    (role: { code: string }) => role.code === "SUPER_ADMIN"
  );
  if (!isSuperAdmin) {
    redirect("/staff/access-denied");
  }

  const seoSettings = await getSeoSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </div>
      <SettingsTabs seoSettings={seoSettings} />
    </div>
  );
}
```

- [ ] **Step 6: Verify `getStaffByUserId` returns roles**

Check that the staff query includes role information. Look at `features/staffs/queries.ts`:

```bash
grep -A 20 "getStaffByUserId" features/staffs/queries.ts
```

If roles are not included in the query, you'll need to add a join with `staffRoles` and `roles` tables. The result should include `staff.roles` as an array of `{ code: string }`.

- [ ] **Step 7: Install Switch component if needed**

Check if shadcn switch exists:
```bash
ls components/ui/switch.tsx 2>/dev/null || echo "not found"
```

If not found and you prefer Switch over the custom ToggleSwitch, install it:
```bash
npx shadcn@latest add switch
```

Then update `seo-settings-form.tsx` to use the shadcn Switch instead of ToggleSwitch.

- [ ] **Step 8: Test the page renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/staff/settings` as a SUPER_ADMIN user. Verify:
- Tabs render with SEO tab active
- Google Analytics section shows enable toggle and measurement ID input
- Search Console section shows site URL and verification token inputs
- Form submits and shows success message

- [ ] **Step 9: Commit**

```bash
git add app/\(staff\)/staff/settings/ components/settings/
git commit -m "feat: add settings page with SEO form UI"
```

---

### Task 6: Google Analytics Script Injection

**Files:**
- Create: `components/analytics/google-analytics.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `getSeoSettings()` from Task 3
- Produces: GA script + Search Console meta tag in HTML head

- [ ] **Step 1: Create GoogleAnalytics component**

```typescript
// components/analytics/google-analytics.tsx
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Update root layout to inject GA + Search Console**

Current `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wixvora",
  description: "SaaS Website Builder",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased scrollbar-accent`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Replace with:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getSeoSettings } from "@/features/settings/service";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wixvora",
  description: "SaaS Website Builder",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const seoSettings = await getSeoSettings();
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scrollbar-accent`}
      suppressHydrationWarning
    >
      <head>
        {isProduction &&
          seoSettings.googleAnalytics.enabled &&
          seoSettings.googleAnalytics.measurementId && (
            <GoogleAnalytics
              measurementId={seoSettings.googleAnalytics.measurementId}
            />
          )}

        {seoSettings.searchConsole.verificationToken && (
          <meta
            name="google-site-verification"
            content={seoSettings.searchConsole.verificationToken}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Test GA injection**

1. Go to `/staff/settings` and enable GA with measurement ID `G-TEST123456`
2. Save settings
3. View page source on any page
4. Verify the gtag.js script tag appears in `<head>`
5. Verify `google-site-verification` meta tag appears when token is set

```bash
curl -s http://localhost:3000 | grep -o 'googletagmanager.com/gtag.js.*G-TEST123456'
curl -s http://localhost:3000 | grep -o 'google-site-verification'
```

- [ ] **Step 4: Commit**

```bash
git add components/analytics/ app/layout.tsx
git commit -m "feat: inject GA script and Search Console meta tag from settings"
```

---

### Task 7: Navigation Integration

**Files:**
- Modify: `config/navigation.ts`

**Interfaces:**
- Consumes: navigation pattern from existing config
- Produces: Settings link visible to SUPER_ADMIN

- [ ] **Step 1: Add Settings to navigation**

Add a new `NavGroup` to the `staffNavGroups` array in `config/navigation.ts`:

```typescript
{
  label: "Configuration",
  icon: "Cog",
  items: [
    {
      title: "Settings",
      href: "/staff/settings",
      icon: "Settings",
      permission: "settings.update",
    },
  ],
},
```

Make sure `Settings` and `Cog` icons are imported from `lucide-react`:

```typescript
import { Settings, Cog } from "lucide-react";
```

Note: Check how icons are handled in the navigation. If icons are stored as strings and resolved dynamically, use the string name. If they're stored as components, use the component reference.

- [ ] **Step 2: Verify navigation renders**

Run dev server and check:
- Settings link appears in sidebar for SUPER_ADMIN
- Settings link does NOT appear for other roles (filtered by permissions)
- Clicking navigates to `/staff/settings`

- [ ] **Step 3: Commit**

```bash
git add config/navigation.ts
git commit -m "feat: add Settings link to staff navigation"
```

---

### Task 8: Testing & Verification

**Files:**
- Create: `features/settings/__tests__/validation.test.ts`
- Create: `features/settings/__tests__/service.test.ts`

**Interfaces:**
- Tests all layers: validation, service, actions

- [ ] **Step 1: Create validation tests**

```typescript
// features/settings/__tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import { seoSettingsSchema } from "../validation";

describe("seoSettingsSchema", () => {
  it("parses valid settings", () => {
    const input = {
      googleAnalytics: {
        enabled: true,
        measurementId: "G-ABC1234567",
      },
      searchConsole: {
        siteUrl: "https://example.com",
        verificationToken: "abc123",
      },
    };
    const result = seoSettingsSchema.parse(input);
    expect(result.googleAnalytics.measurementId).toBe("G-ABC1234567");
  });

  it("transforms empty strings to null", () => {
    const input = {
      googleAnalytics: { enabled: false, measurementId: "" },
      searchConsole: { siteUrl: "", verificationToken: "" },
    };
    const result = seoSettingsSchema.parse(input);
    expect(result.googleAnalytics.measurementId).toBeNull();
    expect(result.searchConsole.siteUrl).toBeNull();
    expect(result.searchConsole.verificationToken).toBeNull();
  });

  it("rejects invalid measurement ID format", () => {
    const input = {
      googleAnalytics: { enabled: true, measurementId: "UA-12345" },
      searchConsole: { siteUrl: null, verificationToken: null },
    };
    expect(() => seoSettingsSchema.parse(input)).toThrow();
  });

  it("rejects invalid URL", () => {
    const input = {
      googleAnalytics: { enabled: false, measurementId: null },
      searchConsole: { siteUrl: "not-a-url", verificationToken: null },
    };
    expect(() => seoSettingsSchema.parse(input)).toThrow();
  });

  it("applies defaults for missing fields", () => {
    const input = {};
    const result = seoSettingsSchema.parse(input);
    expect(result.googleAnalytics.enabled).toBe(false);
    expect(result.googleAnalytics.measurementId).toBeNull();
    expect(result.searchConsole.siteUrl).toBeNull();
  });
});
```

- [ ] **Step 2: Run validation tests**

```bash
npx vitest run features/settings/__tests__/validation.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 3: Test the full flow manually**

1. Log in as SUPER_ADMIN
2. Navigate to Settings > SEO
3. Enable Google Analytics, enter measurement ID `G-TEST123456`
4. Enter Search Console site URL `https://example.com`
5. Enter verification token `test-token-123`
6. Click Save SEO Settings
7. Verify success message appears
8. View page source on any page
9. Verify GA script and verification meta tag are present
10. Disable GA toggle, save again
11. Verify GA script is removed from page source
12. Check audit log for SETTINGS_UPDATE entries

- [ ] **Step 4: Test non-SUPER_ADMIN access**

1. Log in as ADMIN or other non-SUPER_ADMIN staff
2. Navigate to `/staff/settings`
3. Verify redirect to `/staff/access-denied`
4. Verify Settings link is not visible in sidebar

- [ ] **Step 5: Commit**

```bash
git add features/settings/__tests__/
git commit -m "test: add settings validation tests"
```

---

### Task 9: Final Review & Cleanup

- [ ] **Step 1: Run linter**

```bash
npm run lint
```

Fix any errors.

- [ ] **Step 2: Run type checker**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Ensure all tests pass.

- [ ] **Step 4: Review all created/modified files**

Verify:
- `lib/db/schema/settings.ts` - Schema matches design
- `features/settings/validation.ts` - Zod schemas are correct
- `features/settings/service.ts` - Cache and revalidation work
- `features/settings/actions.ts` - Auth and audit logging correct
- `components/settings/seo-settings-form.tsx` - Form handles all states
- `app/layout.tsx` - GA injection is production-only
- `config/navigation.ts` - Settings link with correct permission

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete SEO settings feature with GA and Search Console"
```
