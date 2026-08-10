# Design: Multi-Viewport Layout System

## Overview

Update the existing website editor to support Wix-style multi-viewport layouts, section grouping, and compact sidebar UI. This adopts the reference file's UX patterns (per-viewport independent positioning, section strips, flyout panels) while preserving the existing codebase's advanced features (zoom, pan, grid snapping, 11 block types).

## Approach: Hybrid Evolution

Keep the existing block/section architecture but add multi-viewport layout support as the primary positioning model.

---

## 1. Data Model

### Block Type (Updated)

```typescript
interface ViewportLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
}

interface Block {
  id: string;
  type: BlockType;
  props: any;
  children?: Block[];

  // New: per-viewport layouts
  layouts: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
  zIndex?: number;

  // Deprecated: kept for backward compat, migrated on load
  x?: number;
  y?: number;
  hidden?: boolean;
  width?: number;
  height?: number;
}
```

### Section Type (New)

```typescript
interface Section {
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
```

### Viewport Widths

```typescript
const VIEWPORT_WIDTHS = {
  desktop: 1024,
  tablet: 768,
  mobile: 375
};
```

### Editor State (Updated)

```typescript
interface EditorState {
  sections: Section[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  viewport: 'desktop' | 'tablet' | 'mobile';
  // ... existing state (history, zoom, snap, preview, etc.)
}
```

---

## 2. Layout Resolution

### getLayout Function

Resolves the correct viewport layout for a block.

```typescript
function getLayout(block: Block, viewport: 'desktop' | 'tablet' | 'mobile'): ViewportLayout {
  if (block.layouts && block.layouts[viewport]) {
    return block.layouts[viewport];
  }

  // Fallback: use desktop layout as base
  const baseLayout = block.layouts?.desktop || {
    x: block.x || 40,
    y: block.y || 40,
    width: block.width || 200,
    height: block.height || 100,
    hidden: block.hidden || false
  };

  if (viewport === 'desktop') return baseLayout;

  // Auto-scale for tablet/mobile if not explicitly set
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
```

### getSectionHeight Function

```typescript
function getSectionHeight(section: Section, viewport: 'desktop' | 'tablet' | 'mobile'): number {
  if (section.heights && section.heights[viewport] !== undefined) {
    return section.heights[viewport];
  }
  return 600; // default
}
```

---

## 3. Data Migration

### Auto-Detection on Load

```typescript
function loadEditorState(savedData: any) {
  if (Array.isArray(savedData) || savedData.blocks) {
    return migrateToSectionFormat(savedData);
  }
  if (savedData.sections) {
    return savedData;
  }
  return createDefaultState();
}
```

### Migration Function

```typescript
function migrateToSectionFormat(oldData: any) {
  const blocks = Array.isArray(oldData) ? oldData : oldData.blocks || [];

  return {
    sections: [{
      id: createUniqueId('sec'),
      title: 'Migrated Content',
      bgColor: '#ffffff',
      bgGradient: '',
      heights: { desktop: 600, tablet: 600, mobile: 800 },
      blocks: blocks.map(block => ({
        ...block,
        layouts: {
          desktop: {
            x: block.x || 40,
            y: block.y || 40,
            width: block.width || 200,
            height: block.height || 100,
            hidden: block.hidden || false
          },
          tablet: {
            x: Math.max(20, Math.round((block.x || 40) * 0.75)),
            y: block.y || 40,
            width: Math.min(block.width || 200, 728),
            height: block.height || 100,
            hidden: false
          },
          mobile: {
            x: 20,
            y: block.y || 40,
            width: Math.min(block.width || 200, 335),
            height: block.height || 100,
            hidden: false
          }
        }
      }))
    }],
    viewport: 'desktop',
    selectedSectionId: null,
    selectedBlockId: null
  };
}
```

### Deprecation Path

- Old `x, y, hidden` properties marked deprecated
- Keep for 3 months with console warnings
- Migration runs automatically on first load

---

## 4. Drag & Drop Behavior

### Per-Viewport Drag

Each drag updates only the current viewport layout:

```typescript
function handleBlockDrag(e, sectionId, blockId) {
  const block = findBlock(sectionId, blockId);
  const currentLayout = getLayout(block, viewport);

  const newX = currentLayout.x + deltaX;
  const newY = currentLayout.y + deltaY;

  // Snap to grid
  const snappedX = snapToGrid ? Math.round(newX / 10) * 10 : newX;
  const snappedY = snapToGrid ? Math.round(newY / 10) * 10 : newY;

  // Constrain to section boundaries
  const sectionWidth = VIEWPORT_WIDTHS[viewport];
  const sectionHeight = section.heights[viewport];

  const finalX = Math.max(0, Math.min(sectionWidth - currentLayout.width, snappedX));
  const finalY = Math.max(0, Math.min(sectionHeight - currentLayout.height, snappedY));

  updateBlockLayout(sectionId, blockId, viewport, { x: finalX, y: finalY });
}
```

### Resize Handling

- Resize handles: bottom-right (`br`), right (`r`), bottom (`b`)
- Updates width/height for current viewport only
- Min constraints: 30px width, 20px height
- Constrained to section boundaries

### Section Height Resize

- Drag bottom edge of selected section
- Updates `section.heights[viewport]`
- Min height: 150px
- Snap to 20px grid

### Visual Indicators

- Blueprint label shows `[VIEWPORT] X: {x}, Y: {y}` above selected block
- Hidden badge shows `Hidden ({viewport})` on hidden blocks
- Section height bar shows `Height ({VIEWPORT}): {h}px`

---

## 5. Canvas Rendering

### Section-Based Structure

```
Canvas Container
  └─ Section 1 (height based on viewport)
       ├─ Section Toolbar (when selected)
       ├─ Block A (absolute positioned within section)
       ├─ Block B
       └─ Section Resize Handle
  └─ Section 2
       └─ ...
```

### Rendering Logic

```typescript
<div className="canvas-container" style={{ zoom: zoomLevel }}>
  {sections.map(section => (
    <section
      key={section.id}
      style={{
        height: getSectionHeight(section, viewport),
        backgroundColor: section.bgColor
      }}
      className={`section-wrapper ${section.bgGradient}`}
    >
      {/* Section controls */}
      {selectedSectionId === section.id && !isPreviewMode && (
        <SectionToolbar section={section} />
      )}

      {/* Blocks */}
      <div className="section-content">
        {section.blocks.map(block => {
          const layout = getLayout(block, viewport);
          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.width,
                height: layout.height,
                zIndex: block.zIndex,
                display: layout.hidden ? 'none' : 'block'
              }}
              onMouseDown={(e) => handleBlockDrag(e, section.id, block.id)}
            >
              <BlockRenderer block={block} />
            </div>
          );
        })}
      </div>

      {/* Section resize handle */}
      {selectedSectionId === section.id && !isPreviewMode && (
        <div
          className="section-resize-handle"
          onMouseDown={(e) => handleSectionResize(e, section.id)}
        />
      )}
    </section>
  ))}
</div>
```

### Zoom/Pan

- Existing zoom controls preserved (Ctrl+/-, mouse wheel)
- Existing pan controls preserved (spacebar+drag, middle mouse)
- Zoom applies to entire sections container
- Grid overlay scales with zoom

---

## 6. UI Layout

### Structure

```
┌─────────────────────────────────────────────────────────┐
│ Top Bar (56px): Logo | Viewport Switcher | Actions      │
├──┬────────────────────────────────────────────────────┬─┤
│  │                                                    │ │
│S │            Canvas Area                             │I│
│i │    ┌──────────────────────────┐                   │n│
│d │    │   Section 1              │                   │s│
│e │    │  ┌─────┐  ┌─────┐       │                   │p│
│b │    │  │Block│  │Block│       │                   │e│
│a │    │  └─────┘  └─────┘       │                   │c│
│r │    ├──────────────────────────┤                   │t│
│  │    │   Section 2              │                   │o│
│1 │    │  ┌─────┐                 │                   │r│
│6 │    │  │Block│                 │                   │  │
│p │    │  └─────┘                 │                   │3│
│x │    └──────────────────────────┘                   │2│
│  │                                                    │0│
│  │                                                    │p│
│  │                                                    │x│
└──┴────────────────────────────────────────────────────┴─┘
```

### Sidebar Modes

**Compact Mode (16px icon bar):**
- Plus button (opens flyout menu)
- Elements icon
- Sections/Layers icon
- Pages icon
- Flyout panels slide out on click (288px width)

**Full Mode (existing 256px sidebar):**
- Keep existing full sidebar as option
- Toggle between compact/full with keyboard shortcut `Ctrl/Cmd + B`

### Flyout Panels

- Elements: list of block presets, click to add to selected section
- Sections: list of sections, reorder/delete, add template button
- Pages: page manager

### Inspector Tabs

- Tab 1: "Position [VIEWPORT]" — x, y, width, height, hide checkbox
- Tab 2: "Style & Content" — colors, text, images, typography

---

## 7. Section Templates

### Template Library

| ID | Title | Category | Description |
|---|---|---|---|
| `hero` | Hero Strip | Header/Banner | Badge + heading + paragraph + button + image |
| `features` | Features 3-Column | Content | Heading + 3 feature cards |
| `testimonials` | Testimonials | Social Proof | Heading + 2 review cards |
| `cta_banner` | CTA Banner | Promotional | Centered heading + paragraph + button |
| `contact` | Contact Info | Footer/Info | Heading + paragraph + info card + map |
| `blank` | Blank Section | Basic | Empty section |

### Template Factory Pattern

```typescript
const SECTION_TEMPLATES = [
  {
    id: 'hero',
    title: 'Hero Strip Section',
    category: 'Header / Banner',
    previewBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    factory: () => ({
      id: createUniqueId('sec'),
      title: 'Hero Banner',
      heights: { desktop: 480, tablet: 460, mobile: 640 },
      bgColor: '#ffffff',
      bgGradient: 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50',
      blocks: [
        // Badge, heading, paragraph, button, image blocks
        // Each with full viewport layouts
      ]
    })
  }
  // ... more templates
];
```

---

## 8. Export & HTML Generation

### Per-Viewport Media Queries

```css
/* Desktop (default) */
#sec-hero { height: 480px; }
#block-badge { left: 60px; top: 40px; width: 250px; height: 34px; }
#block-heading { left: 60px; top: 90px; width: 580px; height: 100px; }

/* Tablet */
@media (max-width: 1023px) {
  #sec-hero { height: 460px; }
  #block-badge { left: 40px; top: 30px; width: 240px; height: 32px; }
  #block-heading { left: 40px; top: 75px; width: 440px; height: 100px; }
}

/* Mobile */
@media (max-width: 639px) {
  #sec-hero { height: 640px; }
  #block-badge { left: 20px; top: 20px; width: 230px; height: 32px; }
  #block-heading { left: 20px; top: 65px; width: 335px; height: 110px; }
}
```

### JSON Export/Import

- Exports new section-based structure
- Backward compatible: can import old flat block arrays
- Auto-migration on import

---

## 9. Files to Modify

### Core State
- `components/website-editor/editor-provider.tsx` — add section state, viewport layout updates
- `components/website-editor/lib/block-types.ts` — add ViewportLayout type, update Block type

### Canvas
- `components/website-editor/canvas/editor-canvas.tsx` — section-based rendering, viewport-aware drag
- `components/website-editor/canvas/canvas-block.tsx` — use getLayout() for positioning

### Coordinate Utils
- `components/website-editor/lib/coordinate-utils.ts` — add getLayout(), update snap logic

### Inspector
- `components/website-editor/inspector/right-inspector.tsx` — viewport-specific position tab
- `components/website-editor/inspector/content-tab.tsx` — content editing per element
- `components/website-editor/inspector/style-tab.tsx` — style controls

### Sidebar
- `components/website-editor/sidebar/left-sidebar.tsx` — compact mode, flyout panels
- `components/website-editor/sidebar/block-palette.tsx` — element catalog in flyout
- `components/website-editor/sidebar/layer-manager.tsx` — section hierarchy

### Toolbar
- `components/website-editor/toolbar/editor-topbar.tsx` — viewport switcher updates
- `components/website-editor/toolbar/viewport-switcher.tsx` — already exists, minor updates

### Export
- `components/website-editor/lib/html-generator.ts` — media query generation

### Templates
- `components/website-editor/lib/template-presets.ts` — section templates

### CSS
- `components/website-editor/styles/editor.css` — section/element styles, flyout animations

### New Files
- `components/website-editor/lib/section-templates.ts` — section template definitions
- `components/website-editor/lib/viewport-utils.ts` — viewport layout helpers

---

## 10. Implementation Phases

### Phase 1: Core Data Migration (Week 1)
- Add `layouts` property to Block type
- Add Section type and state management
- Implement `getLayout()` helper function
- Create migration function for existing blocks
- Update EditorProvider with section state

### Phase 2: Viewport System (Week 1-2)
- Update drag handlers to use `layouts[viewport]`
- Update resize handlers per viewport
- Implement section height resizing
- Update inspector to show viewport-specific controls
- Add viewport indicator in UI

### Phase 3: Section UI (Week 2)
- Add section templates library
- Create section modal UI
- Implement section toolbar (add block, resize)
- Add section reorder/delete controls
- Update layers panel for sections

### Phase 4: Compact Sidebar (Week 2-3)
- Create 16px icon sidebar
- Implement flyout panels (elements, sections, pages)
- Add sidebar mode toggle (compact/full)
- Update add menu with flyout behavior

### Phase 5: Export & Polish (Week 3)
- Update HTML generator with media queries
- Update JSON export/import with migration
- Add section templates (Hero, Features, etc.)
- Testing and bug fixes
- Documentation

### Rollout
- Feature flag: `ENABLE_MULTI_VIEWPORT`
- Default OFF initially for testing
- Toggle ON per user for beta testing
- Full rollout after validation

---

## 11. Testing Strategy

### Unit Tests
- `getLayout()` with all viewport scenarios
- Migration function (old format to new format)
- Section CRUD operations (add, delete, reorder)
- Viewport layout updates (drag, resize)
- Boundary constraints (sections, canvas edges)

### Integration Tests
- Full drag-drop workflow across viewports
- Section template insertion
- Export HTML with media queries validation
- Import/export roundtrip (data integrity)
- Undo/redo with section operations

### Manual Testing Checklist
- [ ] Create new project with sections
- [ ] Migrate existing project (verify no data loss)
- [ ] Drag blocks in desktop, switch to mobile (positions independent)
- [ ] Resize section height per viewport
- [ ] Hide/show blocks per viewport
- [ ] Export HTML, test in browser at different widths
- [ ] Undo/redo operations
- [ ] Compact sidebar flyouts
- [ ] Section templates insertion
- [ ] Zoom/pan still works
- [ ] Grid snapping still works

### Performance Testing
- Large projects (10+ sections, 50+ blocks)
- Drag performance at 60fps
- Canvas render performance
- Export generation speed

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss on migration | High | Auto-backup before migration, test thoroughly |
| Performance with many sections | Medium | Memoize layout calculations, lazy rendering |
| Breaking existing features | Medium | Feature flag, incremental rollout |
| Complex state management | Medium | Keep EditorProvider focused, add section-specific hooks |

---

## 13. Success Criteria

- Blocks positioned independently per viewport
- Section height adjustable per viewport
- Export HTML has correct responsive media queries
- Existing projects migrate without data loss
- Drag performance remains smooth (60fps)
- All existing features (zoom, pan, grid, multi-select) still work
- UI is clean and intuitive (reference file aesthetic)
