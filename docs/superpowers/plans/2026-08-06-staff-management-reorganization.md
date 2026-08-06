# Staff Management Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the existing `/staff/users` page into two separate pages — `/staff/staffs` for staff users and `/staff/clients` for client users — under the Management navigation group, using a shared component architecture.

**Architecture:** Extend the existing `UserWithProfile` type with an optional `client` field. Create reusable page/data-table/form components that adapt based on `userType` prop. Move old `/staff/users` code to `/staff/staffs`, add new `/staff/clients`, and redirect old URLs.

**Tech Stack:** Next.js App Router (server components + server actions), Drizzle ORM (PostgreSQL), TanStack Table, shadcn/ui, Zod, better-auth

## Global Constraints

- Follow existing codebase patterns: server components for pages, client components for interactivity
- Use `authorize()` from `@/lib/auth/authorize` for permission checks
- Use `createAuditLog()` from `@/features/audit/service` for audit logging
- All server actions must be `"use server"` and return `UserActionResult`
- Use existing `DataTable` from `@/components/shared/data-table` — do not create new table components
- Use existing `PageHeader` from `@/components/shared/page-header`
- No new external dependencies

---

### Task 1: Data Layer — Extend types, queries, and create client CRUD

**Files:**
- Modify: `features/users/types.ts`
- Modify: `features/users/queries.ts`
- Create: `features/clients/service.ts`
- Modify: `features/clients/validation.ts`
- Modify: `features/clients/actions.ts`

**Interfaces:**
- Produces: `UserWithProfile` (with optional `client` field), `getAllClientUsers()`, `createClientUser()`, `createClientSchema`

- [ ] **Step 1: Extend UserWithProfile type**

Edit `features/users/types.ts`:

```ts
export interface UserWithProfile {
  id: string;
  name: string;
  email: string;
  accountType: "CLIENT" | "STAFF";
  createdAt: Date;
  staff?: {
    id: string;
    department: string | null;
    position: string | null;
    employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
  } | null;
  client?: {
    id: string;
    displayName: string | null;
    companyName: string | null;
    phone: string | null;
    status: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  } | null;
}

export type UserActionResult =
  | { success: true }
  | { success: false; error: string };
```

- [ ] **Step 2: Add getAllClientUsers query**

Edit `features/users/queries.ts` — add `getAllClientUsers` function. Add import for `clients` from schema:

```ts
import { db } from "@/lib/db";
import { user, staffs, roles, clients } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import type { UserWithProfile } from "./types";

// ... existing getAllStaffUsers unchanged ...

export async function getAllClientUsers(): Promise<UserWithProfile[]> {
  const clientUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      createdAt: user.createdAt,
      clientId: clients.id,
      displayName: clients.displayName,
      companyName: clients.companyName,
      phone: clients.phone,
      status: clients.status,
    })
    .from(user)
    .leftJoin(clients, eq(user.id, clients.userId))
    .where(eq(user.accountType, "CLIENT"));

  return clientUsers.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    accountType: row.accountType as "CLIENT" | "STAFF",
    createdAt: row.createdAt,
    client: row.clientId
      ? {
          id: row.clientId,
          displayName: row.displayName,
          companyName: row.companyName,
          phone: row.phone,
          status: row.status as "ACTIVE" | "SUSPENDED" | "INACTIVE",
        }
      : null,
  }));
}

// ... existing getAllRoles unchanged ...
```

- [ ] **Step 3: Create client service**

Create `features/clients/service.ts`:

```ts
import { db } from "@/lib/db";
import { user, clients } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import type { CreateClientInput } from "./validation";

export async function createClientUser(
  input: CreateClientInput
): Promise<{ userId: string; clientId: string }> {
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
      accountType: "CLIENT",
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create user account");
  }

  const [client] = await db
    .insert(clients)
    .values({
      userId: result.user.id,
      displayName: input.displayName,
      companyName: input.companyName,
      phone: input.phone,
      status: "ACTIVE",
    })
    .returning();

  if (!client) {
    throw new Error("Failed to create client profile");
  }

  return { userId: result.user.id, clientId: client.id };
}
```

- [ ] **Step 4: Add createClientSchema validation**

Edit `features/clients/validation.ts` — add `createClientSchema`:

```ts
import { z } from "zod";

export const updateClientProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
});

export type UpdateClientProfileInput = z.infer<
  typeof updateClientProfileSchema
>;

export const createClientSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  displayName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
```

- [ ] **Step 5: Add createClientAction**

Edit `features/clients/actions.ts` — add `createClientAction` function. Add imports for `authorize`, `PERMISSIONS`, `createClientUser`, `createClientSchema`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createAuditLog } from "@/features/audit/service";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClientUser } from "./service";
import { updateClientProfileSchema, createClientSchema } from "./validation";
import type { ClientActionResult } from "./types";

// ... existing updateClientProfile unchanged ...

export async function createClientAction(
  data: unknown
): Promise<ClientActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.accountType !== "STAFF") {
      return { success: false, error: "Forbidden: Staff access required" };
    }

    await authorize(PERMISSIONS.CLIENTS_CREATE);

    const validated = createClientSchema.parse(data);

    const { userId, clientId } = await createClientUser(validated);

    await createAuditLog({
      userId: session.user.id,
      action: "CLIENT_CREATED",
      entity: "user",
      entityId: userId,
      metadata: {
        email: validated.email,
        clientId,
      },
    });

    revalidatePath("/staff/clients");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

- [ ] **Step 6: Verify types compile**

Run: `npx tsc --noEmit --pretty`
Expected: No type errors.

- [ ] **Step 7: Commit**

```bash
git add features/users/types.ts features/users/queries.ts features/clients/service.ts features/clients/validation.ts features/clients/actions.ts
git commit -m "feat: add client data layer - query, service, validation, action"
```

---

### Task 2: Table Configurations — Rename staff columns, create client table config

**Files:**
- Rename: `features/users/table/columns.tsx` → `features/users/table/staff-columns.tsx`
- Modify: `features/users/table/filters.ts`
- Modify: `features/users/table/bulk-actions.tsx` → `features/users/table/staff-bulk-actions.tsx`
- Modify: `features/users/table/index.ts`
- Create: `features/clients/table/client-columns.tsx`
- Create: `features/clients/table/client-filters.ts`
- Create: `features/clients/table/bulk-actions.tsx`
- Create: `features/clients/table/index.ts`

**Interfaces:**
- Consumes: `UserWithProfile` (from Task 1)
- Produces: `staffColumns`, `staffFilters`, `staffBulkActions`, `clientColumns`, `clientFilters`, `clientBulkActions`

- [ ] **Step 1: Rename staff columns file**

Rename `features/users/table/columns.tsx` to `features/users/table/staff-columns.tsx`.

Update the export name and internal link hrefs:

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithProfile } from "@/features/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export const staffColumns: ColumnDef<UserWithProfile, unknown>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
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
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Name",
      filterVariant: "text",
      searchable: true,
      exportable: true,
      visibleFrom: "always",
      minWidth: 140,
      maxWidth: 260,
      truncate: true,
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Email",
      filterVariant: "text",
      searchable: true,
      copyable: true,
      exportable: true,
      minWidth: 180,
      maxWidth: 300,
      truncate: true,
    },
  },
  {
    id: "department",
    accessorFn: (row) => row.staff?.department ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Department",
      filterVariant: "select",
      exportable: true,
      minWidth: 120,
      truncate: true,
    },
  },
  {
    id: "position",
    accessorFn: (row) => row.staff?.position ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    enableSorting: true,
    meta: {
      label: "Position",
      exportable: true,
      minWidth: 120,
      truncate: true,
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.staff?.employmentStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value === "ACTIVE" ? "default" : "secondary"}>
          {value}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Status",
      filterVariant: "select",
      exportable: true,
      align: "center",
      visibleFrom: "always",
      minWidth: 100,
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const u = row.original;
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
              render={<Link href={`/staff/staffs/${u.id}`} />}
            >
              <Eye className="mr-2 size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href={`/staff/staffs/${u.id}/edit`} />}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                console.log("Delete user:", u.id);
              }}
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
```

- [ ] **Step 2: Rename staff bulk-actions file**

Rename `features/users/table/bulk-actions.tsx` to `features/users/table/staff-bulk-actions.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";

export const staffBulkActions: DataTableBulkAction<UserWithProfile>[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      console.log(
        "Delete users:",
        rows.map((r) => r.id)
      );
    },
  },
];
```

- [ ] **Step 3: Update staff barrel export**

Edit `features/users/table/index.ts`:

```ts
export { staffColumns } from "./staff-columns";
export { staffFilters } from "./filters";
export { staffBulkActions } from "./staff-bulk-actions";
```

- [ ] **Step 4: Create client columns**

Create `features/clients/table/client-columns.tsx`:

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserWithProfile } from "@/features/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export const clientColumns: ColumnDef<UserWithProfile, unknown>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
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
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Name",
      filterVariant: "text",
      searchable: true,
      exportable: true,
      visibleFrom: "always",
      minWidth: 140,
      maxWidth: 260,
      truncate: true,
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Email",
      filterVariant: "text",
      searchable: true,
      copyable: true,
      exportable: true,
      minWidth: 180,
      maxWidth: 300,
      truncate: true,
    },
  },
  {
    id: "companyName",
    accessorFn: (row) => row.client?.companyName ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Company",
      filterVariant: "select",
      exportable: true,
      minWidth: 140,
      truncate: true,
    },
  },
  {
    id: "phone",
    accessorFn: (row) => row.client?.phone ?? "-",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    enableSorting: true,
    meta: {
      label: "Phone",
      exportable: true,
      minWidth: 120,
      truncate: true,
    },
  },
  {
    id: "clientStatus",
    accessorFn: (row) => row.client?.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      const variant =
        value === "ACTIVE"
          ? "default"
          : value === "SUSPENDED"
            ? "destructive"
            : "secondary";
      return <Badge variant={variant}>{value}</Badge>;
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: "Status",
      filterVariant: "select",
      exportable: true,
      align: "center",
      visibleFrom: "always",
      minWidth: 100,
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const u = row.original;
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
              render={<Link href={`/staff/clients/${u.id}`} />}
            >
              <Eye className="mr-2 size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href={`/staff/clients/${u.id}/edit`} />}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                console.log("Delete client:", u.id);
              }}
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
```

- [ ] **Step 5: Create client filters**

Create `features/clients/table/client-filters.ts`:

```ts
import type { DataTableFilter } from "@/components/shared/data-table";

export const clientFilters: DataTableFilter[] = [
  {
    id: "clientStatus",
    label: "Status",
    type: "faceted",
    column: "clientStatus",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Suspended", value: "SUSPENDED" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    id: "companyName",
    label: "Company",
    type: "faceted",
    column: "companyName",
    options: [],
  },
];
```

- [ ] **Step 6: Create client bulk-actions**

Create `features/clients/table/bulk-actions.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";

export const clientBulkActions: DataTableBulkAction<UserWithProfile>[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      console.log(
        "Delete clients:",
        rows.map((r) => r.id)
      );
    },
  },
];
```

- [ ] **Step 7: Create client barrel export**

Create `features/clients/table/index.ts`:

```ts
export { clientColumns } from "./client-columns";
export { clientFilters } from "./client-filters";
export { clientBulkActions } from "./bulk-actions";
```

- [ ] **Step 8: Verify types compile**

Run: `npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add features/users/table/ features/clients/table/
git commit -m "feat: add staff and client table configurations"
```

---

### Task 3: Shared Data-Table Components — Create reusable StaffDataTable and ClientDataTable

**Files:**
- Create: `features/user-management/components/staff-data-table.tsx`
- Create: `features/user-management/components/client-data-table.tsx`
- Create: `features/user-management/components/staff-form.tsx`
- Create: `features/user-management/components/client-form.tsx`
- Create: `features/user-management/components/index.ts`

**Interfaces:**
- Consumes: `staffColumns`, `staffFilters`, `staffBulkActions` (Task 2), `clientColumns`, `clientFilters`, `clientBulkActions` (Task 2), `UserWithProfile` (Task 1)
- Produces: `StaffDataTable`, `ClientDataTable`, `StaffForm`, `ClientForm`

- [ ] **Step 1: Create StaffDataTable component**

Create `features/user-management/components/staff-data-table.tsx`:

```tsx
"use client";

import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { staffColumns } from "@/features/users/table/staff-columns";
import { staffFilters } from "@/features/users/table/filters";
import { staffBulkActions } from "@/features/users/table/staff-bulk-actions";

interface StaffDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function StaffDataTable({
  users,
  isLoading = false,
}: StaffDataTableProps) {
  return (
    <DataTable
      tableId="staff-users"
      data={users}
      columns={staffColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ["name", "email"] }}
      filters={staffFilters}
      bulkActions={staffBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: "staff-users",
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
        searchPlaceholder: "Search staff...",
        noResults: "No staff users found.",
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
```

- [ ] **Step 2: Create ClientDataTable component**

Create `features/user-management/components/client-data-table.tsx`:

```tsx
"use client";

import { DataTable } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";
import { clientColumns } from "@/features/clients/table/client-columns";
import { clientFilters } from "@/features/clients/table/client-filters";
import { clientBulkActions } from "@/features/clients/table/bulk-actions";

interface ClientDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function ClientDataTable({
  users,
  isLoading = false,
}: ClientDataTableProps) {
  return (
    <DataTable
      tableId="client-users"
      data={users}
      columns={clientColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ["name", "email"] }}
      filters={clientFilters}
      bulkActions={clientBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: "client-users",
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
        searchPlaceholder: "Search clients...",
        noResults: "No client users found.",
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
```

- [ ] **Step 3: Create StaffForm component**

Create `features/user-management/components/staff-form.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaffAction } from "@/features/users/actions";

interface Role {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface StaffFormProps {
  roles: Role[];
}

export function StaffForm({ roles }: StaffFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleRoleChange = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleId]);
    } else {
      setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      department: formData.get("department") as string,
      position: formData.get("position") as string,
      roleIds: selectedRoles,
    };

    startTransition(async () => {
      const result = await createStaffAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/staff/staffs");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input id="position" name="position" />
      </div>

      <div className="space-y-2">
        <Label>Roles</Label>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`role-${role.id}`}
                checked={selectedRoles.includes(role.id)}
                onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor={`role-${role.id}`} className="text-sm">
                {role.name}
                {role.description && (
                  <span className="text-muted-foreground">
                    {" "}
                    - {role.description}
                  </span>
                )}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isPending || selectedRoles.length === 0}
        >
          {isPending ? "Creating..." : "Create Staff"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/staffs")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create ClientForm component**

Create `features/user-management/components/client-form.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientAction } from "@/features/clients/actions";

export function ClientForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      displayName: formData.get("displayName") as string,
      companyName: formData.get("companyName") as string,
      phone: formData.get("phone") as string,
    };

    startTransition(async () => {
      const result = await createClientAction(data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/staff/clients");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" name="displayName" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" name="companyName" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Client"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/clients")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create barrel export**

Create `features/user-management/components/index.ts`:

```ts
export { StaffDataTable } from "./staff-data-table";
export { ClientDataTable } from "./client-data-table";
export { StaffForm } from "./staff-form";
export { ClientForm } from "./client-form";
```

- [ ] **Step 6: Verify types compile**

Run: `npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add features/user-management/
git commit -m "feat: add shared staff and client components"
```

---

### Task 4: Staff Routes — Create `/staff/staffs/` pages

**Files:**
- Create: `app/(staff)/staff/staffs/page.tsx`
- Create: `app/(staff)/staff/staffs/create/page.tsx`

**Interfaces:**
- Consumes: `StaffDataTable`, `StaffForm` (Task 3), `getAllStaffUsers`, `getAllRoles` (existing)

- [ ] **Step 1: Create staff list page**

Create `app/(staff)/staff/staffs/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllStaffUsers } from "@/features/users/queries";
import { StaffDataTable } from "@/features/user-management/components";
import { PageHeader } from "@/components/shared/page-header";

export default async function StaffsPage() {
  try {
    await authorize(PERMISSIONS.USERS_VIEW);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const users = await getAllStaffUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Users"
        description="Manage staff accounts, roles, and permissions"
        actions={
          <Link href="/staff/staffs/create">
            <Button>
              <UserPlus />
              Create Staff
            </Button>
          </Link>
        }
      />

      <StaffDataTable users={users} />
    </div>
  );
}
```

- [ ] **Step 2: Create staff create page**

Create `app/(staff)/staff/staffs/create/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllRoles } from "@/features/users/queries";
import { StaffForm } from "@/features/user-management/components";

export default async function CreateStaffPage() {
  try {
    await authorize(PERMISSIONS.USERS_CREATE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const roles = await getAllRoles();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Staff User</h1>
      <StaffForm roles={roles} />
    </div>
  );
}
```

- [ ] **Step 3: Update createStaffAction revalidation path**

Edit `features/users/actions.ts` — change `revalidatePath("/staff/users")` to `revalidatePath("/staff/staffs")`:

```ts
revalidatePath("/staff/staffs");
```

- [ ] **Step 4: Verify the staffs page loads**

Run: `npm run dev` (or `npx next dev`)
Navigate to: `http://localhost:3000/staff/staffs`
Expected: Page loads with staff users table (may need auth bypass for testing).

- [ ] **Step 5: Commit**

```bash
git add "app/(staff)/staff/staffs/" features/users/actions.ts
git commit -m "feat: add /staff/staffs route pages"
```

---

### Task 5: Client Routes — Create `/staff/clients/` pages

**Files:**
- Create: `app/(staff)/staff/clients/page.tsx`
- Create: `app/(staff)/staff/clients/create/page.tsx`

**Interfaces:**
- Consumes: `ClientDataTable`, `ClientForm` (Task 3), `getAllClientUsers` (Task 1)

- [ ] **Step 1: Create client list page**

Create `app/(staff)/staff/clients/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllClientUsers } from "@/features/users/queries";
import { ClientDataTable } from "@/features/user-management/components";
import { PageHeader } from "@/components/shared/page-header";

export default async function ClientsPage() {
  try {
    await authorize(PERMISSIONS.CLIENTS_VIEW);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  const users = await getAllClientUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Users"
        description="Manage client accounts and access"
        actions={
          <Link href="/staff/clients/create">
            <Button>
              <UserPlus />
              Create Client
            </Button>
          </Link>
        }
      />

      <ClientDataTable users={users} />
    </div>
  );
}
```

- [ ] **Step 2: Create client create page**

Create `app/(staff)/staff/clients/create/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { authorize, AuthorizationError } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { ClientForm } from "@/features/user-management/components";

export default async function CreateClientPage() {
  try {
    await authorize(PERMISSIONS.CLIENTS_CREATE);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect("/staff/access-denied");
    }
    throw error;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Client User</h1>
      <ClientForm />
    </div>
  );
}
```

- [ ] **Step 3: Verify the clients page loads**

Run: `npm run dev` (or `npx next dev`)
Navigate to: `http://localhost:3000/staff/clients`
Expected: Page loads with client users table.

- [ ] **Step 4: Commit**

```bash
git add "app/(staff)/staff/clients/"
git commit -m "feat: add /staff/clients route pages"
```

---

### Task 6: Navigation, Redirects, and Cleanup

**Files:**
- Modify: `config/navigation.ts`
- Modify: `next.config.ts`
- Delete: `app/(staff)/staff/users/` directory

**Interfaces:**
- Consumes: All previous tasks complete

- [ ] **Step 1: Update navigation config**

Edit `config/navigation.ts` — replace the Management group items:

```ts
export const staffNavGroups: NavGroup[] = [
  {
    label: "Main",
    icon: "LayoutDashboard",
    items: [{ title: "Dashboard", href: "/staff", icon: "LayoutDashboard" }],
  },
  {
    label: "Management",
    icon: "Settings",
    items: [
      {
        title: "Staffs",
        href: "/staff/staffs",
        icon: "Users",
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: "Clients",
        href: "/staff/clients",
        icon: "UserCheck",
        permission: PERMISSIONS.CLIENTS_VIEW,
      },
      {
        title: "Roles",
        href: "/staff/roles",
        icon: "Shield",
        permission: PERMISSIONS.ROLES_VIEW,
      },
      {
        title: "Audit Logs",
        href: "/staff/audit",
        icon: "FileText",
        permission: PERMISSIONS.AUDIT_VIEW,
      },
    ],
  },
];
```

- [ ] **Step 2: Add redirects to next.config.ts**

Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.7"],
  async redirects() {
    return [
      {
        source: "/staff/users",
        destination: "/staff/staffs",
        permanent: true,
      },
      {
        source: "/staff/users/create",
        destination: "/staff/staffs/create",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Delete old users directory**

Run: `rm -rf app/\(staff\)/staff/users/`

- [ ] **Step 4: Verify redirects work**

Run: `npm run dev` (or `npx next dev`)
Navigate to: `http://localhost:3000/staff/users`
Expected: Redirects to `/staff/staffs`.

Navigate to: `http://localhost:3000/staff/users/create`
Expected: Redirects to `/staff/staffs/create`.

- [ ] **Step 5: Verify navigation shows correct items**

Navigate to any staff page.
Expected: Sidebar shows "Staffs" and "Clients" under Management group.

- [ ] **Step 6: Final type check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors.

- [ ] **Step 7: Run linter**

Run: `npm run lint` (or equivalent)
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add config/navigation.ts next.config.ts
git commit -m "feat: update navigation and add redirects for staff management reorganization"
```

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `/staff/staffs` shows staff users with correct columns (Name, Email, Department, Position, Status)
- [ ] `/staff/clients` shows client users with correct columns (Name, Email, Company, Phone, Status)
- [ ] `/staff/staffs/create` form creates staff user with role assignment
- [ ] `/staff/clients/create` form creates client user
- [ ] `/staff/users` redirects to `/staff/staffs` (301)
- [ ] `/staff/users/create` redirects to `/staff/staffs/create` (301)
- [ ] Navigation sidebar shows "Staffs" and "Clients" under Management
- [ ] Permissions enforced (USERS_VIEW/CREATE for staffs, CLIENTS_VIEW/CREATE for clients)
- [ ] Audit logs created on user creation
- [ ] Search and filters work on both tables
- [ ] CSV/Excel export works on both tables
- [ ] Type check passes: `npx tsc --noEmit --pretty`
- [ ] Lint passes: `npm run lint`
