# Image Inspector Rich Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `ImageInspector` component with display controls (object-fit, opacity, aspect ratio, border radius), CSS filters (brightness, contrast, saturation, blur), hover effects, link wrapping, alt text, and caption — replacing the inline single `Image URL` input.

**Architecture:** Follow existing inspector pattern (VideoInspector, ButtonInspector). Create `ImageInspector.tsx` with `{ element, sectionId, onUpdate }` props. Add 8 optional fields to `Element` interface. Update canvas rendering, HTML export, and element presets. Wire into `index.tsx` style tab.

**Tech Stack:** TypeScript, React 19, Next.js 16, Tailwind CSS 4

## Global Constraints

- Follow existing code conventions (no new comments, no new dependencies)
- Flat properties on Element interface (no nested objects)
- if-chain pattern in RenderElementContent (not switch/registry)
- Inspector follows VideoInspector/ButtonInspector pattern using existing UI primitives
- HTML export follows existing if-chain pattern in html-generator.ts
- All new fields optional (`?`) for backward compatibility

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `components/website-editor/lib/block-types.ts` | Modify | Add image-specific fields to Element interface |
| `components/website-editor/lib/element-presets.ts` | Modify | Add defaults for new image fields |
| `components/website-editor/inspector/ImageInspector.tsx` | Create | Inspector panel for image element |
| `components/website-editor/index.tsx` | Modify | Update canvas rendering + wire ImageInspector |
| `components/website-editor/lib/html-generator.ts` | Modify | Update image HTML export (both generateFullHTML + generateMultiPageHTML) |

---

### Task 1: Add Image-Specific Fields to Block Types

**Files:**
- Modify: `components/website-editor/lib/block-types.ts:40-59`

**Interfaces:**
- Consumes: None (foundational task)
- Produces: `linkUrl`, `opacity`, `filterBrightness`, `filterContrast`, `filterSaturation`, `filterBlur`, `hoverEffect`, `caption` on Element

- [ ] **Step 1: Add image-specific fields to Element interface**

In `components/website-editor/lib/block-types.ts`, add after line 40 (`objectFit?: string;`):

```typescript
  // Image-specific
  linkUrl?: string;
  opacity?: number;
  filterBrightness?: number;
  filterContrast?: number;
  filterSaturation?: number;
  filterBlur?: number;
  hoverEffect?: 'none' | 'zoom' | 'grayscale-to-color';
  caption?: string;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to block-types.ts

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/block-types.ts
git commit -m "feat(editor): add image-specific fields to Element interface"
```

---

### Task 2: Add Defaults to Image Element Preset

**Files:**
- Modify: `components/website-editor/lib/element-presets.ts:115-135`

**Interfaces:**
- Consumes: New image fields from Task 1 (`linkUrl`, `opacity`, `filterBrightness`, `filterContrast`, `filterSaturation`, `filterBlur`, `hoverEffect`, `caption`)
- Produces: Updated defaultProps with sensible initial values

- [ ] **Step 1: Add new default values**

In `components/website-editor/lib/element-presets.ts`, update the image preset's `defaultProps` (around line 123-128):

```typescript
      defaultProps: {
        name: 'Visual Image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        alt: 'Showcase',
        borderRadius: '16px',
        objectFit: 'cover',
        linkUrl: '',
        openInNewTab: false,
        opacity: 1,
        filterBrightness: 100,
        filterContrast: 100,
        filterSaturation: 100,
        filterBlur: 0,
        hoverEffect: 'none',
        caption: '',
      },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to element-presets.ts

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/element-presets.ts
git commit -m "feat(editor): add defaults for new image fields in element preset"
```

---

### Task 3: Create ImageInspector Component

**Files:**
- Create: `components/website-editor/inspector/ImageInspector.tsx`

**Interfaces:**
- Consumes: `Element` type from `block-types.ts` (including new fields from Task 1)
- Produces: `<ImageInspector>` component with props `{ element: Element; sectionId: string; onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void }`

- [ ] **Step 1: Create ImageInspector.tsx**

Write `components/website-editor/inspector/ImageInspector.tsx`:

```tsx
"use client";

import type { Element } from "../lib/block-types";

const OBJECT_FITS = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'scale-down', label: 'Scale-down' },
] as const;

const ASPECT_RATIOS = [
  { value: '', label: 'Auto' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
] as const;

const HOVER_EFFECTS = [
  { value: 'none' as const, label: 'None' },
  { value: 'zoom' as const, label: 'Zoom In' },
  { value: 'grayscale-to-color' as const, label: 'Grayscale\u2192Color' },
];

export function ImageInspector({
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
      {/* Image Source */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Image URL</label>
          <input
            type="text"
            value={element.url || ''}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Alt Text</label>
          <input
            type="text"
            value={element.alt || ''}
            onChange={(e) => update({ alt: e.target.value })}
            placeholder="Describe the image"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Display */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Object Fit</label>
          <div className="grid grid-cols-4 gap-1.5">
            {OBJECT_FITS.map((of) => (
              <button
                key={of.value}
                onClick={() => update({ objectFit: of.value })}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.objectFit || 'cover') === of.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {of.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
          <input
            type="text"
            value={element.borderRadius || '16px'}
            onChange={(e) => update({ borderRadius: e.target.value })}
            placeholder="e.g., 16px, 9999px"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Opacity: {Math.round((element.opacity ?? 1) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((element.opacity ?? 1) * 100)}
            onChange={(e) => update({ opacity: parseInt(e.target.value) / 100 })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Aspect Ratio</label>
          <div className="grid grid-cols-4 gap-1.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                onClick={() => update({ aspectRatio: ar.value || undefined })}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.aspectRatio || '') === ar.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Effects */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Brightness: {element.filterBrightness ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterBrightness ?? 100}
            onChange={(e) => update({ filterBrightness: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Contrast: {element.filterContrast ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterContrast ?? 100}
            onChange={(e) => update({ filterContrast: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Saturation: {element.filterSaturation ?? 100}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={element.filterSaturation ?? 100}
            onChange={(e) => update({ filterSaturation: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">
            Blur: {element.filterBlur ?? 0}px
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={element.filterBlur ?? 0}
            onChange={(e) => update({ filterBlur: parseInt(e.target.value) })}
            className="w-full h-1 accent-blue-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Hover Effect</label>
          <div className="grid grid-cols-3 gap-1.5">
            {HOVER_EFFECTS.map((fx) => (
              <button
                key={fx.value}
                onClick={() => update({ hoverEffect: fx.value })}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                  (element.hoverEffect || 'none') === fx.value
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {fx.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Linking */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500">Link URL</label>
          <input
            type="text"
            value={element.linkUrl || ''}
            onChange={(e) => update({ linkUrl: e.target.value })}
            placeholder="https://... (click through)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-500">Open in New Tab</label>
          <input
            type="checkbox"
            checked={!!element.openInNewTab}
            onChange={(e) => update({ openInNewTab: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Caption</label>
        <input
          type="text"
          value={element.caption || ''}
          onChange={(e) => update({ caption: e.target.value })}
          placeholder="Image caption text"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/inspector/ImageInspector.tsx
git commit -m "feat(editor): create ImageInspector component with rich controls"
```

---

### Task 4: Update Canvas Rendering in index.tsx

**Files:**
- Modify: `components/website-editor/index.tsx:112-121`

**Interfaces:**
- Consumes: New image fields from Task 1, `Icon` from `icon-library`
- Produces: Updated `RenderElementContent` image branch with filters, opacity, link, caption, aspect ratio

- [ ] **Step 1: Replace the image rendering block**

In `components/website-editor/index.tsx`, replace lines 112-121 (the `if (element.type === "image")` block):

```tsx
  if (element.type === "image") {
    const brightness = element.filterBrightness ?? 100;
    const contrast = element.filterContrast ?? 100;
    const saturation = element.filterSaturation ?? 100;
    const blur = element.filterBlur ?? 0;
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    const hasBrokenImage = !element.url;

    const imgElement = hasBrokenImage ? (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
        <Icon name="image" className="w-8 h-8 text-slate-400" />
        <span className="text-[10px] text-slate-400 mt-1 font-semibold">No image</span>
      </div>
    ) : (
      <img
        src={element.url}
        alt={element.alt || "Visual"}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300"><svg class="w-8 h-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg><span class="text-[10px] text-slate-400 mt-1 font-bold">No image</span></div>';
          }
        }}
        style={{
          borderRadius: element.borderRadius,
          objectFit: (element.objectFit as any) || "cover",
          opacity: element.opacity ?? 1,
          filter: filterStyle,
        }}
        className="w-full h-full"
      />
    );

    const linkedContent = element.linkUrl ? (
      <a
        href={element.linkUrl}
        target={element.openInNewTab ? "_blank" : undefined}
        rel={element.openInNewTab ? "noopener noreferrer" : undefined}
        className="block w-full h-full"
      >
        {imgElement}
      </a>
    ) : (
      imgElement
    );

    const ratioStyle: React.CSSProperties = element.aspectRatio
      ? { aspectRatio: element.aspectRatio }
      : {};

    return (
      <div className="flex flex-col w-full h-full">
        <div className="relative w-full flex-1 overflow-hidden" style={ratioStyle}>
          {linkedContent}
        </div>
        {element.caption ? (
          <div className="text-center text-[11px] text-slate-600 mt-1 px-1 leading-tight">{element.caption}</div>
        ) : null}
      </div>
    );
  }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat(editor): update image canvas rendering with filters, link, caption, and placeholder"
```

---

### Task 5: Wire ImageInspector in index.tsx Style Tab

**Files:**
- Modify: `components/website-editor/index.tsx:12-15,976-986`

**Interfaces:**
- Consumes: `ImageInspector` from Task 3, existing inspector wiring pattern
- Produces: Image element uses dedicated inspector component instead of inline input

- [ ] **Step 1: Add ImageInspector import**

In `components/website-editor/index.tsx`, add after line 15 (`import { VideoInspector } from "./inspector/VideoInspector";`):

```tsx
import { ImageInspector } from "./inspector/ImageInspector";
```

- [ ] **Step 2: Replace inline image inspector with ImageInspector component**

In `components/website-editor/index.tsx`, replace lines 976-986:

```tsx
                  {selectedElement.type === 'image' && (
                    <ImageInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat(editor): wire ImageInspector into element inspector style tab"
```

---

### Task 6: Update HTML Export for Image Element

**Files:**
- Modify: `components/website-editor/lib/html-generator.ts:58-59,250-251`

**Interfaces:**
- Consumes: New image fields from Task 1
- Produces: Updated generateFullHTML and generateMultiPageHTML image branches

- [ ] **Step 1: Add helper functions for image filter CSS and hover CSS**

Add these two functions at the top of `html-generator.ts`, after the existing imports (after line 4):

```typescript
function imageFilterCSS(el: any): string {
  const b = el.filterBrightness ?? 100;
  const c = el.filterContrast ?? 100;
  const s = el.filterSaturation ?? 100;
  const bl = el.filterBlur ?? 0;
  return `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
}

function imageHoverCSS(el: any): string {
  const hover = el.hoverEffect;
  if (!hover || hover === 'none') return '';
  if (hover === 'zoom') return `#el-${el.id}:hover { transform: scale(1.05); }`;
  if (hover === 'grayscale-to-color') return `#el-${el.id} { filter: grayscale(100%); } #el-${el.id}:hover { filter: grayscale(0%); }`;
  return '';
}
```

- [ ] **Step 2: Update generateFullHTML image branch (line 58-59)**

Replace lines 58-59 in `generateFullHTML`:

```typescript
      if (el.type === 'image') {
        const filterVal = imageFilterCSS(el);
        const linkTarget = (el as any).linkUrl;
        const openNewTab = !!(el as any).openInNewTab;
        const opaque = (el as any).opacity ?? 1;
        const hasFilter = filterVal !== 'brightness(100%) contrast(100%) saturate(100%) blur(0px)';

        const imgTag = `<img src="${el.url}" alt="${el.alt || ''}" style="border-radius: ${el.borderRadius || '16px'}; object-fit: ${el.objectFit || 'cover'}; opacity: ${opaque}; filter: ${filterVal}; width: 100%; height: 100%;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px\\'><span style=\\'color:#94a3b8;font-size:11px;font-weight:600\\'>No image</span></div>'" />`;

        const innerHtml = linkTarget
          ? `<a href="${linkTarget}" ${openNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="display:block;width:100%;height:100%">${imgTag}</a>`
          : imgTag;

        const aspectRatioStyle = (el as any).aspectRatio ? ` aspect-ratio: ${(el as any).aspectRatio};` : '';
        const captionHtml = (el as any).caption ? ` <div style="text-align:center;font-size:12px;color:#475569;margin-top:4px;line-height:1.4">${(el as any).caption}</div>` : '';

        const hoverCss = imageHoverCSS(el);
        if (hoverCss) {
          cssRules += `    ${hoverCss}\n`;
        }

        return `        <div ${idAttr} style="border-radius: ${el.borderRadius || '16px'}; overflow: hidden;${aspectRatioStyle}" class="${hasFilter ? '' : ''}">${innerHtml}</div>${captionHtml}`;
      }
```

- [ ] **Step 3: Update generateMultiPageHTML image branch (line 250-251)**

Replace lines 250-251 in `generateMultiPageHTML` with the same logic as Step 2.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/lib/html-generator.ts
git commit -m "feat(editor): add image filter, link, caption, hover effects to HTML export"
```

---
