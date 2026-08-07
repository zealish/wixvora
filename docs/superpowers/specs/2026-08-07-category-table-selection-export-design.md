# Business Categories Table: Checkbox Selection & Multi-Format Export

**Date:** 2026-08-07  
**Status:** Approved  
**Feature:** Add checkbox selection and multi-format export (CSV, Excel, JSON) to Business Categories DataTable

---

## Overview

Extend the existing Business Categories DataTable to support row selection via checkboxes and export functionality in multiple formats (CSV, Excel, JSON). This enhancement follows the existing pattern established in `staff-columns.tsx` and `client-columns.tsx` for consistency across the application.

---

## Goals

1. Enable users to select individual category rows via checkboxes
2. Provide multi-format export (CSV, Excel, JSON) for selected or all visible rows
3. Maintain consistency with existing table patterns in the codebase
4. Respect current filters and hierarchical expand/collapse state

---

## Architecture

### Component Structure

```
features/business-categories/
├── table/
│   ├── category-columns.tsx          [MODIFY] Add checkbox column
│   └── category-export-menu.tsx      [NEW] Export dropdown component
├── lib/
│   └── export-utils.ts                [NEW] Export utility functions
└── components/
    └── category-data-table.tsx        [MODIFY] Add export UI, wire selection
```

### Dependencies

**New packages to install:**
- `xlsx` (^0.18.5) - Excel file generation
- `file-saver` (^2.0.5) - Browser download trigger
- `@types/file-saver` (^2.0.5) - TypeScript definitions

---

## Checkbox Selection

### Column Definition

Add checkbox column as the **first column** in `getCategoryColumns()`:

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
}
```

### Selection State Management

**TanStack Table built-in:**
- Use `rowSelection` state object: `{[rowId: string]: boolean}`
- Enable via `enableRowSelection: true` in table config
- Handle state changes via `onRowSelectionChange` callback

**Selection Behavior:**
- **Independent selection** - parent and children are independent; no cascade
- **Select all** affects only currently visible rows (respects filters and expand state)
- Selected count badge appears in toolbar when `selectedIds.length > 0`

### UI Changes in DataTable

**Toolbar additions:**
- Selected count badge: `"{count} selected"` (only when selection active)
- Export button group positioned before "Add Category" button
- Bulk actions remain in current position

---

## Export Functionality

### Export Formats

1. **CSV** - Plain text, comma-separated values
2. **Excel (XLSX)** - Native Excel format with styling
3. **JSON** - Structured data for API integration

### Export Scope

**Data selection logic:**
- If rows are selected → export **selected rows only**
- If no selection → export **all visible rows** (respecting current filters)

**Filtering behavior:**
- Respect status filter (all/active/inactive)
- Respect search filter (name/slug)
- Respect expand/collapse state (only export visible rows in flattened structure)

### Data Mapping

**Exported columns:**
1. Name
2. Slug
3. Parent Category (parent's name, or "—" if root)
4. Icon (icon name or "—")
5. Display Order
6. Status
7. Created At (ISO 8601 string)
8. Updated At (ISO 8601 string)

**Excluded fields:**
- `id` (internal)
- `parentId` (internal, replaced by parent name)
- `deletedAt` (internal)
- `children` (flattened structure)

**Hierarchical flattening:**
- Parent categories and their children are exported as separate flat rows
- Parent name column shows relationship
- No nested structure in export

### Export UI Component

**Component:** `CategoryExportMenu`

**Structure:**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export {selectedCount > 0 && `(${selectedCount} selected)`}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleExportCSV}>
      <FileText className="h-4 w-4 mr-2" />
      Export as CSV
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleExportExcel}>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Export as Excel
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleExportJSON}>
      <Code className="h-4 w-4 mr-2" />
      Export as JSON
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Props:**
```typescript
interface CategoryExportMenuProps {
  data: CategoryWithChildren[];  // All flattened visible rows
  selectedIds: string[];          // Currently selected row IDs
}
```

### Export Utility Functions

**File:** `features/business-categories/lib/export-utils.ts`

**Functions:**

1. `exportToCSV(data: ExportRow[], filename: string): void`
   - Generate CSV string with proper escaping (quotes for commas in values)
   - Trigger download via Blob + file-saver

2. `exportToExcel(data: ExportRow[], filename: string): void`
   - Use `xlsx` library to create workbook
   - Apply styling: bold header row, auto-width columns
   - Trigger download via file-saver

3. `exportToJSON(data: ExportRow[], filename: string): void`
   - Serialize to JSON with 2-space indentation
   - Trigger download as `.json` file

4. `prepareExportData(categories: CategoryWithChildren[], selectedIds: string[]): ExportRow[]`
   - Filter by selection if `selectedIds.length > 0`
   - Flatten hierarchical structure
   - Map to export columns
   - Return array of plain objects

**Export row type:**
```typescript
interface ExportRow {
  name: string;
  slug: string;
  parentCategory: string;
  icon: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Error Handling & Edge Cases

### Empty State
- Disable export button if no data available (after filtering)
- Show toast notification: `"No data to export"`

### Large Datasets
- No artificial pagination limit
- Export all visible/selected rows
- Browser handles download natively
- Memory consideration: flattened structure may duplicate parent metadata in each child row

### Failed Export
- Wrap all export functions in try-catch blocks
- Show toast on error: `"Failed to export data. Please try again."`
- Log full error to console for debugging

### Format-Specific Handling

**CSV:**
- Escape commas in category names with double quotes
- Use UTF-8 BOM for proper Excel compatibility

**Excel:**
- Apply bold style to header row
- Auto-width columns based on content
- Freeze header row for scrolling

**JSON:**
- Pretty-print with 2-space indentation
- Valid JSON array structure

### Selection Edge Cases

1. **Expand/collapse after selection:**
   - Selection state persists by row ID (unaffected by visibility changes)

2. **Bulk delete:**
   - Clear selection after successful bulk delete

3. **After export:**
   - Maintain selection (do not auto-clear)
   - User can continue selecting or export again

4. **Filter changes:**
   - Selection state persists
   - "Select all" only affects newly visible rows

---

## Testing Considerations

### Manual Testing Checklist

1. **Selection:**
   - [ ] Check individual row
   - [ ] Check all visible rows via header checkbox
   - [ ] Partial selection shows indeterminate state
   - [ ] Expand/collapse maintains selection
   - [ ] Filter changes maintain selection by ID

2. **Export - No Selection:**
   - [ ] CSV exports all visible rows with correct format
   - [ ] Excel exports with styling and auto-width
   - [ ] JSON exports valid structure
   - [ ] Filename includes timestamp

3. **Export - With Selection:**
   - [ ] Only selected rows are exported
   - [ ] Export button shows count
   - [ ] All formats respect selection

4. **Edge Cases:**
   - [ ] Empty table disables export
   - [ ] Export with filters applied
   - [ ] Export hierarchical data (parent + children)
   - [ ] Large dataset (50+ categories)
   - [ ] Special characters in category names
   - [ ] Categories without icons/parent

5. **Error Handling:**
   - [ ] Toast appears on export failure
   - [ ] Console logs error details

---

## Implementation Notes

### Existing Patterns to Follow

- Checkbox column pattern from `features/users/table/staff-columns.tsx`
- TanStack Table row selection from `features/user-management/components/staff-data-table.tsx`
- Dropdown menu pattern from existing toolbar components

### Files to Modify

1. **features/business-categories/table/category-columns.tsx**
   - Add checkbox column definition at index 0
   - Shift existing columns

2. **features/business-categories/components/category-data-table.tsx**
   - Add `enableRowSelection: true` to table config
   - Add `rowSelection` and `onRowSelectionChange` state
   - Add `<CategoryExportMenu>` component to toolbar
   - Pass selected IDs to export menu

### Files to Create

1. **features/business-categories/table/category-export-menu.tsx**
   - Export dropdown component
   - Handles click events for each format
   - Shows selected count in button label

2. **features/business-categories/lib/export-utils.ts**
   - Export utility functions for CSV/Excel/JSON
   - Data preparation and flattening logic
   - File download triggers

### Package Installation

```bash
pnpm add xlsx file-saver
pnpm add -D @types/file-saver
```

---

## Success Criteria

1. ✅ Checkbox column appears as first column in table
2. ✅ Select all checkbox works correctly with indeterminate state
3. ✅ Individual row selection works independently
4. ✅ Selected count appears in toolbar
5. ✅ Export button shows correct label with selection count
6. ✅ CSV export generates valid file with proper escaping
7. ✅ Excel export generates .xlsx with styling
8. ✅ JSON export generates valid pretty-printed JSON
9. ✅ Export respects selection scope (selected vs all visible)
10. ✅ Export respects current filters
11. ✅ Error handling shows appropriate toast notifications
12. ✅ Pattern matches existing staff/client table implementations

---

## Future Enhancements (Out of Scope)

- Cascade selection (select parent → select children)
- Column visibility toggle for export
- Custom export templates
- Export to PDF format
- Scheduled/automated exports
- Export history/audit trail
