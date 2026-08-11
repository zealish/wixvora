# Copy-Paste Keyboard Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ctrl+C / Ctrl+V copy-paste for Elements and Sections in the website editor.

**Architecture:** Add clipboard state and copy/paste methods to EditorContext, wire up a global keyboard listener. All changes in two files.

**Tech Stack:** React (useState, useCallback, useEffect), TypeScript

## Global Constraints

- Reuse existing helpers: `createUniqueId()`, `updateCurrentPageSections()`, `showToast()`, `getLayout()`, `VIEWPORT_WIDTHS`
- Follow existing patterns from `duplicateElement()` for position offset
- Deep clone via `JSON.parse(JSON.stringify())`
- History tracking automatic via `pushHistory()` in `updateCurrentPageSections()`

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `components/website-editor/lib/translations.ts` | Modify | Add 4 toast translation keys |
| `components/website-editor/editor-provider.tsx` | Modify | Add clipboard state, 4 copy/paste methods, keyboard listener |

---

### Task 1: Add translation keys

**Files:**
- Modify: `components/website-editor/lib/translations.ts:78-88` (toast section of TranslationKey union)
- Modify: `components/website-editor/lib/translations.ts:187-197` (toast section of EN record)

**Interfaces:**
- Consumes: existing `TranslationKey` type and `EN` record
- Produces: 4 new translation keys usable via `t()`

- [ ] **Step 1: Add new keys to TranslationKey union type**

In `components/website-editor/lib/translations.ts`, find the toast section of the `TranslationKey` type (lines 78-87) and add 4 new entries after `'toast.redo_success'`:

```typescript
  | 'toast.redo_success'
  | 'toast.element_copied'
  | 'toast.section_copied'
  | 'toast.element_pasted'
  | 'toast.section_pasted'
```

- [ ] **Step 2: Add English translations to EN record**

In the same file, find the toast section of the `EN` record (lines 196-197) and add 4 new entries after `'toast.redo_success'`:

```typescript
  'toast.redo_success': 'Redo',
  'toast.element_copied': 'Element copied',
  'toast.section_copied': 'Section copied',
  'toast.element_pasted': 'Element pasted',
  'toast.section_pasted': 'Section pasted',
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to translations.ts

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/lib/translations.ts
git commit -m "feat(editor): add copy-paste toast translation keys"
```

---

### Task 2: Add clipboard state and copy methods

**Files:**
- Modify: `components/website-editor/editor-provider.tsx:11-68` (EditorContextValue interface)
- Modify: `components/website-editor/editor-provider.tsx:145-150` (state declarations)
- Modify: `components/website-editor/editor-provider.tsx:519-573` (value object)

**Interfaces:**
- Consumes: existing `Element`, `Section` types from `./lib/block-types`, existing `showToast`, `currentSections`, `updateCurrentPageSections`
- Produces: `clipboard` state, `copyElement()`, `copySection()` methods exposed via context

- [ ] **Step 1: Add Clipboard type and state to EditorContextValue interface**

In `components/website-editor/editor-provider.tsx`, add to the `EditorContextValue` interface (after line 30, near other state declarations):

```typescript
  clipboard: { type: 'element'; data: Element } | { type: 'section'; data: Section } | null;
```

Add these 4 method signatures after the existing methods (after line 57, near `duplicateElement`):

```typescript
  copyElement: (sectionId: string, elementId: string) => void;
  copySection: (sectionId: string) => void;
  pasteElement: (targetSectionId?: string) => void;
  pasteSection: () => void;
```

- [ ] **Step 2: Add clipboard state declaration**

In the `EditorProvider` function, after the existing state declarations (after line 150, near `isSectionModalOpen`), add:

```typescript
  const [clipboard, setClipboard] = useState<{ type: 'element'; data: Element } | { type: 'section'; data: Section } | null>(null);
```

- [ ] **Step 3: Implement copyElement method**

After the existing `duplicateElement` callback (after line 318), add:

```typescript
  const copyElement = useCallback((sectionId: string, elementId: string) => {
    const section = currentSections.find(s => s.id === sectionId);
    if (!section) return;
    const element = section.elements.find(e => e.id === elementId);
    if (!element) return;
    const clone = JSON.parse(JSON.stringify(element));
    setClipboard({ type: 'element', data: clone });
    showToast(t('toast.element_copied'));
  }, [currentSections, showToast]);
```

- [ ] **Step 4: Implement copySection method**

After `copyElement`, add:

```typescript
  const copySection = useCallback((sectionId: string) => {
    const section = currentSections.find(s => s.id === sectionId);
    if (!section) return;
    const clone = JSON.parse(JSON.stringify(section));
    setClipboard({ type: 'section', data: clone });
    showToast(t('toast.section_copied'));
  }, [currentSections, showToast]);
```

- [ ] **Step 5: Add methods and state to context value object**

In the `value` object (around line 519-573), add these entries:

```typescript
    clipboard,
    copyElement,
    copySection,
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors. `pasteElement` and `pasteSection` will show as missing — that's expected until Task 3.

- [ ] **Step 7: Commit**

```bash
git add components/website-editor/editor-provider.tsx
git commit -m "feat(editor): add clipboard state and copy element/section methods"
```

---

### Task 3: Implement paste methods

**Files:**
- Modify: `components/website-editor/editor-provider.tsx` (pasteElement and pasteSection callbacks)

**Interfaces:**
- Consumes: `clipboard` state, `currentSections`, `selectedSectionId`, `updateCurrentPageSections`, `setSelectedSectionId`, `setSelectedElementId`, `showToast`, `createUniqueId`, `getLayout`, `VIEWPORT_WIDTHS`
- Produces: `pasteElement()`, `pasteSection()` methods exposed via context

- [ ] **Step 1: Add imports for getLayout and VIEWPORT_WIDTHS**

At the top of `editor-provider.tsx`, the import on line 7 already imports from `./lib/viewport-utils`. Verify it includes `getLayout` and `VIEWPORT_WIDTHS`:

```typescript
import { getLayout, VIEWPORT_WIDTHS } from "./lib/viewport-utils";
```

- [ ] **Step 2: Implement pasteElement method**

After `copySection` callback, add:

```typescript
  const pasteElement = useCallback((targetSectionId?: string) => {
    if (!clipboard || clipboard.type !== 'element') return;
    const destId = targetSectionId || selectedSectionId;
    if (!destId) {
      if (currentSections.length > 0 && currentSections[0]) {
        pasteElement(currentSections[0].id);
      }
      return;
    }

    const copy = JSON.parse(JSON.stringify(clipboard.data));
    copy.id = createUniqueId('el');
    copy.name = (copy.name || 'Element') + ' (Copy)';

    (['desktop', 'tablet', 'mobile'] as Viewport[]).forEach(vp => {
      const l = getLayout(copy, vp);
      const vpWidth = VIEWPORT_WIDTHS[vp];
      let newX = l.x + 20;
      let newY = l.y + 20;
      if (newX + l.width > vpWidth - 10) {
        newX = Math.max(10, vpWidth - l.width - 10);
      }
      copy.layouts[vp] = { ...l, x: newX, y: newY };
    });

    const updated = currentSections.map(sec => {
      if (sec.id === destId) {
        return { ...sec, elements: [...sec.elements, copy] };
      }
      return sec;
    });

    updateCurrentPageSections(updated);
    setSelectedSectionId(destId);
    setSelectedElementId(copy.id);
    showToast(t('toast.element_pasted'));
  }, [clipboard, selectedSectionId, currentSections, updateCurrentPageSections, setSelectedSectionId, setSelectedElementId, showToast]);
```

- [ ] **Step 3: Implement pasteSection method**

After `pasteElement`, add:

```typescript
  const pasteSection = useCallback(() => {
    if (!clipboard || clipboard.type !== 'section') return;

    const copy = JSON.parse(JSON.stringify(clipboard.data));
    copy.id = createUniqueId('sec');
    copy.title = (copy.title || 'Section') + ' (Copy)';

    copy.elements = copy.elements.map((el: Element) => ({
      ...el,
      id: createUniqueId('el'),
    }));

    let insertIndex = currentSections.length;
    if (selectedSectionId) {
      const idx = currentSections.findIndex(s => s.id === selectedSectionId);
      if (idx !== -1) {
        insertIndex = idx + 1;
      }
    }

    const updated = [...currentSections];
    updated.splice(insertIndex, 0, copy);
    updateCurrentPageSections(updated);
    setSelectedSectionId(copy.id);
    setSelectedElementId(null);
    showToast(t('toast.section_pasted'));
  }, [clipboard, selectedSectionId, currentSections, updateCurrentPageSections, setSelectedSectionId, setSelectedElementId, showToast]);
```

- [ ] **Step 4: Add pasteElement and pasteSection to context value object**

In the `value` object, add after `copySection`:

```typescript
    pasteElement,
    pasteSection,
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/editor-provider.tsx
git commit -m "feat(editor): add paste element and paste section methods"
```

---

### Task 4: Add keyboard event listener

**Files:**
- Modify: `components/website-editor/editor-provider.tsx` (add useEffect for keydown)

**Interfaces:**
- Consumes: `isPreviewMode`, `selectedElementId`, `selectedSectionId`, `clipboard`, `copyElement`, `copySection`, `pasteElement`, `pasteSection`
- Produces: global keyboard handler for Ctrl+C / Ctrl+V

- [ ] **Step 1: Add useEffect import**

Verify line 3 includes `useEffect`:

```typescript
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
```

- [ ] **Step 2: Add keyboard event listener useEffect**

Inside `EditorProvider`, after the `setHomePage` callback (after line 517, before the `value` object), add:

```typescript
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreviewMode) return;
      const modifier = e.ctrlKey || e.metaKey;
      if (!modifier) return;
      if (e.key !== 'c' && e.key !== 'v') return;

      e.preventDefault();

      if (e.key === 'c') {
        if (selectedElementId && selectedSectionId) {
          copyElement(selectedSectionId, selectedElementId);
        } else if (selectedSectionId) {
          copySection(selectedSectionId);
        }
      }

      if (e.key === 'v') {
        if (!clipboard) return;
        if (clipboard.type === 'element') {
          pasteElement(selectedSectionId || undefined);
        } else if (clipboard.type === 'section') {
          pasteSection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, selectedElementId, selectedSectionId, clipboard, copyElement, copySection, pasteElement, pasteSection]);
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Verify dev server builds**

Run: `pnpm dev 2>&1 &` then wait 5 seconds and check for compilation errors in the output. Kill the server after.

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/editor-provider.tsx
git commit -m "feat(editor): add Ctrl+C/Ctrl+V keyboard shortcuts for copy-paste"
```

---

### Task 5: Final verification and push

- [ ] **Step 1: Full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: Zero errors

- [ ] **Step 2: Build check**

Run: `pnpm build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Push all commits**

```bash
git push
```

- [ ] **Step 4: Manual verification checklist**

Verify in browser:
1. Select an element → Ctrl+C → toast "Element copied"
2. Select different section → Ctrl+V → element pasted with offset
3. Select a section (no element) → Ctrl+C → toast "Section copied"
4. Ctrl+V → section inserted below with "(Copy)" suffix
5. Ctrl+V with empty clipboard → nothing happens (no crash)
6. Ctrl+C with nothing selected → nothing happens (no crash)
7. Toggle Preview mode → Ctrl+C / Ctrl+V → nothing happens
8. Paste multiple times from same copy → each gets unique ID
9. Undo (Ctrl+Z) works on paste operations
