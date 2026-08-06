# Reusable DataTable Component — Design Specification

**Date:** 2026-08-06
**Status:** Approved
**Scope:** Shared DataTable component for staff and client portals

---

## 1. Overview

### Problem

WixVora needs feature-rich data tables across staff and client portals. Building each table from scratch leads to duplicated code, inconsistent UX, and high maintenance cost.

### Solution

A reusable `<DataTable>` component built on TanStack Table (engine) with Shadcn UI (presentation). TanStack Table is fully encapsulated — feature modules never import or interact with TanStack APIs directly.

### Design Principles

- TanStack Table is an internal implementation detail
- Feature modules provide only configuration and data
- The public API is simple, generic, declarative, and type-safe
- Business logic stays inside feature modules
- DataTable is presentation-only — no knowledge of Drizzle, BetterAuth, React Query, or Server Actions

---

## 2. Architecture

### Data Flow

```
Page
    │
    ▼
Feature Wrapper (e.g. UsersDataTable)
    │
    ▼
DataTable (shared component)
    │
    ▼
useDataTable (orchestrator hook)
    │
    ├── useTablePersistence
    ├── useSearch
    ├── useExport
    └── TanStack Table
            │
            ▼
        Shadcn UI Components
```

### Component Structure

```
components/shared/data-table/
    ├── index.ts
    ├── data-table.tsx
    ├── toolbar.tsx
    ├── pagination.tsx
    ├── column-header.tsx
    ├── view-options.tsx
    ├── faceted-filter.tsx
    ├── advanced-filter.tsx
    ├── bulk-actions.tsx
    ├── export-menu.tsx
    ├── loading.tsx
    ├── empty-state.tsx
    ├── types.ts
    ├── utils.ts
    └── hooks/
        ├── use-data-table.ts
        ├── use-table-persistence.ts
        ├── use-export.ts
        └── use-search.ts
```

### Feature Structure (per table)

```
features/users/table/
    ├── index.ts
    ├── columns.tsx
    ├── filters.ts
    ├── bulk-actions.tsx
    └── toolbar.tsx
```

---

## 3. Public API

### Basic Usage

```tsx
<DataTable
  tableId="users"
  data={users}
  columns={userColumns}
  rowId={(row) => row.id}
  loading={isLoading}
  error={error}
  initialState={{
    sorting: [{ id: "createdAt", desc: true }],
    columnVisibility: { email: true, phone: false },
  }}
  enabledFeatures={{
    sorting: true,
    filtering: true,
    pagination: true,
    export: true,
    rowSelection: true,
    columnVisibility: true,
  }}
  search={{
    keys: ["name", "email"],
  }}
  filters={userFilters}
  bulkActions={[archiveAction, deleteAction, assignRoleAction]}
  exportOptions={{
    csv: true,
    excel: true,
    filename: "users",
  }}
  pagination={pagination}
  pageCount={pageCount}
  onPaginationChange={setPagination}
  locale={{
    searchPlaceholder: "Search users...",
    noResults: "No users found.",
    rowsSelected: (count) => `${count} selected`,
  }}
  slots={{
    emptyState: UsersEmptyState,
    loading: UsersLoading,
  }}
/>
```

### Props Reference

| Prop                    | Type                              | Required | Description                             |
| ----------------------- | --------------------------------- | -------- | --------------------------------------- |
| `tableId`               | `string`                          | Yes      | Unique identifier for state persistence |
| `data`                  | `TData[]`                         | Yes      | Array of data objects                   |
| `columns`               | `ColumnDef<TData>[]`              | Yes      | TanStack column definitions             |
| `rowId`                 | `(row: TData) => string`          | No       | Custom row identifier function          |
| `loading`               | `boolean`                         | No       | Shows loading state                     |
| `error`                 | `Error \| null`                   | No       | Shows error state                       |
| `initialState`          | `Partial<InitialTableState>`      | No       | Default sort, visibility, etc.          |
| `enabledFeatures`       | `Partial<DataTableFeatures>`      | No       | Feature toggles                         |
| `search`                | `DataTableSearch`                 | No       | Multi-column global search config       |
| `filters`               | `DataTableFilter[]`               | No       | Faceted and advanced filters            |
| `bulkActions`           | `DataTableBulkAction<TData>[]`    | No       | Multi-select actions                    |
| `exportOptions`         | `DataTableExportOptions<TData>`   | No       | CSV/Excel export config                 |
| `pagination`            | `PaginationState`                 | No       | Controlled pagination (server-side)     |
| `pageCount`             | `number`                          | No       | Total pages (server-side)               |
| `onPaginationChange`    | `(p: PaginationState) => void`    | No       | Pagination change handler               |
| `onSortingChange`       | `(s: SortingState) => void`       | No       | Server-side sorting handler             |
| `onColumnFiltersChange` | `(f: ColumnFiltersState) => void` | No       | Server-side filter handler              |
| `onGlobalFilterChange`  | `(f: string) => void`             | No       | Server-side global filter handler       |
| `locale`                | `DataTableLocale`                 | No       | i18n strings                            |
| `slots`                 | `DataTableSlots<TData>`           | No       | Custom render overrides                 |

---

## 4. Type Definitions

### Core Types

```typescript
import type {
  ColumnDef,
  InitialTableState,
  PaginationState,
  SortingState,
  ColumnFiltersState,
  FilterFn,
} from "@tanstack/react-table";

// String path to support nested access (e.g. 'staff.department').
// Could be replaced with DeepKeyOf<T> for stricter typing later.
export type DataTableField = string;

export interface DataTableProps<TData> {
  tableId: string;
  data: TData[];
  columns: ColumnDef<TData>[];
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
```

### Column Meta Extension

```typescript
declare module "@tanstack/react-table" {
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

### Column Configuration Pattern

Feature modules use TanStack's `ColumnDef<TData>` directly — no wrapper types.

```typescript
import type { ColumnDef } from '@tanstack/react-table';
import type { UserWithProfile } from '@/features/users/types';

export const userColumns: ColumnDef<UserWithProfile>[] = [
    {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
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
        header: 'Email',
        meta: {
            label: 'Email',
            filterVariant: 'text',
            searchable: true,
            copyable: true,
        },
    },
    {
        id: 'department',
        accessorFn: (row) => row.staff?.department ?? '-',
        header: 'Department',
        meta: {
            filterVariant: 'select',
            exportable: true,
        },
    },
    {
        id: 'status',
        accessorFn: (row) => row.staff?.employmentStatus,
        header: 'Status',
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return (
                <Badge variant={value === 'ACTIVE' ? 'default' : 'secondary'}>
                    {value}
                </Badge>
            );
        },
        meta: {
            filterVariant: 'select',
            exportable: true,
            align: 'center',
        },
    },
];
```

---

## 5. Internal Implementation

### Rendering Priority

The DataTable renders one state at a time, in fixed priority:

1. **Loading** — `slots.loading` or default skeleton
2. **Error** — `slots.error` or default error state
3. **Empty** — `slots.emptyState` or default empty message
4. **Table** — Full table with toolbar, rows, pagination

### `useDataTable` Hook (Orchestrator)

The only hook that instantiates TanStack Table.

**Responsibilities:**

- Initialize TanStack Table with proper config
- Detect client-side vs server-side via paired props (`pagination + onPaginationChange`)
- Expose minimal `DataTableInstance` interface
- Delegate persistence, search, export to sub-hooks

**Server-side detection:**

```typescript
const isControlledPagination =
  pagination !== undefined && onPaginationChange !== undefined;
```

**Global search** uses TanStack's `globalFilterFn` — no manual filtering pipeline.

### `useTablePersistence` Hook

**Responsibilities:**

- Load persisted state from `localStorage` on mount
- Save state changes (debounced at 500ms)
- Handle SSR safety (`typeof window === 'undefined'` guard)
- Support versioned storage keys for safe migration

**Storage key format:**

```
datatable:v1:{tableId}
```

**Persisted state:**

- Column visibility
- Sorting
- Column sizing
- Column order
- Page size
- Global filter
- Column filters

### `useSearch` Hook

**Responsibilities:**

- Return a `globalFilterFn` compatible with TanStack Table
- Support multi-column search via `search.keys[]`
- Use `getValue()` utility for nested field access (dot notation)

**Implementation:** All search logic runs through TanStack's filtering pipeline — no custom `useMemo` filtering.

### `useExport` Hook

**Export pipeline:**

```
rows
    ↓
selection (selected or all)
    ↓
transform (custom transform if provided)
    ↓
column filtering (exportable + excludeColumns)
    ↓
value formatting (date → ISO, boolean → Yes/No)
    ↓
column-level exportFormatter (from column meta)
    ↓
CSV / Excel
```

**Exposed methods:**

- `exportCSV()`
- `exportExcel()`
- `prepareExportData()` — for testing

**Dependencies:**

- `export-to-csv` for CSV
- `xlsx` for Excel

### `utils/get-value.ts`

```typescript
export function getValue<T = unknown>(obj: any, path: string): T | undefined {
  if (!path) return obj;
  const keys = path.split(".");
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return undefined;
    result = result[key];
  }
  return result as T;
}
```

Replaces `lodash.get` — no hidden dependency.

---

## 6. Type Safety Rules

- **No `any` types** — use `unknown` and narrow with type guards
- **Type-safe keys** — `Array<keyof TData>` for flat data, `string` for nested paths
- **Type-safe column references** — filters use `DataTableField` (supports dot notation)
- **Generic component** — `DataTable<TData>` preserves type inference
- **Module augmentation** — extend TanStack's `ColumnMeta` instead of replacing `ColumnDef`

---

## 7. State Management

### Client-side Mode (default)

All sorting, filtering, pagination, and search happen in memory via TanStack Table's built-in models.

### Server-side Mode (controlled)

Activated when both `pagination` and `onPaginationChange` are provided. The DataTable defers to the parent for:

- Pagination (`manualPagination: true`)
- Sorting (`manualSorting: true`, via `onSortingChange`)
- Filtering (`manualFiltering: true`, via `onColumnFiltersChange`)
- Global filter (via `onGlobalFilterChange`)

Detection is based on paired props — not inferred from unrelated values.

### Persistence

State is persisted to `localStorage` keyed by `datatable:v1:{tableId}`. SSR-safe with `typeof window` guard. Writes are debounced at 500ms.

---

## 8. Feature Module Pattern

Each feature (users, clients, etc.) creates a `table/` directory with:

| File               | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `columns.tsx`      | `ColumnDef<TData>[]` definitions           |
| `filters.ts`       | `DataTableFilter[]` definitions            |
| `bulk-actions.tsx` | `DataTableBulkAction<TData>[]` definitions |
| `toolbar.tsx`      | Custom toolbar (optional)                  |
| `index.ts`         | Re-exports                                 |

The feature then creates a wrapper component:

```typescript
// features/users/components/users-data-table.tsx
'use client';

import { DataTable } from '@/components/shared/data-table';
import { userColumns } from '../table/columns';
import { userFilters } from '../table/filters';
import { userBulkActions } from '../table/bulk-actions';

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
            exportOptions={{ csv: true, excel: true, filename: 'users' }}
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

---

## 9. Dependencies

### New npm packages

| Package                 | Purpose                 | Size   |
| ----------------------- | ----------------------- | ------ |
| `@tanstack/react-table` | Table engine (headless) | ~40KB  |
| `export-to-csv`         | CSV export              | ~5KB   |
| `xlsx`                  | Excel export            | ~350KB |

### Existing dependencies (reused)

- `lucide-react` — icons
- `@radix-ui/*` — UI primitives via Shadcn
- `shadcn` — UI components
- `tailwind-merge` — class merging
- `class-variance-authority` — variants

---

## 10. Phase 2 Scope

The following features are designed into the architecture but deferred to Phase 2:

- **Advanced Filter Builder** — Modal with AND/OR conditions (`advanced-filter.tsx`)
- **Column resizing** — Drag-to-resize column widths
- **Drag-and-drop column ordering** — Reorder columns via drag
- **Virtualization** — TanStack Virtual integration for large datasets
- **Saved views** — Named view presets with filter/sort/visibility combos

The Phase 1 implementation includes: search, faceted filters, sorting, pagination (client + server), row selection, bulk actions, export (CSV + Excel), column visibility, and state persistence.

---

## 11. Future Extensibility

The architecture is designed to support these features without breaking API changes:

- Column pinning
- Column resizing
- Drag-and-drop column ordering
- Virtualization (TanStack Virtual)
- Saved views / saved filters
- Infinite scrolling (TanStack Infinite Query)
- Row expansion
- Tree tables
- Grouping / aggregation
- Inline editing

---

## 11. Migration Plan

### Step 1: Install dependencies

```bash
pnpm add @tanstack/react-table export-to-csv xlsx
```

### Step 2: Build shared DataTable component

Create all files in `components/shared/data-table/`.

### Step 3: Migrate existing `user-table.tsx`

Replace the current basic table with the new `<UsersDataTable>` wrapper.

### Step 4: Migrate other tables

Apply the same pattern to roles, clients, and any future tables.

---

## Appendix: Files to Create

### Shared DataTable (`components/shared/data-table/`)

| File                             | Lines (est.) |
| -------------------------------- | ------------ |
| `index.ts`                       | 5            |
| `types.ts`                       | 120          |
| `utils.ts`                       | 20           |
| `data-table.tsx`                 | 80           |
| `toolbar.tsx`                    | 60           |
| `pagination.tsx`                 | 80           |
| `column-header.tsx`              | 50           |
| `view-options.tsx`               | 60           |
| `faceted-filter.tsx`             | 90           |
| `advanced-filter.tsx`            | 100          |
| `bulk-actions.tsx`               | 60           |
| `export-menu.tsx`                | 50           |
| `loading.tsx`                    | 30           |
| `empty-state.tsx`                | 25           |
| `hooks/use-data-table.ts`        | 70           |
| `hooks/use-table-persistence.ts` | 50           |
| `hooks/use-export.ts`            | 80           |
| `hooks/use-search.ts`            | 25           |

### Feature: Users (`features/users/table/`)

| File               | Lines (est.) |
| ------------------ | ------------ |
| `index.ts`         | 3            |
| `columns.tsx`      | 60           |
| `filters.ts`       | 30           |
| `bulk-actions.tsx` | 40           |
| `toolbar.tsx`      | 20           |

**Total estimated:** ~1,100 lines
