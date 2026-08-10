# Design: Template-to-Website Integration with Unified Editor

**Date:** 2026-08-10
**Status:** Approved
**Scope:** Phase 1 - Single page website creation from templates

---

## 1. Overview

Integrate the website-editor (Section/Element system) with both templates and websites, enabling staff to create templates visually and clients to create/edit websites from those templates.

### Flow

```
Staff Flow:
/staff/templates -> Create Template Metadata -> /templates-editor/[id] -> Edit sections visually -> Save

Client Flow:
/dashboard -> Create New Website -> Select Template -> Copy sections -> /website-editor/[id] -> Edit & Save
```

### Key Principles

- Templates and websites use the **same data format** (Section/Element from website-editor)
- Website is an **independent copy** of template after creation (no live relation, only templateId for tracking)
- **Single unified editor** component reused for both staff and client
- Single page per website (multi-page in future phase)

---

## 2. Database Schema Changes

### 2.1 Modify `templates` table

**Remove:**
- `blocksJson: BlockConfig[]` - Old block system

**Add/Replace:**
- `sections: jsonb Section[]` - Section/Element data from website-editor
- `pageSettings: jsonb PageSettings` - Keep but update type to match website-editor format

**Keep unchanged:**
- id, name, slug, description, previewImageUrl, categoryId
- isFeatured, sortOrder, status, usageCount, lastUsedAt
- htmlSnapshot, createdBy, timestamps, deletedAt

### 2.2 Modify `websites` table

**Remove/Replace:**
- `htmlContent: text` - Replace with `sections: jsonb Section[]`
- `cssStyles: text` - Remove (handled by editor)
- `jsScripts: text` - Remove (handled by editor)

**Add:**
- `sections: jsonb Section[]` - Website editor sections data
- `pageSettings: jsonb PageSettings` - Page settings from editor

**Keep unchanged:**
- id, name, slug, description, ownerId, templateId
- status, isPublished, publishedAt
- mainDomain, subdomain, customDomain, customDomainVerified, sslEnabled
- seoTitle, seoDescription, seoKeywords, seoImage, seoCanonicalUrl
- createdAt, updatedAt, deletedAt

---

## 3. File Changes

### 3.1 Database Schema

| File | Action | Change |
|------|--------|--------|
| `lib/db/schema/templates.ts` | Modify | Replace `blocksJson` with `sections`, update `pageSettings` type |
| `lib/db/schema/websites.ts` | Modify | Add `sections`, `pageSettings`; remove `htmlContent`, `cssStyles`, `jsScripts` |

### 3.2 Templates Feature

| File | Action | Change |
|------|--------|--------|
| `features/templates/types.ts` | Modify | Update `Template` interface: `blocks` -> `sections: Section[]` |
| `features/templates/queries.ts` | Modify | Update `getTemplateById` to map `sectionsJson` -> `sections` |
| `features/templates/service.ts` | Modify | Update create/update to use `sections` instead of `blocks` |
| `features/templates/validation.ts` | Modify | Update validation schema for `sections` |
| `features/templates/components/template-form.tsx` | Modify | Remove blocks initialization, keep metadata only |

### 3.3 Website Feature (NEW)

| File | Action | Description |
|------|--------|-------------|
| `features/websites/types.ts` | Create | Website interface with sections/pageSettings |
| `features/websites/queries.ts` | Create | CRUD queries for websites |
| `features/websites/service.ts` | Create | Business logic: create from template, save sections |
| `features/websites/actions.ts` | Create | Server actions for client-side calls |
| `features/websites/validation.ts` | Create | Zod schemas for website inputs |

### 3.4 Website Editor Refactoring

| File | Action | Change |
|------|--------|--------|
| `components/website-editor/index.tsx` | Modify | Accept `initialSections`, `initialPageSettings` via props; replace Export HTML with Save |
| `components/website-editor/editor-provider.tsx` | Modify | Accept props for initial data and save callback |
| `components/website-editor/template-editor.tsx` | Create | Wrapper for staff: loads template, saves to template endpoint |
| `components/website-editor/website-editor-client.tsx` | Create | Wrapper for client: loads website, saves to website endpoint |

### 3.5 Routes

| Route | Action | Description |
|-------|--------|-------------|
| `app/templates-editor/[id]/page.tsx` | Create | Staff template editor page |
| `app/(client)/client/dashboard/page.tsx` | Create | Client dashboard with website list |
| `app/(client)/client/dashboard/websites/create/page.tsx` | Create | Template selection page |
| `app/website-editor/[id]/page.tsx` | Modify | Update to load website by ID |
| `app/api/templates/[id]/sections/route.ts` | Create | API: save template sections |
| `app/api/websites/[id]/sections/route.ts` | Create | API: save website sections |

### 3.6 Components

| File | Action | Description |
|------|--------|-------------|
| `components/templates/template-picker.tsx` | Create | Grid of templates for client selection |
| `components/dashboard/website-list.tsx` | Create | List of client's websites |

---

## 4. API Endpoints

### 4.1 Template Sections API

```
POST /api/templates/[id]/sections
  Body: { sections: Section[], pageSettings: PageSettings }
  Auth: Staff only
  Response: { success: boolean }
```

### 4.2 Website Sections API

```
POST /api/websites/[id]/sections
  Body: { sections: Section[], pageSettings: PageSettings }
  Auth: Owner only
  Response: { success: boolean }
```

### 4.3 Create Website from Template (Server Action)

```
createWebsiteFromTemplateAction(templateId, name)
  - Copy sections from template
  - Create website record
  - Increment template.usageCount
  - Return website ID
```

---

## 5. Data Flow

### 5.1 Template Creation (Staff)

1. Staff creates template metadata -> `/staff/templates/create`
2. Redirect to `/templates-editor/[id]`
3. Editor loads with empty sections (or existing if editing)
4. Staff adds/modifies sections visually
5. Save -> `POST /api/templates/[id]/sections`
6. Server saves sections + generates htmlSnapshot

### 5.2 Website Creation (Client)

1. Client goes to `/dashboard`
2. Clicks "Create New Website" -> `/dashboard/websites/create`
3. Template picker shows all published templates
4. Client selects template -> opens naming dialog
5. Server action: copy template sections -> create website record
6. Redirect to `/website-editor/[id]`
7. Editor loads with copied sections
8. Client edits and saves -> `POST /api/websites/[id]/sections`

---

## 6. Migration Strategy

Since there's only 1 test template:
- Drop and recreate templates table (test data only)
- Simpler than migration

---

## 7. Success Criteria

1. Staff can create template via website-editor
2. Client can select template and create website
3. Client can edit website via website-editor
4. Website saves independently from template
5. Template usageCount increments on website creation
