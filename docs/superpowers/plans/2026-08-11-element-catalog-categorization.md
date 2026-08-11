# Element Catalog Categorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the flat element catalog into a categorized, modal-based drill-down UI with full English translation support.

**Architecture:** Add category definitions, restructure element presets by category, create a modal component with two views (category grid → element list), add a simple translation utility, and replace all Indonesian UI text with English translation keys.

**Tech Stack:** React, TypeScript, Tailwind CSS, Next.js

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `lib/block-types.ts` | Modify | Add `ElementCategory` type |
| `lib/element-categories.ts` | Create | Category definitions with icons, labels, colors |
| `lib/element-presets.ts` | Modify | Add `category` field, restructure to nested, translate labels |
| `lib/translations.ts` | Create | Type-safe translation utility |
| `ui/icon-library.tsx` | Modify | Add 6 new category icons |
| `modals/element-catalog-modal.tsx` | Create | Modal with category grid + element list views |
| `index.tsx` | Modify | Replace flyout element list with modal, translate all text |
| `editor-provider.tsx` | Modify | Translate toast messages |
| `lib/section-templates.ts` | Modify | Translate section labels and categories |

---

## Task 1: Add ElementCategory Type

**Files:**
- Modify: `components/website-editor/lib/block-types.ts`

**Interfaces:**
- Produces: `ElementCategory` type

- [ ] **Step 1: Add ElementCategory type to block-types.ts**

```typescript
// Add after the existing ElementType definition
export type ElementCategory = 'text' | 'interactive' | 'media' | 'layout' | 'navigation' | 'forms';
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/block-types.ts
git commit -m "feat(editor): add ElementCategory type definition"
```

---

## Task 2: Add Category Icons to Icon Library

**Files:**
- Modify: `components/website-editor/ui/icon-library.tsx`

**Interfaces:**
- Produces: 6 new icon cases in the `icons` record

- [ ] **Step 1: Add new icon names to IconName type**

Add these to the `IconName` union type:

```typescript
export type IconName =
  // ... existing 48 icons ...
  | "text"
  | "cursor"
  | "media"
  | "layoutGrid"
  | "navigation"
  | "form";
```

- [ ] **Step 2: Add icon SVG definitions**

Add these to the `icons` record after the existing entries:

```typescript
text: (
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="16" y2="12" />
    <line x1="4" y1="18" x2="18" y2="18" />
  </>
),
cursor: (
  <>
    <path d="M4,4 L10,12 L13,9 L20,16" />
    <path d="M15,14 L20,16 L22,21 L17,19 L14,22 L12,19 L4,4 Z" />
  </>
),
media: (
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10,8 16,12 10,16" />
  </>
),
layoutGrid: (
  <>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </>
),
navigation: (
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </>
),
form: (
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="12" x2="13" y2="12" />
    <polyline points="7,15 9,17 13,13" />
  </>
)
```

- [ ] **Step 3: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/ui/icon-library.tsx
git commit -m "feat(editor): add 6 category icons to icon library"
```

---

## Task 3: Create Translation Utility

**Files:**
- Create: `components/website-editor/lib/translations.ts`

**Interfaces:**
- Produces: `t(key: TranslationKey): string` function

- [ ] **Step 1: Create translations.ts with type definition and English translations**

```typescript
type TranslationKey =
  // Editor toolbar
  | 'editor.title'
  | 'editor.save'
  | 'editor.publish'
  | 'editor.undo'
  | 'editor.redo'
  | 'editor.preview'
  // Sidebar
  | 'sidebar.elements'
  | 'sidebar.sections'
  | 'sidebar.pages'
  | 'sidebar.settings'
  // Element catalog modal
  | 'elements.modal.title'
  | 'elements.modal.subtitle'
  | 'elements.modal.back'
  | 'elements.modal.close'
  | 'elements.modal.search_placeholder'
  | 'elements.modal.empty_category'
  | 'elements.modal.coming_soon'
  | 'elements.modal.click_to_insert'
  // Categories
  | 'category.text.label'
  | 'category.text.description'
  | 'category.interactive.label'
  | 'category.interactive.description'
  | 'category.media.label'
  | 'category.media.description'
  | 'category.layout.label'
  | 'category.layout.description'
  | 'category.navigation.label'
  | 'category.navigation.description'
  | 'category.forms.label'
  | 'category.forms.description'
  // Elements
  | 'element.heading.label'
  | 'element.heading.description'
  | 'element.paragraph.label'
  | 'element.paragraph.description'
  | 'element.button.label'
  | 'element.button.description'
  | 'element.badge.label'
  | 'element.badge.description'
  | 'element.image.label'
  | 'element.image.description'
  | 'element.card.label'
  | 'element.card.description'
  // Inspector
  | 'inspector.title'
  | 'inspector.no_selection'
  | 'inspector.position'
  | 'inspector.size'
  | 'inspector.style'
  | 'inspector.content'
  | 'inspector.delete'
  | 'inspector.duplicate'
  // Viewport
  | 'viewport.desktop'
  | 'viewport.tablet'
  | 'viewport.mobile'
  // Section templates
  | 'sections.modal.title'
  | 'sections.modal.subtitle'
  | 'sections.btn_add'
  | 'sections.category.header'
  | 'sections.category.content'
  | 'sections.category.social_proof'
  | 'sections.category.promotional'
  | 'sections.category.footer'
  | 'sections.category.basic'
  // Pages
  | 'pages.title'
  | 'pages.add_page'
  | 'pages.home'
  | 'pages.delete_confirm'
  // Toasts
  | 'toast.element_added'
  | 'toast.section_added'
  | 'toast.page_added'
  | 'toast.saved'
  | 'toast.published'
  | 'toast.error'
  | 'toast.deleted'
  | 'toast.duplicated'
  // Flyout headers
  | 'flyout.katalog_elemen'
  | 'flyout.struktur_seksi'
  | 'flyout.halaman_website'
  // Misc
  | 'misc.tip_click_element'
  | 'misc.tambah_ke_seksi'
  | 'misc.untitled_section'
  | 'misc.element'
  | 'misc.section'
  | 'misc.page'
  | 'misc.layers'
  | 'misc.settings'
  | 'misc.move_up'
  | 'misc.move_down'
  | 'misc.delete'
  | 'misc.drag_to_move'
  | 'misc.add_section_template';

const EN: Record<TranslationKey, string> = {
  // Editor toolbar
  'editor.title': 'Website Editor',
  'editor.save': 'Save',
  'editor.publish': 'Publish',
  'editor.undo': 'Undo',
  'editor.redo': 'Redo',
  'editor.preview': 'Preview',
  // Sidebar
  'sidebar.elements': 'Elements',
  'sidebar.sections': 'Sections',
  'sidebar.pages': 'Pages',
  'sidebar.settings': 'Settings',
  // Element catalog modal
  'elements.modal.title': 'Add Element',
  'elements.modal.subtitle': 'Choose a category to browse elements',
  'elements.modal.back': 'Back',
  'elements.modal.close': 'Close',
  'elements.modal.search_placeholder': 'Search elements...',
  'elements.modal.empty_category': 'No elements in this category yet',
  'elements.modal.coming_soon': 'Coming soon',
  'elements.modal.click_to_insert': 'Click to insert',
  // Categories
  'category.text.label': 'Text',
  'category.text.description': 'Headings, paragraphs, and text content',
  'category.interactive.label': 'Interactive',
  'category.interactive.description': 'Buttons, badges, and clickable elements',
  'category.media.label': 'Media',
  'category.media.description': 'Images, videos, and media content',
  'category.layout.label': 'Layout',
  'category.layout.description': 'Containers, cards, and structural elements',
  'category.navigation.label': 'Navigation',
  'category.navigation.description': 'Menus, breadcrumbs, and navigation elements',
  'category.forms.label': 'Forms',
  'category.forms.description': 'Inputs, textareas, and form controls',
  // Elements
  'element.heading.label': 'Heading',
  'element.heading.description': 'Main heading for sections',
  'element.paragraph.label': 'Paragraph',
  'element.paragraph.description': 'Body text and descriptions',
  'element.button.label': 'Button',
  'element.button.description': 'Call-to-action button',
  'element.badge.label': 'Badge',
  'element.badge.description': 'Label or tag element',
  'element.image.label': 'Image',
  'element.image.description': 'Image showcase',
  'element.card.label': 'Card',
  'element.card.description': 'Content card container',
  // Inspector
  'inspector.title': 'Inspector',
  'inspector.no_selection': 'No element selected',
  'inspector.position': 'Position',
  'inspector.size': 'Size',
  'inspector.style': 'Style',
  'inspector.content': 'Content',
  'inspector.delete': 'Delete',
  'inspector.duplicate': 'Duplicate',
  // Viewport
  'viewport.desktop': 'Desktop',
  'viewport.tablet': 'Tablet',
  'viewport.mobile': 'Mobile',
  // Section templates
  'sections.modal.title': 'Add Section',
  'sections.modal.subtitle': 'Choose a template to insert',
  'sections.btn_add': 'Add Section Template',
  'sections.category.header': 'Header / Banner',
  'sections.category.content': 'Content / Features',
  'sections.category.social_proof': 'Social Proof',
  'sections.category.promotional': 'Promotional',
  'sections.category.footer': 'Footer / Info',
  'sections.category.basic': 'Basic',
  // Pages
  'pages.title': 'Pages',
  'pages.add_page': 'Add Page',
  'pages.home': 'Home',
  'pages.delete_confirm': 'Delete this page?',
  // Toasts
  'toast.element_added': 'Element added',
  'toast.section_added': 'Section added',
  'toast.page_added': 'Page added',
  'toast.saved': 'Changes saved',
  'toast.published': 'Published successfully',
  'toast.error': 'Something went wrong',
  'toast.deleted': 'Deleted',
  'toast.duplicated': 'Duplicated',
  // Flyout headers
  'flyout.katalog_elemen': 'Element Catalog',
  'flyout.struktur_seksi': 'Section Structure',
  'flyout.halaman_website': 'Website Pages',
  // Misc
  'misc.tip_click_element': 'Click an element to insert into the active section in {viewport} mode.',
  'misc.tambah_ke_seksi': 'Add to section',
  'misc.untitled_section': 'Untitled Section',
  'misc.element': 'Element',
  'misc.section': 'Section',
  'misc.page': 'Page',
  'misc.layers': 'Layers',
  'misc.settings': 'Settings',
  'misc.move_up': 'Move up',
  'misc.move_down': 'Move down',
  'misc.delete': 'Delete',
  'misc.drag_to_move': 'Drag to move',
  'misc.add_section_template': 'Add Section Template',
};

export const t = (key: TranslationKey): string => {
  return EN[key] || key;
};

export type { TranslationKey };
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/translations.ts
git commit -m "feat(editor): add translation utility with English keys"
```

---

## Task 4: Create Category Definitions

**Files:**
- Create: `components/website-editor/lib/element-categories.ts`

**Interfaces:**
- Consumes: `ElementCategory` from `block-types.ts`
- Produces: `CategoryDefinition[]` export

- [ ] **Step 1: Create element-categories.ts**

```typescript
import type { ElementCategory } from './block-types';
import { t } from './translations';

export interface CategoryDefinition {
  id: ElementCategory;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

export const ELEMENT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'text',
    labelKey: 'category.text.label',
    descriptionKey: 'category.text.description',
    icon: 'text',
    color: 'blue',
  },
  {
    id: 'interactive',
    labelKey: 'category.interactive.label',
    descriptionKey: 'category.interactive.description',
    icon: 'cursor',
    color: 'purple',
  },
  {
    id: 'media',
    labelKey: 'category.media.label',
    descriptionKey: 'category.media.description',
    icon: 'media',
    color: 'green',
  },
  {
    id: 'layout',
    labelKey: 'category.layout.label',
    descriptionKey: 'category.layout.description',
    icon: 'layoutGrid',
    color: 'orange',
  },
  {
    id: 'navigation',
    labelKey: 'category.navigation.label',
    descriptionKey: 'category.navigation.description',
    icon: 'navigation',
    color: 'indigo',
  },
  {
    id: 'forms',
    labelKey: 'category.forms.label',
    descriptionKey: 'category.forms.description',
    icon: 'form',
    color: 'pink',
  },
];

export const getCategoryLabel = (cat: CategoryDefinition) => t(cat.labelKey as any);
export const getCategoryDescription = (cat: CategoryDefinition) => t(cat.descriptionKey as any);
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/element-categories.ts
git commit -m "feat(editor): add element category definitions"
```

---

## Task 5: Restructure Element Presets with Categories

**Files:**
- Modify: `components/website-editor/lib/element-presets.ts`

**Interfaces:**
- Consumes: `ElementCategory` from `block-types.ts`
- Produces: `ELEMENT_PRESETS_BY_CATEGORY`, updated `ELEMENT_PRESETS` with `category` field

- [ ] **Step 1: Rewrite element-presets.ts with category field and nested structure**

```typescript
import type { ElementType, ViewportLayout, ElementCategory } from './block-types';

export interface ElementPreset {
  type: ElementType;
  category: ElementCategory;
  label: string;
  icon: string;
  labelKey: string;
  descriptionKey: string;
  defaultProps: Record<string, unknown>;
  defaultLayouts: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
}

export const ELEMENT_PRESETS_BY_CATEGORY: Record<ElementCategory, ElementPreset[]> = {
  text: [
    {
      type: 'heading',
      category: 'text',
      label: 'Heading',
      icon: 'type',
      labelKey: 'element.heading.label',
      descriptionKey: 'element.heading.description',
      defaultProps: {
        name: 'Heading',
        text: 'Responsive Heading Text',
        fontSize: '32px',
        fontWeight: '800',
        textColor: '#0f172a',
        textAlign: 'left',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 40, width: 520, height: 60, hidden: false },
        tablet: { x: 40, y: 30, width: 440, height: 60, hidden: false },
        mobile: { x: 20, y: 20, width: 335, height: 70, hidden: false },
      },
    },
    {
      type: 'paragraph',
      category: 'text',
      label: 'Paragraph',
      icon: 'type',
      labelKey: 'element.paragraph.label',
      descriptionKey: 'element.paragraph.description',
      defaultProps: {
        name: 'Paragraph',
        text: 'Each viewport (Desktop, Tablet, Mobile) has independent X, Y coordinates and sizing.',
        fontSize: '14px',
        fontWeight: '400',
        textColor: '#475569',
        textAlign: 'left',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 110, width: 480, height: 80, hidden: false },
        tablet: { x: 40, y: 100, width: 420, height: 90, hidden: false },
        mobile: { x: 20, y: 100, width: 335, height: 110, hidden: false },
      },
    },
  ],
  interactive: [
    {
      type: 'button',
      category: 'interactive',
      label: 'Button',
      icon: 'move',
      labelKey: 'element.button.label',
      descriptionKey: 'element.button.description',
      defaultProps: {
        name: 'CTA Button',
        text: 'Click / Drag Me',
        url: '#',
        bgColor: '#2563eb',
        textColor: '#ffffff',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 200, width: 180, height: 46, hidden: false },
        tablet: { x: 40, y: 200, width: 180, height: 46, hidden: false },
        mobile: { x: 20, y: 220, width: 335, height: 48, hidden: false },
      },
    },
    {
      type: 'badge',
      category: 'interactive',
      label: 'Badge',
      icon: 'sparkles',
      labelKey: 'element.badge.label',
      descriptionKey: 'element.badge.description',
      defaultProps: {
        name: 'Badge Tag',
        text: 'RESPONSIVE INDEPENDENT DnD',
        bgColor: '#eff6ff',
        textColor: '#2563eb',
        borderColor: '#bfdbfe',
        borderRadius: '9999px',
        fontSize: '11px',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 15, width: 220, height: 32, hidden: false },
        tablet: { x: 40, y: 15, width: 200, height: 32, hidden: false },
        mobile: { x: 20, y: 10, width: 200, height: 30, hidden: false },
      },
    },
  ],
  media: [
    {
      type: 'image',
      category: 'media',
      label: 'Image',
      icon: 'image',
      labelKey: 'element.image.label',
      descriptionKey: 'element.image.description',
      defaultProps: {
        name: 'Visual Image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        alt: 'Showcase',
        borderRadius: '16px',
        objectFit: 'cover',
      },
      defaultLayouts: {
        desktop: { x: 620, y: 30, width: 280, height: 220, hidden: false },
        tablet: { x: 480, y: 30, width: 240, height: 190, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 180, hidden: false },
      },
    },
  ],
  layout: [
    {
      type: 'card',
      category: 'layout',
      label: 'Card',
      icon: 'box',
      labelKey: 'element.card.label',
      descriptionKey: 'element.card.description',
      defaultProps: {
        name: 'Feature Card',
        title: 'Fully Customizable',
        subtitle: 'Each card section and its elements are in an isolated section.',
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderRadius: '16px',
        accentColor: '#2563eb',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 270, width: 300, height: 180, hidden: false },
        tablet: { x: 40, y: 260, width: 280, height: 170, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 170, hidden: false },
      },
    },
  ],
  navigation: [],
  forms: [],
};

export const ELEMENT_PRESETS: ElementPreset[] = Object.values(ELEMENT_PRESETS_BY_CATEGORY).flat();
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/element-presets.ts
git commit -m "feat(editor): restructure element presets with categories and English labels"
```

---

## Task 6: Create Element Catalog Modal Component

**Files:**
- Create: `components/website-editor/modals/element-catalog-modal.tsx`

**Interfaces:**
- Consumes: `ELEMENT_PRESETS_BY_CATEGORY`, `ELEMENT_CATEGORIES` from lib
- Produces: `<ElementCatalogModal>` component with `onSelectElement(preset)` callback

- [ ] **Step 1: Create the modal component file**

```typescript
'use client';

import { useState } from 'react';
import { Icon, type IconName } from '../ui/icon-library';
import { ELEMENT_CATEGORIES, getCategoryLabel, getCategoryDescription } from '../lib/element-categories';
import { ELEMENT_PRESETS_BY_CATEGORY } from '../lib/element-presets';
import { t } from '../lib/translations';
import type { ElementPreset, ElementCategory } from '../lib/block-types';

interface ElementCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (preset: ElementPreset) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; hoverBg: string }> = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-600',    hoverBg: 'hover:bg-blue-100' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-600',  hoverBg: 'hover:bg-purple-100' },
  green:   { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-600',   hoverBg: 'hover:bg-green-100' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-600',  hoverBg: 'hover:bg-orange-100' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-600',  hoverBg: 'hover:bg-indigo-100' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-600',    hoverBg: 'hover:bg-pink-100' },
};

export function ElementCatalogModal({ isOpen, onClose, onSelectElement }: ElementCatalogModalProps) {
  const [view, setView] = useState<'categories' | 'elements'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const selectedCat = ELEMENT_CATEGORIES.find(c => c.id === selectedCategory);
  const elements = selectedCategory ? ELEMENT_PRESETS_BY_CATEGORY[selectedCategory] : [];

  const filteredElements = searchQuery
    ? elements.filter(e => e.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : elements;

  const handleCategoryClick = (categoryId: ElementCategory) => {
    const elems = ELEMENT_PRESETS_BY_CATEGORY[categoryId];
    if (elems.length === 0) return;
    setSelectedCategory(categoryId);
    setView('elements');
    setSearchQuery('');
  };

  const handleBack = () => {
    setView('categories');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setView('categories');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleSelectElement = (preset: ElementPreset) => {
    onSelectElement(preset);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[80vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            {view === 'elements' && (
              <button onClick={handleBack} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition">
                <Icon name="arrowLeft" className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {view === 'categories' ? t('elements.modal.title') : getCategoryLabel(selectedCat!)}
              </h2>
              <p className="text-xs text-slate-500">
                {view === 'categories' ? t('elements.modal.subtitle') : `${elements.length} ${elements.length === 1 ? 'element' : 'elements'}`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'categories' ? (
            <div className="grid grid-cols-3 gap-4">
              {ELEMENT_CATEGORIES.map(cat => {
                const colors = COLOR_MAP[cat.color] || COLOR_MAP.blue;
                const elemCount = ELEMENT_PRESETS_BY_CATEGORY[cat.id].length;
                const isEmpty = elemCount === 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    disabled={isEmpty}
                    className={`relative flex flex-col items-center p-6 rounded-xl border-2 transition-all ${
                      isEmpty
                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                        : `${colors.bg} ${colors.border} ${colors.hoverBg} cursor-pointer hover:scale-[1.02] hover:shadow-md`
                    }`}
                  >
                    {!isEmpty && (
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {elemCount} {elemCount === 1 ? 'element' : 'elements'}
                      </span>
                    )}
                    {isEmpty && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        {t('elements.modal.coming_soon')}
                      </span>
                    )}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colors.bg}`}>
                      <Icon name={cat.icon as IconName} className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="text-sm font-bold text-slate-800">{getCategoryLabel(cat)}</div>
                    <div className="text-[11px] text-slate-500 text-center mt-1">{getCategoryDescription(cat)}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {elements.length > 10 && (
                <div className="relative">
                  <Icon name="settings" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('elements.modal.search_placeholder')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                  />
                </div>
              )}

              {filteredElements.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  {t('elements.modal.empty_category')}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredElements.map(preset => (
                    <button
                      key={preset.type}
                      onClick={() => handleSelectElement(preset)}
                      className="flex items-center space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 group transition text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 group-hover:border-blue-400 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
                        <Icon name={preset.icon as IconName} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{preset.label}</div>
                        <div className="text-[11px] text-slate-500">{t(preset.descriptionKey as any)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/modals/element-catalog-modal.tsx
git commit -m "feat(editor): add element catalog modal with category grid and element list"
```

---

## Task 7: Integrate Modal into Main Editor

**Files:**
- Modify: `components/website-editor/index.tsx`

**Interfaces:**
- Consumes: `<ElementCatalogModal>` from Task 6, `t()` from Task 3
- Produces: Modal opens on "Elements" button click, replaces flyout element list

- [ ] **Step 1: Add imports at top of index.tsx**

```typescript
import { ElementCatalogModal } from './modals/element-catalog-modal';
import { t } from './lib/translations';
```

- [ ] **Step 2: Add state for element modal**

Add near existing state declarations:

```typescript
const [isElementModalOpen, setIsElementModalOpen] = useState(false);
```

- [ ] **Step 3: Change "Elements" button in sidebar to open modal**

Find the Elements button in the left sidebar (the one with `sparkles` icon that sets `activeFlyout`). Replace the `onClick` handler to open the modal instead of the flyout:

Before:
```typescript
onClick={() => setActiveFlyout(activeFlyout === 'elements' ? null : 'elements')}
```

After:
```typescript
onClick={() => setIsElementModalOpen(true)}
```

- [ ] **Step 4: Remove the flyout element list section**

Remove or comment out the entire `{activeFlyout === 'elements' && ( ... )}` block (lines 688-704 approximately).

- [ ] **Step 5: Add modal component before closing div**

Add near other modal components in the JSX:

```typescript
<ElementCatalogModal
  isOpen={isElementModalOpen}
  onClose={() => setIsElementModalOpen(false)}
  onSelectElement={(preset) => addElement(preset)}
/>
```

- [ ] **Step 6: Translate sidebar labels**

Replace Indonesian text in sidebar buttons with translation calls:

- Sidebar "Elemen" button label → `{t('sidebar.elements')}`
- Sidebar "Seksi" button label → `{t('sidebar.sections')}`
- Sidebar "Halaman" button label → `{t('sidebar.pages')}`

- [ ] **Step 7: Translate flyout panel headers**

Replace all Indonesian text in flyout headers:
- `'Katalog Elemen'` → `{t('flyout.katalog_elemen')}`
- `'Struktur Seksi'` → `{t('flyout.struktur_seksi')}`
- `'Halaman Website'` → `{t('flyout.halaman_website')}`

- [ ] **Step 8: Translate viewport labels**

Replace `DESKTOP`, `TABLET`, `MOBILE` and related labels with `t('viewport.desktop')`, `t('viewport.tablet')`, `t('viewport.mobile')`.

- [ ] **Step 9: Translate all remaining Indonesian text in index.tsx**

Systematic sweep through the file replacing:
- `'Tambah Seksi Templat'` → `{t('misc.add_section_template')}`
- `'Tambah ke seksi'` → `{t('misc.tambah_ke_seksi')}`
- `'Klik elemen untuk menyisipkan...'` → `{t('misc.tip_click_element').replace('{viewport}', viewport)}`
- `'Simpan'` → `{t('editor.save')}`
- `'Publish'` → `{t('editor.publish')}`
- `'Undo'` → `{t('editor.undo')}`
- `'Redo'` → `{t('editor.redo')}`
- `'Preview'` → `{t('editor.preview')}`
- `'Inspector'` → `{t('inspector.title')}`
- `'Tidak ada elemen dipilih'` → `{t('inspector.no_selection')}`
- `'Posisi'` → `{t('inspector.position')}`
- `'Ukuran'` → `{t('inspector.size')}`
- `'Gaya'` → `{t('inspector.style')}`
- `'Konten'` → `{t('inspector.content')}`
- `'Hapus'` → `{t('inspector.delete')}`
- `'Duplikat'` → `{t('inspector.duplicate')}`
- `'Drag to move'` → `{t('misc.drag_to_move')}`

- [ ] **Step 10: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 11: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat(editor): integrate element catalog modal and translate editor UI to English"
```

---

## Task 8: Translate Editor Provider Toast Messages

**Files:**
- Modify: `components/website-editor/editor-provider.tsx`

**Interfaces:**
- Consumes: `t()` from translations

- [ ] **Step 1: Add import for translations**

```typescript
import { t } from './lib/translations';
```

- [ ] **Step 2: Replace toast messages**

Search for `showToast(` calls and replace Indonesian strings:
- `'Elemen ditambahkan'` → `t('toast.element_added')`
- `'Seksi ditambahkan'` → `t('toast.section_added')`
- `'Halaman ditambahkan'` → `t('toast.page_added')`
- `'Perubahan tersimpan'` → `t('toast.saved')`
- `'Berhasil dipublikasikan'` → `t('toast.published')`
- `'Terjadi kesalahan'` → `t('toast.error')`
- `'Dihapus'` → `t('toast.deleted')`
- `'Diduplikat'` → `t('toast.duplicated')`

- [ ] **Step 3: Translate any remaining Indonesian strings**

Do a grep for common Indonesian words (`'di'`, `'ke'`, `'untuk'`, `'dari'`, `'dan'`, `'atau'`, `'tidak'`) and translate any remaining UI-facing strings.

- [ ] **Step 4: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/editor-provider.tsx
git commit -m "feat(editor): translate toast messages to English"
```

---

## Task 9: Translate Section Templates

**Files:**
- Modify: `components/website-editor/lib/section-templates.ts`

**Interfaces:**
- Consumes: `t()` from translations

- [ ] **Step 1: Add import for translations**

```typescript
import { t } from './translations';
```

- [ ] **Step 2: Translate section category strings**

Replace all `category` values in section templates:
- `'Header / Banner'` → `t('sections.category.header')`
- `'Content / Features'` → `t('sections.category.content')`
- `'Social Proof'` → `t('sections.category.social_proof')`
- `'Promotional'` → `t('sections.category.promotional')`
- `'Footer / Info'` → `t('sections.category.footer')`
- `'Basic'` → `t('sections.category.basic')`

- [ ] **Step 3: Translate section titles and descriptions**

Translate all `title` and `desc` values in section template factory functions to English.

- [ ] **Step 4: Verify build passes**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/lib/section-templates.ts
git commit -m "feat(editor): translate section templates to English"
```

---

## Task 10: Final Sweep and Verification

**Files:**
- All modified files

**Interfaces:**
- Consumes: All tasks 1-9

- [ ] **Step 1: Grep for remaining Indonesian text**

Run: `rg -i "judul|paragraf|tombol|badge|gambar|kartu|tambah|hapus|simpan|elemen|seksi|halaman|turunkan|naikkan|dipilih|gaya|posisi|ukuran|konten|duplikat" components/website-editor/`

Expected: No matches (or only in non-UI contexts like variable names)

- [ ] **Step 2: Verify full TypeScript build**

Run: `npx tsc --noEmit --project tsconfig.json`
Expected: No errors

- [ ] **Step 3: Run linter if available**

Run: `npm run lint` or `npx next lint`
Expected: No new errors

- [ ] **Step 4: Manual smoke test**

- Open the website editor
- Click "Elements" in sidebar → modal opens with 6 category cards
- Click "Text" category → shows Heading, Paragraph elements
- Click "Heading" → element inserted, modal closes
- Click "Interactive" → shows Button, Badge
- Verify "Navigation" and "Forms" show "Coming soon" badge
- Verify all labels are in English
- Test undo/redo after inserting element

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore(editor): final cleanup and verification for element catalog categorization"
```
