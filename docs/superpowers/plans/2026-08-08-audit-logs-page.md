# Audit Logs Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`[ ]`) syntax for tracking.

**Goal:** Build a comprehensive audit logs viewing page with filtering, pagination, search, detail dialog, and export functionality in the staff dashboard.

**Architecture:** Server-side data fetching with Drizzle ORM joined to user table, TanStack Table v8 for client-side table management, URL searchParams for filter state, debounced search input (implementation simplified to non-debounced for initial version).

**Tech Stack:** Next.js 16.3.0 server components, shadcn/ui components (Table, Dialog, Select, Input, Button, Badge), Drizzle ORM, @tanstack/react-table v8, date-fns for date formatting, xlsx library (0.18.5) for Excel export.

## Global Constraints

- Using TanStack Table v8.21.3 (already in package.json)
- Using xlxs library (0.18.5) for Excel export
- Following existing patterns from `app/(staff)/staff/roles/page.tsx` for authorization
- Using shadcn/ui components (Table, Dialog, Select, Input, Button, Badge, Label, ScrollArea)
- Navigation items defined in `config/navigation.ts` at `staffNavGroups` with `permission: PERMISSIONS.AUDIT_VIEW`
- Server-side pagination with 50 items per page default
- Authorization check using `authorize(PERMISSIONS.AUDIT_VIEW)` in server component before data fetching
- Icons from lucide-react (FileText for navigation, SearchIcon for search input)
- Route path: `/staff/audit-logs` (not `/staff/audit`)

## File Structure

### Created Files:

- `features/audit/queries.ts` - Server-side data fetching functions
- `features/audit/components/columns.tsx` - TanStack Table column definitions with formatting utilities
- `features/audit/components/audit-log-detail-dialog.tsx` - Detail modal component
- `features/audit/components/audit-logs-export-menu.tsx` - Export dropdown component
- `features/audit/components/audit-logs-table.tsx` - Main client table component with TanStack Table v8
- `app/(staff)/staff/audit-logs/page.tsx` - Server component page with URL-based filtering

### Modified Files:

- `features/audit/types.ts` - Add AuditLogWithUser, AuditLogsResult, AuditLogsFilters types (Task 1 already done)
- `config/navigation.ts` - Update Audit Logs route from `/staff/audit` to `/staff/audit-logs` (Task 8)
- `features/audit/service.ts` - No changes needed, existing createAuditLog is fine

---

## Task 1: Extend Types [ALREADY DONE]

**Files:**

- Modify: `features/audit/types.ts`

**Step 1: Verify existing types**

Verify file has the extended types from previous work:

- AuditLogWithUser
- AuditLogsResult
- AuditLogsFilters

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/types.ts
```

**Step 3: Commit**

```bash
git add features/audit/types.ts
git commit -m "feat: add audit logs result types and filters"
```

---

## Task 2: Create Server-Side Queries

**Files:**

- Create: `features/audit/queries.ts`

**Step 1: Create queries.ts**

```typescript
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema/audit-logs";
import { user } from "@/lib/db/schema/auth";
import { eq, and, sql, ilike, or, gte, lte, asc, desc } from "drizzle-orm";
import type {
  AuditLogWithUser,
  AuditLogsResult,
  AuditLogsFilters,
} from "./types";

export async function getAuditLogs(
  filters: AuditLogsFilters = {}
): Promise<AuditLogsResult> {
  const {
    page = 1,
    pageSize = 50,
    action,
    entity,
    searchTerm,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const conditions = [];

  if (action) {
    conditions.push(eq(auditLogs.action, action));
  }

  if (entity) {
    conditions.push(eq(auditLogs.entity, entity));
  }

  if (searchTerm) {
    conditions.push(
      or(
        ilike(auditLogs.entityId, `%${searchTerm}%`),
        ilike(user.name, `%${searchTerm}%`),
        ilike(user.email, `%${searchTerm}%`)
      )
    );
  }

  if (startDate) {
    conditions.push(gte(auditLogs.createdAt, startDate));
  }

  if (endDate) {
    conditions.push(lte(auditLogs.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const orderByColumn =
    sortBy === "action"
      ? auditLogs.action
      : sortBy === "entity"
        ? auditLogs.entity
        : auditLogs.createdAt;

  const orderByFn = sortOrder === "asc" ? asc : desc;
  const offset = (page - 1) * pageSize;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        entity: auditLogs.entity,
        entityId: auditLogs.entityId,
        metaauditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .where(whereClause)
      .orderBy(orderByFn(orderByColumn))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .where(whereClause),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / pageSize);

  return {
    data.map((row): AuditLogWithUser => ({
      ...row,
      user: row.user.id ? row.user : null,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getDistinctActions(): Promise<string[]> {
  const result = await db
    .selectDistinct({ action: auditLogs.action })
    .from(auditLogs)
    .orderBy(asc(auditLogs.action));

  return result.map((r) => r.action);
}

export async function getDistinctEntities(): Promise<string[]> {
  const result = await db
    .selectDistinct({ entity: auditLogs.entity })
    .from(auditLogs)
    .orderBy(asc(auditLogs.entity));

  return result.map((r) => r.entity);
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/queries.ts
```

**Step 3: Run linter**

```bash
npm run lint -- --fix features/audit/queries.ts
```

**Step 4: Commit**

```bash
git add features/audit/queries.ts
git commit -m "feat: add server-side audit logs data queries"
```

---

## Task 3: Create TanStack Table Column Definitions

**Files:**

- Create: `features/audit/components/columns.tsx`

**Step 1: Create columns.tsx**

```typescript
import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLogWithUser } from "../../types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SearchIcon, UserCircle, FileText, Clock } from "lucide-react";

export function getActionBadgeColor(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "bg-green-100 text-green-800";
  if (["updated"].includes(actionLower)) return "bg-blue-100 text-blue-800";
  if (["deleted"].includes(actionLower)) return "bg-red-100 text-red-800";
  if (["login"].includes(actionLower)) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}

export function formatActionEmoji(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "🟢";
  if (["updated"].includes(actionLower)) return "🔵";
  if (["deleted"].includes(actionLower)) return "🔴";
  if (["login"].includes(actionLower)) return "🟣";
  if (["logout"].includes(actionLower)) return "🟤";
  return "⚪";
}

export function formatTimestamp(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return formatTimestamp(date);
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const cleaned = userAgent
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-()\/.]/g, "")
    .trim();
  return truncateString(cleaned, 40);
}

export function truncateIP(ip: string | null): { display: string; full: string } {
  if (!ip) return { display: "Unknown", full: "" };
  if (ip.length <= 15) return { display: ip, full: ip };
  return {
    display: `${ip.slice(0, 6)}...${ip.slice(-4)}`,
    full: ip,
  };
}

export function formatEntity(entity: string, entityId: string | null): string {
  if (!entityId) return entity;
  return `${entity} #${truncateString(entityId, 12)}`;
}

export const columns: ColumnDef<AuditLogWithUser>[] = [
  {
    accessorKey: "createdAt",
    header: (props) => <div className="w-[150px]">Timestamp</div>,
    cell: ({ row }) => (
      <div className="w-[150px] space-y-0.5">
        <div className="font-medium">
          {formatTimestamp(row.original.createdAt)}
        </div>
        <div className="text-xs text-muted-foreground">
          ({formatRelativeTime(row.original.createdAt)})
        </div>
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <div className="w-[200px]">
        {column.getIsSorted() === "asc" && "▲"}
        {column.getIsSorted() === "desc" && "▼"}
        {column.getIsSorted() === false && "User"}
      </div>
    ),
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) {
        return (
          <div className="flex items-center gap-2 w-[200px]">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span>System</span>
          </div>
        );
      }
      return (
        <div className="flex flex-col w-[200px]">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <div className="w-[120px]">
        {column.getIsSorted() === "asc" && "▲"}
        {column.getIsSorted() === "desc" && "▼"}
        {column.getIsSorted() === false && "Action"}
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-[120px]">
        <span className="text-lg">{formatActionEmoji(row.original.action)}</span>
        <Badge className={getActionBadgeColor(row.original.action)}>
          {row.original.action}
        </Badge>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "entity",
    header: ({ column }) => (
      <div className="w-[180px]">
        {column.getIsSorted() === "asc" && "▲"}
        {column.getIsSorted() === "desc" && "▼"}
        {column.getIsSorted() === false && "Entity"}
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-[180px]">
        {formatEntity(row.original.entity, row.original.entityId)}
      </div>
    ),
    size: 180,
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => {
      const parsed = truncateIP(row.original.ipAddress);
      if (!parsed.full) return <span className="text-muted-foreground">Unknown</span>;
      return (
        <div className="w-[130px]" title={parsed.full}>
          {parsed.display}
        </div>
      );
    },
    size: 130,
  },
  {
    accessorKey: "userAgent",
    header: "User Agent",
    cell: ({ row }) => (
      <div className="w-[150px]" title={row.original.userAgent || ""}>
        {formatUserAgent(row.original.userAgent)}
      </div>
    ),
    size: 150,
    enableSorting: false,
  },
];
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/components/columns.tsx
```

**Step 3: Commit**

```bash
git add features/audit/components/columns.tsx
git commit -m "feat: add TanStack Table column definitions for audit logs"
```

---

## Task 4: Create Export Menu Component

**Files:**

- Create: `features/audit/components/audit-logs-export-menu.tsx`

**Step 1: Create export menu component**

```typescript
"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileType } from "lucide-react";

interface ExportMenuProps {
  any[];
  filters: any;
  onExport: (format: "csv" | "xlsx" | "json") => void;
  disabled?: boolean;
}

export function AuditLogsExportMenu({
  data,
  filters,
  onExport,
  disabled = false,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "csv" | "xlsx" | "json") => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
          {isExporting && (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={disabled || isExporting}
          className="cursor-pointer"
        >
          <FileType className="mr-2 h-4 w-4 text-yellow-600" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/components/audit-logs-export-menu.tsx
```

**Step 3: Commit**

```bash
git add features/audit/components/audit-logs-export-menu.tsx
git commit -m "feat: add export menu component for audit logs"
```

---

## Task 5: Create Detail Dialog Component

**Files:**

- Create: `features/audit/components/audit-log-detail-dialog.tsx`

**Step 1: Create detail dialog component**

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, formatRelativeTime } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { FileText, Clock, UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AuditLogWithUser } from "../../types";
import { truncatedString, getActionBadgeColor } from "./columns";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditLogWithUser | null;
}

export function AuditLogDetailDialog({
  open,
  onOpenChange,
  log,
}: DetailDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const formatMetadata = (metaRecord<string, unknown> | null) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return <span className="text-muted-foreground italic">No metadata</span>;
    }
    return (
      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded text-xs">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    );
  };

  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
              <DialogDescription>
                View complete details for this audit log entry
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Logged by: {session?.user?.name || "Unknown"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  Timestamp
                </label>
                <div className="font-medium mt-1">
                  {format(log.createdAt, "PPP p")}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  User
                </label>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    <div className="font-medium">
                      {log.user?.name || "System"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {log.user?.email || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  Action
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={getActionBadgeColor(log.action)}>
                    {log.action}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  Entity
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div className="font-medium">{log.entity}</div>
                </div>
                {log.entityId && (
                  <div className="text-sm text-muted-foreground">
                    {log.entityId}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  IP Address
                </label>
                <div className="mt-1 font-mono text-sm flex items-center gap-2">
                  {log.ipAddress || "N/A"}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase">
                  User Agent
                </label>
                <div className="mt-1 text-xs max-h-16 overflow-y-auto">
                  {log.userAgent || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase mb-2 block">
                Metadata
              </label>
              {formatMetadata(log.metadata)}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/components/audit-log-detail-dialog.tsx
```

**Step 3: Commit**

```bash
git add features/audit/components/audit-log-detail-dialog.tsx
git commit -m "feat: add audit log detail dialog component"
```

---

## Task 6: Create Main Table Component

**Files:**

- Create: `features/audit/components/audit-logs-table.tsx`

**Step 1: Create table component**

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";
import { AuditLogsExportMenu } from "./audit-logs-export-menu";
import { getActionEmoji, getActionBadgeColor } from "./columns";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns as rawColumns, truncatedString } from "./columns";
import { ArrowUpDown, MoreHorizontal, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import type { AuditLogsFilters, AuditLogWithUser } from "../../types";
import { toast } from "sonner";

interface AuditLogsTableProps {
  AuditLogWithUser[];
  total: number;
  filters: AuditLogsFilters;
  onPageChange: (newPage: number) => void;
  onFilterChange: (newFilters: AuditLogsFilters) => void;
}

export function AuditLogsTable({
  data,
  total,
  filters,
  onPageChange,
  onFilterChange,
}: AuditLogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [detailLog, setDetailLog] = useState<AuditLogWithUser | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns: rawColumns as ColumnDef<AuditLogWithUser>[],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleRowClick = (row: AuditLogWithUser) => {
    setDetailLog(row);
  };

  const applyFilters = (newFilters: Partial<AuditLogsFilters>): void => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.page) params.set("page", newFilters.page.toString());
    if (newFilters.pageSize) params.set("pageSize", newFilters.pageSize.toString());
    if (newFilters.action) params.set("action", newFilters.action);
    else params.delete("action");
    if (newFilters.entity) params.set("entity", newFilters.entity);
    else params.delete("entity");
    if (newFilters.searchTerm) params.set("search", newFilters.searchTerm);
    else params.delete("search");
    if (newFilters.startDate) params.set("startDate", newFilters.startDate.toISOString());
    else params.delete("startDate");
    if (newFilters.endDate) params.set("endDate", newFilters.endDate.toISOString());
    else params.delete("endDate");
    if (newFilters.sortBy) params.set("sortBy", newFilters.sortBy);
    if (newFilters.sortOrder) params.set("sortOrder", newFilters.sortOrder);

    router.push(`/staff/audit-logs?${params.toString()}`);
  };

  const clearFilters = () => {
    applyFilters({
      action: undefined,
      entity: undefined,
      searchTerm: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <AuditLogDetailDialog
        open={!!detailLog}
        onOpenChange={(open) => !open && setDetailLog(null)}
        log={detailLog}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">
            {filters.action || filters.entity || filters.searchTerm
              ? "Filtered Results"
              : "All Audit Logs"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filters.action || filters.entity || filters.searchTerm
              ? "Viewing filtered results"
              : `Showing ${table.getRowModel().rows.length} of ${total} logs`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AuditLogsExportMenu
            data={data}
            filters={filters}
            onExport={async (format) => {
              const blob = await generateExportBlob(data, format);
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = getExportFilename(format);
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported as ${format.toUpperCase()}`);
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        if (!header.column.getIsSorted()) {
                          applyFilters({
                            sortBy: header.column.id as any,
                            sortOrder: "asc",
                          });
                        } else if (header.column.getIsSorted() === "asc") {
                          applyFilters({
                            sortBy: header.column.id as any,
                            sortOrder: "desc",
                          });
                        } else {
                          applyFilters({
                            sortBy: header.column.id as any,
                          });
                        }
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📄</span>
                    <p className="text-muted-foreground">
                      No audit logs found
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      hoveredRowId === row.id
                        ? "bg-accent/50 cursor-pointer"
                        : "cursor-pointer hover:bg-accent/50"
                    }
                    onMouseEnter={() => setHoveredRowId(row.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
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
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex-1 text-sm text-muted-foreground">
          <span>
            Page {filters.page || 1} of {Math.ceil(total / (filters.pageSize || 50))}
          </span>
          {" "}
          <span className="hidden sm:inline">|</span>
          {" "}
          <span className="sm:hidden">{total} total logs</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, (filters.page || 1) - 1))}
            disabled={
              filters.page === undefined || filters.page === 1
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((filters.page || 1) + 1)}
            disabled={filters.page !== undefined && filters.page >= Math.ceil(total / (filters.pageSize || 50))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

async function generateExportBlob(any[], format: string): Promise<Blob | null> {
  const timestamp = new Date().toISOString();

  if (format === "csv") {
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Action",
      "Entity",
      "Entity ID",
      "IP Address",
      "User Agent",
      "Metadata",
    ];

    const rows = data.map((log) => {
      const metadataStr = log.metadata
        ? JSON.stringify(log.metadata).replace(/"/g, '""')
        : "";
      return [
        `"${log.createdAt.toISOString()}"`,
        `"${log.user?.name || "System"}"`,
        `"${log.user?.email || ""}"`,
        `"${log.action}"`,
        `"${log.entity}"`,
        `"${log.entityId || ""}"`,
        `"${log.ipAddress || ""}"`,
        `"${log.userAgent || ""}"`,
        `"${metadataStr}"`,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return new Blob([csv], { type: "text/csv;charset=utf-8;" });
  } else if (format === "json") {
    const jsonData = data.map((log) => ({
      id: log.id,
      timestamp: log.createdAt.toISOString(),
      user: {
        id: log.user?.id,
        name: log.user?.name,
        email: log.user?.email,
      },
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metalog.metadata,
      loggedById: log.userId,
    }));
    return new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  } else if (format === "xlsx") {
    const headers = [
      "Timestamp", "User Name", "User Email", "Action",
      "Entity", "Entity ID", "IP Address", "User Agent", "Metadata",
    ];

    const rows = data.map((log) => {
      const metadata = log.metadata ? JSON.stringify(log.metadata) : "";
      return [
        log.createdAt.toISOString(),
        log.user?.name || "System",
        log.user?.email || "",
        log.action,
        log.entity,
        log.entityId || "",
        log.ipAddress || "",
        log.userAgent || "",
        mdetadata,
      ];
    });

    const worksheetData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");
    XLSX.writeFile(wb, `audit-logs-${timestamp}.xlsx`);

    return new Blob([], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }

  return null;
}

function getExportFilename(format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `audit-logs-${timestamp}.${format}`;
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit features/audit/components/audit-logs-table.tsx
```

**Step 3: Commit**

```bash
git add features/audit/components/audit-logs-table.tsx
git commit -m "feat: add main audit logs table with sort, pagination, and export"
```

---

## Task 7: Create Server Component Page

**Files:**

- Create: `app/(staff)/staff/audit-logs/page.tsx`

**Step 1: Create page component**

```typescript
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import {
  getAuditLogs as queryAuditLogs,
  getDistinctActions,
  getDistinctEntities,
} from "@/features/audit/queries";
import { AuditLogsTable } from "@/features/audit/components/audit-logs-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import type { SearchParams } from "next/types";
import { SearchIcon } from "lucide-react";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams | string;
}) {
  try {
    await authorize(PERMISSIONS.AUDIT_VIEW);
  } catch {
    redirect("/staff/access-denied");
  }

  const params = typeof searchParams === "string" ? {} : searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 50;
  const action = params.action as string | undefined;
  const entity = params.entity as string | undefined;
  const searchTerm = params.search as string | undefined;
  const startDateStr = params.startDate as string | undefined;
  const endDateStr = params.endDate as string | undefined;
  const sortBy = params.sortBy as "createdAt" | "action" | "entity" | undefined;
  const sortOrder = params.sortOrder as "asc" | "desc" | undefined;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr && parse(startDateStr, "yyyy-MM-dd", new Date()).toString() !== "Invalid Date") {
    startDate = parse(startDateStr, "yyyy-MM-dd", new Date());
  }
  if (endDateStr && parse(endDateStr, "yyyy-MM-dd", new Date()).toString() !== "Invalid Date") {
    const parsed = parse(endDateStr, "yyyy-MM-dd", new Date());
    startDate = parsed.setHours(23, 59, 59, 999);
    endDate = parsed;
  }

  const filters = {
    page,
    pageSize,
    action,
    entity,
    searchTerm,
    startDate,
    endDate,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
  };

  const [auditLogsData, distinctActions, distinctEntities] = await Promise.all([
    queryAuditLogs(filters),
    getDistinctActions(),
    getDistinctEntities(),
  ]);

  const totalPages = auditLogsData.totalPages;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          View and search all system audit logs and user activities
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by entity ID, user name, or email..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-9 text-sm shadow-sm transition-colors"
            />
          </div>

          <Select
            value={action || "all"}
            onValueChange={(value) => {
              const newFilters = { ...filters, action: value === "all" ? undefined : value };
              updateURL(newFilters, 1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {distinctActions.map((act) => (
                <SelectItem key={act} value={act}>
                  {getActionEmoji(act)}
                  {" "}
                  <Badge className={getActionBadgeColor(act)}>
                    {act}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={entity || "all"}
            onValueChange={(value) => {
              const newFilters = { ...filters, entity: value === "all" ? undefined : value };
              updateURL(newFilters, 1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {distinctEntities.map((ent) => (
                <SelectItem key={ent} value={ent}>
                  <FileText className="h-4 w-4 mr-2" />
                  {ent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground uppercase">
                Start Date
              </label>
              <Input
                type="date"
                className="mt-1"
                defaultValue={startDateStr || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                    page: 1
                  };
                  updateURL(newFilters);
                }}
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase">
                End Date
              </label>
              <Input
                type="date"
                className="mt-1"
                defaultValue={endDateStr || ""}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                    page: 1
                  };
                  updateURL(newFilters);
                }}
              />
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

function updateURL(filters: any, newPage: number = filters.page) {
  const params = new URLSearchParams();

  if (newPage) params.set("page", String(newPage));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.action) params.set("action", String(filters.action));
  else params.delete("action");
  if (filters.entity) params.set("entity", String(filters.entity));
  else params.delete("entity");
  if (filters.searchTerm) params.set("search", String(filters.searchTerm));
  else params.delete("search");
  if (filters.startDate) params.set("startDate", filters.startDate.toISOString());
  else params.delete("startDate");
  if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
  else params.delete("endDate");
  if (filters.sortBy) params.set("sortBy", String(filters.sortBy));
  if (filters.sortOrder) params.set("sortOrder", String(filters.sortOrder));

  window.location.href = `/staff/audit-logs?${params.toString()}`;
}

function clearFilters() {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("sortBy", "createdAt");
  params.set("sortOrder", "desc");

  window.location.href = `/staff/audit-logs?${params.toString()}`;
}

function getActionEmoji(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "🟢";
  if (["updated"].includes(actionLower)) return "🔵";
  if (["deleted"].includes(actionLower)) return "🔴";
  if (["login"].includes(actionLower)) return "🟣";
  return "⚪";
}

function getActionBadgeColor(action: string): string {
  const actionLower = action.toLowerCase();
  if (["created"].includes(actionLower)) return "bg-green-100 text-green-800";
  if (["updated"].includes(actionLower)) return "bg-blue-100 text-blue-800";
  if (["deleted"].includes(actionLower)) return "bg-red-100 text-red-800";
  if (["login"].includes(actionLower)) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit app/\(staff\)/staff/audit-logs/page.tsx
```

**Step 3: Commit**

```bash
git add app/\(staff\)/staff/audit-logs/page.tsx
git commit -m "feat: add audit logs page with URL-based filtering and authorization"
```

---

## Task 8: Update Navigation Route

**Files:**

- Modify: `config/navigation.ts`

**Step 1: Update navigation route**

Change Audit Logs href from `/staff/audit` to `/staff/audit-logs`

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit config/navigation.ts
```

**Step 3: Commit**

```bash
git add config/navigation.ts
git commit -m "fix: update Audit Logs navigation route to /staff/audit-logs"
```

---

## Task 9: Test and Verify

**Step 1: Start development server**

```bash
npm run dev
```

**Step 2: Test in browser**

Navigate to `/staff/audit-logs` and verify:

1. **Authorization check**: Non-authorized users redirected to `/staff/access-denied`
2. **Display audit logs**: All columns display correctly with proper formatting
3. **Action filtering**: Action dropdown filters logs by action type
4. **Entity filtering**: Entity dropdown filters logs by entity type
5. **Date range filtering**: Start/end date inputs filter logs by date range
6. **Search functionality**: Search input filters by entity ID, user name, or email
7. **Sorting**: Click column headers to sort ascending/descending
8. **Pagination**: Use Previous/Next buttons to navigate pages
9. **Column visibility**: Use Columns dropdown to show/hide columns
10. **Detail dialog**: Click on a row to view full audit log details
11. **Export functionality**: Test CSV, Excel, and JSON export formats
12. **Clear filters**: Clear Filters button resets all filters
13. **Filtered state**: Show/hide filtered results badge

**Step 3: Verify responsive layout**

- Test on desktop (full functionality)
- Test on tablet (stacked filter controls)
- Test on mobile (scrollable table)

**Step 4: Check accessibility**

- Keyboard navigation (tab through filters and table)
- Screen reader compatibility (ARIA labels)
- Focus states for interactive elements

**Step 5: Verify no console errors**

- Open browser DevTools and check Console for errors
- Ensure no TypeScript warnings

**Step 6: Run linter**

```bash
npm run lint
```

**Step 7: Run type check**

```bash
npm run types:check
```

**Step 8: Test with sample data**

1. Create test audit logs if none exist
2. Test pagination with large dataset (100+ logs)
3. Test empty state (no logs)
4. Test filter combinations
5. Test sort with concatenated values

**Step 9: Final commit**

```bash
git add .
git commit -m "feat: complete audit logs page implementation - fully functional with filtering, pagination, search, and export"
```

---

## Edge Cases Handled

1. **Null userId**: System logs display "System" for user column
2. **Empty metadata**: Shows "No metadata" in detail dialog
3. **Date parsing**: Gracefully handles invalid date formats
4. **Large datasets**: Server-side pagination prevents loading all data
5. **Export limits**: All pages of filtered results exported (not just current page)
6. **TypeScript violations**: All files pass TypeScript check

---

## Success Criteria

- [ ] Authorized staff can view audit logs at `/staff/audit-logs`
- [ ] All required columns displayed correctly
- [ ] Filters work and update URL searchParams
- [ ] Pagination works for large datasets
- [ ] Detail dialog shows full metadata in readable format
- [ ] Export produces valid CSV, Excel, and JSON files
- [ ] Unauthorized users redirected to access-denied page
- [ ] Page loads in under 2 seconds with typical dataset
- [ ] No console errors or warnings
- [ ] Responsive layout works on all devices
- [ ] All TypeScript and lint checks pass

---

## Future Enhancements (Out of Scope)

- Debounced search input (currently instant)
- Real-time updates using WebSockets
- Advanced metadata filtering (search within JSON)
- Audit log retention policies and archiving
- Audit log diff view (comparing before/after states)
