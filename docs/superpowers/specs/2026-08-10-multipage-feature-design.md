# Multipage Feature Design

**Date**: 2026-08-10  
**Status**: Approved  
**Scope**: Templates, Websites, Admin Panel

---

## Overview

Add multipage support to the website builder, allowing users to create and manage multiple pages within a single template or website. Each page has its own sections, settings, and URL slug.

---

## Requirements Summary

| Requirement | Decision |
|-------------|----------|
| Editor Navigation | Tab-based |
| Page Types | Free pages (unlimited) |
| Published Navigation | Auto-generated navigation menu |
| Backward Compatibility | Auto-migrate existing data |
| URL Structure | Slug-based (`/page-slug`) |
| Page Limit | Unlimited |
| Scope | Templates + Websites + Admin Panel |

---

## 1. Data Model

### TypeScript Types

```typescript
// components/website-editor/lib/block-types.ts

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  pageSettings: PageSettings;
  isHomePage: boolean;
  sortOrder: number;
}

interface WebsiteData {
  pages: Page[];
}
```

### Database Schema Changes

**Templates Table** (`lib/db/schema/templates.ts`):
```typescript
templates: {
  // ... existing fields
  pages: jsonb('pages').$type<Page[]>().default([]),
  // DEPRECATED: sections and pageSettings remain for backward compat
}
```

**Websites Table** (`lib/db/schema/websites.ts`):
```typescript
websites: {
  // ... existing fields
  pages: jsonb('pages').$type<Page[]>().default([]),
  // DEPRECATED: sections and pageSettings remain for backward compat
}
```

### Migration Function

```typescript
// lib/db/migrations/migrate-to-multipage.ts

function migrateToMultipage(
  sections: Section[],
  pageSettings: PageSettings
): Page[] {
  return [{
    id: nanoid(),
    title: pageSettings.title || 'Home',
    slug: 'home',
    sections: sections,
    pageSettings: pageSettings,
    isHomePage: true,
    sortOrder: 0,
  }];
}
```

---

## 2. Editor UI - Tab Navigation

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [Preview] [Undo] [Redo]                    [Save] [Publish]    │
├─────────────────────────────────────────────────────────────────┤
│ [Home*] [About] [Services] [Contact] [+ Add Page]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    EDITOR CANVAS                                │
│                    (current page sections)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Behavior

1. **Tab Display**: Page title, click to switch
2. **Active Tab**: Highlighted with accent color
3. **Add Page**: Button "+" at end of tab bar
4. **Tab Context Menu**: Right-click for:
   - Rename
   - Duplicate
   - Set as Home Page
   - Delete (with confirmation)
5. **Drag to Reorder**: Tabs can be dragged to change order
6. **Home Indicator**: House icon or asterisk (*) on home page

### Editor State Updates

```typescript
// editor-provider.tsx
interface EditorState {
  pages: Page[];
  currentPageId: string;
  // ... existing state

  // New actions
  addPage: (title: string) => void;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  setCurrentPage: (pageId: string) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  duplicatePage: (pageId: string) => void;
  setHomePage: (pageId: string) => void;
}

// Computed
const currentPage = pages.find(p => p.id === currentPageId);
const currentSections = currentPage?.sections || [];
```

---

## 3. Auto Navigation Menu

### Navigation Section Template

New section type that generates auto-menu from pages:

```typescript
// lib/section-templates.ts
{
  id: 'navigation',
  title: 'Navigation Menu',
  type: 'navigation',
  properties: {
    layout: 'horizontal' | 'vertical' | 'hamburger',
    position: 'fixed' | 'sticky' | 'static',
    bgColor: string,
    textColor: string,
    activeColor: string,
    logo?: { text: string; imageUrl?: string },
    showLogo: boolean,
    showCTAButton: boolean,
    ctaText: string,
    ctaUrl: string,
  }
}
```

### Navigation Rendering

```typescript
// html-generator.ts
function generateNavigation(
  pages: Page[],
  settings: NavigationSettings
): string {
  // Generate nav links from pages array
  // Sort by sortOrder
  // Home page link: /
  // Other pages: /{slug}
}
```

### Published Website Structure

```
/ (home page)
/about
/services
/contact
/... (other pages)
```

### Navigation Behavior

1. **Auto-generated**: Navigation section auto-generates links from pages
2. **Sortable**: Link order follows page `sortOrder`
3. **Active State**: Highlights current page
4. **Responsive**: Mobile hamburger menu
5. **Configurable**: Layout, position, colors, logo, CTA button

---

## 4. HTML Generation & Save Flow

### Multi-Page HTML Generation

```typescript
// lib/html-generator.ts

interface GeneratedSite {
  indexPage: string;
  pages: { slug: string; html: string }[];
  assets: { name: string; content: string }[];
}

function generateMultiPageHTML(
  pages: Page[],
  globalSettings: GlobalSettings
): GeneratedSite {
  const navHtml = generateNavigation(pages, globalSettings.navigation);

  const generatedPages = pages.map(page => ({
    slug: page.slug,
    html: generatePageHTML(page, navHtml, globalSettings),
  }));

  const homePage = pages.find(p => p.isHomePage);
  const indexPage = generatePageHTML(homePage, navHtml, globalSettings);

  return {
    indexPage,
    pages: generatedPages,
    assets: generateSharedAssets(globalSettings),
  };
}
```

### Save Flow Updates

```typescript
// API endpoints updated
interface SaveRequest {
  pages: Page[];
  // DEPRECATED: sections, pageSettings still accepted for backward compat
}

// Server action
async function saveTemplateSections(templateId: string, pages: Page[]) {
  // 1. Validate pages
  // 2. Update DB: pages JSONB
  // 3. Regenerate htmlSnapshot (multi-page)
  // 4. Return success
}
```

### Key Decisions

1. **Shared Navigation**: Navigation section renders on all pages with same links
2. **Relative URLs**: Internal links use relative URLs (`/about`, `/services`)
3. **Single HTML File**: For preview, concatenate all pages
4. **Separate Files**: For publish, generate separate files per page

---

## 5. Migration & Backward Compatibility

### Auto-Migration Strategy

```typescript
// Run on app startup or as migration script
export async function migrateToMultipage() {
  // 1. Load all templates with old format
  const templates = await db.select()
    .from(templatesTable)
    .where(isNull(templatesTable.deletedAt));

  // 2. Transform each template
  for (const template of templates) {
    if (!template.pages && template.sections) {
      const pages = migrateToMultipage(
        template.sections as Section[],
        template.pageSettings as PageSettings
      );

      await db.update(templatesTable)
        .set({ pages })
        .where(eq(templatesTable.id, template.id));
    }
  }

  // Same for websites
}
```

### Backward Compatibility

1. **API Endpoints**: Continue accepting `sections` + `pageSettings` format
2. **Editor**: Auto-detect format and migrate on load
3. **New Format**: All new data saved in `pages` format
4. **Deprecation**: Old format fields marked deprecated but functional

### Testing Checklist

- [ ] Existing templates load correctly
- [ ] Existing websites load correctly
- [ ] New multipage template creation works
- [ ] New multipage website creation works
- [ ] Save/load cycle preserves all pages
- [ ] Navigation menu renders correctly
- [ ] HTML generation produces valid multi-page output
- [ ] Editor tab switching works smoothly
- [ ] Page CRUD operations work (add, rename, delete, reorder)
- [ ] Home page designation works

### Rollback Plan

If issues arise:
1. Disable multipage feature flag
2. Run reverse migration
3. Editor reverts to single-page mode

---

## Files to Modify

### Core Editor
- `components/website-editor/lib/block-types.ts` - Add Page type
- `components/website-editor/editor-provider.tsx` - Add page state management
- `components/website-editor/index.tsx` - Add tab bar UI
- `components/website-editor/lib/html-generator.ts` - Multi-page generation
- `components/website-editor/lib/section-templates.ts` - Add navigation template

### Database
- `lib/db/schema/templates.ts` - Add pages JSONB field
- `lib/db/schema/websites.ts` - Add pages JSONB field
- `lib/db/migrations/` - Migration script

### Features
- `features/templates/service.ts` - Update save logic
- `features/templates/actions.ts` - Update server actions
- `features/websites/service.ts` - Update save logic
- `features/websites/actions.ts` - Update server actions

### API Routes
- `app/api/templates/[id]/sections/route.ts` - Accept pages format
- `app/api/websites/[id]/sections/route.ts` - Accept pages format

### Editor Wrappers
- `components/website-editor/template-editor.tsx` - Pass pages
- `components/website-editor/website-editor-client.tsx` - Pass pages

---

## Implementation Order

1. **Phase 1: Data Layer**
   - Update TypeScript types
   - Update database schemas
   - Create migration script

2. **Phase 2: Editor Core**
   - Add page state management
   - Add tab bar UI
   - Implement page CRUD operations

3. **Phase 3: Navigation**
   - Create navigation section template
   - Implement auto-link generation

4. **Phase 4: HTML Generation**
   - Update HTML generator for multi-page
   - Update save flow

5. **Phase 5: Migration & Testing**
   - Run migration
   - Test all scenarios
   - Verify backward compatibility

---

## Success Criteria

- [ ] Users can create multiple pages in templates
- [ ] Users can create multiple pages in websites
- [ ] Tab-based navigation works smoothly
- [ ] Navigation menu auto-generates from pages
- [ ] Existing single-page data loads correctly
- [ ] HTML generation produces valid multi-page output
- [ ] All CRUD operations work (add, rename, delete, reorder)
- [ ] Home page designation works
- [ ] Save/load cycle preserves all data
