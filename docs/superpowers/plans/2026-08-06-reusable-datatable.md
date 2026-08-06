# Reusable DataTable Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `<DataTable>` component powered by TanStack Table (engine) and Shadcn UI (presentation) for use across staff and client portals.

**Architecture:** TanStack Table is fully encapsulated inside `components/shared/data-table/`. Feature modules define column definitions, filters, and bulk actions using standard TanStack `ColumnDef<TData>` types, but never import or interact with TanStack APIs directly. The DataTable is presentation-only — no knowledge of Drizzle, BetterAuth, React Query, or Server Actions.

**Tech Stack:** Next.js 16, React 19, TanStack Table v8, Shadcn UI (Base UI primitives), Tailwind CSS 4, TypeScript 5

**Design Spec:** `docs/superpowers/specs/2026-08-06-reusable-datatable-design.md`

## Global Constraints

- No `any` types — use `unknown` and narrow with type guards
- TanStack Table types are only imported inside `components/shared/data-table/` and its hooks
- Feature modules use `ColumnDef<TData>` from `@tanstack/react-table` for column definitions only (this is the one approved exception)
- All new files use `'use client'` directive (client components)
- Follow existing Shadcn UI patterns from `components/ui/`
- Use `cn()` from `@/lib/utils` for class merging
- Use `lucide-react` for icons
- Persistence uses `localStorage` with SSR guard (`typeof window === 'undefined'`)
- Storage key format: `datatable:v1:{tableId}`

---

## File Structure

### Shared DataTable (`components/shared/data-table/`)

| File                             | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `types.ts`                       | Public type definitions, column meta augmentation |
| `utils.ts`                       | `getValue()` utility for nested field access      |
| `hooks/use-search.ts`            | Returns `globalFilterFn` for TanStack             |
| `hooks/use-table-persistence.ts` | localStorage read/write with debouncing           |
| `hooks/use-export.ts`            | CSV and Excel export pipeline                     |
| `hooks/use-data-table.ts`        | Orchestrator — initializes TanStack Table         |
| `column-header.tsx`              | Sortable column header component                  |
| `view-options.tsx`               | Column visibility toggle dropdown                 |
| `faceted-filter.tsx`             | Checkbox-based filter component                   |
| `export-menu.tsx`                | CSV/Excel export dropdown                         |
| `bulk-actions.tsx`               | Multi-select action bar                           |
| `toolbar.tsx`                    | Search input + filters + export + view options    |
| `pagination.tsx`                 | Page controls + rows-per-page selector            |
| `loading.tsx`                    | Skeleton loading state                            |
| `empty-state.tsx`                | No data state                                     |
| `data-table.tsx`                 | Public `<DataTable>` component                    |
| `index.ts`                       | Public exports                                    |

### Feature: Users (`features/users/table/`)

| File               | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `columns.tsx`      | `ColumnDef<UserWithProfile>[]` definitions           |
| `filters.ts`       | `DataTableFilter[]` definitions                      |
| `bulk-actions.tsx` | `DataTableBulkAction<UserWithProfile>[]` definitions |
| `index.ts`         | Re-exports                                           |

### Feature: Users Page Integration

| File                                                      | Action                          |
| --------------------------------------------------------- | ------------------------------- |
| `app/(staff)/staff/users/components/user-table.tsx`       | Replace with `<UsersDataTable>` |
| `app/(staff)/staff/users/components/users-data-table.tsx` | New wrapper component           |

---

### Task 1: Install Dependencies and Add Missing Shadcn Components

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install npm dependencies**

```bash
cd /home/zealish/Projects/NextJS/wixvora
pnpm add @tanstack/react-table export-to-csv xlsx
```

Expected: Dependencies added to `package.json`.

- [ ] **Step 2: Add missing Shadcn components**

```bash
pnpm dlx shadcn@latest add badge popover command
```

Expected: `badge.tsx`, `popover.tsx`, `command.tsx` created in `components/ui/`.

- [ ] **Step 3: Verify installation**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml components/ui/badge.tsx components/ui/popover.tsx components/ui/command.tsx
git commit -m "chore: add tanstack/react-table, export-to-csv, xlsx, and shadcn badge/popover/command"
```

---

### Task 2: Create Types and Utilities

**Files:**

- Create: `components/shared/data-table/types.ts`
- Create: `components/shared/data-table/utils.ts`

**Produces:**

- All public type interfaces used by every subsequent task
- `getValue()` utility used by `use-search.ts` and `use-export.ts`

- [ ] **Step 1: Create `types.ts`**

Create `components/shared/data-table/types.ts`:

```typescript
import type {
  ColumnDef,
  Column,
  InitialTableState,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  FilterFn,
  Table as TanStackTable,
} from "@tanstack/react-table";

// String path to support nested access (e.g. 'staff.department')
export type DataTableField = string;

export interface DataTableProps<TData> {
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  rowId?: (row: TData) => string;
  loading?: boolean;
  error?: Error | null;
  initialState?: Partial<InitialTableState>;
  enabledFeatures?: Partial<DataTableFeatures>;
  search?: DataTableSearch;
  filters?: DataTableFilter[];
  bulkActions?: DataTableBulkAction<TData>[];
  exportOptions?: DataTableExportOptions<TData>;
  pagination?: PaginationState;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (filter: string) => void;
  locale?: DataTableLocale;
  slots?: DataTableSlots<TData>;
}

export interface DataTableFeatures {
  sorting: boolean;
  filtering: boolean;
  pagination: boolean;
  export: boolean;
  rowSelection: boolean;
  columnVisibility: boolean;
}

export interface DataTableSearch {
  keys: DataTableField[];
  placeholder?: string;
  debounce?: number;
}

export interface DataTableFilter {
  id: string;
  label: string;
  type: "faceted" | "advanced";
  column: DataTableField;
  options?: FilterOption[];
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableBulkAction<TData> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive";
  onAction: (context: BulkActionContext<TData>) => void | Promise<void>;
}

export interface BulkActionContext<TData> {
  rows: TData[];
  table: DataTableInstance<TData>;
}

export interface DataTableExportOptions<TData> {
  csv?: boolean;
  excel?: boolean;
  filename?: string;
  excludeColumns?: string[];
  onlySelected?: boolean;
  transform?: (row: TData) => unknown;
}

export interface DataTableLocale {
  searchPlaceholder?: string;
  noResults?: string;
  rowsSelected?: (count: number) => string;
  loading?: string;
  error?: string;
  export?: {
    csv?: string;
    excel?: string;
  };
}

export interface DataTableSlots<TData> {
  emptyState?: React.ComponentType;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error: Error }>;
  toolbar?: React.ComponentType<{ table: DataTableInstance<TData> }>;
}

export interface DataTableInstance<TData> {
  getSelectedRows: () => TData[];
  resetRowSelection: () => void;
}

// Column meta augmentation for DataTable-specific features
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    label?: string;
    filterVariant?: "text" | "select" | "date" | "number";
    exportable?: boolean;
    searchable?: boolean;
    copyable?: boolean;
    align?: "left" | "center" | "right";
    width?: number;
    className?: string;
    headerClassName?: string;
    sortableLabel?: string;
    tooltip?: string;
    truncate?: boolean;
    exportFormatter?: (value: unknown) => string | number | boolean | null;
  }
}
```

- [ ] **Step 2: Create `utils.ts`**

Create `components/shared/data-table/utils.ts`:

```typescript
export function getValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string
): T | undefined {
  if (!path) return obj as T;
  const keys = path.split(".");
  let result: unknown = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = (result as Record<string, unknown>)[key];
  }
  return result as T;
}

export function formatExportValue(
  value: unknown
): string | number | boolean | null {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0];
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return "";
  }
  return value as string | number | boolean;
}
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/data-table/types.ts components/shared/data-table/utils.ts
git commit -m "feat: add DataTable types and utilities"
```

---

### Task 3: Create Hooks — use-search and use-table-persistence

**Files:**

- Create: `components/shared/data-table/hooks/use-search.ts`
- Create: `components/shared/data-table/hooks/use-table-persistence.ts`

**Consumes:** `DataTableSearch` from `types.ts`, `getValue` from `utils.ts`
**Produces:** `useSearch()`, `useTablePersistence()` — used by `use-data-table.ts`

- [ ] **Step 1: Create `use-search.ts`**

Create `components/shared/data-table/hooks/use-search.ts`:

```typescript
import { useCallback } from "react";
import type { FilterFn } from "@tanstack/react-table";
import type { DataTableSearch } from "../types";
import { getValue } from "../utils";

export function useSearch<TData>(
  search?: DataTableSearch
): FilterFn<TData> | undefined {
  if (!search) return undefined;

  const globalFilterFn: FilterFn<TData> = useCallback(
    (row, _columnId, filterValue) => {
      if (!filterValue || typeof filterValue !== "string") return true;
      const searchLower = filterValue.toLowerCase();
      return search.keys.some((key) => {
        const value = getValue(row.original as Record<string, unknown>, key);
        return String(value ?? "")
          .toLowerCase()
          .includes(searchLower);
      });
    },
    [search.keys]
  );

  return globalFilterFn;
}
```

- [ ] **Step 2: Create `use-table-persistence.ts`**

Create `components/shared/data-table/hooks/use-table-persistence.ts`:

```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnSizingState,
} from "@tanstack/react-table";

const STORAGE_VERSION = "v1";

interface PersistedTableState {
  sorting?: SortingState;
  columnVisibility?: VisibilityState;
  columnSizing?: ColumnSizingState;
  columnOrder?: string[];
  pageSize?: number;
  globalFilter?: string;
  columnFilters?: ColumnFiltersState;
}

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced as T & { cancel: () => void };
}

export function useTablePersistence(tableId: string) {
  const storageKey = `datatable:${STORAGE_VERSION}:${tableId}`;

  const savedState = useMemo((): PersistedTableState => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as PersistedTableState) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const debouncedSave = useRef(
    debounce((state: PersistedTableState) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.warn("Failed to persist table state:", error);
      }
    }, 500)
  );

  useEffect(() => {
    return () => {
      debouncedSave.current.cancel();
    };
  }, []);

  const saveState = useCallback((state: PersistedTableState) => {
    debouncedSave.current(state);
  }, []);

  return { savedState, saveState };
}
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/data-table/hooks/use-search.ts components/shared/data-table/hooks/use-table-persistence.ts
git commit -m "feat: add useSearch and useTablePersistence hooks"
```

---

### Task 4: Create Hook — use-export

**Files:**

- Create: `components/shared/data-table/hooks/use-export.ts`

**Consumes:** `DataTableExportOptions`, `DataTableInstance` from `types.ts`, `getValue`, `formatExportValue` from `utils.ts`
**Produces:** `useExport()` — used by `use-data-table.ts`

- [ ] **Step 1: Create `use-export.ts`**

Create `components/shared/data-table/hooks/use-export.ts`:

```typescript
import { useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { DataTableExportOptions, DataTableInstance } from "../types";
import { getValue, formatExportValue } from "../utils";

interface UseExportOptions<TData> {
  exportOptions: DataTableExportOptions<TData>;
  columns: ColumnDef<TData, unknown>[];
  getInstance: () => DataTableInstance<TData>;
  getAllRows: () => TData[];
}

export function useExport<TData>({
  exportOptions,
  columns,
  getInstance,
  getAllRows,
}: UseExportOptions<TData>) {
  const prepareExportData = useCallback(() => {
    // 1. Get rows (selected or all)
    let rows: unknown[] = exportOptions.onlySelected
      ? getInstance().getSelectedRows()
      : getAllRows();

    // 2. Transform if provided
    if (exportOptions.transform) {
      rows = rows.map(exportOptions.transform);
    }

    // 3. Filter columns to exportable ones
    const exportableColumns = columns.filter((col) => {
      const id = col.id ?? (col.accessorKey as string);
      if (exportOptions.excludeColumns?.includes(id)) return false;
      if (col.meta?.exportable === false) return false;
      return true;
    });

    // 4. Format values for export
    const formattedData = rows.map((row) => {
      const formatted: Record<string, string | number | boolean | null> = {};

      exportableColumns.forEach((col) => {
        const id = col.id ?? (col.accessorKey as string);
        const label = col.meta?.label ?? id;

        let value: unknown;
        if (col.accessorFn) {
          value = col.accessorFn(row as TData, 0);
        } else if (col.accessorKey) {
          value = getValue(
            row as Record<string, unknown>,
            col.accessorKey as string
          );
        }

        // Apply column-level formatter first, then default
        if (col.meta?.exportFormatter) {
          formatted[label] = col.meta.exportFormatter(value);
        } else {
          formatted[label] = formatExportValue(value);
        }
      });

      return formatted;
    });

    return formattedData;
  }, [exportOptions, columns, getInstance, getAllRows]);

  const exportCSV = useCallback(async () => {
    const { mkConfig, generateCsv, download } = await import("export-to-csv");
    const data = prepareExportData();
    const csvConfig = mkConfig({
      filename: exportOptions.filename ?? "export",
      fieldSeparator: ",",
      quoteStrings: true,
    });
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  }, [prepareExportData, exportOptions.filename]);

  const exportExcel = useCallback(async () => {
    const XLSX = await import("xlsx");
    const data = prepareExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${exportOptions.filename ?? "export"}.xlsx`);
  }, [prepareExportData, exportOptions.filename]);

  return { exportCSV, exportExcel, prepareExportData };
}
```

- [ ] **Step 2: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/data-table/hooks/use-export.ts
git commit -m "feat: add useExport hook with CSV and Excel export"
```

---

### Task 5: Create Hook — use-data-table (Orchestrator)

**Files:**

- Create: `components/shared/data-table/hooks/use-data-table.ts`

**Consumes:** All hooks from Tasks 3-4, `DataTableProps` from `types.ts`
**Produces:** `useDataTable()` — the central orchestrator hook

- [ ] **Step 1: Create `use-data-table.ts`**

Create `components/shared/data-table/hooks/use-data-table.ts`:

```typescript
"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type PaginationState,
} from "@tanstack/react-table";
import type { DataTableProps, DataTableInstance } from "../types";
import { useSearch } from "./use-search";
import { useTablePersistence } from "./use-table-persistence";
import { useExport } from "./use-export";

const DEFAULT_PAGE_SIZE = 10;

export function useDataTable<TData>(props: DataTableProps<TData>) {
  const {
    tableId,
    data,
    columns,
    rowId,
    initialState: initialStateProp,
    enabledFeatures,
    search,
    pagination: controlledPagination,
    pageCount,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    exportOptions,
  } = props;

  // Detect controlled (server-side) mode
  const isControlledPagination =
    controlledPagination !== undefined && onPaginationChange !== undefined;
  const isControlledSorting = onSortingChange !== undefined;
  const isControlledFiltering = onColumnFiltersChange !== undefined;

  // Persistence
  const { savedState, saveState } = useTablePersistence(tableId);

  // Global search via TanStack's filter system
  const globalFilterFn = useSearch<TData>(search);

  // Internal pagination state for client-side mode
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: savedState.pageSize ?? DEFAULT_PAGE_SIZE,
    });

  const pagination = isControlledPagination
    ? controlledPagination
    : internalPagination;

  const handlePaginationChange = isControlledPagination
    ? onPaginationChange
    : setInternalPagination;

  // Merge initial state
  const mergedInitialState = useMemo(
    () => ({
      ...savedState,
      ...initialStateProp,
    }),
    [savedState, initialStateProp]
  );

  // Row ID function
  const getRowId = rowId
    ? (row: TData, index: number, parent?: { id: string }) =>
        parent ? `${parent.id}-${rowId(row)}` : rowId(row)
    : undefined;

  // Initialize TanStack Table
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      ...(mergedInitialState.sorting && {
        sorting: mergedInitialState.sorting,
      }),
      ...(mergedInitialState.columnVisibility && {
        columnVisibility: mergedInitialState.columnVisibility,
      }),
      ...(mergedInitialState.columnSizing && {
        columnSizing: mergedInitialState.columnSizing,
      }),
    },
    initialState: mergedInitialState,
    onPaginationChange: handlePaginationChange,
    onSortingChange: isControlledSorting ? onSortingChange : undefined,
    onColumnFiltersChange: isControlledFiltering
      ? onColumnFiltersChange
      : undefined,
    onGlobalFilterChange: onGlobalFilterChange,
    ...(globalFilterFn && { globalFilterFn }),
    getRowId,
    manualPagination: isControlledPagination,
    manualSorting: isControlledSorting,
    manualFiltering: isControlledFiltering,
    ...(isControlledPagination && pageCount !== undefined && { pageCount }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: enabledFeatures?.rowSelection ?? false,
  });

  // Watch specific state slices for persistence
  const { sorting, columnVisibility, columnSizing } = table.getState();

  React.useEffect(() => {
    saveState({
      sorting,
      columnVisibility,
      columnSizing,
      pageSize: pagination.pageSize,
    });
  }, [sorting, columnVisibility, columnSizing, pagination.pageSize, saveState]);

  // Export
  const { exportCSV, exportExcel, prepareExportData } = useExport<TData>({
    exportOptions: exportOptions ?? { csv: false, excel: false },
    columns,
    getInstance: () => instance,
    getAllRows: () => table.getRowModel().rows.map((r) => r.original),
  });

  // Expose minimal instance
  const instance: DataTableInstance<TData> = useMemo(
    () => ({
      getSelectedRows: () =>
        table.getSelectedRowModel().rows.map((r) => r.original),
      resetRowSelection: () => table.resetRowSelection(),
    }),
    [table]
  );

  return {
    table,
    instance,
    exportCSV,
    exportExcel,
    prepareExportData,
    pagination,
    setPagination: handlePaginationChange,
  };
}
```

Note: This hook imports `React` for `useState` and `useEffect`. Ensure `import React from 'react'` is present.

- [ ] **Step 2: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/data-table/hooks/use-data-table.ts
git commit -m "feat: add useDataTable orchestrator hook"
```

---

### Task 6: Create UI Components — Column Header and View Options

**Files:**

- Create: `components/shared/data-table/column-header.tsx`
- Create: `components/shared/data-table/view-options.tsx`

**Consumes:** Existing Shadcn UI components (`Button`, `DropdownMenu`, `Tooltip`)
**Produces:** `DataTableColumnHeader`, `DataTableViewOptions` — used by `data-table.tsx`

- [ ] **Step 1: Create `column-header.tsx`**

Create `components/shared/data-table/column-header.tsx`:

```typescript
'use client';

import type { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
              <span>{column.meta?.sortableLabel ?? title}</span>
              {column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 size-4" />
              ) : column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 size-4" />
              ) : (
                <ArrowUpDown className="ml-2 size-4" />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 size-3.5 text-muted-foreground" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 size-3.5 text-muted-foreground" />
            Desc
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                <EyeOff className="mr-2 size-3.5 text-muted-foreground" />
                Hide
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

- [ ] **Step 2: Create `view-options.tsx`**

Create `components/shared/data-table/view-options.tsx`:

```typescript
'use client';

import type { Table as TanStackTable } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableViewOptionsProps<TData> {
  table: TanStackTable<TData>;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2 className="mr-2 size-4" />
            Columns
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.meta?.label ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/data-table/column-header.tsx components/shared/data-table/view-options.tsx
git commit -m "feat: add DataTableColumnHeader and DataTableViewOptions components"
```

---

### Task 7: Create UI Components — Faceted Filter and Export Menu

**Files:**

- Create: `components/shared/data-table/faceted-filter.tsx`
- Create: `components/shared/data-table/export-menu.tsx`

**Consumes:** Existing Shadcn UI components (`Popover`, `Command`, `Button`, `Badge`, `Separator`)
**Produces:** `DataTableFacetedFilter`, `DataTableExportMenu` — used by `toolbar.tsx`

- [ ] **Step 1: Create `faceted-filter.tsx`**

Create `components/shared/data-table/faceted-filter.tsx`:

```typescript
'use client';

import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import { Check, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { FilterOption } from './types';

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: FilterOption[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column.getFacetedUniqueValues();
  const selectedValues = new Set(column.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <PlusCircle className="mr-2 size-4" />
            {title}
            {selectedValues.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="size-4" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Create `export-menu.tsx`**

Create `components/shared/data-table/export-menu.tsx`:

```typescript
'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableExportMenuProps {
  csv?: boolean;
  excel?: boolean;
  onExportCSV: () => void;
  onExportExcel: () => void;
  labels?: {
    csv?: string;
    excel?: string;
  };
}

export function DataTableExportMenu({
  csv = true,
  excel = true,
  onExportCSV,
  onExportExcel,
  labels,
}: DataTableExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {csv && (
          <DropdownMenuItem onClick={onExportCSV}>
            <FileText className="mr-2 size-4" />
            {labels?.csv ?? 'Export CSV'}
          </DropdownMenuItem>
        )}
        {excel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 size-4" />
            {labels?.excel ?? 'Export Excel'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 3: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add components/shared/data-table/faceted-filter.tsx components/shared/data-table/export-menu.tsx
git commit -m "feat: add DataTableFacetedFilter and DataTableExportMenu components"
```

---

### Task 8: Create UI Components — Bulk Actions, Toolbar, and Pagination

**Files:**

- Create: `components/shared/data-table/bulk-actions.tsx`
- Create: `components/shared/data-table/toolbar.tsx`
- Create: `components/shared/data-table/pagination.tsx`

**Consumes:** `DataTableBulkAction`, `DataTableInstance` from `types.ts`, `DataTableFacetedFilter`, `DataTableExportMenu`
**Produces:** `DataTableBulkActions`, `DataTableToolbar`, `DataTablePagination` — used by `data-table.tsx`

- [ ] **Step 1: Create `bulk-actions.tsx`**

Create `components/shared/data-table/bulk-actions.tsx`:

```typescript
'use client';

import { X } from 'lucide-react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { DataTableBulkAction, DataTableInstance } from './types';

interface DataTableBulkActionsProps<TData> {
  table: TanStackTable<TData>;
  instance: DataTableInstance<TData>;
  actions: DataTableBulkAction<TData>[];
  rowsSelectedLabel?: (count: number) => string;
}

export function DataTableBulkActions<TData>({
  table,
  instance,
  actions,
  rowsSelectedLabel,
}: DataTableBulkActionsProps<TData>) {
  const selectedCount = table.getSelectedRowModel().rows.length;

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
      <span className="text-sm text-muted-foreground">
        {rowsSelectedLabel
          ? rowsSelectedLabel(selectedCount)
          : `${selectedCount} selected`}
      </span>

      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
          size="sm"
          className="h-7"
          onClick={() => {
            const rows = table
              .getSelectedRowModel()
              .rows.map((r) => r.original);
            action.onAction({ rows, table: instance });
          }}
        >
          {action.icon && <action.icon className="mr-1.5 size-3.5" />}
          {action.label}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2"
        onClick={() => table.resetRowSelection()}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `toolbar.tsx`**

Create `components/shared/data-table/toolbar.tsx`:

```typescript
'use client';

import type { Table as TanStackTable } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type {
  DataTableSearch,
  DataTableFilter,
  DataTableExportOptions,
  DataTableBulkAction,
  DataTableInstance,
} from './types';
import { DataTableFacetedFilter } from './faceted-filter';
import { DataTableExportMenu } from './export-menu';
import { DataTableViewOptions } from './view-options';
import { DataTableBulkActions } from './bulk-actions';

interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
  instance: DataTableInstance<TData>;
  search?: DataTableSearch;
  filters?: DataTableFilter[];
  exportOptions?: DataTableExportOptions<TData>;
  bulkActions?: DataTableBulkAction<TData>[];
  onExportCSV: () => void;
  onExportExcel: () => void;
  showColumnToggle?: boolean;
  locale?: {
    searchPlaceholder?: string;
    rowsSelected?: (count: number) => string;
    export?: { csv?: string; excel?: string };
  };
}

export function DataTableToolbar<TData>({
  table,
  instance,
  search,
  filters,
  exportOptions,
  bulkActions,
  onExportCSV,
  onExportExcel,
  showColumnToggle,
  locale,
}: DataTableToolbarProps<TData>) {
  const globalFilter = table.getState().globalFilter as string;

  return (
    <div className="space-y-2">
      {/* Bulk actions bar */}
      {bulkActions && bulkActions.length > 0 && (
        <DataTableBulkActions
          table={table}
          instance={instance}
          actions={bulkActions}
          rowsSelectedLabel={locale?.rowsSelected}
        />
      )}

      {/* Toolbar row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2">
          {/* Search input */}
          {search && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={
                  locale?.searchPlaceholder ?? search.placeholder ?? 'Search...'
                }
                value={globalFilter ?? ''}
                onChange={(e) =>
                  table.setGlobalFilter(e.target.value)
                }
                className="h-8 w-[150px] pl-8 lg:w-[250px]"
              />
            </div>
          )}

          {/* Faceted filters */}
          {filters?.map((filter) => {
            const column = table.getColumn(filter.column);
            if (!column) return null;

            if (filter.type === 'faceted' && filter.options) {
              return (
                <DataTableFacetedFilter
                  key={filter.id}
                  column={column}
                  title={filter.label}
                  options={filter.options}
                />
              );
            }

            return null;
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          {exportOptions?.csv || exportOptions?.excel ? (
            <DataTableExportMenu
              csv={exportOptions.csv}
              excel={exportOptions.excel}
              onExportCSV={onExportCSV}
              onExportExcel={onExportExcel}
              labels={locale?.export}
            />
          ) : null}

          {/* Column visibility */}
          {showColumnToggle && <DataTableViewOptions table={table} />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `pagination.tsx`**

Create `components/shared/data-table/pagination.tsx`:

```typescript
'use client';

import type { Table as TanStackTable } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add components/shared/data-table/bulk-actions.tsx components/shared/data-table/toolbar.tsx components/shared/data-table/pagination.tsx
git commit -m "feat: add DataTableBulkActions, Toolbar, and Pagination components"
```

---

### Task 9: Create UI Components — Loading, Empty State, and Main DataTable

**Files:**

- Create: `components/shared/data-table/loading.tsx`
- Create: `components/shared/data-table/empty-state.tsx`
- Create: `components/shared/data-table/data-table.tsx`
- Create: `components/shared/data-table/index.ts`

**Consumes:** All previous components and hooks
**Produces:** The public `<DataTable>` component

- [ ] **Step 1: Create `loading.tsx`**

Create `components/shared/data-table/loading.tsx`:

```typescript
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function DataTableLoading() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 border-b p-4 last:border-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `empty-state.tsx`**

Create `components/shared/data-table/empty-state.tsx`:

```typescript
'use client';

import { Inbox } from 'lucide-react';

interface DataTableEmptyStateProps {
  message?: string;
}

export function DataTableEmptyState({
  message = 'No results found.',
}: DataTableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Inbox className="mb-4 size-12" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
```

- [ ] **Step 3: Create `data-table.tsx`**

Create `components/shared/data-table/data-table.tsx`:

```typescript
'use client';

import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { DataTableProps } from './types';
import { useDataTable } from './hooks/use-data-table';
import { DataTableColumnHeader } from './column-header';
import { DataTableToolbar } from './toolbar';
import { DataTablePagination } from './pagination';
import { DataTableLoading } from './loading';
import { DataTableEmptyState } from './empty-state';

export function DataTable<TData>(props: DataTableProps<TData>) {
  const {
    data,
    columns,
    loading,
    error,
    enabledFeatures,
    search,
    filters,
    exportOptions,
    bulkActions,
    locale,
    slots,
    pagination: controlledPagination,
    pageCount,
  } = props;

  const { table, instance, exportCSV, exportExcel } = useDataTable(props);

  // Priority 1: Loading
  if (loading) {
    return slots?.loading ? <slots.loading /> : <DataTableLoading />;
  }

  // Priority 2: Error
  if (error) {
    return slots?.error ? (
      <slots.error error={error} />
    ) : (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <p className="text-sm">{locale?.error ?? error.message}</p>
      </div>
    );
  }

  // Priority 3: Empty
  if (data.length === 0) {
    return slots?.emptyState ? (
      <slots.emptyState />
    ) : (
      <DataTableEmptyState message={locale?.noResults} />
    );
  }

  // Priority 4: Table content
  const isControlledPagination =
    controlledPagination !== undefined && props.onPaginationChange !== undefined;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {slots?.toolbar ? (
        <slots.toolbar table={instance} />
      ) : (
        <DataTableToolbar
          table={table}
          instance={instance}
          search={search}
          filters={filters}
          exportOptions={exportOptions}
          bulkActions={bulkActions}
          onExportCSV={exportCSV}
          onExportExcel={exportExcel}
          showColumnToggle={enabledFeatures?.columnVisibility}
          locale={locale}
        />
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(header.column.meta?.headerClassName)}
                    style={
                      header.column.meta?.width
                        ? { width: header.column.meta.width }
                        : undefined
                    }
                  >
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
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(cell.column.meta?.className, {
                      'text-center': cell.column.meta?.align === 'center',
                      'text-right': cell.column.meta?.align === 'right',
                    })}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enabledFeatures?.pagination && <DataTablePagination table={table} />}
    </div>
  );
}
```

- [ ] **Step 4: Create `index.ts`**

Create `components/shared/data-table/index.ts`:

```typescript
export { DataTable } from "./data-table";
export type {
  DataTableProps,
  DataTableFeatures,
  DataTableSearch,
  DataTableFilter,
  FilterOption,
  DataTableBulkAction,
  BulkActionContext,
  DataTableExportOptions,
  DataTableLocale,
  DataTableSlots,
  DataTableInstance,
  DataTableField,
} from "./types";
```

- [ ] **Step 5: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 6: Commit**

```bash
git add components/shared/data-table/loading.tsx components/shared/data-table/empty-state.tsx components/shared/data-table/data-table.tsx components/shared/data-table/index.ts
git commit -m "feat: add DataTable component with loading, empty state, and public API"
```

---

### Task 10: Create Users Table Configuration and Integrate into Page

**Files:**

- Create: `features/users/table/columns.tsx`
- Create: `features/users/table/filters.ts`
- Create: `features/users/table/bulk-actions.tsx`
- Create: `features/users/table/index.ts`
- Create: `app/(staff)/staff/users/components/users-data-table.tsx`
- Modify: `app/(staff)/staff/users/components/user-table.tsx`

**Consumes:** `DataTable` from `components/shared/data-table`, `ColumnDef` from `@tanstack/react-table`, `UserWithProfile` from `features/users/types`
**Produces:** Working UsersDataTable integrated into the staff users page

- [ ] **Step 1: Create `features/users/table/columns.tsx`**

Create `features/users/table/columns.tsx`:

```typescript
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { UserWithProfile } from '@/features/users/types';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/shared/data-table/column-header';

export const userColumns: ColumnDef<UserWithProfile, unknown>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Name',
      filterVariant: 'text',
      searchable: true,
      exportable: true,
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Email',
      filterVariant: 'text',
      searchable: true,
      copyable: true,
      exportable: true,
    },
  },
  {
    id: 'department',
    accessorFn: (row) => row.staff?.department ?? '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Department',
      filterVariant: 'select',
      exportable: true,
    },
  },
  {
    id: 'position',
    accessorFn: (row) => row.staff?.position ?? '-',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    enableSorting: true,
    meta: {
      label: 'Position',
      exportable: true,
    },
  },
  {
    id: 'status',
    accessorFn: (row) => row.staff?.employmentStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ getValue }) => {
      const value = getValue() as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return (
        <Badge variant={value === 'ACTIVE' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      filterVariant: 'select',
      exportable: true,
      align: 'center',
    },
  },
];
```

- [ ] **Step 2: Create `features/users/table/filters.ts`**

Create `features/users/table/filters.ts`:

```typescript
import type { DataTableFilter } from "@/components/shared/data-table";

export const userFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "faceted",
    column: "status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Terminated", value: "TERMINATED" },
    ],
  },
  {
    id: "department",
    label: "Department",
    type: "faceted",
    column: "department",
    options: [], // Dynamic: populated from data via getFacetedUniqueValues
  },
];
```

- [ ] **Step 3: Create `features/users/table/bulk-actions.tsx`**

Create `features/users/table/bulk-actions.tsx`:

```typescript
"use client";

import { Trash2 } from "lucide-react";
import type { DataTableBulkAction } from "@/components/shared/data-table";
import type { UserWithProfile } from "@/features/users/types";

export const userBulkActions: DataTableBulkAction<UserWithProfile>[] = [
  {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    variant: "destructive",
    onAction: async ({ rows }) => {
      // Placeholder: integrate with server action later
      console.log(
        "Delete users:",
        rows.map((r) => r.id)
      );
    },
  },
];
```

- [ ] **Step 4: Create `features/users/table/index.ts`**

Create `features/users/table/index.ts`:

```typescript
export { userColumns } from "./columns";
export { userFilters } from "./filters";
export { userBulkActions } from "./bulk-actions";
```

- [ ] **Step 5: Create `app/(staff)/staff/users/components/users-data-table.tsx`**

Create `app/(staff)/staff/users/components/users-data-table.tsx`:

```typescript
'use client';

import { DataTable } from '@/components/shared/data-table';
import type { UserWithProfile } from '@/features/users/types';
import { userColumns } from '@/features/users/table/columns';
import { userFilters } from '@/features/users/table/filters';
import { userBulkActions } from '@/features/users/table/bulk-actions';

interface UsersDataTableProps {
  users: UserWithProfile[];
  isLoading?: boolean;
}

export function UsersDataTable({ users, isLoading }: UsersDataTableProps) {
  return (
    <DataTable
      tableId="staff-users"
      data={users}
      columns={userColumns}
      rowId={(row) => row.id}
      loading={isLoading}
      search={{ keys: ['name', 'email'] }}
      filters={userFilters}
      bulkActions={userBulkActions}
      exportOptions={{
        csv: true,
        excel: true,
        filename: 'users',
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
        searchPlaceholder: 'Search users...',
        noResults: 'No users found.',
        rowsSelected: (count) => `${count} selected`,
      }}
    />
  );
}
```

- [ ] **Step 6: Update existing `user-table.tsx` to use new component**

Read the current `app/(staff)/staff/users/page.tsx` to understand how `UserTable` is used, then replace its usage with `UsersDataTable`. If the page passes `users` as a prop, update the import and component name.

Update `app/(staff)/staff/users/components/user-table.tsx` to re-export from the new component for backward compatibility:

```typescript
// Backward-compatible re-export
export { UsersDataTable as UserTable } from "./users-data-table";
```

- [ ] **Step 7: Verify types compile**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 8: Run lint**

```bash
pnpm run lint
```

Expected: No lint errors.

- [ ] **Step 9: Commit**

```bash
git add features/users/table/ app/(staff)/staff/users/components/users-data-table.tsx app/(staff)/staff/users/components/user-table.tsx
git commit -m "feat: integrate DataTable with users table and create feature configuration"
```

---

### Task 11: Final Verification and Cleanup

- [ ] **Step 1: Run full type check**

```bash
pnpm run types:check
```

Expected: No type errors.

- [ ] **Step 2: Run lint**

```bash
pnpm run lint
```

Expected: No lint errors.

- [ ] **Step 3: Run format check**

```bash
pnpm run format:check
```

Expected: All files formatted correctly.

- [ ] **Step 4: Run build**

```bash
pnpm run build
```

Expected: Build succeeds without errors.

- [ ] **Step 5: Commit final fixes if needed**

If any fixes were needed:

```bash
git add -A
git commit -m "fix: address type/lint/format issues from DataTable implementation"
```

---

## Summary

| Task | Deliverable                         | Estimated Lines |
| ---- | ----------------------------------- | --------------- |
| 1    | Dependencies + Shadcn components    | 0               |
| 2    | Types + Utilities                   | ~140            |
| 3    | useSearch + useTablePersistence     | ~80             |
| 4    | useExport                           | ~90             |
| 5    | useDataTable                        | ~110            |
| 6    | ColumnHeader + ViewOptions          | ~100            |
| 7    | FacetedFilter + ExportMenu          | ~130            |
| 8    | BulkActions + Toolbar + Pagination  | ~200            |
| 9    | Loading + Empty + DataTable + index | ~150            |
| 10   | Users feature config + integration  | ~140            |
| 11   | Final verification                  | 0               |

**Total: ~1,140 lines across 20 files**
