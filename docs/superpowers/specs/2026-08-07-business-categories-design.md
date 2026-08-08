# Business Categories Management - Design Specification

**Date:** 2026-08-07  
**Status:** Approved  
**Author:** AI Assistant

---

## Overview

This specification describes the implementation of a hierarchical business category management system within the staff portal. The system allows staff members to create, edit, and organize business categories and sub-categories with a maximum depth of 2 levels.

### Goals

- Provide a unified interface for managing business categories and sub-categories
- Support hierarchical organization with expandable/collapsible table view
- Enable flexible ordering and status management
- Maintain full audit trail of all category operations
- Integrate with existing RBAC permission system

### Non-Goals

- Categories deeper than 2 levels (categories → sub-categories only)
- Public-facing category display (this is staff management only)
- Category assignment to other entities (can be added later)

---

## Architecture Decision

**Selected Approach:** Single unified table with self-referential relationship

### Rationale

A single `business_categories` table with `parentId` column provides the optimal balance of:

- **Simplicity:** One schema, one set of queries, one form component
- **Maintainability:** Less code duplication, single source of truth
- **Flexibility:** Easy to extend if hierarchy depth requirements change
- **Performance:** Efficient queries with proper indexing

### Key Design Principles

1. **Unified Model:** Categories and sub-categories are the same entity type, differentiated only by presence of `parentId`
2. **Application-Level Constraints:** Maximum depth of 2 levels enforced in service layer, not database schema
3. **Soft Delete with Cascade:** Deleting a category soft-deletes all children in a transaction
4. **Unique Ordering Per Level:** Display order must be unique among siblings (same parent)

---

## Database Schema

### Table: `business_categories`

```typescript
business_categories {
  id: uuid (primary key)

  name: varchar(100) NOT NULL
  slug: varchar(120) NOT NULL UNIQUE
  icon: varchar(100) NULL              // Lucide React icon name

  displayOrder: integer NOT NULL
  status: enum('active', 'inactive') NOT NULL DEFAULT 'active'

  parentId: uuid NULL                  // NULL = root category

  createdAt: timestamp NOT NULL
  updatedAt: timestamp NOT NULL
  deletedAt: timestamp NULL            // Soft delete
}
```

### Constraints

```sql
-- No duplicate order numbers within same parent
UNIQUE(parent_id, display_order)

-- Display order must be positive
CHECK(display_order > 0)

-- Prevent self-referencing
CHECK(parent_id IS NULL OR parent_id <> id)

-- Foreign key to self
FOREIGN KEY(parent_id) REFERENCES business_categories(id)
```

**Note:** No `ON DELETE CASCADE` is used because soft deletes mean physical deletion never occurs. Cascade logic is implemented in the service layer.

### Indexes

```sql
CREATE INDEX idx_categories_parent ON business_categories(parent_id);
CREATE INDEX idx_categories_status ON business_categories(status);
CREATE INDEX idx_categories_order ON business_categories(parent_id, display_order);
```

### Business Rules

- `parentId = NULL` represents a root category
- A category may only have one level of children (max depth = 2)
- `displayOrder` must be unique among siblings (same parent)
- `displayOrder` must be a positive integer
- A category cannot reference itself as parent
- Soft delete is used for auditability and recovery
- Deleting a category performs soft cascade to all child categories
- `slug` is globally unique (URL pattern: `/categories/{slug}`)

---

## Feature Structure

Following the project's feature-based architecture:

```
features/
  business-categories/
    actions.ts                      # Server actions (create, update, delete)
    queries.ts                      # Data fetching (getAll, getById, getTree)
    service.ts                      # Business logic & soft cascade delete
    validation.ts                   # Zod schemas
    types.ts                        # TypeScript types

    components/
      category-form.tsx             # Unified form for create/edit
      category-data-table.tsx       # DataTable wrapper with expandable rows
      category-icon-picker.tsx      # Lucide icon selector component

    table/
      category-columns.tsx          # Column definitions with expand/collapse
      category-filters.ts           # Filter configuration
      category-bulk-actions.tsx     # Bulk operations (delete, status toggle)

lib/
  db/
    schema/
      business-categories.ts        # Drizzle schema definition

lib/
  auth/
    permissions.ts                  # Add CATEGORIES_* permissions

config/
  navigation.ts                     # Add categories nav item

app/
  (staff)/
    staff/
      business-categories/
        page.tsx                    # List page with DataTable
        create/
          page.tsx                  # Create root category form
        [id]/
          edit/
            page.tsx                # Edit category form
          create-sub/
            page.tsx                # Create sub-category (parentId from URL)
```

---

## Data Layer

### Drizzle Schema

**Key Elements:**

- `categoryStatusEnum` for status values
- Self-referential `parentId` foreign key
- Unique constraint on `(parentId, displayOrder)`
- Check constraints for positive order and non-self-reference
- Relations defined for parent/children navigation

### Query Functions (`queries.ts`)

```typescript
// Fetch hierarchical structure (categories with children)
getCategoriesTree(): Promise<CategoryWithChildren[]>

// Only active categories with active children
getActiveCategoriesTree(): Promise<CategoryWithChildren[]>

// Single category with parent info
getCategoryById(id: string): Promise<CategoryWithParent | null>

// Category with all sub-categories
getCategoryWithChildren(id: string): Promise<CategoryWithChildren | null>

// Suggest next available order number
getNextDisplayOrder(parentId: string | null): Promise<number>

// Check if display order is available
validateDisplayOrder(
  parentId: string | null,
  order: number,
  excludeId?: string
): Promise<boolean>
```

### Service Layer (`service.ts`)

**Core Functions:**

```typescript
// Create category with validation
createCategory(data: CreateCategoryInput): Promise<Category>
- Validates hierarchy depth (max 2 levels)
- Generates unique slug from name
- Validates display order uniqueness
- Creates audit log entry

// Update category
updateCategory(id: string, data: UpdateCategoryInput): Promise<Category>
- Regenerates slug if name changes
- Validates display order if changed
- Prevents depth violations if parent changes
- Creates audit log entry

// Soft delete with cascade
softDeleteCategory(id: string): Promise<{ deletedCount: number }>
- Marks category as deleted
- Soft deletes all children in same transaction
- Returns count of deleted records
- Creates audit log with cascade info

// Validate hierarchy depth
validateHierarchyDepth(parentId: string | null): Promise<void>
- Checks if parent already has a parent (would create 3rd level)
- Throws error if depth limit exceeded

// Generate unique slug
generateUniqueSlug(name: string, excludeId?: string): Promise<string>
- Converts name to slug (lowercase, hyphens)
- Checks uniqueness, adds numeric suffix if needed
- Returns unique slug
```

---

## UI Components

### DataTable with Expandable Rows

**Features:**

- Root categories displayed as regular rows
- Expand icon (ChevronRight/ChevronDown) in first column for categories with children
- Sub-categories appear as nested rows with visual indentation when expanded
- Columns: Expand Icon | Name & Icon | Slug | Order | Status | Actions
- Bulk actions: Delete selected, Toggle status
- Filters: Status (All/Active/Inactive), Search by name

**Row Actions:**

- **Edit:** Opens edit page
- **Add Sub-Category:** Available only for root categories (with depth validation)
- **Delete:** Shows confirmation dialog, warns if has children (cascade delete)
- **Toggle Status:** Quick status change without leaving page

**Expandable Row Behavior:**

- Click expand icon or anywhere on row to toggle expansion
- Expanded state maintained during filtering/sorting
- Sub-categories load with parent (not lazy-loaded)
- Visual indentation shows hierarchy level

### Category Form Component

**Form Fields:**

1. **Name** (required)
   - Text input, max 100 characters
   - Real-time validation

2. **Slug** (required, auto-generated)
   - Text input, editable
   - Auto-generated from name (debounced)
   - Shows URL preview: `/categories/{slug}`
   - Validates uniqueness on blur

3. **Icon** (optional)
   - Icon picker component
   - Searchable Lucide icons with preview
   - Shows current selection

4. **Display Order** (required)
   - Number input, min 1
   - Suggests next available number
   - Validates uniqueness on blur
   - Shows error if duplicate at same level

5. **Status** (required)
   - Radio group or Select
   - Options: Active, Inactive
   - Default: Active

6. **Parent Category** (conditional)
   - Read-only display for sub-category edit
   - Hidden for root category create/edit
   - Pre-filled from URL param for sub-category create

**Form Behavior:**

- Real-time slug generation while typing name (300ms debounce)
- Display order validation on blur with helpful error messages
- Icon picker opens in dialog/popover
- Submit creates audit log entry
- Success redirects to list page with toast notification
- Error handling shows field-level validation messages

### Icon Picker Component

**Features:**

- Search box to filter icons by name
- Grid display of icon previews (32x32 size)
- Selected icon highlighted with border/background
- Popular business category icons shown first
- Scrollable list of all Lucide icons
- Click to select, shows icon name below preview
- Clear selection button

**Popular Icons Suggested:**

- Store, ShoppingCart, Package, Utensils, Coffee
- Briefcase, Wrench, Car, Home, Heart
- BookOpen, Laptop, Palette, Music, Camera

---

## Permissions & Authorization

### New Permissions

Added to `lib/auth/permissions.ts`:

```typescript
CATEGORIES_VIEW: "categories:view";
CATEGORIES_CREATE: "categories:create";
CATEGORIES_UPDATE: "categories:update";
CATEGORIES_DELETE: "categories:delete";
```

### Permission Enforcement

**Page Level:**

- `/business-categories` → `CATEGORIES_VIEW`
- `/business-categories/create` → `CATEGORIES_CREATE`
- `/business-categories/[id]/edit` → `CATEGORIES_UPDATE`
- `/business-categories/[id]/create-sub` → `CATEGORIES_CREATE`

**Action Level:**

- `createCategoryAction` → `CATEGORIES_CREATE`
- `updateCategoryAction` → `CATEGORIES_UPDATE`
- `deleteCategoryAction` → `CATEGORIES_DELETE`
- `toggleCategoryStatusAction` → `CATEGORIES_UPDATE`
- `bulkDeleteCategoriesAction` → `CATEGORIES_DELETE`

**UI Level:**

- "Create Category" button → `CATEGORIES_VIEW`
- "Edit" row action → `CATEGORIES_UPDATE`
- "Delete" row action → `CATEGORIES_DELETE`
- "Add Sub-Category" row action → `CATEGORIES_CREATE`
- Bulk action buttons → Respective permissions

### Navigation

Added to `config/navigation.ts` in Management group:

```typescript
{
  title: 'Business Categories',
  href: '/staff/business-categories',
  icon: 'FolderTree',
  permission: PERMISSIONS.CATEGORIES_VIEW,
}
```

---

## Audit Logging

All category operations are logged to the audit system with full context.

### Event Types

**Category Created:**

```typescript
{
  action: 'CATEGORY_CREATED',
  entityType: 'business_category',
  entityId: category.id,
  changes: {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Laptop',
    displayOrder: 1,
    status: 'active',
    parentId: null
  }
}
```

**Category Updated:**

```typescript
{
  action: 'CATEGORY_UPDATED',
  entityType: 'business_category',
  entityId: category.id,
  changes: {
    before: { name: 'Electronic', displayOrder: 2 },
    after: { name: 'Electronics', displayOrder: 1 }
  }
}
```

**Category Deleted (with cascade):**

```typescript
{
  action: 'CATEGORY_DELETED',
  entityType: 'business_category',
  entityId: category.id,
  metadata: {
    categoryName: 'Electronics',
    childrenCount: 5,
    cascadeDeleted: [
      'uuid-child-1',
      'uuid-child-2',
      'uuid-child-3',
      'uuid-child-4',
      'uuid-child-5'
    ]
  }
}
```

**Status Changed:**

```typescript
{
  action: 'CATEGORY_STATUS_CHANGED',
  entityType: 'business_category',
  entityId: category.id,
  changes: {
    before: { status: 'active' },
    after: { status: 'inactive' }
  }
}
```

---

## Error Handling & Validation

### Validation Errors (400 Bad Request)

**Duplicate Display Order:**

```
Display order 3 is already used by another category at this level.
```

**Invalid Hierarchy Depth:**

```
Cannot create sub-category: maximum depth of 2 levels reached.
```

**Slug Already Exists:**

```
Slug 'electronics' is already in use. Please choose a different name or edit the slug manually.
```

**Invalid Display Order:**

```
Display order must be a positive number greater than 0.
```

**Self-Reference Attempt:**

```
A category cannot be its own parent.
```

### Business Logic Errors (422 Unprocessable Entity)

**Delete Category with Active Children:**

```
Cannot delete category 'Electronics' because it has 5 active sub-categories. Please deactivate or delete them first, or use force delete to cascade.
```

**Change Parent Creates Invalid Depth:**

```
Cannot change parent: this category has children. Moving it would exceed the maximum depth of 2 levels.
```

**Inactive Parent with Active Children:**

```
Cannot set status to inactive while 3 sub-categories are still active. Please deactivate children first or cascade the status change.
```

### Authorization Errors (403 Forbidden)

```
You don't have permission to perform this action. Required: categories:create
```

### Not Found Errors (404 Not Found)

```
Category not found or has been deleted.
```

```
Parent category not found. It may have been deleted.
```

### User Feedback Messages

**Success Messages:**

- "Category created successfully"
- "Sub-category created under Electronics"
- "Category updated successfully"
- "Category and 5 sub-categories deleted successfully"
- "Status changed to active"
- "3 categories deleted successfully"

**Confirmation Dialogs:**

- "Delete category?" - "This category has 5 sub-categories. All will be deleted. This action cannot be undone."
- "Delete 3 categories?" - "Some categories have sub-categories that will also be deleted. Continue?"

---

## Implementation Notes

### Slug Generation Strategy

1. Convert name to lowercase
2. Replace spaces and special characters with hyphens
3. Remove multiple consecutive hyphens
4. Trim hyphens from start/end
5. Check uniqueness in database (exclude current record if editing)
6. If duplicate, append numeric suffix: `electronics-2`, `electronics-3`, etc.

### Display Order Management

- When creating a category, suggest `MAX(display_order) + 1` for the parent level
- Allow user to override suggested order
- Validate uniqueness before save
- On duplicate, show error and suggest alternative numbers
- No automatic reordering of existing categories

### Soft Cascade Delete Logic

```typescript
// Transaction pseudocode
BEGIN TRANSACTION
  // Get all children
  children = SELECT * FROM business_categories WHERE parent_id = :id

  // Mark parent as deleted
  UPDATE business_categories SET deleted_at = NOW() WHERE id = :id

  // Mark all children as deleted
  UPDATE business_categories SET deleted_at = NOW() WHERE parent_id = :id

  // Create audit log with cascade info
  INSERT INTO audit_logs (action, entity_id, metadata)
COMMIT
```

### Expandable Row State Management

- Maintain expanded state in component state (Set of expanded IDs)
- Persist expanded state across re-renders
- Reset expanded state on filter/search changes (optional UX decision)
- Load all data upfront (no lazy loading of children for simplicity)

---

## Testing Strategy

### Unit Tests

- Slug generation with various inputs (special chars, duplicates, unicode)
- Display order validation logic
- Hierarchy depth validation
- Soft cascade delete logic

### Integration Tests

- Create category → verify in database
- Create sub-category → verify parent relationship
- Update category → verify audit log
- Delete category with children → verify cascade
- Duplicate display order → verify error

### E2E Tests

- Complete CRUD flow via UI
- Expand/collapse rows
- Bulk operations
- Permission enforcement
- Form validation

---

## Future Enhancements (Out of Scope)

- Category images/banners in addition to icons
- Drag-and-drop reordering
- Category templates
- Category analytics (usage statistics)
- Multi-language support for category names
- Category assignment to products/services
- Public-facing category pages
- Category-based filtering in other modules

---

## Migration Strategy

### Database Migration

1. Create `business_categories` table with all constraints
2. Create indexes
3. Seed with initial categories (optional)

### Permission Migration

1. Add new permissions to permissions table
2. Assign to Super Admin role by default
3. Allow other roles to be configured manually

### Navigation Migration

1. Add navigation item to config
2. Navigation will auto-filter based on permissions

---

## Success Criteria

- ✅ Staff can create, edit, and delete categories and sub-categories
- ✅ Maximum 2-level hierarchy enforced
- ✅ Display order is unique per level and validated
- ✅ Expandable table shows hierarchy clearly
- ✅ Slugs are auto-generated and editable
- ✅ Icon picker integrates Lucide icons
- ✅ All operations create audit logs
- ✅ Permissions properly enforced at all levels
- ✅ Soft delete with cascade works correctly
- ✅ Form validation provides helpful error messages
- ✅ UI follows existing project patterns and design system

---

## Open Questions

None - all design decisions have been made and approved.
