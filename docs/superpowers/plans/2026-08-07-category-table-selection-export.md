# Business Categories Table: Checkbox Selection & Multi-Format Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add checkbox selection and multi-format export (CSV, Excel, JSON) to Business Categories DataTable

**Architecture:** Extend existing CategoryDataTable with TanStack Table's built-in row selection, add checkbox column following staff-columns.tsx pattern, create export utilities for CSV/Excel/JSON formats, add export dropdown menu to toolbar.

**Tech Stack:** React, TanStack Table, TypeScript, xlsx, file-saver, lucide-react

**Base Commit:** `2fc6b74`

## Global Constraints

- TypeScript strict mode enabled - no `any` types without justification
- Follow existing patterns from `features/users/table/staff-columns.tsx`
- Independent selection - no cascade to parent/children
- Export respects current filters and expand/collapse state
- All exports use UTF-8 encoding
- Filenames include timestamp: `business-categories-YYYY-MM-DD-HHmmss.{csv,xlsx,json}`

---

## File Structure

```
features/business-categories/
├── lib/
│   └── export-utils.ts                [NEW] Export utility functions
├── table/
│   ├── category-columns.tsx          [MODIFY] Add checkbox column
│   └── category-export-menu.tsx      [NEW] Export dropdown component
└── components/
    └── category-data-table.tsx        [MODIFY] Enable row selection, add export UI
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: None
- Produces: `xlsx`, `file-saver` packages available for import

- [ ] **Step 1: Install export dependencies**

```bash
pnpm add xlsx file-saver
pnpm add -D @types/file-saver
```

Expected: Packages installed successfully

- [ ] **Step 2: Verify installation**

```bash
pnpm list xlsx file-saver
```

Expected output shows installed versions

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add xlsx and file-saver for category export"
```

---

### Task 2: Create Export Utilities

**Files:**
- Create: `features/business-categories/lib/export-utils.ts`

**Interfaces:**
- Consumes: `CategoryWithChildren` from `../types`
- Produces:
  - `type ExportRow`
  - `function prepareExportData(categories: CategoryWithChildren[], selectedIds: string[]): ExportRow[]`
  - `function exportToCSV(data: ExportRow[], filename: string): void`
  - `function exportToExcel(data: ExportRow[], filename: string): void`
  - `function exportToJSON(data: ExportRow[], filename: string): void`

- [ ] **Step 1: Write test for prepareExportData**

Create: `features/business-categories/lib/export-utils.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { prepareExportData } from "./export-utils";
import type { CategoryWithChildren } from "../types";

describe("prepareExportData", () => {
  it("should flatten hierarchical categories with parent names", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "Food & Beverage",
        slug: "food-beverage",
        icon: "Utensils",
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        deletedAt: null,
        children: [
          {
            id: "2",
            name: "Restaurant",
            slug: "restaurant",
            icon: "ChefHat",
            displayOrder: 1,
            status: "active",
            parentId: "1",
            createdAt: new Date("2026-01-02"),
            updatedAt: new Date("2026-01-02"),
            deletedAt: null,
            children: [],
          },
        ],
      },
    ];

    const result = prepareExportData(categories, []);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Food & Beverage",
      slug: "food-beverage",
      parentCategory: "—",
      icon: "Utensils",
      displayOrder: 1,
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result[1]).toEqual({
      name: "Restaurant",
      slug: "restaurant",
      parentCategory: "Food & Beverage",
      icon: "ChefHat",
      displayOrder: 1,
      status: "active",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("should filter by selectedIds when provided", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "Category 1",
        slug: "category-1",
        icon: null,
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        deletedAt: null,
        children: [],
      },
      {
        id: "2",
        name: "Category 2",
        slug: "category-2",
        icon: null,
        displayOrder: 2,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        deletedAt: null,
        children: [],
      },
    ];

    const result = prepareExportData(categories, ["1"]);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Category 1");
  });

  it("should handle categories without icons", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "No Icon",
        slug: "no-icon",
        icon: null,
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        deletedAt: null,
        children: [],
      },
    ];

    const result = prepareExportData(categories, []);

    expect(result[0].icon).toBe("—");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test features/business-categories/lib/export-utils.test.ts
```

Expected: FAIL - module not found

- [ ] **Step 3: Implement export utilities**

Create: `features/business-categories/lib/export-utils.ts`

```typescript
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { CategoryWithChildren } from "../types";

export interface ExportRow {
  name: string;
  slug: string;
  parentCategory: string;
  icon: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function prepareExportData(
  categories: CategoryWithChildren[],
  selectedIds: string[]
): ExportRow[] {
  const rows: ExportRow[] = [];
  const parentMap = new Map<string, string>();

  const flatten = (cats: CategoryWithChildren[], parentName: string | null = null) => {
    for (const cat of cats) {
      if (parentName) {
        parentMap.set(cat.id, parentName);
      }

      const row: ExportRow = {
        name: cat.name,
        slug: cat.slug,
        parentCategory: parentMap.get(cat.id) || "—",
        icon: cat.icon || "—",
        displayOrder: cat.displayOrder,
        status: cat.status,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      };

      rows.push(row);

      if (cat.children && cat.children.length > 0) {
        flatten(cat.children, cat.name);
      }
    }
  };

  flatten(categories);

  if (selectedIds.length > 0) {
    const selectedSet = new Set(selectedIds);
    return rows.filter((_, idx) => {
      const cat = findCategoryByIndex(categories, idx);
      return cat && selectedSet.has(cat.id);
    });
  }

  return rows;
}

function findCategoryByIndex(
  categories: CategoryWithChildren[],
  targetIndex: number
): CategoryWithChildren | null {
  let currentIndex = 0;

  const search = (cats: CategoryWithChildren[]): CategoryWithChildren | null => {
    for (const cat of cats) {
      if (currentIndex === targetIndex) {
        return cat;
      }
      currentIndex++;

      if (cat.children && cat.children.length > 0) {
        const found = search(cat.children);
        if (found) return found;
      }
    }
    return null;
  };

  return search(categories);
}

function generateFilename(format: string): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "")
    .replace("T", "-");
  return `business-categories-${timestamp}.${format}`;
}

export function exportToCSV(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const headers = [
      "Name",
      "Slug",
      "Parent Category",
      "Icon",
      "Display Order",
      "Status",
      "Created At",
      "Updated At",
    ];

    const escapeCSV = (value: string | number): string => {
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        [
          escapeCSV(row.name),
          escapeCSV(row.slug),
          escapeCSV(row.parentCategory),
          escapeCSV(row.icon),
          escapeCSV(row.displayOrder),
          escapeCSV(row.status),
          escapeCSV(row.createdAt),
          escapeCSV(row.updatedAt),
        ].join(",")
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename || generateFilename("csv"));
  } catch (error) {
    console.error("CSV export failed:", error);
    throw error;
  }
}

export function exportToExcel(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const headers = [
      "Name",
      "Slug",
      "Parent Category",
      "Icon",
      "Display Order",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = data.map((row) => [
      row.name,
      row.slug,
      row.parentCategory,
      row.icon,
      row.displayOrder,
      row.status,
      row.createdAt,
      row.updatedAt,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    const columnWidths = headers.map((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...rows.map((row) => String(row[i]).length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet["!cols"] = columnWidths;

    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = { font: { bold: true } };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename || generateFilename("xlsx"));
  } catch (error) {
    console.error("Excel export failed:", error);
    throw error;
  }
}

export function exportToJSON(data: ExportRow[], filename?: string): void {
  try {
    if (data.length === 0) {
      throw new Error("No data to export");
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
    saveAs(blob, filename || generateFilename("json"));
  } catch (error) {
    console.error("JSON export failed:", error);
    throw error;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test features/business-categories/lib/export-utils.test.ts
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add features/business-categories/lib/export-utils.ts features/business-categories/lib/export-utils.test.ts
git commit -m "feat(categories): add export utility functions for CSV/Excel/JSON"
```

---

### Task 3: Add Checkbox Column to Category Columns

**Files:**
- Modify: `features/business-categories/table/category-columns.tsx`

**Interfaces:**
- Consumes: `Checkbox` from `@/components/ui/checkbox`, `CategoryWithChildren` from `../types`
- Produces: Updated `getCategoryColumns()` with checkbox column as first column

- [ ] **Step 1: Add checkbox column import**

Add to imports in `features/business-categories/table/category-columns.tsx`:

```typescript
import { Checkbox } from "@/components/ui/checkbox";
```

- [ ] **Step 2: Add checkbox column definition**

In `getCategoryColumns()` function, insert as **first column** (before expand column):

```typescript
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
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add features/business-categories/table/category-columns.tsx
git commit -m "feat(categories): add checkbox selection column to table"
```

---

### Task 4: Create Export Menu Component

**Files:**
- Create: `features/business-categories/table/category-export-menu.tsx`

**Interfaces:**
- Consumes:
  - `CategoryWithChildren` from `../types`
  - `exportToCSV`, `exportToExcel`, `exportToJSON`, `prepareExportData` from `../lib/export-utils`
- Produces: `function CategoryExportMenu(props: CategoryExportMenuProps): JSX.Element`
  - Props: `{ data: CategoryWithChildren[], selectedIds: string[] }`

- [ ] **Step 1: Create export menu component**

Create: `features/business-categories/table/category-export-menu.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Code } from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  prepareExportData,
} from "../lib/export-utils";
import type { CategoryWithChildren } from "../types";

interface CategoryExportMenuProps {
  data: CategoryWithChildren[];
  selectedIds: string[];
}

export function CategoryExportMenu({
  data,
  selectedIds,
}: CategoryExportMenuProps) {
  const handleExport = (format: "csv" | "excel" | "json") => {
    try {
      const exportData = prepareExportData(data, selectedIds);

      if (exportData.length === 0) {
        toast.add({
          type: "error",
          title: "No data to export",
          description: "Please select categories or adjust your filters.",
        });
        return;
      }

      switch (format) {
        case "csv":
          exportToCSV(exportData);
          break;
        case "excel":
          exportToExcel(exportData);
          break;
        case "json":
          exportToJSON(exportData);
          break;
      }

      toast.add({
        type: "success",
        title: "Export successful",
        description: `${exportData.length} ${
          exportData.length === 1 ? "category" : "categories"
        } exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.add({
        type: "error",
        title: "Export failed",
        description: "Failed to export data. Please try again.",
      });
    }
  };

  const hasData = data.length > 0;
  const selectedCount = selectedIds.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasData}>
          <Download className="h-4 w-4 mr-2" />
          Export{selectedCount > 0 && ` (${selectedCount} selected)`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <Code className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add features/business-categories/table/category-export-menu.tsx
git commit -m "feat(categories): add export menu component with CSV/Excel/JSON options"
```

---

### Task 5: Integrate Selection and Export into DataTable

**Files:**
- Modify: `features/business-categories/components/category-data-table.tsx`

**Interfaces:**
- Consumes:
  - `CategoryExportMenu` from `../table/category-export-menu`
  - TanStack Table row selection API
- Produces: DataTable with working selection and export functionality

- [ ] **Step 1: Add import for export menu**

Add to imports in `features/business-categories/components/category-data-table.tsx`:

```typescript
import { CategoryExportMenu } from "../table/category-export-menu";
```

- [ ] **Step 2: Enable row selection in table config**

In the `useReactTable` call, add after line with `getCoreRowModel`:

```typescript
enableRowSelection: true,
```

Add to state object (find `rowSelection: Object.fromEntries(...)` line):

```typescript
onRowSelectionChange: (updater) => {
  const currentSelection = Object.fromEntries(selectedIds.map((id) => [id, true]));
  const newSelection =
    typeof updater === "function" ? updater(currentSelection) : updater;
  setSelectedIds(Object.keys(newSelection).filter((id) => newSelection[id]));
},
```

- [ ] **Step 3: Add export menu to toolbar**

Find the toolbar section (around line 240, where "Add Category" button is). Add before the "Add Category" button:

```typescript
<CategoryExportMenu data={flattenData} selectedIds={selectedIds} />
```

- [ ] **Step 4: Clear selection after bulk delete**

Find the `handleBulkDelete` function. After the successful `router.refresh()` call, add:

```typescript
setSelectedIds([]);
```

- [ ] **Step 5: Verify TypeScript compilation**

```bash
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 6: Start dev server and manual test**

```bash
pnpm dev
```

Navigate to `/staff/business-categories` and verify:
- Checkbox column appears as first column
- Individual checkbox selection works
- Header checkbox selects all visible rows
- Indeterminate state shows for partial selection
- Export button shows "(X selected)" when rows selected
- Export dropdown has 3 options
- Export respects selection (click export with selection, check file)
- Export all when no selection (uncheck all, export, check file)

- [ ] **Step 7: Commit**

```bash
git add features/business-categories/components/category-data-table.tsx
git commit -m "feat(categories): integrate row selection and export menu into table"
```

---

### Task 6: Final Verification and Documentation

**Files:**
- Modify: None (verification only)
- Test: Manual testing of all features

**Interfaces:**
- Consumes: All implemented features
- Produces: Verified working implementation

- [ ] **Step 1: Run TypeScript check**

```bash
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run unit tests**

```bash
pnpm test features/business-categories/lib/export-utils.test.ts
```

Expected: All tests PASS

- [ ] **Step 3: Manual test - Selection behavior**

In browser at `/staff/business-categories`:

1. Check individual category row
   - Expected: Row highlighted, selected count appears
2. Check header checkbox with no selection
   - Expected: All visible rows selected
3. Check header checkbox with partial selection
   - Expected: All visible rows selected
4. Uncheck header checkbox with all selected
   - Expected: All rows deselected
5. Expand parent with children, select parent only
   - Expected: Only parent selected (no cascade)
6. Apply status filter with selection
   - Expected: Selection persists by ID
7. Collapse parent after selecting child
   - Expected: Selection persists (child still selected)

- [ ] **Step 4: Manual test - Export with selection**

In browser:

1. Select 2-3 categories (mix of parent and child)
2. Click Export button
   - Expected: Shows "(X selected)" in button label
3. Click "Export as CSV"
   - Expected: File downloads, contains only selected rows
4. Open CSV file
   - Expected: Proper headers, UTF-8 encoding, parent names shown
5. Click "Export as Excel"
   - Expected: .xlsx file downloads
6. Open Excel file
   - Expected: Bold headers, auto-width columns, correct data
7. Click "Export as JSON"
   - Expected: .json file downloads
8. Open JSON file
   - Expected: Valid JSON array, pretty-printed, correct structure

- [ ] **Step 5: Manual test - Export without selection**

In browser:

1. Uncheck all selections
2. Click Export button
   - Expected: No "(X selected)" text
3. Export as CSV
   - Expected: File contains all visible categories (respecting filters)
4. Apply status filter to "active"
5. Export as CSV
   - Expected: File contains only active categories

- [ ] **Step 6: Manual test - Edge cases**

In browser:

1. Clear all data via filters (search for non-existent)
2. Click Export button
   - Expected: Button disabled
3. Try to export
   - Expected: Toast error "No data to export"
4. Reset filters
5. Test category with special characters in name (e.g., "Food & Beverage")
6. Export as CSV
   - Expected: Proper escaping with quotes
7. Select many rows (10+)
8. Export as Excel
   - Expected: All rows exported successfully

- [ ] **Step 7: Manual test - Bulk delete with selection**

In browser:

1. Select 2 categories
2. Click bulk delete
3. Confirm deletion
   - Expected: Categories deleted, selection cleared

- [ ] **Step 8: Verify filename format**

Check downloaded files:
- Expected format: `business-categories-20260807-143045.{csv,xlsx,json}`
- Expected: Timestamp in filename

- [ ] **Step 9: Push to main**

```bash
git push origin main
```

Expected: All commits pushed successfully

- [ ] **Step 10: Mark plan as complete**

Update plan status in this file header:
- Change status from "In Progress" to "Completed"
- Add completion date

---

## Success Criteria Checklist

- [x] Dependencies installed (xlsx, file-saver)
- [x] Export utilities created with tests
- [x] Checkbox column added as first column
- [x] Export menu component created
- [x] Row selection enabled in DataTable
- [x] Export menu integrated into toolbar
- [x] TypeScript compilation clean
- [ ] All manual tests pass
- [ ] Selection behavior correct (independent, no cascade)
- [ ] Export respects selection and filters
- [ ] All three formats work (CSV, Excel, JSON)
- [ ] Error handling shows appropriate toasts
- [ ] Filenames include timestamps
- [ ] Pushed to main branch

---

## Notes

- Export flattens hierarchical structure - parent info duplicated in each child row
- Selection state persists through expand/collapse and filter changes
- "Select all" only affects currently visible rows
- CSV includes UTF-8 BOM for Excel compatibility
- Excel has frozen header row and auto-width columns
- JSON is pretty-printed with 2-space indentation
