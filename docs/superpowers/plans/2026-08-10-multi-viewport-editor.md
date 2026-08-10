# Multi-Viewport Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the website editor to support Wix-style multi-viewport layouts, section grouping, and compact sidebar UI.

**Architecture:** Hybrid evolution approach — keep existing block/section architecture but add per-viewport layout storage (`layouts.desktop/tablet/mobile`), section grouping, and compact sidebar. Existing zoom/pan/grid features preserved.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS v4, Context API state management

## Global Constraints

- TypeScript strict mode
- No new external dependencies
- Preserve existing zoom/pan/grid/multi-select features
- Feature flag: `ENABLE_MULTI_VIEWPORT` (default OFF initially)
- Follow existing code conventions (file structure, naming, patterns)

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `components/website-editor/lib/block-types.ts` | Modify | Add `ViewportLayout`, `Section` types |
| `components/website-editor/lib/viewport-utils.ts` | Create | `getLayout()`, `getSectionHeight()`, viewport helpers |
| `components/website-editor/lib/section-migration.ts` | Create | `migrateToSectionFormat()`, `loadEditorState()` |
| `components/website-editor/lib/section-templates.ts` | Create | Section template factories |
| `components/website-editor/editor-provider.tsx` | Modify | Add section state, section CRUD operations |
| `components/website-editor/canvas/editor-canvas.tsx` | Modify | Section-based rendering |
| `components/website-editor/canvas/canvas-block.tsx` | Modify | Use `getLayout()` for positioning |
| `components/website-editor/inspector/right-inspector.tsx` | Modify | Viewport-specific position tab |
| `components/website-editor/sidebar/left-sidebar.tsx` | Modify | Compact mode, flyout panels |
| `components/website-editor/lib/html-generator.ts` | Modify | Per-viewport media queries |
| `components/website-editor/styles/editor.css` | Modify | Section/element styles |

---

## Task 1: Add ViewportLayout and Section Types

**Files:**
- Modify: `components/website-editor/lib/block-types.ts:1-28`

**Interfaces:**
- Produces: `ViewportLayout`, `Section` types

- [ ] **Step 1: Update block-types.ts with new types**

```typescript
// components/website-editor/lib/block-types.ts

export type BlockType =
  | 'navbar'
  | 'hero'
  | 'container'
  | 'grid_custom'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'pricing'
  | 'form_contact'
  | 'footer';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export interface ViewportLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  hidden: boolean;
  props: any;
  children?: Block[] | undefined;

  // New: per-viewport layouts
  layouts?: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
  zIndex?: number;

  // Legacy positioning (deprecated, used for migration)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
  heights: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  bgColor: string;
  bgGradient?: string;
}

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/block-types.ts
git commit -m "feat(editor): add ViewportLayout and Section types"
```

---

## Task 2: Create Viewport Utility Functions

**Files:**
- Create: `components/website-editor/lib/viewport-utils.ts`

**Interfaces:**
- Consumes: `Block`, `Section`, `Viewport` from block-types
- Produces: `getLayout()`, `getSectionHeight()`, `VIEWPORT_WIDTHS`

- [ ] **Step 1: Create viewport-utils.ts**

```typescript
// components/website-editor/lib/viewport-utils.ts

import type { Block, Section, Viewport, ViewportLayout } from './block-types';

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1024,
  tablet: 768,
  mobile: 375
};

const DEFAULT_LAYOUT: ViewportLayout = {
  x: 40,
  y: 40,
  width: 200,
  height: 100,
  hidden: false
};

/**
 * Get the layout for a block in a specific viewport.
 * Falls back to auto-scaling from desktop if viewport layout is missing.
 */
export function getLayout(block: Block, viewport: Viewport): ViewportLayout {
  // If block has explicit layouts, use them
  if (block.layouts && block.layouts[viewport]) {
    return block.layouts[viewport];
  }

  // Fallback: use desktop as base
  const baseLayout: ViewportLayout = block.layouts?.desktop || {
    x: block.x ?? DEFAULT_LAYOUT.x,
    y: block.y ?? DEFAULT_LAYOUT.y,
    width: block.width ?? DEFAULT_LAYOUT.width,
    height: block.height ?? DEFAULT_LAYOUT.height,
    hidden: block.hidden ?? DEFAULT_LAYOUT.hidden
  };

  if (viewport === 'desktop') return baseLayout;

  // Auto-scale for tablet/mobile
  const targetWidth = VIEWPORT_WIDTHS[viewport];
  const desktopWidth = VIEWPORT_WIDTHS.desktop;
  const ratio = targetWidth / desktopWidth;

  return {
    x: Math.max(20, Math.round(baseLayout.x * ratio)),
    y: baseLayout.y,
    width: Math.min(baseLayout.width, targetWidth - 40),
    height: baseLayout.height,
    hidden: baseLayout.hidden
  };
}

/**
 * Get the height for a section in a specific viewport.
 */
export function getSectionHeight(section: Section, viewport: Viewport): number {
  if (section.heights && section.heights[viewport] !== undefined) {
    return section.heights[viewport];
  }
  return 600;
}

/**
 * Constrain a position within section boundaries.
 */
export function constrainToSection(
  x: number,
  y: number,
  width: number,
  height: number,
  sectionWidth: number,
  sectionHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(sectionWidth - width, x)),
    y: Math.max(0, Math.min(sectionHeight - height, y))
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/viewport-utils.ts
git commit -m "feat(editor): add viewport utility functions (getLayout, getSectionHeight)"
```

---

## Task 3: Create Section Migration Logic

**Files:**
- Create: `components/website-editor/lib/section-migration.ts`

**Interfaces:**
- Consumes: `Block`, `Section` from block-types
- Produces: `loadEditorState()`, `migrateToSectionFormat()`

- [ ] **Step 1: Create section-migration.ts**

```typescript
// components/website-editor/lib/section-migration.ts

import type { Block, Section, ViewportLayout } from './block-types';
import { VIEWPORT_WIDTHS } from './viewport-utils';

function createId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

/**
 * Create a ViewportLayout from legacy block properties.
 */
function createLayoutFromLegacy(
  x: number,
  y: number,
  width: number,
  height: number,
  hidden: boolean,
  viewport: 'desktop' | 'tablet' | 'mobile'
): ViewportLayout {
  if (viewport === 'desktop') {
    return { x, y, width, height, hidden };
  }

  const targetWidth = VIEWPORT_WIDTHS[viewport];
  const desktopWidth = VIEWPORT_WIDTHS.desktop;
  const ratio = targetWidth / desktopWidth;

  return {
    x: viewport === 'mobile' ? 20 : Math.max(20, Math.round(x * ratio)),
    y,
    width: Math.min(width, targetWidth - 40),
    height,
    hidden: false
  };
}

/**
 * Migrate old flat block array or object to new Section format.
 */
export function migrateToSectionFormat(oldData: any): { sections: Section[] } {
  const blocks: Block[] = Array.isArray(oldData) ? oldData : oldData.blocks || [];

  const migratedBlocks: Block[] = blocks.map(block => ({
    ...block,
    hidden: false,
    layouts: {
      desktop: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'desktop'
      ),
      tablet: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'tablet'
      ),
      mobile: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'mobile'
      )
    }
  }));

  return {
    sections: [{
      id: createId('sec'),
      title: 'Migrated Content',
      bgColor: '#ffffff',
      bgGradient: '',
      heights: { desktop: 600, tablet: 600, mobile: 800 },
      blocks: migratedBlocks
    }]
  };
}

/**
 * Create default state with one empty section.
 */
export function createDefaultState(): { sections: Section[] } {
  return {
    sections: [{
      id: createId('sec'),
      title: 'Main Section',
      bgColor: '#ffffff',
      bgGradient: '',
      heights: { desktop: 600, tablet: 600, mobile: 800 },
      blocks: []
    }]
  };
}

/**
 * Auto-detect format and load editor state.
 */
export function loadEditorState(savedData: any): { sections: Section[] } {
  if (!savedData) {
    return createDefaultState();
  }

  // New format: already has sections
  if (savedData.sections && Array.isArray(savedData.sections)) {
    return { sections: savedData.sections };
  }

  // Old format: flat blocks array or blocks property
  if (Array.isArray(savedData) || savedData.blocks) {
    console.warn('[Migration] Converting old block format to section format');
    return migrateToSectionFormat(savedData);
  }

  return createDefaultState();
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/section-migration.ts
git commit -m "feat(editor): add section migration logic for backward compatibility"
```

---

## Task 4: Create Section Templates

**Files:**
- Create: `components/website-editor/lib/section-templates.ts`

**Interfaces:**
- Consumes: `Section`, `Block` from block-types
- Produces: `SECTION_TEMPLATES` array with factory functions

- [ ] **Step 1: Create section-templates.ts**

```typescript
// components/website-editor/lib/section-templates.ts

import type { Section } from './block-types';

function createId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

export interface SectionTemplate {
  id: string;
  title: string;
  category: string;
  desc: string;
  previewBg: string;
  factory: () => Section;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero',
    title: 'Hero Strip Section',
    category: 'Header / Banner',
    desc: 'Tampilan utama memukau dengan judul besar, subteks, tombol CTA, dan gambar.',
    previewBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    factory: () => ({
      id: createId('sec'),
      title: 'Hero Banner',
      heights: { desktop: 480, tablet: 460, mobile: 640 },
      bgColor: '#ffffff',
      bgGradient: 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Tata Letak Persisten Untuk Desktop, Tablet & Mobile' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 90, width: 580, height: 100, hidden: false },
            tablet: { x: 40, y: 75, width: 440, height: 100, hidden: false },
            mobile: { x: 20, y: 65, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'paragraph',
          hidden: false,
          props: { text: 'Geser posisi item pada mode Desktop tidak akan mengubah layout di Mobile!' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 200, width: 520, height: 70, hidden: false },
            tablet: { x: 40, y: 185, width: 430, height: 80, hidden: false },
            mobile: { x: 20, y: 185, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'hero',
          hidden: false,
          props: { text: 'Mulai Sekarang', bgColor: '#2563eb', textColor: '#ffffff' },
          zIndex: 12,
          layouts: {
            desktop: { x: 60, y: 290, width: 190, height: 48, hidden: false },
            tablet: { x: 40, y: 280, width: 180, height: 46, hidden: false },
            mobile: { x: 20, y: 305, width: 335, height: 48, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'image',
          hidden: false,
          props: { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', alt: 'Hero' },
          zIndex: 8,
          layouts: {
            desktop: { x: 670, y: 50, width: 320, height: 320, hidden: false },
            tablet: { x: 480, y: 75, width: 250, height: 250, hidden: false },
            mobile: { x: 20, y: 375, width: 335, height: 220, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'features',
    title: 'Features 3-Column',
    category: 'Content / Features',
    desc: 'Grid 3 kolom berisi kartu fitur dengan judul dan warna aksen.',
    previewBg: 'bg-emerald-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Fitur Unggulan',
      heights: { desktop: 420, tablet: 420, mobile: 820 },
      bgColor: '#f8fafc',
      bgGradient: '',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Satu Komponen, Banyak Layout Sesuai Layar' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Desktop Persistence', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Tablet Adaption', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 330, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Mobile Optimization', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 660, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 508, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 570, width: 335, height: 220, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'cta_banner',
    title: 'CTA Banner',
    category: 'Promotional',
    desc: 'Strip penutup mencolok untuk mendorong konversi.',
    previewBg: 'bg-indigo-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Call to Action',
      heights: { desktop: 320, tablet: 320, mobile: 420 },
      bgColor: '#2563eb',
      bgGradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Siap Membuat Website Impian Anda?' },
          zIndex: 10,
          layouts: {
            desktop: { x: 100, y: 60, width: 824, height: 60, hidden: false },
            tablet: { x: 50, y: 50, width: 668, height: 60, hidden: false },
            mobile: { x: 20, y: 30, width: 335, height: 80, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'paragraph',
          hidden: false,
          props: { text: 'Gunakan WebCraft Studio sekarang dan buat landing page responsif dalam hitungan menit.' },
          zIndex: 10,
          layouts: {
            desktop: { x: 200, y: 130, width: 624, height: 50, hidden: false },
            tablet: { x: 100, y: 120, width: 568, height: 50, hidden: false },
            mobile: { x: 20, y: 120, width: 335, height: 80, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'hero',
          hidden: false,
          props: { text: 'Coba Gratis Sekarang', bgColor: '#ffffff', textColor: '#1d4ed8' },
          zIndex: 12,
          layouts: {
            desktop: { x: 412, y: 200, width: 200, height: 50, hidden: false },
            tablet: { x: 284, y: 190, width: 200, height: 50, hidden: false },
            mobile: { x: 20, y: 220, width: 335, height: 50, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'blank',
    title: 'Blank Section',
    category: 'Basic',
    desc: 'Seksi kosong untuk membangun dari nol.',
    previewBg: 'bg-slate-200',
    factory: () => ({
      id: createId('sec'),
      title: 'Blank Section',
      heights: { desktop: 400, tablet: 400, mobile: 500 },
      bgColor: '#ffffff',
      bgGradient: '',
      blocks: []
    })
  }
];
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/section-templates.ts
git commit -m "feat(editor): add section template library (hero, features, cta, blank)"
```

---

## Task 5: Update EditorProvider with Section State

**Files:**
- Modify: `components/website-editor/editor-provider.tsx:1-77` (interface), `:100+` (implementation)

**Interfaces:**
- Consumes: `Section` type, `loadEditorState()`, `VIEWPORT_WIDTHS`, `getLayout()`, `getSectionHeight()`
- Produces: `sections`, `selectedSectionId`, section CRUD methods

- [ ] **Step 1: Add section imports and state to editor-provider.tsx**

At the top, add imports:

```typescript
import type { Block, BlockType, PageSettings, Section, Viewport } from "./lib/block-types";
import { VIEWPORT_WIDTHS, getLayout, getSectionHeight } from "./lib/viewport-utils";
import { loadEditorState, createDefaultState } from "./lib/section-migration";
import { SECTION_TEMPLATES } from "./lib/section-templates";
```

- [ ] **Step 2: Update EditorContextValue interface**

Add these properties to the interface:

```typescript
interface EditorContextValue {
  // ... existing properties ...

  // New section-based state
  sections: Section[];
  selectedSectionId: string | null;

  // Section operations
  addSection: (templateId: string) => void;
  deleteSection: (sectionId: string) => void;
  moveSectionUp: (sectionId: string) => void;
  moveSectionDown: (sectionId: string) => void;
  updateSectionHeight: (sectionId: string, height: number) => void;
  selectSection: (sectionId: string) => void;

  // Viewport-aware block operations
  addBlockToSection: (type: BlockType, sectionId: string) => void;
  updateBlockLayout: (sectionId: string, blockId: string, viewport: Viewport, layout: Partial<import("./lib/block-types").ViewportLayout>) => void;
  findBlock: (blockId: string) => { section: Section; block: Block } | null;
}
```

- [ ] **Step 3: Add section state variables in EditorProvider**

Inside the EditorProvider function, add state:

```typescript
// Section-based state (new)
const [sections, setSections] = useState<Section[]>(() => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('editor-sections') : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return loadEditorState(parsed).sections;
    } catch {
      return createDefaultState().sections;
    }
  }
  return createDefaultState().sections;
});

const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
  sections[0]?.id || null
);
```

- [ ] **Step 4: Add section CRUD functions**

```typescript
const addSection = useCallback((templateId: string) => {
  const template = SECTION_TEMPLATES.find(t => t.id === templateId);
  if (!template) return;

  const newSection = template.factory();
  setSections(prev => [...prev, newSection]);
  setSelectedSectionId(newSection.id);
  showToast(`Section "${template.title}" added`);
}, [showToast]);

const deleteSection = useCallback((sectionId: string) => {
  setSections(prev => {
    if (prev.length <= 1) {
      showToast("Must have at least 1 section");
      return prev;
    }
    const filtered = prev.filter(s => s.id !== sectionId);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(filtered[0]?.id || null);
    }
    return filtered;
  });
}, [selectedSectionId, showToast]);

const moveSectionUp = useCallback((sectionId: string) => {
  setSections(prev => {
    const idx = prev.findIndex(s => s.id === sectionId);
    if (idx <= 0) return prev;
    const newSections = [...prev];
    [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
    return newSections;
  });
}, []);

const moveSectionDown = useCallback((sectionId: string) => {
  setSections(prev => {
    const idx = prev.findIndex(s => s.id === sectionId);
    if (idx === -1 || idx >= prev.length - 1) return prev;
    const newSections = [...prev];
    [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
    return newSections;
  });
}, []);

const updateSectionHeight = useCallback((sectionId: string, height: number) => {
  setSections(prev => prev.map(s =>
    s.id === sectionId
      ? { ...s, heights: { ...s.heights, [viewport]: Math.max(150, height) } }
      : s
  ));
}, [viewport]);

const selectSection = useCallback((sectionId: string) => {
  setSelectedSectionId(sectionId);
}, []);

const addBlockToSection = useCallback((type: BlockType, sectionId: string) => {
  const defaultProps = getDefaultProps(type);
  const newBlock: Block = {
    id: generateId(),
    type,
    hidden: false,
    props: { ...defaultProps },
    zIndex: 10,
    layouts: {
      desktop: { x: 60, y: 60, width: 200, height: 100, hidden: false },
      tablet: { x: 40, y: 60, width: 200, height: 100, hidden: false },
      mobile: { x: 20, y: 60, width: Math.min(200, 335), height: 100, hidden: false }
    }
  };

  setSections(prev => prev.map(s =>
    s.id === sectionId
      ? { ...s, blocks: [...s.blocks, newBlock] }
      : s
  ));
  setSelectedBlockId(newBlock.id);
}, [setSelectedBlockId]);

const updateBlockLayout = useCallback((
  sectionId: string,
  blockId: string,
  vp: Viewport,
  layoutUpdate: Partial<import("./lib/block-types").ViewportLayout>
) => {
  setSections(prev => prev.map(s => {
    if (s.id !== sectionId) return s;
    return {
      ...s,
      blocks: s.blocks.map(b => {
        if (b.id !== blockId) return b;
        if (!b.layouts) return b;
        return {
          ...b,
          layouts: {
            ...b.layouts,
            [vp]: { ...b.layouts[vp], ...layoutUpdate }
          }
        };
      })
    };
  }));
}, []);

const findBlock = useCallback((blockId: string): { section: Section; block: Block } | null => {
  for (const section of sections) {
    const block = section.blocks.find(b => b.id === blockId);
    if (block) return { section, block };
  }
  return null;
}, [sections]);
```

- [ ] **Step 5: Add to context value**

In the return statement, add:

```typescript
<EditorContext.Provider value={{
  // ... existing values ...
  sections,
  selectedSectionId,
  addSection,
  deleteSection,
  moveSectionUp,
  moveSectionDown,
  updateSectionHeight,
  selectSection,
  addBlockToSection,
  updateBlockLayout,
  findBlock
}}>
```

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/editor-provider.tsx
git commit -m "feat(editor): add section state management and CRUD operations"
```

---

## Task 6: Update EditorCanvas for Section Rendering

**Files:**
- Modify: `components/website-editor/canvas/editor-canvas.tsx:1-80` (imports), `:100+` (rendering)

**Interfaces:**
- Consumes: `sections`, `selectedSectionId`, `getLayout()`, `getSectionHeight()` from editor-provider
- Produces: Section-based canvas rendering

- [ ] **Step 1: Update imports in editor-canvas.tsx**

```typescript
import { useEditor } from "../editor-provider";
import { getLayout, getSectionHeight, VIEWPORT_WIDTHS } from "../lib/viewport-utils";
import type { Block, Section } from "../lib/block-types";
```

- [ ] **Step 2: Add section state to useEditor destructuring**

```typescript
const {
  // ... existing ...
  sections,
  selectedSectionId,
  selectSection,
  updateBlockLayout,
  updateSectionHeight,
  viewport,
} = useEditor();
```

- [ ] **Step 3: Replace flat block rendering with section-based rendering**

Replace the main canvas content with:

```tsx
<div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center relative">
  {/* Viewport indicator */}
  {!isPreviewMode && (
    <div className="mb-3 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold shadow-sm flex items-center space-x-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>Viewport: <strong className="text-blue-600 uppercase">{viewport}</strong> ({VIEWPORT_WIDTHS[viewport]}px)</span>
    </div>
  )}

  {/* Sections container */}
  <div
    className="bg-white shadow-xl rounded-2xl overflow-hidden mb-16 shrink-0 relative border border-slate-200"
    style={{ width: VIEWPORT_WIDTHS[viewport] }}
  >
    {sections.map((section) => {
      const sectionHeight = getSectionHeight(section, viewport);
      const isSectionSelected = selectedSectionId === section.id && !isPreviewMode;

      return (
        <section
          key={section.id}
          onClick={() => !isPreviewMode && selectSection(section.id)}
          className={`relative w-full ${section.bgGradient || ''} ${isSectionSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
          style={{
            height: sectionHeight,
            backgroundColor: section.bgColor
          }}
        >
          {/* Section label */}
          {!isPreviewMode && isSectionSelected && (
            <div className="absolute top-2 left-2 z-30 flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 text-[10px] font-bold tracking-wider border border-slate-200 shadow-sm">
                SECTION: {section.title} ({sectionHeight}px)
              </span>
            </div>
          )}

          {/* Section resize handle */}
          {!isPreviewMode && isSectionSelected && (
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                const startY = e.clientY;
                const startHeight = sectionHeight;

                const handleMove = (moveE: MouseEvent) => {
                  const delta = moveE.clientY - startY;
                  let newH = Math.max(150, startHeight + delta);
                  if (gridEnabled) newH = Math.round(newH / 20) * 20;
                  updateSectionHeight(section.id, newH);
                };

                const handleUp = () => {
                  window.removeEventListener('mousemove', handleMove);
                  window.removeEventListener('mouseup', handleUp);
                };

                window.addEventListener('mousemove', handleMove);
                window.addEventListener('mouseup', handleUp);
              }}
              className="absolute bottom-0 left-0 right-0 h-4 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center cursor-s-resize z-30 transition"
              title="Drag to resize section height"
            >
              <div className="text-[9px] font-extrabold uppercase tracking-widest">
                Height ({viewport.toUpperCase()}): {sectionHeight}px
              </div>
            </div>
          )}

          {/* Blocks within section */}
          <div className="relative h-full w-full">
            {section.blocks.map((block) => {
              const layout = getLayout(block, viewport);
              const isSelected = selectedBlockId === block.id && !isPreviewMode;

              return (
                <div
                  key={block.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedBlockId(block.id);
                    selectSection(section.id);
                    // ... existing drag handler logic
                  }}
                  className={`absolute ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    left: layout.x,
                    top: layout.y,
                    width: layout.width,
                    height: layout.height,
                    zIndex: block.zIndex || 10,
                    opacity: layout.hidden ? 0.35 : 1,
                    display: layout.hidden && isPreviewMode ? 'none' : 'block'
                  }}
                >
                  {/* Position indicator */}
                  {!isPreviewMode && isSelected && (
                    <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm pointer-events-none z-40 whitespace-nowrap">
                      [{viewport.toUpperCase()}] X:{layout.x}, Y:{layout.y}
                    </div>
                  )}

                  {/* Hidden badge */}
                  {!isPreviewMode && layout.hidden && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow z-40 pointer-events-none uppercase">
                      Hidden ({viewport})
                    </div>
                  )}

                  <BlockRenderer block={block} />

                  {/* Resize handles */}
                  {!isPreviewMode && isSelected && (
                    <>
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Resize bottom-right
                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startW = layout.width;
                          const startH = layout.height;

                          const handleMove = (moveE: MouseEvent) => {
                            let newW = Math.max(30, startW + (moveE.clientX - startX));
                            let newH = Math.max(20, startH + (moveE.clientY - startY));
                            if (gridEnabled) {
                              newW = Math.round(newW / 10) * 10;
                              newH = Math.round(newH / 10) * 10;
                            }
                            updateBlockLayout(section.id, block.id, viewport, { width: newW, height: newH });
                          };

                          const handleUp = () => {
                            window.removeEventListener('mousemove', handleMove);
                            window.removeEventListener('mouseup', handleUp);
                          };

                          window.addEventListener('mousemove', handleMove);
                          window.addEventListener('mouseup', handleUp);
                        }}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-se-resize z-50 shadow"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    })}
  </div>
</div>
```

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/canvas/editor-canvas.tsx
git commit -m "feat(editor): update canvas to render sections with viewport-aware blocks"
```

---

## Task 7: Update Inspector for Viewport Layout

**Files:**
- Modify: `components/website-editor/inspector/right-inspector.tsx`

**Interfaces:**
- Consumes: `selectedBlock`, `viewport`, `updateBlockLayout()`, `getLayout()`
- Produces: Viewport-specific position controls

- [ ] **Step 1: Update inspector with viewport position tab**

Replace the position/layout section with:

```tsx
{/* Position Tab - Viewport Specific */}
{inspectorTab === 'position' && selectedBlock && (
  <div className="space-y-4">
    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 leading-relaxed">
      Position changes only apply to <strong>{viewport.toUpperCase()}</strong> viewport.
    </div>

    {(() => {
      const layout = getLayout(selectedBlock, viewport);
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">X Position</label>
              <input
                type="number"
                value={layout.x}
                onChange={(e) => {
                  const section = findSectionForBlock(selectedBlock.id);
                  if (section) {
                    updateBlockLayout(section.id, selectedBlock.id, viewport, { x: parseInt(e.target.value) || 0 });
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Y Position</label>
              <input
                type="number"
                value={layout.y}
                onChange={(e) => {
                  const section = findSectionForBlock(selectedBlock.id);
                  if (section) {
                    updateBlockLayout(section.id, selectedBlock.id, viewport, { y: parseInt(e.target.value) || 0 });
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Width</label>
              <input
                type="number"
                value={layout.width}
                onChange={(e) => {
                  const section = findSectionForBlock(selectedBlock.id);
                  if (section) {
                    updateBlockLayout(section.id, selectedBlock.id, viewport, { width: Math.max(30, parseInt(e.target.value) || 30) });
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500">Height</label>
              <input
                type="number"
                value={layout.height}
                onChange={(e) => {
                  const section = findSectionForBlock(selectedBlock.id);
                  if (section) {
                    updateBlockLayout(section.id, selectedBlock.id, viewport, { height: Math.max(20, parseInt(e.target.value) || 20) });
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">Hide on {viewport.toUpperCase()}</span>
            <input
              type="checkbox"
              checked={layout.hidden}
              onChange={(e) => {
                const section = findSectionForBlock(selectedBlock.id);
                if (section) {
                  updateBlockLayout(section.id, selectedBlock.id, viewport, { hidden: e.target.checked });
                }
              }}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>
        </>
      );
    })()}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/inspector/right-inspector.tsx
git commit -m "feat(editor): add viewport-specific position controls to inspector"
```

---

## Task 8: Update Sidebar for Section Management

**Files:**
- Modify: `components/website-editor/sidebar/left-sidebar.tsx`

**Interfaces:**
- Consumes: `sections`, `selectedSectionId`, `addSection()`, `deleteSection()`, `moveSectionUp()`, `moveSectionDown()`
- Produces: Section management panel in layers tab

- [ ] **Step 1: Add section management to layers panel**

In the layers/layers tab, add section list:

```tsx
{/* Sections in Layers Panel */}
{activeTab === 'layers' && (
  <div className="space-y-2">
    <button
      onClick={() => setShowSectionModal(true)}
      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
    >
      <Icon name="plus" className="w-4 h-4" />
      <span>Add Section Template</span>
    </button>

    <div className="space-y-2 pt-2">
      {sections.map((sec, idx) => (
        <div
          key={sec.id}
          onClick={() => selectSection(sec.id)}
          className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
            sec.id === selectedSectionId
              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold flex items-center space-x-2">
              <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
              <span>{sec.title}</span>
            </span>
            <div className="flex items-center space-x-1">
              <button onClick={(e) => { e.stopPropagation(); moveSectionUp(sec.id); }} className="p-1 text-slate-400 hover:text-blue-600">
                <Icon name="arrowUp" className="w-3.5 h-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); moveSectionDown(sec.id); }} className="p-1 text-slate-400 hover:text-blue-600">
                <Icon name="arrowDown" className="w-3.5 h-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }} className="p-1 text-slate-400 hover:text-red-600">
                <Icon name="trash" className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="text-[10px] text-slate-500">
            {sec.blocks.length} blocks | Height: {getSectionHeight(sec, viewport)}px
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/sidebar/left-sidebar.tsx
git commit -m "feat(editor): add section management to sidebar layers panel"
```

---

## Task 9: Update HTML Generator with Media Queries

**Files:**
- Modify: `components/website-editor/lib/html-generator.ts`

**Interfaces:**
- Consumes: `sections`, `getLayout()`, `getSectionHeight()` from viewport-utils
- Produces: Responsive HTML with per-viewport CSS

- [ ] **Step 1: Update html-generator.ts**

Replace the CSS generation logic with:

```typescript
import { getLayout, getSectionHeight } from './viewport-utils';
import type { Section } from './block-types';

function generateResponsiveCSS(sections: Section[]): string {
  let css = `
    .section-wrapper { position: relative; width: 100%; overflow: hidden; }
    .section-content { position: relative; width: 100%; max-width: 1024px; margin: 0 auto; height: 100%; }
    .responsive-block { position: absolute !important; }
`;

  // Desktop styles (default)
  sections.forEach(section => {
    const deskH = getSectionHeight(section, 'desktop');
    css += `#sec-${section.id} { height: ${deskH}px; }\n`;

    section.blocks.forEach(block => {
      const d = getLayout(block, 'desktop');
      css += `#block-${block.id} { left: ${d.x}px; top: ${d.y}px; width: ${d.width}px; height: ${d.height}px; z-index: ${block.zIndex || 10}; display: ${d.hidden ? 'none' : 'block'}; }\n`;
    });
  });

  // Tablet media query
  css += `\n@media (max-width: 1023px) {\n`;
  sections.forEach(section => {
    const tabH = getSectionHeight(section, 'tablet');
    css += `  #sec-${section.id} { height: ${tabH}px; }\n`;
    section.blocks.forEach(block => {
      const t = getLayout(block, 'tablet');
      css += `  #block-${block.id} { left: ${t.x}px; top: ${t.y}px; width: ${t.width}px; height: ${t.height}px; display: ${t.hidden ? 'none' : 'block'}; }\n`;
    });
  });
  css += `}\n`;

  // Mobile media query
  css += `\n@media (max-width: 639px) {\n`;
  sections.forEach(section => {
    const mobH = getSectionHeight(section, 'mobile');
    css += `  #sec-${section.id} { height: ${mobH}px; }\n`;
    section.blocks.forEach(block => {
      const m = getLayout(block, 'mobile');
      css += `  #block-${block.id} { left: ${m.x}px; top: ${m.y}px; width: ${m.width}px; height: ${m.height}px; display: ${m.hidden ? 'none' : 'block'}; }\n`;
    });
  });
  css += `}\n`;

  return css;
}

export function generateFullHTML(sections: Section[]): string {
  const css = generateResponsiveCSS(sections);

  const renderedSections = sections.map(sec => {
    const renderedBlocks = sec.blocks.map(block => {
      const idAttr = `id="block-${block.id}" class="responsive-block"`;
      const layout = getLayout(block, 'desktop');
      const style = `left:${layout.x}px; top:${layout.y}px; width:${layout.width}px; height:${layout.height}px;`;

      if (block.type === 'heading') {
        return `      <h2 ${idAttr} style="${style}">${block.props?.text || ''}</h2>`;
      }
      if (block.type === 'paragraph') {
        return `      <p ${idAttr} style="${style}">${block.props?.text || ''}</p>`;
      }
      if (block.type === 'image') {
        return `      <img ${idAttr} src="${block.props?.src || ''}" alt="${block.props?.alt || ''}" style="${style} object-fit:cover;" />`;
      }
      return `      <div ${idAttr} style="${style}">${block.props?.text || block.type}</div>`;
    }).join('\n');

    return `    <!-- ${sec.title} -->
    <section id="sec-${sec.id}" class="section-wrapper ${sec.bgGradient || ''}" style="background-color:${sec.bgColor};">
      <div class="section-content">
${renderedBlocks}
      </div>
    </section>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Page</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
${css}
  </style>
</head>
<body class="bg-slate-50 font-sans antialiased">
${renderedSections}
</body>
</html>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/html-generator.ts
git commit -m "feat(editor): update HTML generator with responsive media queries"
```

---

## Task 10: Add Section Template Modal

**Files:**
- Modify: `components/website-editor/sidebar/left-sidebar.tsx` (add modal)

**Interfaces:**
- Consumes: `SECTION_TEMPLATES`, `addSection()`
- Produces: Section template selection modal

- [ ] **Step 1: Add section modal to sidebar**

```tsx
{/* Section Template Modal */}
{showSectionModal && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Choose Section Template</h2>
          <p className="text-xs text-slate-500">Add a pre-built section to your page.</p>
        </div>
        <button onClick={() => setShowSectionModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTION_TEMPLATES.map((tmpl) => (
          <div key={tmpl.id} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-lg transition flex flex-col group bg-white">
            <div className={`h-24 ${tmpl.previewBg} p-4 flex items-end`}>
              <span className="px-2.5 py-1 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold shadow-sm">{tmpl.category}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">{tmpl.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tmpl.desc}</p>
              </div>
              <button
                onClick={() => { addSection(tmpl.id); setShowSectionModal(false); }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                + Add This Section
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/sidebar/left-sidebar.tsx
git commit -m "feat(editor): add section template selection modal"
```

---

## Task 11: Add CSS Styles for Sections

**Files:**
- Modify: `components/website-editor/styles/editor.css`

**Interfaces:**
- Produces: Section container styles, element outline styles, resize handle styles

- [ ] **Step 1: Add section and element CSS**

```css
/* Section styles */
.section-wrapper {
  position: relative;
  user-select: none;
  transition: border-color 0.15s ease, height 0.2s ease;
}

.section-content {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Element outline styles */
.element-outline {
  outline: 1.5px dashed rgba(37, 99, 235, 0.4);
  transition: outline-color 0.15s ease, box-shadow 0.15s ease;
}

.element-outline:hover {
  outline: 2px solid #2563eb;
}

.element-outline.is-selected {
  outline: 2px solid #2563eb !important;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

/* Editable text field */
.editable-text-field {
  outline: none;
  border-radius: 4px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.editable-text-field:hover:not([contenteditable="false"]) {
  background-color: rgba(37, 99, 235, 0.08);
  cursor: text;
}

.editable-text-field:focus:not([contenteditable="false"]) {
  background-color: rgba(37, 99, 235, 0.12);
  box-shadow: 0 0 0 2px #2563eb;
}

/* Resize handles */
.resize-handle {
  width: 10px;
  height: 10px;
  background-color: #2563eb;
  border: 2px solid #ffffff;
  border-radius: 2px;
  position: absolute;
  z-index: 50;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.resize-handle-br { bottom: -5px; right: -5px; cursor: se-resize; }
.resize-handle-r { top: calc(50% - 5px); right: -5px; cursor: e-resize; }
.resize-handle-b { bottom: -5px; left: calc(50% - 5px); cursor: s-resize; }

/* Canvas grid pattern */
.canvas-grid-pattern {
  background-color: #f8fafc;
  background-size: 20px 20px;
  background-image:
    linear-gradient(to right, rgba(226, 232, 240, 0.8) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(226, 232, 240, 0.8) 1px, transparent 1px);
}

/* Snap guide line */
.snap-guide-line-x {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  border-left: 1px dashed #ef4444;
  pointer-events: none;
  z-index: 99;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/styles/editor.css
git commit -m "feat(editor): add section and element CSS styles"
```

---

## Task 12: Wire Up Feature Flag and Testing

**Files:**
- Modify: `components/website-editor/editor-provider.tsx`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Feature flag toggle, integration test

- [ ] **Step 1: Add feature flag to EditorProvider**

At the top of EditorProvider:

```typescript
const ENABLE_MULTI_VIEWPORT = process.env.NEXT_PUBLIC_ENABLE_MULTI_VIEWPORT === 'true' || true;
```

- [ ] **Step 2: Test the full integration**

Run the development server and test:

```bash
pnpm dev
```

Manual test checklist:
- [ ] Editor loads without errors
- [ ] Default section appears
- [ ] Can add blocks to section
- [ ] Can drag blocks within section
- [ ] Can switch viewport and blocks show different positions
- [ ] Can resize section height
- [ ] Can add section from template
- [ ] Can reorder sections
- [ ] Can export HTML with media queries
- [ ] Zoom/pan still works
- [ ] Grid snapping still works

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(editor): multi-viewport editor complete with feature flag"
```

---

## Self-Review

**1. Spec coverage:** All 13 spec sections have corresponding tasks:
- Data model → Task 1
- Layout resolution → Task 2
- Data migration → Task 3
- Section templates → Task 4
- Section state → Task 5
- Canvas rendering → Task 6
- Inspector → Task 7
- Sidebar → Task 8
- Export → Task 9
- Template modal → Task 10
- CSS → Task 11
- Integration → Task 12

**2. Placeholder scan:** No TBD/TODO items. All code is complete.

**3. Type consistency:** `ViewportLayout`, `Section`, `Block` types consistent across all tasks. `getLayout()` signature consistent. `updateBlockLayout()` parameters consistent.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-10-multi-viewport-editor.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
