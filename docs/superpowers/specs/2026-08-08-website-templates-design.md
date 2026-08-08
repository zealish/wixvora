# Website Templates Feature - Design Specification

**Date:** 2026-08-08  
**Author:** AI Assistant  
**Status:** Approved  
**Implementation Approach:** Phased (3 phases over 4 weeks)

---

## Overview

The Website Templates feature enables staff to create, manage, and publish website templates for Wixvora's website builder SaaS platform. Clients will select and use these templates to build their websites, which are hosted on Wixvora subdomains or custom domains. This is a core feature for the platform's value proposition.

### Business Context

- **Platform Type:** Website builder SaaS (like Wix/Webflow)
- **User Flow:** Client selects template → customizes → publishes to subdomain/custom domain
- **No Source Code Access:** Clients use templates through the platform only
- **Template Ownership:** Staff creates and manages all templates
- **Categorization:** Templates are associated with business categories (parent or subcategory)

---

## Approved Approach: Phased Implementation

### Phase 1: Core Foundation (Week 1)

- Database schema + migrations
- Basic CRUD operations with DataTable
- Simple form-based block configuration (JSON editor)
- Category association
- Permissions + audit logging

### Phase 2: Visual Block Editor (Week 2-3)

- Full React conversion of HTML block editor
- All panels: toolbar, palette, layers, canvas, inspector
- Undo/redo, viewport switching
- Live preview

### Phase 3: Advanced Features (Week 4)

- Preview modal
- Duplicate template
- Usage tracking
- Featured flags
- Bulk operations

---

## Database Schema

### Templates Table

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE NOT NULL,
  description TEXT,
  preview_image_url VARCHAR(500),

  -- Category relationship (can be parent OR subcategory)
  category_id UUID REFERENCES business_categories(id) ON DELETE SET NULL,

  -- Block configuration
  blocks_json JSONB NOT NULL,
  html_snapshot TEXT NOT NULL,

  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published'

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  -- Ownership & audit
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category_id);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_featured ON templates(is_featured);
CREATE INDEX idx_templates_sort ON templates(sort_order);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE UNIQUE INDEX idx_templates_slug ON templates(slug);
```

### Relations

- Template → BusinessCategory (many-to-one)
- Template → User/Staff (many-to-one, createdBy)
- Template → AuditLogs (one-to-many)

---

## Block Configuration Structure

### JSON Schema

```typescript
interface BlockConfig {
  id: string; // Unique block ID (e.g., "layer_abc123")
  type: BlockType; // Block type enum
  hidden: boolean; // Visibility toggle
  props: BlockProps; // Type-specific properties
}

type BlockType =
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

// Example: Grid Custom Block Props
interface GridCustomProps {
  layerName: string;
  title: string;
  subtitle: string;
  columnsCount: 1 | 2 | 3 | 4;
  gap: string; // Tailwind class (e.g., 'gap-6')
  columns: Array<{
    icon: string; // Icon name
    title: string;
    desc: string;
    bgColor: string; // Hex color
    textColor: string; // Hex color
    accentColor: string; // Hex color
    btnText?: string;
    btnUrl?: string;
  }>;
}
```

### Example blocks_json

```json
[
  {
    "id": "layer_abc123",
    "type": "navbar",
    "hidden": false,
    "props": {
      "layerName": "Main Navigation",
      "logoText": "Brand Name",
      "bgColor": "#090d16",
      "textColor": "#ffffff",
      "accentColor": "#2563eb",
      "links": [
        { "label": "Home", "url": "#" },
        { "label": "Features", "url": "#features" }
      ],
      "ctaText": "Get Started",
      "ctaUrl": "#signup"
    }
  },
  {
    "id": "layer_def456",
    "type": "hero",
    "hidden": false,
    "props": {
      "layerName": "Hero Section",
      "badge": "🚀 New Release",
      "title": "Build Your Dream Website",
      "subtitle": "Create stunning websites without code",
      "buttonText": "Start Free Trial",
      "buttonUrl": "#trial",
      "bgColor": "#090d16",
      "textColor": "#ffffff",
      "bgGradient": "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
      "align": "center"
    }
  }
]
```

### HTML Snapshot Generation

Server-side function that:

1. Iterates through `blocks_json` array
2. Maps each block type to HTML template function
3. Injects props into template literals with proper escaping
4. Wraps in full HTML document structure (DOCTYPE, head, body, Tailwind CDN)
5. Returns complete HTML string stored in `html_snapshot` field

**Purpose:** Fast rendering for client previews without re-computing HTML from JSON.

---

## Permission Model

### New Permissions

```typescript
// lib/auth/permissions.ts - additions
TEMPLATES_VIEW: "templates.view";
TEMPLATES_CREATE: "templates.create";
TEMPLATES_UPDATE_OWN: "templates.update.own"; // Edit own templates
TEMPLATES_UPDATE_ANY: "templates.update.any"; // Edit any template
TEMPLATES_DELETE_OWN: "templates.delete.own"; // Delete own
TEMPLATES_DELETE_ANY: "templates.delete.any"; // Delete any
TEMPLATES_PUBLISH: "templates.publish"; // Publish to clients
TEMPLATES_MANAGE_ALL: "templates.manage.all"; // Super permission
```

### Role Permission Mapping

**Template Designer Role** (new role to create):

- `templates.view`
- `templates.create`
- `templates.update.own`
- `templates.delete.own`

**Template Manager Role** (new role):

- All Template Designer permissions
- `templates.update.any`
- `templates.delete.any`
- `templates.publish`

**Admin/Super Admin** (existing roles):

- `templates.manage.all` (grants all template permissions)

### Authorization Logic

```typescript
// Ownership-based authorization
async function canEditTemplate(templateId: string, userId: string) {
  const hasUpdateAny = await hasPermission(userId, "templates.update.any");
  if (hasUpdateAny) return true;

  const template = await getTemplateById(templateId);
  const hasUpdateOwn = await hasPermission(userId, "templates.update.own");

  return hasUpdateOwn && template.createdBy === userId;
}
```

### Audit Log Events

Track these actions in `audit_logs` table:

- `template.created`
- `template.updated` (log changed fields in metadata)
- `template.deleted` (soft delete)
- `template.published` (status change to published)
- `template.unpublished` (status change to draft)
- `template.duplicated`
- `template.used` (when client creates site from template)

---

## File Structure

Following existing patterns (business-categories, user-management):

```
features/templates/
├── actions.ts                    # Server actions (create, update, delete)
├── service.ts                    # Business logic layer
├── queries.ts                    # Database queries
├── types.ts                      # TypeScript interfaces
├── validation.ts                 # Zod schemas
├── components/
│   ├── index.ts
│   ├── template-data-table.tsx   # Index page table
│   ├── template-form-basic.tsx   # Phase 1: Simple form
│   └── block-editor/             # Phase 2: Full visual editor
│       ├── index.tsx             # Main editor component
│       ├── toolbar.tsx           # Top toolbar
│       ├── block-palette.tsx     # Left sidebar - add blocks
│       ├── layer-tree.tsx        # Left sidebar - manage layers
│       ├── canvas.tsx            # Center - preview canvas
│       ├── inspector-panel.tsx   # Right sidebar - edit props
│       ├── viewport-switcher.tsx # Desktop/tablet/mobile toggle
│       └── blocks/               # Individual block renderers
│           ├── navbar-block.tsx
│           ├── hero-block.tsx
│           ├── container-block.tsx
│           ├── grid-custom-block.tsx
│           ├── heading-block.tsx
│           ├── paragraph-block.tsx
│           ├── image-block.tsx
│           ├── pricing-block.tsx
│           ├── form-contact-block.tsx
│           └── footer-block.tsx
├── table/
│   ├── template-columns.tsx      # DataTable columns definition
│   ├── template-filters.ts       # Filter configurations
│   └── template-bulk-actions.tsx # Bulk operations
└── lib/
    ├── block-catalog.ts          # Block type definitions & defaults
    ├── html-generator.ts         # Generate HTML snapshot from JSON
    └── block-validator.ts        # Validate block configs

lib/db/schema/
├── templates.ts                  # New schema file
└── index.ts                      # Export templates schema

app/(staff)/staff/templates/
├── page.tsx                      # Index with DataTable
├── create/
│   └── page.tsx                  # Create template page
└── [id]/
    └── edit/
        └── page.tsx              # Edit template page
```

---

## UI/UX Flow

### Index Page (`/staff/templates`)

**Layout:**

- `PageHeader` with:
  - Title: "Website Templates"
  - Description: "Create and manage website templates for clients"
  - Action: "Create Template" button (links to `/staff/templates/create`)
- `DataTable` with columns:
  - **Preview:** Thumbnail image (60x60px, rounded)
  - **Name:** Template name with featured badge (⭐) if `isFeatured`
  - **Category:** Display with breadcrumb if subcategory (e.g., "Food & Beverage > Restaurant")
  - **Status:** Badge (Draft: gray, Published: green)
  - **Usage:** Count with icon (shows `usageCount`)
  - **Created By:** Staff user name
  - **Last Updated:** Relative time (e.g., "2 days ago")
  - **Actions:** Dropdown with View, Edit, Duplicate, Delete

**Features:**

- **Search:** By name/description (debounced)
- **Filters:**
  - Status: All, Draft, Published
  - Category: Tree select (parent + subcategories)
  - Featured: All, Featured Only
  - Created By: All, Created by Me
- **Bulk Actions:**
  - Publish Selected
  - Unpublish Selected
  - Delete Selected
  - Set as Featured
- **Export:** CSV/Excel with template metadata
- **Sorting:** Name, Usage Count, Created Date, Last Used

### Create Page (`/staff/templates/create`)

**Phase 1 Layout (Form-based):**

- `PageHeader` with "Create Template" title
- Form with sections:
  1. **Basic Information**
     - Name (required, max 200 chars)
     - Slug (auto-generated from name, editable)
     - Description (textarea, optional)
     - Category (tree select: parent or subcategory)
     - Preview Image URL (text input)
  2. **Block Configuration**
     - JSON editor with syntax highlighting (Monaco Editor or similar)
     - Validation errors displayed inline
     - "Add Sample Blocks" button (loads preset structure)
  3. **Settings**
     - Featured toggle
     - Sort Order (number input, default 0)
     - Status (Draft/Published radio)
- **Side Panel:** Live preview rendering blocks (iframe or sandboxed div)
- **Actions:**
  - Save as Draft (primary button)
  - Publish (secondary button)
  - Cancel (link back to index)

**Phase 2 Layout (Visual Editor):**

- Full-screen editor matching HTML example structure:
  - **Top Toolbar:**
    - Logo/Brand
    - Viewport switcher (Desktop/Tablet/Mobile buttons)
    - Undo/Redo buttons (with disabled state)
    - Import JSON / Export JSON buttons
    - Preview Mode toggle
    - Save as Draft / Publish buttons
  - **Left Sidebar (320px):**
    - Tabs: Blocks, Layers, Templates, Settings
    - **Blocks Tab:** Categorized block palette (click to add)
    - **Layers Tab:** Tree view of all blocks with controls (show/hide, move up/down, delete)
    - **Templates Tab:** Load preset template structures
    - **Settings Tab:** Global page settings (title, background, font)
  - **Center Canvas:**
    - Responsive preview container (width changes with viewport)
    - Grid background pattern
    - Blocks with hover outlines and selection state
    - Floating action bar on selected block (move, duplicate, delete)
  - **Right Inspector Panel (320px):**
    - Tabs: Content, Style, Grid/Advanced
    - Dynamic form based on selected block type
    - Color pickers (hex input + visual picker)
    - Text inputs, textareas, selects
    - Array editors for columns/links/features

### Edit Page (`/staff/templates/[id]/edit`)

Same layout as Create but:

- Pre-populated with existing data
- Header shows: "Edit Template: [Name]"
- Metadata displayed: "Created by [User] on [Date]"
- Additional actions in toolbar:
  - **Duplicate:** Creates copy with "(Copy)" suffix
  - **View Usage:** Shows which client sites use this template
  - **Delete:** Soft delete with confirmation
- Authorization check: Must own template OR have `update.any` permission

### Preview Modal (Phase 3)

Full-screen modal showing:

- Template rendered in iframe
- Viewport switcher (desktop/tablet/mobile)
- Close button
- "Use This Template" button (for future client-facing feature)

---

## Data Flow

### Template Creation Flow

```
1. User fills form → Client-side validation (Zod)
2. Submit form → Calls Server Action (actions.ts)
3. Server Action:
   a. Authorize user (check TEMPLATES_CREATE permission)
   b. Validate input (Zod schema)
   c. Call service.createTemplate()
4. Service Layer (service.ts):
   a. Validate blocks JSON structure
   b. Generate slug if not provided
   c. Generate HTML snapshot from blocks
   d. Insert to database (queries.ts)
   e. Create audit log entry
5. Return success → Revalidate path
6. Redirect to edit page with success toast
```

### Block Editor State Management (Phase 2)

Using React `useState` and custom hooks:

```typescript
interface EditorState {
  blocks: BlockConfig[]; // Array of block configurations
  selectedBlockId: string | null; // Currently selected block
  viewport: "desktop" | "tablet" | "mobile";
  history: BlockConfig[][]; // History stack for undo
  historyIndex: number; // Current position in history
  isDirty: boolean; // Unsaved changes flag
}

// Custom hooks
useBlockEditor(initialBlocks); // Main editor state
useUndoRedo(blocks, setBlocks); // Undo/redo logic
useAutoSave(blocks, templateId); // Auto-save every 30s
```

### HTML Snapshot Generation

Server-side function (`lib/html-generator.ts`):

```typescript
function generateHTMLSnapshot(blocks: BlockConfig[]): string {
  const head = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Template Preview</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body class="font-sans antialiased">
  `;

  const bodyContent = blocks
    .filter((block) => !block.hidden)
    .map((block) => renderBlockToHTML(block))
    .join("\n");

  const footer = `
    </body>
    </html>
  `;

  return head + bodyContent + footer;
}

function renderBlockToHTML(block: BlockConfig): string {
  // Switch on block.type and return HTML string
  // Each block type has its own template function
  // Props are injected with proper escaping
}
```

---

## Phase Breakdown & Deliverables

### Phase 1: Core Foundation (Week 1)

**Database & Schema:**

- ✅ Create `templates.ts` schema file
- ✅ Generate migration
- ✅ Add to schema index exports

**Permissions & Roles:**

- ✅ Add template permissions to `PERMISSIONS` constant
- ✅ Create Template Designer and Template Manager roles
- ✅ Seed roles with permissions

**Service Layer:**

- ✅ `features/templates/types.ts` - TypeScript interfaces
- ✅ `features/templates/validation.ts` - Zod schemas
- ✅ `features/templates/queries.ts` - Database queries (CRUD)
- ✅ `features/templates/service.ts` - Business logic
- ✅ `features/templates/actions.ts` - Server actions
- ✅ `features/templates/lib/block-validator.ts` - Block validation
- ✅ `features/templates/lib/html-generator.ts` - HTML generation

**UI Components:**

- ✅ `app/(staff)/staff/templates/page.tsx` - Index with DataTable
- ✅ `features/templates/components/template-data-table.tsx` - Table wrapper
- ✅ `features/templates/table/template-columns.tsx` - Column definitions
- ✅ `features/templates/table/template-filters.ts` - Filter configs
- ✅ `app/(staff)/staff/templates/create/page.tsx` - Create page
- ✅ `app/(staff)/staff/templates/[id]/edit/page.tsx` - Edit page
- ✅ `features/templates/components/template-form-basic.tsx` - Form component

**What Staff Can Do:**

- View all templates in searchable/filterable table
- Create templates by editing JSON in form
- Assign templates to categories (parent or subcategory)
- Set draft/published status
- Edit existing templates (with ownership checks)
- Delete templates (soft delete)
- See live preview of blocks rendering

**Success Criteria:**

- All CRUD operations work
- Permissions enforced correctly
- Audit logs created for all actions
- HTML snapshots generate correctly
- Category association works for parent and subcategories

---

### Phase 2: Visual Block Editor (Week 2-3)

**Block Editor Components:**

- ✅ `features/templates/components/block-editor/index.tsx` - Main editor
- ✅ `features/templates/components/block-editor/toolbar.tsx` - Top toolbar
- ✅ `features/templates/components/block-editor/block-palette.tsx` - Add blocks sidebar
- ✅ `features/templates/components/block-editor/layer-tree.tsx` - Manage layers sidebar
- ✅ `features/templates/components/block-editor/canvas.tsx` - Preview canvas
- ✅ `features/templates/components/block-editor/inspector-panel.tsx` - Edit block props
- ✅ `features/templates/components/block-editor/viewport-switcher.tsx` - Responsive toggle
- ✅ `features/templates/lib/block-catalog.ts` - Block definitions and defaults

**Block Renderers:**

- ✅ `features/templates/components/block-editor/blocks/navbar-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/hero-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/container-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/grid-custom-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/heading-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/paragraph-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/image-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/pricing-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/form-contact-block.tsx`
- ✅ `features/templates/components/block-editor/blocks/footer-block.tsx`

**Editor Features:**

- ✅ Add blocks from palette
- ✅ Select blocks on canvas
- ✅ Edit block props in inspector (dynamic form based on type)
- ✅ Move blocks up/down in layer order
- ✅ Duplicate blocks
- ✅ Delete blocks
- ✅ Show/hide blocks
- ✅ Undo/redo (history stack)
- ✅ Viewport switching (desktop/tablet/mobile)
- ✅ Export/import JSON
- ✅ Auto-save (every 30 seconds)
- ✅ Unsaved changes warning

**UI Updates:**

- ✅ Replace JSON editor in create/edit pages with visual editor
- ✅ Keep basic info form (name, category, etc.) above or in sidebar

**What Staff Can Do:**

- Build templates visually (no JSON editing required)
- See live preview while editing
- Drag blocks to reorder (via move up/down buttons)
- Customize every aspect of each block (colors, text, spacing, etc.)
- Switch viewport to see responsive design
- Undo mistakes
- Import existing JSON layouts
- Export layouts for backup

**Success Criteria:**

- Editor matches HTML example functionality
- All 10 block types render correctly
- Inspector forms are type-safe and validated
- Undo/redo works reliably
- Auto-save prevents data loss
- Responsive preview is accurate

---

### Phase 3: Advanced Features (Week 4)

**Preview & Usage:**

- ✅ Template preview modal (full-screen)
- ✅ Usage tracking:
  - Increment `usage_count` when client uses template
  - Update `last_used_at` timestamp
  - Show usage stats in index table
- ✅ "View Usage" feature in edit page (lists client sites using this template)

**Template Management:**

- ✅ Duplicate template functionality
  - Creates exact copy with "(Copy)" suffix
  - New slug generated
  - Preserves blocks JSON
  - Sets status to Draft
  - Sets createdBy to current user
- ✅ Featured templates:
  - Toggle in form/editor
  - Badge display in table
  - Filter by featured
  - Featured templates shown first to clients (future)

**Bulk Operations:**

- ✅ `features/templates/table/template-bulk-actions.tsx` - Bulk action components
- ✅ Publish selected (draft → published)
- ✅ Unpublish selected (published → draft)
- ✅ Delete selected (soft delete with confirmation)
- ✅ Set as featured (batch update)

**Data Export:**

- ✅ Export to CSV (name, status, category, usage, created by, dates)
- ✅ Export to Excel (same fields, formatted)

**Advanced Filters:**

- ✅ Multi-select category filter (with parent/child hierarchy)
- ✅ Date range filter (created date, last used date)
- ✅ Usage count range filter (e.g., "used 10+ times")
- ✅ Sort by usage count (most/least used)

**What Staff Can Do:**

- Preview templates in full-screen before publishing
- See analytics on template usage
- Duplicate successful templates as starting points
- Mark high-quality templates as featured
- Bulk publish/unpublish/delete templates
- Export template data for reporting
- Filter by advanced criteria (usage, dates, etc.)

**Success Criteria:**

- Preview modal renders correctly
- Usage tracking integrates with client site creation (stub for now)
- Duplicate creates perfect copy
- Bulk operations work on multiple selections
- Export generates valid CSV/Excel files
- All filters work correctly

---

## Technical Considerations

### Performance

- **HTML Snapshot:** Pre-generated HTML avoids runtime JSON-to-HTML conversion for client previews
- **DataTable Pagination:** Use server-side pagination for large template lists
- **Lazy Load Images:** Preview thumbnails loaded lazily in table
- **Debounced Search:** Prevent excessive database queries

### Security

- **Authorization Checks:** Every action checks permissions and ownership
- **Input Validation:** Zod schemas on client and server
- **SQL Injection:** Drizzle ORM parameterizes queries
- **XSS Prevention:** HTML generation escapes user input
- **Audit Logging:** All actions tracked with user ID and metadata

### Data Integrity

- **Soft Delete:** `deleted_at` timestamp instead of hard delete
- **Foreign Key Constraints:** Proper cascade rules (SET NULL on category/user delete)
- **Unique Constraints:** Slug must be unique
- **JSON Validation:** Blocks JSON validated against schema before save

### Scalability

- **Indexing:** Proper indexes on frequently queried columns
- **Caching:** Consider caching popular templates (future)
- **CDN:** Preview images served from CDN (future)
- **Database:** PostgreSQL JSONB for efficient block storage and querying

---

## Migration Path

### From Phase 1 to Phase 2

- No schema changes required
- Editor replaces JSON textarea in UI
- Existing templates work seamlessly (same JSON structure)
- Staff can switch between JSON view and visual editor

### From Phase 2 to Phase 3

- Minor schema additions possible (e.g., usage tracking fields)
- Existing templates retain all functionality
- New features are additive

---

## Testing Strategy

### Unit Tests

- Block validation functions
- HTML generation from JSON
- Permission checks
- Slug generation

### Integration Tests

- CRUD operations end-to-end
- Authorization enforcement
- Audit log creation
- Category association

### E2E Tests (Playwright)

- Create template flow
- Edit template flow
- Visual editor interactions
- Bulk operations
- Search and filtering

---

## Future Enhancements (Post-MVP)

- **Template Versioning:** Track template history, allow rollback
- **Template Categories/Tags:** Additional categorization beyond business categories
- **Template Marketplace:** Allow third-party designers to submit templates
- **Template Analytics:** Detailed usage analytics dashboard
- **A/B Testing:** Test different template versions
- **Template Comments:** Staff collaboration on templates
- **Template Approval Workflow:** Draft → Review → Published
- **Template Import/Export:** Backup/restore templates
- **Template Localization:** Multi-language support

---

## Success Metrics

### Phase 1

- 10+ templates created by staff
- Zero permission bypass incidents
- All audit logs captured correctly

### Phase 2

- 90%+ of staff prefer visual editor over JSON
- Average template creation time < 30 minutes
- Zero data loss incidents (auto-save working)

### Phase 3

- Top 5 templates account for 50%+ of usage
- 20+ templates marked as featured
- Bulk operations used regularly (5+ times/week)

---

## Conclusion

This design provides a comprehensive template management system that balances immediate needs (Phase 1) with long-term vision (Phases 2-3). The phased approach reduces risk while delivering incremental value. The architecture is extensible for future enhancements like versioning, marketplace, and advanced analytics.

**Next Step:** Create implementation plan using `writing-plans` skill.
