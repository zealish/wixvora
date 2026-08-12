# Nested Layout Elements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 new layout elements (Container, Flex Row, Grid, Divider, Spacer, Icon+Text) to the element catalog and implement true nested element architecture supporting container elements with children.

**Architecture:** Add `parentId`/`children`/`ContainerLayout` to the Element model. Refactor canvas rendering from flat `sec.elements.map()` to recursive `RenderElementWrapper`. Add container drop-target on canvas. Add 4 new inspector panels. Refactor HTML export to recursive renderer.

**Tech Stack:** TypeScript, React 19, Next.js 16, Tailwind CSS 4, @dnd-kit/core @dnd-kit/sortable (new dependency)

## Global Constraints

- Follow existing code conventions (no comments, no new dependencies except @dnd-kit)
- Flat properties on Element interface (no nested objects beyond ContainerLayout)
- if-chain / conditional rendering pattern in RenderElementContent
- Inspector follows CardInspector pattern: `(element, sectionId, onUpdate)` → `update()` helper
- HTML export follows existing if-chain pattern in html-generator.ts
- Viewport layout: `getLayout(element, viewport)`, `updateElementViewportLayout()` for position
- No nested containers (container inside container) enforced at UI level

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `components/website-editor/lib/block-types.ts` | Modify | Add 6 element types, `parentId`, `children`, `ContainerLayout`, new element props |
| `components/website-editor/lib/element-presets.ts` | Modify | Add 6 presets to layout category |
| `components/website-editor/ui/icon-library.tsx` | Modify | Add 7 new icons |
| `components/website-editor/lib/translations.ts` | Modify | Add all translation keys |
| `components/website-editor/editor-provider.tsx` | Modify | Add nesting functions, modify addElement/deleteElement/copy/paste/duplicate |
| `components/website-editor/index.tsx` | Modify | Refactor to recursive RenderElementWrapper, add container drop target, wire new inspectors |
| `components/website-editor/lib/html-generator.ts` | Modify | Refactor to recursive renderer, add new element HTML export |
| `app/globals.css` | Modify | Container drop target + children panel styles |
| `components/website-editor/inspector/ContainerInspector.tsx` | Create | Layout, Style, Children tabs |
| `components/website-editor/inspector/DividerInspector.tsx` | Create | Color, Height, Width |
| `components/website-editor/inspector/SpacerInspector.tsx` | Create | Height |
| `components/website-editor/inspector/IconTextInspector.tsx` | Create | Icon, title, description, layout |
| `components/website-editor/lib/section-templates.ts` | Modify (optional) | Update Features template to use Grid + Icon+Text |

---

### Task 1: Add New Types and Properties to Block Types

**Files:**
- Modify: `components/website-editor/lib/block-types.ts`

**Interfaces:**
- Consumes: None (foundational)
- Produces: `'container' | 'flex-row' | 'grid' | 'divider' | 'spacer' | 'icon-text'` in ElementType, `ContainerLayout` interface, `parentId`, `children`, new props on Element

- [ ] **Step 1: Add new types to ElementType union**

Open `components/website-editor/lib/block-types.ts`. Change line 1 from:

```ts
export type ElementType = 'heading' | 'paragraph' | 'button' | 'badge' | 'image' | 'card' | 'video';
```

To:

```ts
export type ElementType = 'heading' | 'paragraph' | 'button' | 'badge' | 'image' | 'card' | 'video' | 'container' | 'flex-row' | 'grid' | 'divider' | 'spacer' | 'icon-text';
```

- [ ] **Step 2: Add ContainerLayout interface**

Add before the `Element` interface (after `ViewportLayout`):

```ts
export interface ContainerLayout {
  type: 'flex' | 'grid';
  direction?: 'row' | 'column';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  columns?: number;
  gap?: number;
}
```

- [ ] **Step 3: Add nesting and new element props to Element interface**

Add after the Video-specific section (after `controlBarTheme` line) but before the closing `}`:

```ts
  // Nesting
  parentId?: string;
  children?: Element[];
  containerLayout?: ContainerLayout;

  // Divider-specific
  dividerColor?: string;
  dividerHeight?: string;
  dividerWidth?: string;

  // Icon+Text-specific
  iconName?: string;
  iconColor?: string;
  iconSize?: string;
  iconTextLayout?: 'horizontal' | 'vertical';
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors related to block-types.ts

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/lib/block-types.ts
git commit -m "feat(editor): add container/layout element types, ContainerLayout interface, and nesting props"
```

---

### Task 2: Add New Icons to Icon Library

**Files:**
- Modify: `components/website-editor/ui/icon-library.tsx`

**Interfaces:**
- Consumes: None
- Produces: New icons: `layoutColumns`, `gripVertical`, `arrowUpDown`, `rectangle`, `container`

- [ ] **Step 1: Add new icon names to IconName union**

Add to the `IconName` union before the closing `;`:

```ts
  | 'layoutColumns'
  | 'gripVertical'
  | 'arrowUpDown'
  | 'rectangle'
  | 'container';
```

- [ ] **Step 2: Add icon SVGs to icons record**

Add before the closing `};` of the `icons` record:

```ts
  layoutColumns: (
    <>
      <rect x="3" y="3" width="8" height="18" rx="1" />
      <rect x="13" y="3" width="8" height="18" rx="1" />
    </>
  ),
  gripVertical: (
    <>
      <circle cx="9" cy="5" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="19" r="1" />
    </>
  ),
  arrowUpDown: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <polyline points="8,7 12,3 16,7" />
      <polyline points="8,17 12,21 16,17" />
    </>
  ),
  rectangle: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </>
  ),
  container: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12,18v4M8,22h8" />
    </>
  ),
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors related to icon-library.tsx

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/ui/icon-library.tsx
git commit -m "feat(editor): add layout/catalog icons to icon library"
```

---

### Task 3: Add Translation Keys

**Files:**
- Modify: `components/website-editor/lib/translations.ts`

**Interfaces:**
- Consumes: None
- Produces: Translation keys for all new elements and inspector labels

- [ ] **Step 1: Add translation keys to TranslationKey union**

Add before the closing `;` of the `TranslationKey` type:

```ts
  | 'element.container.label'
  | 'element.container.description'
  | 'element.flex_row.label'
  | 'element.flex_row.description'
  | 'element.grid.label'
  | 'element.grid.description'
  | 'element.divider.label'
  | 'element.divider.description'
  | 'element.spacer.label'
  | 'element.spacer.description'
  | 'element.icon_text.label'
  | 'element.icon_text.description'
  | 'inspector.children'
  | 'inspector.children.add'
  | 'inspector.children.move_out'
  | 'inspector.children.empty'
  | 'inspector.container.layout'
  | 'inspector.container.style'
  | 'inspector.container.layout_type'
  | 'inspector.container.direction'
  | 'inspector.container.align_items'
  | 'inspector.container.justify_content'
  | 'inspector.container.columns'
  | 'inspector.container.gap'
  | 'inspector.container.min_height'
  | 'inspector.divider.color'
  | 'inspector.divider.height'
  | 'inspector.divider.width'
  | 'inspector.spacer.height'
  | 'inspector.icon_text.icon'
  | 'inspector.icon_text.icon_color'
  | 'inspector.icon_text.icon_size'
  | 'inspector.icon_text.layout'
  | 'inspector.icon_text.description_color'
  | 'inspector.icon_text.description_font_size'
  | 'toast.element_moved_to_container'
  | 'toast.element_moved_out'
  | 'toast.child_added';
```

- [ ] **Step 2: Add English translations to EN record**

Add before the closing `};` of the `EN` record:

```ts
  'element.container.label': 'Container',
  'element.container.description': 'Flexible wrapper for grouping elements',
  'element.flex_row.label': 'Flex Row',
  'element.flex_row.description': 'Arrange elements side by side in a row',
  'element.grid.label': 'Grid',
  'element.grid.description': 'Multi-column grid for galleries and features',
  'element.divider.label': 'Divider',
  'element.divider.description': 'Horizontal separator line',
  'element.spacer.label': 'Spacer',
  'element.spacer.description': 'Add vertical space between elements',
  'element.icon_text.label': 'Icon + Text',
  'element.icon_text.description': 'Icon with heading and description text',
  'inspector.children': 'Children',
  'inspector.children.add': 'Add Child',
  'inspector.children.move_out': 'Move Out',
  'inspector.children.empty': 'No children yet. Drag elements here or click "Add Child".',
  'inspector.container.layout': 'Layout',
  'inspector.container.style': 'Style',
  'inspector.container.layout_type': 'Layout Type',
  'inspector.container.direction': 'Direction',
  'inspector.container.align_items': 'Align Items',
  'inspector.container.justify_content': 'Justify Content',
  'inspector.container.columns': 'Columns',
  'inspector.container.gap': 'Gap',
  'inspector.container.min_height': 'Min Height',
  'inspector.divider.color': 'Color',
  'inspector.divider.height': 'Height',
  'inspector.divider.width': 'Width',
  'inspector.spacer.height': 'Height',
  'inspector.icon_text.icon': 'Icon',
  'inspector.icon_text.icon_color': 'Icon Color',
  'inspector.icon_text.icon_size': 'Icon Size',
  'inspector.icon_text.layout': 'Layout',
  'inspector.icon_text.description_color': 'Description Color',
  'inspector.icon_text.description_font_size': 'Description Font Size',
  'toast.element_moved_to_container': 'Element moved into container',
  'toast.element_moved_out': 'Element moved out of container',
  'toast.child_added': 'Child element added',
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No type errors in translations.ts

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/lib/translations.ts
git commit -m "feat(editor): add translations for new layout elements and inspector labels"
```

---

### Task 4: Add 6 New Element Presets

**Files:**
- Modify: `components/website-editor/lib/element-presets.ts`

**Interfaces:**
- Consumes: `ElementType`, `ElementCategory`, `ViewportLayout` from block-types
- Produces: 6 new presets in layout category

- [ ] **Step 1: Add presets to the layout array**

Open `components/website-editor/lib/element-presets.ts`. In `ELEMENT_PRESETS_BY_CATEGORY.layout`, add these after the card closing `},`:

```ts
    {
      type: 'container',
      category: 'layout',
      label: 'Container',
      icon: 'container',
      labelKey: 'element.container.label',
      descriptionKey: 'element.container.description',
      defaultProps: {
        name: 'Container',
        children: [],
        containerLayout: {
          type: 'flex',
          direction: 'column',
          alignItems: 'start',
          gap: 16,
        },
        bgColor: undefined,
        borderColor: undefined,
        borderRadius: '8px',
        padding: '24px',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 400, height: 200, hidden: false },
        tablet: { x: 40, y: 50, width: 320, height: 180, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 180, hidden: false },
      },
    },
    {
      type: 'flex-row',
      category: 'layout',
      label: 'Flex Row',
      icon: 'layoutColumns',
      labelKey: 'element.flex_row.label',
      descriptionKey: 'element.flex_row.description',
      defaultProps: {
        name: 'Flex Row',
        children: [],
        containerLayout: {
          type: 'flex',
          direction: 'row',
          alignItems: 'center',
          justifyContent: 'start',
          gap: 16,
        },
        padding: '16px',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 700, height: 120, hidden: false },
        tablet: { x: 40, y: 50, width: 500, height: 110, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 110, hidden: false },
      },
    },
    {
      type: 'grid',
      category: 'layout',
      label: 'Grid',
      icon: 'grid',
      labelKey: 'element.grid.label',
      descriptionKey: 'element.grid.description',
      defaultProps: {
        name: 'Grid',
        children: [],
        containerLayout: {
          type: 'grid',
          columns: 3,
          gap: 16,
        },
        padding: '16px',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 700, height: 200, hidden: false },
        tablet: { x: 40, y: 50, width: 500, height: 180, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 180, hidden: false },
      },
    },
    {
      type: 'divider',
      category: 'layout',
      label: 'Divider',
      icon: 'minus',
      labelKey: 'element.divider.label',
      descriptionKey: 'element.divider.description',
      defaultProps: {
        name: 'Divider',
        dividerColor: '#e5e7eb',
        dividerHeight: '1px',
        dividerWidth: '100%',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 400, height: 20, hidden: false },
        tablet: { x: 40, y: 50, width: 320, height: 20, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 20, hidden: false },
      },
    },
    {
      type: 'spacer',
      category: 'layout',
      label: 'Spacer',
      icon: 'arrowUpDown',
      labelKey: 'element.spacer.label',
      descriptionKey: 'element.spacer.description',
      defaultProps: {
        name: 'Spacer',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 400, height: 32, hidden: false },
        tablet: { x: 40, y: 50, width: 320, height: 32, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 32, hidden: false },
      },
    },
    {
      type: 'icon-text',
      category: 'layout',
      label: 'Icon + Text',
      icon: 'sparkles',
      labelKey: 'element.icon_text.label',
      descriptionKey: 'element.icon_text.description',
      defaultProps: {
        name: 'Icon + Text',
        iconName: 'star',
        iconColor: '#3b82f6',
        iconSize: '32',
        title: 'Feature Title',
        description: 'Short description about this feature or benefit.',
        iconTextLayout: 'horizontal',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 50, width: 320, height: 120, hidden: false },
        tablet: { x: 40, y: 50, width: 260, height: 110, hidden: false },
        mobile: { x: 20, y: 50, width: 335, height: 110, hidden: false },
      },
    },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors in element-presets.ts

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/element-presets.ts
git commit -m "feat(editor): add 6 new layout element presets (container, flex-row, grid, divider, spacer, icon-text)"
```

---

### Task 5: Add Nesting Provider Functions to Editor Context

**Files:**
- Modify: `components/website-editor/editor-provider.tsx`

**Interfaces:**
- Consumes: `Element`, `Section`, `ContainerLayout` from block-types; `ELEMENT_PRESETS`
- Produces: `moveElementIntoContainer()`, `moveElementOutOfContainer()`, `addChildElement()`, `removeChildFromContainer()`, `reorderChildren()`, `updateChildElementProps()`; modified `addElement()`, `deleteElement()`, `copyElement()`, `pasteElement()`, `duplicateElement()`

- [ ] **Step 1: Install @dnd-kit**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
Expected: Packages added to package.json

- [ ] **Step 2: Update EditorContextValue interface**

Add to the interface (around line 51):

```ts
  moveElementIntoContainer: (elementId: string, sectionId: string, containerId: string) => void;
  moveElementOutOfContainer: (elementId: string, containerId: string, sectionId: string) => void;
  addChildElement: (preset: typeof ELEMENT_PRESETS[number], containerId: string) => void;
  removeChildFromContainer: (elementId: string, containerId: string, sectionId: string) => void;
  reorderChildren: (containerId: string, sectionId: string, fromIndex: number, toIndex: number) => void;
  updateChildElementProps: (sectionId: string, containerId: string, elementId: string, props: Partial<Element>) => void;
```

And update `addElement` signature:

```ts
  addElement: (preset: typeof ELEMENT_PRESETS[number], sectionId?: string, parentElementId?: string) => void;
```

- [ ] **Step 3: Modify `addElement` to support optional `parentElementId`**

Replace the `addElement` implementation:

```ts
  const addElement = useCallback((preset: typeof ELEMENT_PRESETS[number], sectionId?: string, parentElementId?: string) => {
    const targetSecId = sectionId || selectedSectionId;
    if (!targetSecId) return;
    const targetSec = currentSections.find(s => s.id === targetSecId);
    if (!targetSec) return;

    const baseLayouts = JSON.parse(JSON.stringify(preset.defaultLayouts));
    const newElement: Element = {
      id: createUniqueId('el'),
      type: preset.type,
      ...JSON.parse(JSON.stringify(preset.defaultProps)),
      layouts: baseLayouts,
      zIndex: 10
    };

    if (parentElementId) {
      const updated = currentSections.map(sec => {
        if (sec.id === targetSecId) {
          return {
            ...sec,
            elements: sec.elements.map(el => {
              if (el.id === parentElementId) {
                const child = { ...newElement, parentId: parentElementId };
                return { ...el, children: [...(el.children || []), child as Element] };
              }
              return el;
            })
          };
        }
        return sec;
      });
      updateCurrentPageSections(updated);
      setSelectedSectionId(targetSecId);
      setSelectedElementId(newElement.id);
      setAddMenuOpen(false);
      showToast(t('toast.child_added'));
      return;
    }

    const updated = currentSections.map(sec => {
      if (sec.id === targetSecId) {
        return { ...sec, elements: [...sec.elements, newElement] };
      }
      return sec;
    });

    updateCurrentPageSections(updated);
    setSelectedSectionId(targetSecId);
    setSelectedElementId(newElement.id);
    setAddMenuOpen(false);
    showToast(t('toast.element_added'));
  }, [currentSections, selectedSectionId, updateCurrentPageSections, showToast]);
```

- [ ] **Step 4: Add `moveElementIntoContainer`**

```ts
  const moveElementIntoContainer = useCallback((elementId: string, sourceSectionId: string, targetContainerId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sourceSectionId) {
            const el = sec.elements.find(e => e.id === elementId);
            if (!el) return sec;
            return {
              ...sec,
              elements: sec.elements.map(e => {
                if (e.id === targetContainerId) {
                  return {
                    ...e,
                    children: [...(e.children || []), { ...el, parentId: targetContainerId } as Element],
                  };
                }
                return e;
              }).filter(e => e.id !== elementId),
            };
          }
          return sec;
        }),
      };
    }));
    showToast(t('toast.element_moved_to_container'));
  }, [currentPageId, showToast]);
```

- [ ] **Step 5: Add `moveElementOutOfContainer`**

```ts
  const moveElementOutOfContainer = useCallback((elementId: string, containerElementId: string, sectionId: string) => {
    let movedChild: Element | null = null;

    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              elements: sec.elements.map(el => {
                if (el.id === containerElementId) {
                  const child = el.children?.find(c => c.id === elementId);
                  if (child) movedChild = child;
                  return {
                    ...el,
                    children: el.children?.filter(c => c.id !== elementId) || [],
                  };
                }
                return el;
              }),
            };
          }
          return sec;
        }),
      };
    }));

    if (movedChild) {
      setPages(prev => prev.map(p => {
        if (p.id !== currentPageId) return p;
        return {
          ...p,
          sections: p.sections.map(sec => {
            if (sec.id === sectionId) {
              const { parentId, ...rest } = movedChild!;
              const topLevel: Element = { ...rest, parentId: undefined, children: undefined };
              return { ...sec, elements: [...sec.elements, topLevel] };
            }
            return sec;
          }),
        };
      }));
      showToast(t('toast.element_moved_out'));
    }
  }, [currentPageId, showToast]);
```

- [ ] **Step 6: Add `reorderChildren`**

```ts
  const reorderChildren = useCallback((containerElementId: string, sectionId: string, fromIndex: number, toIndex: number) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              elements: sec.elements.map(el => {
                if (el.id === containerElementId && el.children) {
                  const reordered = [...el.children];
                  const [moved] = reordered.splice(fromIndex, 1);
                  if (moved) reordered.splice(toIndex, 0, moved);
                  return { ...el, children: reordered };
                }
                return el;
              }),
            };
          }
          return sec;
        }),
      };
    }));
  }, [currentPageId]);
```

- [ ] **Step 7: Add `removeChildFromContainer`**

```ts
  const removeChildFromContainer = useCallback((elementId: string, containerElementId: string, sectionId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              elements: sec.elements.map(el => {
                if (el.id === containerElementId) {
                  return { ...el, children: el.children?.filter(c => c.id !== elementId) || [] };
                }
                return el;
              }),
            };
          }
          return sec;
        }),
      };
    }));
    showToast(t('toast.deleted'));
  }, [currentPageId, showToast]);
```

- [ ] **Step 8: Add `updateChildElementProps`**

```ts
  const updateChildElementProps = useCallback((sectionId: string, containerElementId: string, childElementId: string, newProps: Partial<Element>) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              elements: sec.elements.map(el => {
                if (el.id === containerElementId) {
                  return {
                    ...el,
                    children: el.children?.map(child =>
                      child.id === childElementId ? { ...child, ...newProps } : child
                    ) || [],
                  };
                }
                return el;
              }),
            };
          }
          return sec;
        }),
      };
    }));
  }, [currentPageId]);
```

- [ ] **Step 9: Modify `deleteElement` to handle nested elements**

Replace existing `deleteElement`:

```ts
  const deleteElement = useCallback((sectionId: string, elementId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== currentPageId) return p;
      return {
        ...p,
        sections: p.sections.map(sec => {
          if (sec.id !== sectionId) return sec;
          const topLevelEl = sec.elements.find(e => e.id === elementId);
          if (topLevelEl) {
            return { ...sec, elements: sec.elements.filter(e => e.id !== elementId) };
          }
          return {
            ...sec,
            elements: sec.elements.map(el => {
              if (el.children?.some(c => c.id === elementId)) {
                return { ...el, children: el.children.filter(c => c.id !== elementId) };
              }
              return el;
            }),
          };
        }),
      };
    }));
    setSelectedElementId(null);
    showToast(t('toast.deleted'));
  }, [currentPageId, showToast]);
```

- [ ] **Step 10: Modify `duplicateElement` for nested elements**

Replace existing `duplicateElement`:

```ts
  const duplicateElement = useCallback((sectionId: string, elementId: string) => {
    const section = currentSections.find(s => s.id === sectionId);
    if (!section) return;

    const topEl = section.elements.find(e => e.id === elementId);
    if (topEl) {
      const updated = currentSections.map(sec => {
        if (sec.id === sectionId) {
          const copy = JSON.parse(JSON.stringify(topEl));
          copy.id = createUniqueId('el');
          copy.name = (copy.name || 'Element') + ' (Copy)';
          if (copy.children) {
            copy.children = copy.children.map((c: any) => ({ ...c, id: createUniqueId('el'), parentId: copy.id }));
          }
          (['desktop', 'tablet', 'mobile'] as Viewport[]).forEach(vp => {
            const l = getLayout(copy, vp);
            copy.layouts[vp] = { ...l, x: Math.min(l.x + 20, VIEWPORT_WIDTHS[vp] - l.width - 10), y: l.y + 20 };
          });
          return { ...sec, elements: [...sec.elements, copy] };
        }
        return sec;
      });
      updateCurrentPageSections(updated);
      showToast(t('toast.duplicated'));
      return;
    }

    for (const el of section.elements) {
      const child = el.children?.find(c => c.id === elementId);
      if (child) {
        const copy = JSON.parse(JSON.stringify(child));
        copy.id = createUniqueId('el');
        copy.name = (copy.name || 'Element') + ' (Copy)';
        const updated = currentSections.map(sec => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              elements: sec.elements.map(e => {
                if (e.id === el.id) return { ...e, children: [...(e.children || []), copy] };
                return e;
              }),
            };
          }
          return sec;
        });
        updateCurrentPageSections(updated);
        showToast(t('toast.duplicated'));
        return;
      }
    }
  }, [currentSections, updateCurrentPageSections, showToast]);
```

- [ ] **Step 11: Update `pasteElement` for children deep-clone**

In `pasteElement`, after `copy.id = createUniqueId('el');` add:

```ts
    if (copy.children) {
      copy.children = copy.children.map((c: any) => ({ ...c, id: createUniqueId('el') }));
    }
```

- [ ] **Step 12: Add new functions to context value**

Add to the `value` object (after `addElement`):

```ts
        moveElementIntoContainer,
        moveElementOutOfContainer,
        addChildElement: (preset: typeof ELEMENT_PRESETS[number], containerId: string) => addElement(preset, selectedSectionId ?? undefined, containerId),
        removeChildFromContainer,
        reorderChildren,
        updateChildElementProps,
```

- [ ] **Step 13: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -60`
Expected: No type errors from editor-provider.tsx

- [ ] **Step 14: Commit**

```bash
git add components/website-editor/editor-provider.tsx package.json package-lock.json
git commit -m "feat(editor): add nesting functions (moveIntoContainer, reorderChildren, etc.) and install @dnd-kit"
```

---

### Task 6: Add DividerInspector, SpacerInspector, and IconTextInspector

**Files:**
- Create: `components/website-editor/inspector/DividerInspector.tsx`
- Create: `components/website-editor/inspector/SpacerInspector.tsx`
- Create: `components/website-editor/inspector/IconTextInspector.tsx`

**Interfaces:**
- Consumes: `Element` from block-types
- Produces: Three inspector components

- [ ] **Step 1: Create DividerInspector.tsx**

```tsx
"use client";

import type { Element } from "../lib/block-types";
import { t } from "../lib/translations";

export function DividerInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.color')}</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.dividerColor || '#e5e7eb'}
            onChange={(e) => update({ dividerColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.dividerColor}</span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.height')}</label>
        <select
          value={element.dividerHeight || '1px'}
          onChange={(e) => update({ dividerHeight: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
        >
          {['1px', '2px', '3px', '4px'].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">{t('inspector.divider.width')}</label>
        <select
          value={element.dividerWidth || '100%'}
          onChange={(e) => update({ dividerWidth: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
        >
          {['100%', '75%', '50%', '25%'].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create SpacerInspector.tsx**

```tsx
"use client";

import type { Element } from "../lib/block-types";

export function SpacerInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed">
        Spacer creates vertical whitespace. Resize it using the canvas handles to adjust height.
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create IconTextInspector.tsx**

```tsx
"use client";

import type { Element } from "../lib/block-types";
import { t } from "../lib/translations";

const ICON_OPTIONS = [
  { label: 'Star', value: 'star' },
  { label: 'Check', value: 'check' },
  { label: 'Settings', value: 'settings' },
  { label: 'Mail', value: 'mail' },
  { label: 'Sparkles', value: 'sparkles' },
];

export function IconTextInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);

  return (
    <div className="space-y-4">
      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('inspector.icon_text.icon')}</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Icon</label>
          <select
            value={element.iconName || 'star'}
            onChange={(e) => update({ iconName: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          >
            {ICON_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.icon_color')}</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.iconColor || '#3b82f6'}
              onChange={(e) => update({ iconColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.iconColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.icon_size')}</label>
          <select
            value={element.iconSize || '32'}
            onChange={(e) => update({ iconSize: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          >
            {['24', '32', '40', '48'].map(v => (
              <option key={v} value={v}>{v}px</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content</label>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Title</label>
          <input
            type="text"
            value={element.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-slate-400">Description</label>
          <input
            type="text"
            value={element.description || ''}
            onChange={(e) => update({ description: e.target.value })}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">Title Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={element.textColor || '#0f172a'}
              onChange={(e) => update({ textColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">{element.textColor}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[9px] text-slate-400">{t('inspector.icon_text.description_color')}</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value="#6b7280"
              onChange={(e) => update({ accentColor: e.target.value })}
              className="w-6 h-6 rounded border border-slate-200 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-[10px] text-slate-600">#6b7280</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('inspector.icon_text.layout')}</label>

        <div className="grid grid-cols-2 gap-1">
          {(['horizontal', 'vertical'] as const).map(layout => (
            <button
              key={layout}
              onClick={() => update({ iconTextLayout: layout })}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${(element.iconTextLayout || 'horizontal') === layout ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
              {layout === 'horizontal' ? 'Horizontal' : 'Vertical'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors from the three new inspector files

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/inspector/DividerInspector.tsx components/website-editor/inspector/SpacerInspector.tsx components/website-editor/inspector/IconTextInspector.tsx
git commit -m "feat(editor): add DividerInspector, SpacerInspector, and IconTextInspector"
```

---

### Task 7: Create ContainerInspector with Layout, Style, and Children Tabs

**Files:**
- Create: `components/website-editor/inspector/ContainerInspector.tsx`

**Interfaces:**
- Consumes: `Element`, `ContainerLayout` from block-types; `useEditor()` hook; `ELEMENT_PRESETS`
- Produces: `ContainerInspector` component

- [ ] **Step 1: Create ContainerInspector.tsx**

```tsx
"use client";

import { useState } from "react";
import type { Element } from "../lib/block-types";
import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";
import { t } from "../lib/translations";
import { ELEMENT_PRESETS } from "../lib/element-presets";

export function ContainerInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);
  const { removeChildFromContainer, moveElementOutOfContainer, addChildElement, selectElement } = useEditor();
  const [inspectorTab, setInspectorTab] = useState<'layout' | 'style' | 'children'>('layout');
  const [addChildOpen, setAddChildOpen] = useState(false);
  const cl = element.containerLayout;

  const updateContainerLayout = (layoutProps: Partial<typeof cl>) => {
    update({ containerLayout: { ...cl, ...layoutProps } as any });
  };

  const nonContainerPresets = ELEMENT_PRESETS.filter(
    p => p.type !== 'container' && p.type !== 'flex-row' && p.type !== 'grid'
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 border-b border-slate-200 text-[11px] bg-slate-50 rounded-t-lg">
        {(['layout', 'style', 'children'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInspectorTab(tab)}
            className={`py-2 font-semibold transition ${inspectorTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {tab === 'layout' ? t('inspector.container.layout') : tab === 'style' ? t('inspector.container.style') : t('inspector.children')}
          </button>
        ))}
      </div>

      {inspectorTab === 'layout' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">{t('inspector.container.layout_type')}</label>
            <div className="grid grid-cols-2 gap-1">
              {(['flex', 'grid'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => updateContainerLayout({ type })}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition ${cl?.type === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {type === 'flex' ? 'Flex' : 'Grid'}
                </button>
              ))}
            </div>
          </div>

          {cl?.type === 'flex' && (
            <>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.direction')}</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['row', 'column'] as const).map(dir => (
                    <button
                      key={dir}
                      onClick={() => updateContainerLayout({ direction: dir })}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition ${cl?.direction === dir ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {dir === 'row' ? 'Row' : 'Column'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.align_items')}</label>
                <select
                  value={cl?.alignItems || 'start'}
                  onChange={(e) => updateContainerLayout({ alignItems: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                >
                  {['start', 'center', 'end', 'stretch'].map(v => (
                    <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400">{t('inspector.container.justify_content')}</label>
                <select
                  value={cl?.justifyContent || 'start'}
                  onChange={(e) => updateContainerLayout({ justifyContent: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
                >
                  {['start', 'center', 'end', 'space-between', 'space-around'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {cl?.type === 'grid' && (
            <div className="space-y-1">
              <label className="text-[9px] text-slate-400">{t('inspector.container.columns')}</label>
              <select
                value={cl?.columns || 3}
                onChange={(e) => updateContainerLayout({ columns: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 text-[11px]"
              >
                {[2, 3, 4].map(v => (
                  <option key={v} value={v}>{v} Columns</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">{t('inspector.container.gap')} (px)</label>
            <input
              type="number"
              value={cl?.gap || 16}
              onChange={(e) => updateContainerLayout({ gap: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400">Padding (px)</label>
            <input
              type="text"
              value={element.padding || ''}
              onChange={(e) => update({ padding: e.target.value })}
              placeholder="e.g., 16px"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      {inspectorTab === 'style' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">Background</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={element.bgColor || '#ffffff'}
                onChange={(e) => update({ bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-slate-600">{element.bgColor || 'transparent'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">Border Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={element.borderColor || '#e2e8f0'}
                onChange={(e) => update({ borderColor: e.target.value })}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <span className="font-mono text-[11px] text-slate-600">{element.borderColor || 'none'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
            <input
              type="text"
              value={element.borderRadius || '8px'}
              onChange={(e) => update({ borderRadius: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>
        </div>
      )}

      {inspectorTab === 'children' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-slate-500">{t('inspector.children')}</label>
            <div className="relative">
              <button
                onClick={() => setAddChildOpen(!addChildOpen)}
                className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold transition"
              >
                {t('inspector.children.add')}
              </button>
              {addChildOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-50">
                  {nonContainerPresets.map(p => (
                    <button
                      key={p.type}
                      onClick={() => { addChildElement(p, element.id); setAddChildOpen(false); }}
                      className="w-full text-left px-3 py-1.5 rounded text-[11px] hover:bg-slate-50 font-medium text-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setAddChildOpen(false)}
                    className="w-full text-left px-3 py-1.5 rounded text-[10px] text-slate-400 hover:bg-slate-50 mt-1 border-t border-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {(!element.children || element.children.length === 0) ? (
            <div className="text-center py-6 text-slate-400 text-[11px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
              {t('inspector.children.empty')}
            </div>
          ) : (
            <div className="space-y-1">
              {element.children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => selectElement(child.id)}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="gripVertical" className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-700">{child.name || child.type}</span>
                    <span className="text-[9px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">{child.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveElementOutOfContainer(child.id, element.id, sectionId); }}
                      className="p-0.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition"
                      title={t('inspector.children.move_out')}
                    >
                      <Icon name="arrowUp" className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeChildFromContainer(child.id, element.id, sectionId); }}
                      className="p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Icon name="trash" className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors from ContainerInspector.tsx

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/inspector/ContainerInspector.tsx
git commit -m "feat(editor): add ContainerInspector with Layout, Style, and Children tabs"
```

---

### Task 8: Add CSS for child elements and drop target

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: None
- Produces: CSS classes for child elements, drop targets, children panel

- [ ] **Step 1: Add CSS rules**

Append to `app/globals.css`:

```css
.child-element {
  position: relative !important;
}

.container-drop-highlight {
  outline: 2px solid #3b82f6 !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat(editor): add CSS for child elements and container drop target"
```

---

### Task 9: Refactor Canvas Rendering and Wire Inspectors in index.tsx

**Files:**
- Modify: `components/website-editor/index.tsx`

**Interfaces:**
- Consumes: `useEditor()` context; `ContainerInspector`, `DividerInspector`, `SpacerInspector`, `IconTextInspector`; `getLayout`
- Produces: Recursive `RenderElementWrapper`, container drop-target UX, new leaf element renderers, inspector wiring

- [ ] **Step 1: Import new inspectors**

Add at top of `index.tsx`:

```ts
import { ContainerInspector } from "./inspector/ContainerInspector";
import { DividerInspector } from "./inspector/DividerInspector";
import { SpacerInspector } from "./inspector/SpacerInspector";
import { IconTextInspector } from "./inspector/IconTextInspector";
```

- [ ] **Step 2: Add `dragOverContainerId` state and destructure new functions**

In `EditorLayout`, add:

```ts
  const [dragOverContainerId, setDragOverContainerId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
```

Destructure from `useEditor()`:

```ts
    moveElementIntoContainer, moveElementOutOfContainer, addChildElement, removeChildFromContainer, reorderChildren, updateChildElementProps
```

- [ ] **Step 3: Add `buildContainerStyles` and `isContainerElement` helpers**

Before `EditorLayout`:

```ts
function buildContainerStyles(cl: import('./lib/block-types').ContainerLayout | undefined): React.CSSProperties {
  if (!cl) return {};
  const base: React.CSSProperties = {
    display: cl.type === 'flex' ? 'flex' : 'grid',
    gap: `${cl.gap || 16}px`,
  };
  if (cl.type === 'flex') {
    base.flexDirection = cl.direction || 'row';
    base.alignItems = cl.alignItems || 'start';
    if (cl.justifyContent) base.justifyContent = cl.justifyContent;
  }
  if (cl.type === 'grid') {
    base.gridTemplateColumns = `repeat(${cl.columns || 3}, 1fr)`;
  }
  return base;
}

function isContainerElement(el: import('./lib/block-types').Element): boolean {
  return el.type === 'container' || el.type === 'flex-row' || el.type === 'grid';
}
```

- [ ] **Step 4: Add new renderers to RenderElementContent**

Add before `return null;`:

```ts
  if (element.type === "divider") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: element.dividerWidth || '100%',
          height: element.dividerHeight || '1px',
          backgroundColor: element.dividerColor || '#e5e7eb',
        }} />
      </div>
    );
  }

  if (element.type === "spacer") {
    return <div className="w-full h-full" />;
  }

  if (element.type === "icon-text") {
    const isHorizontal = element.iconTextLayout !== 'vertical';
    return (
      <div style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isHorizontal ? '12px' : '8px',
        textAlign: isHorizontal ? 'left' : 'center',
        height: '100%',
        padding: '8px',
      }}>
        <Icon name={(element.iconName as any) || 'star'} size={parseInt(element.iconSize || '32')} style={{ color: element.iconColor || '#3b82f6', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: element.fontSize || '16px', fontWeight: element.fontWeight || '600', color: element.textColor || '#0f172a' }}>
            {element.title || 'Feature'}
          </div>
          {element.description && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {element.description}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isContainerElement(element)) {
    return (
      <div style={{
        ...buildContainerStyles(element.containerLayout),
        minHeight: element.children?.length ? undefined : '80px',
        padding: element.padding || '16px',
        backgroundColor: element.bgColor || 'transparent',
        borderRadius: element.borderRadius || '4px',
        border: element.borderColor ? `1px solid ${element.borderColor}` : '1px dashed #d1d5db',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        alignItems: element.children?.length ? undefined : 'center',
        justifyContent: element.children?.length ? undefined : 'center',
      }}>
        {(!element.children || element.children.length === 0) && (
          <span className="text-[11px] text-slate-400">Drop elements here</span>
        )}
      </div>
    );
  }
```

- [ ] **Step 5: Create RenderElementWrapper component**

Add before `EditorLayout`:

```tsx
function RenderElementWrapper({
  element, sectionId, isPreviewMode, isSelected, onMouseDown, onResizeMouseDown,
  vpLayout, viewport, isChild, dragOverContainerId,
}: {
  element: Element;
  sectionId: string;
  isPreviewMode: boolean;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, secId: string, el: Element) => void;
  onResizeMouseDown: (e: React.MouseEvent, secId: string, el: Element, handleType: 'br' | 'r' | 'b') => void;
  vpLayout: ViewportLayout;
  viewport: Viewport;
  isChild?: boolean;
  dragOverContainerId: string | null;
}) {
  const { updateElementProps, updateChildElementProps, selectedElementId, selectElement, selectSection, duplicateElement, deleteElement } = useEditor();
  const isContainer = isContainerElement(element);
  const containerStyles = isContainer ? buildContainerStyles(element.containerLayout) : {};
  const styleProps: React.CSSProperties = {
    backgroundColor: element.bgColor || 'transparent',
    borderRadius: element.borderRadius || undefined,
    border: element.borderColor ? `1px solid ${element.borderColor}` : undefined,
    padding: element.padding || undefined,
  };

  if (isChild) {
    return (
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          if (element.parentId) {
            selectSection(sectionId);
            selectElement(element.id);
          } else {
            onMouseDown(e, sectionId, element);
          }
        }}
        className={`wix-element-item child-element group ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
        style={{ position: 'relative', width: 'auto', height: 'auto', minWidth: 0 }}
      >
        {!isPreviewMode && isSelected && (
          <div className="absolute -top-5 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm flex items-center space-x-1.5 pointer-events-none z-40 whitespace-nowrap">
            <Icon name="edit" className="w-2.5 h-2.5" />
            <span>{element.type}</span>
          </div>
        )}
        <RenderElementContent
          element={element}
          updateProps={(newProps) => {
            if (element.parentId) {
              updateChildElementProps(sectionId, element.parentId, element.id, newProps);
            } else {
              updateElementProps(sectionId, element.id, newProps);
            }
          }}
          isPreviewMode={isPreviewMode}
          isSelected={isSelected}
        />
      </div>
    );
  }

  return (
    <div
      id={`el-${element.id}`}
      onMouseDown={(e) => onMouseDown(e, sectionId, element)}
      style={{
        position: 'absolute',
        left: `${vpLayout.x}px`, top: `${vpLayout.y}px`,
        width: `${vpLayout.width}px`,
        height: isContainer && element.children?.length ? 'auto' : `${vpLayout.height}px`,
        zIndex: element.zIndex || 10,
        opacity: vpLayout.hidden ? 0.35 : 1,
        ...containerStyles, ...styleProps,
        boxSizing: 'border-box',
        minHeight: isContainer ? '80px' : undefined,
      }}
      className={`wix-element-item group ${!isPreviewMode ? 'element-outline' : ''} ${isSelected ? 'is-selected' : ''}`}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-t-md shadow-sm flex items-center space-x-1.5 pointer-events-none z-40 whitespace-nowrap">
          <Icon name="move" className="w-2.5 h-2.5" />
          <span>[{viewport.toUpperCase()}] X:{vpLayout.x}, Y:{vpLayout.y}</span>
        </div>
      )}

      {!isPreviewMode && vpLayout.hidden && (
        <div className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow z-40 pointer-events-none uppercase">
          Sembunyi ({viewport})
        </div>
      )}

      {dragOverContainerId === element.id && isContainer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-500/10 pointer-events-none">
          <span className="rounded bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">Drop to nest</span>
        </div>
      )}

      <RenderElementContent
        element={element}
        updateProps={(newProps) => updateElementProps(sectionId, element.id, newProps)}
        isPreviewMode={isPreviewMode}
        isSelected={isSelected}
      />

      {isContainer && element.children && element.children.length > 0 && (
        <div style={{ marginTop: element.containerLayout?.type === 'flex' ? undefined : '8px' }}>
          {element.children.map(child => (
            <RenderElementWrapper
              key={child.id}
              element={child}
              sectionId={sectionId}
              isPreviewMode={isPreviewMode}
              isSelected={selectedElementId === child.id && !isPreviewMode}
              onMouseDown={onMouseDown}
              onResizeMouseDown={onResizeMouseDown}
              vpLayout={{ x: 0, y: 0, width: 0, height: 0, hidden: false }}
              viewport={viewport}
              isChild={true}
              dragOverContainerId={dragOverContainerId}
            />
          ))}
        </div>
      )}

      {!isPreviewMode && isSelected && (
        <>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'br')} className="resize-handle resize-handle-br"></div>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'r')} className="resize-handle resize-handle-r"></div>
          <div onMouseDown={(e) => onResizeMouseDown(e, sectionId, element, 'b')} className="resize-handle resize-handle-b"></div>
          <div className="absolute -bottom-8 right-0 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-lg flex items-center space-x-1 px-1.5 py-0.5 z-50 text-[10px]">
            <button onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }} className="p-1 hover:text-blue-600" title="Duplicate">
              <Icon name="copy" className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }} className="p-1 hover:text-red-600" title="Delete">
              <Icon name="trash" className="w-3 h-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Replace canvas element rendering loop**

In the canvas section (~lines 831-885), replace the `.map()` block with:

```tsx
{sec.elements.map((el) => {
  const vpLayout = getLayout(el, viewport);
  const isElementSelected = el.id === selectedElementId && !isPreviewMode;
  if (el.parentId) return null;
  if (vpLayout.hidden && isPreviewMode) return null;
  return (
    <RenderElementWrapper
      key={el.id}
      element={el}
      sectionId={sec.id}
      isPreviewMode={isPreviewMode}
      isSelected={isElementSelected}
      onMouseDown={handleElementMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      vpLayout={vpLayout}
      viewport={viewport}
      dragOverContainerId={dragOverContainerId}
    />
  );
})}
```

- [ ] **Step 7: Add container drop-target collision detection to handleElementMouseDown**

Add detection logic in `handleMouseMove` and handle drop in `handleMouseUp`. In `handleElementMouseDown`, add:

```ts
    const currentSection = sections.find(s => s.id === sectionId);
    const containers = currentSection ? currentSection.elements.filter(el => isContainerElement(el)) : [];
```

In `handleMouseMove`, before updating position:

```ts
        let foundContainer: string | null = null;
        if (containers.length > 0) {
          const canvasEl = canvasRef.current;
          if (canvasEl) {
            const canvasRect = canvasEl.getBoundingClientRect();
            const sectionEls = canvasEl.querySelectorAll('.wix-section-container');
            let secOffsetTop = 0;
            sectionEls.forEach((s, i) => {
              const secId = currentSection?.id;
              if (sections[i]?.id === secId) {
                secOffsetTop = s.getBoundingClientRect().top - canvasRect.top;
              }
            });
            for (const ct of containers) {
              const cv = getLayout(ct, viewport);
              const relX = moveEvent.clientX - canvasRect.left;
              const relY = moveEvent.clientY - canvasRect.top - canvasEl.scrollTop;
              if (relX >= cv.x && relX <= cv.x + cv.width && relY >= cv.y + secOffsetTop && relY <= cv.y + secOffsetTop + (cv.height || 100)) {
                foundContainer = ct.id;
                break;
              }
            }
          }
        }
        setDragOverContainerId(foundContainer);
```

In `handleMouseUp`:

```ts
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dragOverContainerId && sectionId) {
        moveElementIntoContainer(element.id, sectionId, dragOverContainerId);
      }
      setSnapGuideX(null);
      setDragOverContainerId(null);
    };
```

- [ ] **Step 8: Wire new inspectors in style tab**

After the `image` inspector block (~line 1030), add:

```tsx
                  {selectedElement.type === 'container' && (
                    <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
                  {selectedElement.type === 'flex-row' && (
                    <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
                  {selectedElement.type === 'grid' && (
                    <ContainerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
                  {selectedElement.type === 'divider' && (
                    <DividerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
                  {selectedElement.type === 'spacer' && (
                    <SpacerInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
                  {selectedElement.type === 'icon-text' && (
                    <IconTextInspector element={selectedElement} sectionId={selectedSectionId!} onUpdate={updateElementProps} />
                  )}
```

- [ ] **Step 9: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -60`
Expected: No errors from index.tsx

- [ ] **Step 10: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat(editor): refactor to recursive RenderElementWrapper, add container drop-target, wire all new inspectors"
```

---

### Task 10: Refactor HTML Export for Recursive Rendering

**Files:**
- Modify: `components/website-editor/lib/html-generator.ts`

**Interfaces:**
- Consumes: `Element`, `Section`, `ContainerLayout` from block-types
- Produces: `collectAllElements()`, `renderElementTree()`, `buildContainerCSS()`, updated CSS/HTML generation

- [ ] **Step 1: Add helpers at top of html-generator.ts**

```ts
import type { ContainerLayout } from './block-types';

function buildContainerCSS(cl: ContainerLayout | undefined): string {
  if (!cl) return '';
  const parts: string[] = [`display:${cl.type === 'flex' ? 'flex' : 'grid'}`];
  if (cl.type === 'flex') {
    parts.push(`flex-direction:${cl.direction || 'row'}`);
    parts.push(`align-items:${cl.alignItems || 'start'}`);
    if (cl.justifyContent) parts.push(`justify-content:${cl.justifyContent}`);
  }
  if (cl.type === 'grid') parts.push(`grid-template-columns:repeat(${cl.columns || 3},1fr)`);
  parts.push(`gap:${cl.gap || 16}px`);
  return parts.join(';');
}

function isContainerType(type: string): boolean {
  return type === 'container' || type === 'flex-row' || type === 'grid';
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function collectAllElements(elements: any[]): any[] {
  const result: any[] = [];
  for (const el of elements) { result.push(el); if (el.children?.length) result.push(...collectAllElements(el.children)); }
  return result;
}
```

- [ ] **Step 2: Add renderElementTree function**

Add the full `renderElementTree` function that handles all element types including the 6 new ones (container, flex-row, grid, divider, spacer, icon-text). Container types with children recurse. Non-container types render as before.

```ts
function renderElementTree(el: any, isChild: boolean): string {
  const hasChildren = el.children && el.children.length > 0;
  const isContainer = isContainerType(el.type);

  if (isContainer && hasChildren) {
    const containerCSS = buildContainerCSS(el.containerLayout);
    const styleParts = [
      containerCSS,
      el.bgColor ? `background-color:${el.bgColor}` : '',
      el.borderColor ? `border:1px solid ${el.borderColor}` : '',
      el.borderRadius ? `border-radius:${el.borderRadius}` : '',
      el.padding ? `padding:${el.padding}` : '',
      'box-sizing:border-box',
    ].filter(Boolean).join(';');
    const childrenHtml = el.children.map((c: any) => renderElementTree(c, true)).join('');
    return `<div id="el-${el.id}" class="container-el" style="${styleParts}">${childrenHtml}</div>`;
  }

  if (isContainer && !hasChildren) return `<div id="el-${el.id}"></div>`;

  const idAttr = `id="el-${el.id}" class="${isChild ? '' : 'responsive-el'}"`;

  if (el.type === 'divider') {
    return `<hr ${idAttr} style="border:none;background:${el.dividerColor || '#e5e7eb'};height:${el.dividerHeight || '1px'};width:${el.dividerWidth || '100%'}">`;
  }
  if (el.type === 'spacer') return `<div ${idAttr}></div>`;
  if (el.type === 'icon-text') {
    const isHorizontal = el.iconTextLayout !== 'vertical';
    const iconSymbol = el.iconName === 'check' ? '✓' : el.iconName === 'mail' ? '✉' : el.iconName === 'sparkles' ? '✦' : '★';
    return `<div ${idAttr} class="icon-text-el" style="display:flex;flex-direction:${isHorizontal ? 'row' : 'column'};align-items:center;justify-content:center;gap:${isHorizontal ? '12px' : '8px'};text-align:${isHorizontal ? 'left' : 'center'};padding:8px"><span style="color:${el.iconColor || '#3b82f6'};font-size:${el.iconSize || '32'}px;flex-shrink:0">${iconSymbol}</span><div><div style="font-size:${el.fontSize || '16px'};font-weight:${el.fontWeight || '600'};color:${el.textColor || '#0f172a'}">${escapeHtml(el.title || 'Feature')}</div>${el.description ? `<div style="font-size:14px;color:#6b7280;margin-top:4px">${escapeHtml(el.description)}</div>` : ''}</div></div>`;
  }
  if (el.type === 'heading') {
    return `<h2 ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</h2>`;
  }
  if (el.type === 'paragraph') {
    return `<p ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</p>`;
  }
  if (el.type === 'button') {
    return `<a href="${el.url || '#'}" ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: ${el.borderColor ? `1px solid ${el.borderColor}` : 'none'}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; display: flex; align-items: center; justify-content: center; text-decoration: none;" class="shadow-md hover:opacity-90 transition">${el.text}</a>`;
  }
  if (el.type === 'badge') {
    return `<span ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; font-size: ${el.fontSize}; display: flex; align-items: center; justify-content: center; font-weight: 700;">${el.text}</span>`;
  }
  if (el.type === 'card') {
    return `<div ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; padding: 20px; box-sizing: border-box;" class="shadow-lg"><h3 style="color: ${el.accentColor}; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">${el.title}</h3><p style="margin: 0; font-size: 13px; opacity: 0.8; line-height: 1.5;">${el.subtitle}</p></div>`;
  }
  // image + video handled here (copy from existing code)
  return '';
}
```

- [ ] **Step 3: Update CSS loops and HTML rendering in both functions**

In `generateFullHTML` and `generateMultiPageHTML`:
- Replace all `sec.elements.forEach(el => { ... })` in CSS loops with `collectAllElements(sec.elements).forEach(el => { ... })`
- Replace `sec.elements.map(el => { ... existing per-type rendering ... })` with `sec.elements.map(el => `        ${renderElementTree(el, false)}`).join('\n')`

- [ ] **Step 4: Add container CSS rules**

In both CSS blocks, add after `.responsive-el`:
```css
    .container-el { box-sizing: border-box; }
    .icon-text-el { word-break: break-word; }
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -40`
Expected: No errors from html-generator.ts

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/lib/html-generator.ts
git commit -m "feat(editor): refactor HTML export for nested elements with recursive renderer"
```

---

### Task 11: Update Section Templates (Optional)

**Files:**
- Modify: `components/website-editor/lib/section-templates.ts`

**Interfaces:**
- Consumes: `Section` from block-types
- Produces: Updated Features template using Grid + Icon+Text

- [ ] **Step 1: Replace the 3 feature cards with Grid + Icon+Text children**

Replace the 3 card objects in the features template with the Grid + 3 Icon+Text children as specified in the design spec.

- [ ] **Step 2: Verify TypeScript compiles**
- [ ] **Step 3: Commit**

---

### Task 12: Manual Testing and Verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Manual test checklist**

1. Open the website editor
2. Add a "Features" section template → verify Grid + Icon+Text render
3. Open element catalog → layout category shows 7 elements (card + 6 new)
4. Add Container → verify it renders with dashed border and "Drop elements here"
5. Add a heading → drag it onto container → verify "Drop to nest" appears
6. Drop heading onto container → verify it becomes a child
7. Select container → verify ContainerInspector shows 3 tabs
8. In Layout tab → toggle Flex/Grid, change direction/gap → verify canvas updates
9. In Children tab → verify child listed, click "Move Out" → verify it returns to section
10. Add Flex Row → add 2 badge children via Add Child dropdown
11. Add Grid → change columns to 2
12. Add Divider → verify horizontal line renders, change color in inspector
13. Add Spacer → verify empty space, resize via handles
14. Add Icon+Text → verify icon, title, description render
15. Export HTML → verify all elements render correctly in exported page
16. Switch between desktop/tablet/mobile → verify responsive layouts

- [ ] **Step 3: Commit any final fixes**
