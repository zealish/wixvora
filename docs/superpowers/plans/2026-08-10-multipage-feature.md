# Multipage Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multipage support to templates and website editor.

**Architecture:** Nested JSONB approach — each template/website stores a `pages` array. Each page has its own sections, settings, and slug. Editor uses tab-based navigation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS

## Global Constraints

- TypeScript strict mode
- Follow existing feature-based architecture
- Backward compatibility: auto-migrate existing single-page data
- No breaking changes to public APIs

## File Structure

| File | Change |
|------|--------|
| `components/website-editor/lib/block-types.ts` | Add `Page`, `NavigationSettings` |
| `components/website-editor/editor-provider.tsx` | Page state management, CRUD actions |
| `components/website-editor/index.tsx` | Tab bar UI, page context menu |
| `components/website-editor/lib/html-generator.ts` | Multi-page HTML generation |
| `components/website-editor/lib/section-templates.ts` | Navigation section template |
| `components/website-editor/template-editor.tsx` | Pass pages data |
| `components/website-editor/website-editor-client.tsx` | Pass pages data |
| `lib/db/schema/templates.ts` | Add `pages` JSONB field |
| `lib/db/schema/websites.ts` | Add `pages` JSONB field |
| `features/templates/actions.ts` | Accept pages format |
| `features/websites/actions.ts` | Accept pages format |

---

## Task 1: Update TypeScript Types

**Files:** Modify `components/website-editor/lib/block-types.ts`

**Produces:** `Page`, `NavigationSettings` interfaces

- [ ] **Step 1:** Add Page and NavigationSettings interfaces to block-types.ts
- [ ] **Step 2:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 3:** Commit

---

## Task 2: Update Database Schemas

**Files:** Modify `lib/db/schema/templates.ts`, `lib/db/schema/websites.ts`

**Consumes:** `Page` from block-types
**Produces:** Updated schemas with `pages` JSONB field

- [ ] **Step 1:** Add `pages` field to templates schema
- [ ] **Step 2:** Add `pages` field to websites schema
- [ ] **Step 3:** Run `pnpm drizzle-kit generate`
- [ ] **Step 4:** Run `pnpm drizzle-kit migrate`
- [ ] **Step 5:** Commit

---

## Task 3: Update Editor Provider — Page State Management

**Files:** Modify `components/website-editor/editor-provider.tsx`

**Consumes:** `Page` from block-types
**Produces:** Updated `EditorContextValue` with page actions

- [ ] **Step 1:** Update imports to include `Page`
- [ ] **Step 2:** Update `EditorContextValue` with page state and actions
- [ ] **Step 3:** Update `EditorProvider` props to accept `initialPages`
- [ ] **Step 4:** Add page CRUD actions (addPage, removePage, updatePage, setCurrentPage, reorderPages, duplicatePage, setHomePage)
- [ ] **Step 5:** Update section actions to operate on current page
- [ ] **Step 6:** Update saveWebsite to pass pages
- [ ] **Step 7:** Update context value
- [ ] **Step 8:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 9:** Commit

---

## Task 4: Add Tab Bar UI to Editor

**Files:** Modify `components/website-editor/index.tsx`

**Consumes:** page state and actions from EditorContext
**Produces:** Tab bar UI with page switching

- [ ] **Step 1:** Add PageTabBar component with tab rendering
- [ ] **Step 2:** Add "Add Page" button
- [ ] **Step 3:** Add right-click context menu (rename, duplicate, set home, delete)
- [ ] **Step 4:** Integrate tab bar into editor layout
- [ ] **Step 5:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 6:** Commit

---

## Task 5: Add Navigation Section Template

**Files:** Modify `components/website-editor/lib/section-templates.ts`

**Produces:** Navigation section template

- [ ] **Step 1:** Add navigation section factory to SECTION_TEMPLATES
- [ ] **Step 2:** Commit

---

## Task 6: Update HTML Generator for Multi-Page

**Files:** Modify `components/website-editor/lib/html-generator.ts`

**Produces:** `generateMultiPageHTML` function

- [ ] **Step 1:** Add `generateNavigation` function
- [ ] **Step 2:** Add `generateMultiPageHTML` function
- [ ] **Step 3:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 4:** Commit

---

## Task 7: Update Editor Wrappers

**Files:** Modify `template-editor.tsx`, `website-editor-client.tsx`

- [ ] **Step 1:** Update TemplateEditorWrapper to pass `initialPages`
- [ ] **Step 2:** Update WebsiteEditorWrapper to pass `initialPages`
- [ ] **Step 3:** Update `WebsiteEditor` component props
- [ ] **Step 4:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 5:** Commit

---

## Task 8: Update Server Actions

**Files:** Modify `features/templates/actions.ts`, `features/websites/actions.ts`

- [ ] **Step 1:** Update `updateTemplateSectionsAction` to accept pages
- [ ] **Step 2:** Update `updateWebsiteSectionsAction` to accept pages
- [ ] **Step 3:** Run `pnpm tsc --noEmit` — expect PASS
- [ ] **Step 4:** Commit

---

## Task 9: Migration Script for Existing Data

**Files:** Create migration utility

- [ ] **Step 1:** Create migration function that wraps existing sections into pages format
- [ ] **Step 2:** Add auto-detect in editor provider (if no pages, wrap sections)
- [ ] **Step 3:** Commit

---

## Task 10: Testing & Verification

- [ ] **Step 1:** Verify existing templates load correctly
- [ ] **Step 2:** Verify existing websites load correctly
- [ ] **Step 3:** Test creating new multipage template
- [ ] **Step 4:** Test creating new multipage website
- [ ] **Step 5:** Test page CRUD operations
- [ ] **Step 6:** Test tab switching
- [ ] **Step 7:** Test save/load cycle
- [ ] **Step 8:** Test HTML generation

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
