# Image Inspector Rich Features — Design Spec

**Date:** 2026-08-12
**Status:** Draft

---

## Overview

The image element currently has a minimal inspector with a single "Image URL" text input, inlined in `index.tsx`. This spec defines a complete image inspector — on par with Button, Badge, Card, and Video inspectors — adding display controls, CSS filters, hover effects, linking, and captions.

## Motivation

- The image element is the only non-text element without a dedicated inspector component
- Users expect rich controls for image display (object-fit, opacity, filters) and interactivity (linking, hover effects, captions)
- The current inline implementation adds noise to the already-large `index.tsx` (1100+ lines)

## Architecture

**Pattern:** Dedicated inspector component — same as `ButtonInspector`, `BadgeInspector`, `CardInspector`, `VideoInspector`.

**New file:**
- `components/website-editor/inspector/ImageInspector.tsx`

**Props interface (identical to all existing inspectors):**
```typescript
{
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}
```

---

## Feature Specification

### 1. Image Source

| Control | Type | Field | Default |
|---------|------|-------|---------|
| Image URL | text input | `url` | placeholder Unsplash image |
| Alt Text | text input | `alt` | `"Showcase"` |

- Alt text improves accessibility and SEO
- Empty URL shows placeholder in canvas (icon + "No image" text)
- Broken image handled via `onerror` → fallback placeholder

### 2. Display

| Control | Type | Field | Default | Values |
|---------|------|-------|---------|--------|
| Object Fit | 4-btn grid | `objectFit` | `"cover"` | Cover, Contain, Fill, Scale-down |
| Border Radius | text input | `borderRadius` | `"16px"` | e.g. `8px`, `9999px` |
| Opacity | range slider | `opacity` | `1` | 0–1 (float) |
| Aspect Ratio | 3-btn grid | `aspectRatio` | none (natural) | 16:9, 4:3, 1:1 |

- Object fit buttons use same grid pattern as VideoInspector aspect ratio
- Opacity slider: 0–100%, converts to 0–1 float for CSS
- Aspect ratio forces container ratio; object-fit works within it

### 3. Filters & Effects

| Control | Type | Field | Default | Range |
|---------|------|-------|---------|-------|
| Brightness | range slider | `filterBrightness` | `100` | 0–200 (%) |
| Contrast | range slider | `filterContrast` | `100` | 0–200 (%) |
| Saturation | range slider | `filterSaturation` | `100` | 0–200 (%) |
| Blur | range slider | `filterBlur` | `0` | 0–20 (px) |
| Hover Effect | 3-btn grid | `hoverEffect` | `"none"` | None, Zoom In, Grayscale→Color |

- Filters applied via CSS `filter` property on the `<img>` element
- Range sliders: native `<input type="range">` with numeric display
- Hover effects only active in preview/export, NOT in editor canvas (avoids conflict with drag/resize interactions)
- Hover effect descriptions:
  - **None** — no hover change
  - **Zoom In** — `transform: scale(1.05)` transition on hover
  - **Grayscale → Color** — `filter: grayscale(100%)` default, `grayscale(0%)` on hover, with transition

### 4. Linking

| Control | Type | Field | Default |
|---------|------|-------|---------|
| Link URL | text input | `linkUrl` | `""` |
| Open in New Tab | checkbox | `openInNewTab` | `false` |

- `linkUrl` is a NEW field — separate from `url` (image src)
- `openInNewTab` reuses existing Element field (already used by buttons)
- When `linkUrl` is non-empty: wrap `<img>` in `<a href={linkUrl}>` with `rel="noopener noreferrer"` when `openInNewTab`
- When `linkUrl` empty: no `<a>` wrapper, render `<img>` directly

### 5. Caption

| Control | Type | Field | Default |
|---------|------|-------|---------|
| Caption Text | text input | `caption` | `""` |

- Rendered as a `<div>` below the image with centered text
- Only rendered when caption is non-empty
- Rendered as `textContent` (not `innerHTML`) to prevent XSS

---

## Data Model Changes

### `block-types.ts` — New fields on `Element` interface

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

All fields are optional (`?`) — backward compatible with existing pages.

### `element-presets.ts` — Image preset defaults

```typescript
{
  type: 'image',
  category: 'media',
  label: 'Image',
  icon: 'image',
  labelKey: 'element.image.label',
  descriptionKey: 'element.image.description',
  defaultProps: {
    name: 'Visual Image',
    url: 'https://images.unsplash.com/photo-...',
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
  // ... layouts unchanged
}
```

---

## Rendering Changes

### Canvas (`index.tsx` — `RenderElementContent`)

```tsx
if (element.type === "image") {
  const filterStyle = `brightness(${element.filterBrightness ?? 100}%) contrast(${element.filterContrast ?? 100}%) saturate(${element.filterSaturation ?? 100}%) blur(${element.filterBlur ?? 0}px)`;
  const img = (
    <img
      src={element.url}
      alt={element.alt || "Visual"}
      onError={(e) => { /* fallback placeholder */ }}
      style={{
        borderRadius: element.borderRadius,
        objectFit: (element.objectFit as any) || "cover",
        opacity: element.opacity ?? 1,
        filter: filterStyle,
      }}
      className="w-full h-full"
    />
  );
  const linked = element.linkUrl ? (
    <a href={element.linkUrl} target={element.openInNewTab ? "_blank" : undefined} rel={element.openInNewTab ? "noopener noreferrer" : undefined} className="block w-full h-full">
      {img}
    </a>
  ) : img;
  return (
    <div className="flex flex-col w-full h-full">
      <div className="relative w-full flex-1" style={{ aspectRatio: element.aspectRatio || undefined }}>
        {linked}
      </div>
      {element.caption && <div className="text-center text-sm text-slate-600 mt-1">{element.caption}</div>}
    </div>
  );
}
```

### Empty/Broken image placeholder

When `url` is empty or image fails to load:
- Show a centered icon (image icon from `icon-library`) with "No image" text
- Styled with a subtle background to indicate the element bounds

### HTML Export (`html-generator.ts`)

Generate CSS filters, opacity, aspect ratio, link wrapper, and caption. Hover effects rendered as inline `<style>` block with `:hover` pseudo-class.

---

## Inspector Tab Integration

In `index.tsx` style tab, replace the inline image input with:

```tsx
{selectedElement.type === 'image' && (
  <ImageInspector
    element={selectedElement}
    sectionId={selectedSectionId!}
    onUpdate={updateElementProps}
  />
)}
```

Import added alongside other inspector imports.

---

## Files Affected

| # | File | Change |
|---|------|--------|
| 1 | `components/website-editor/inspector/ImageInspector.tsx` | **NEW** — full inspector component |
| 2 | `components/website-editor/lib/block-types.ts` | Add 8 image-specific fields |
| 3 | `components/website-editor/lib/element-presets.ts` | Add defaults for new fields |
| 4 | `components/website-editor/index.tsx` | Update canvas rendering + wire up ImageInspector |
| 5 | `components/website-editor/lib/html-generator.ts` | Update image HTML export |
| 6 | `components/website-editor/lib/translations.ts` | (Optional) Add translation keys |

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Empty image URL | Canvas shows placeholder (icon + "No image") |
| Broken image URL | `onerror` → fallback to placeholder |
| Filter values out of range | Clamped at inspector level (0–200 for filters, 0–20 for blur) |
| Opacity out of range | Clamped 0–1 |
| Empty link URL | No `<a>` wrapper rendered |
| Empty caption | No caption div rendered |
| Missing optional fields | All fields optional with sensible defaults — no crash |

## Security

- Caption rendered as `textContent` (XSS prevention)
- Link with `target="_blank"` uses `rel="noopener noreferrer"` (tabnapping prevention)
- Image URLs accepted as-is (user content, no sanitization — same as existing behavior)

## Backward Compatibility

All new fields are optional (`?`). Existing pages and elements without these fields will render correctly using defaults. The field `url` continues to serve as image source; `linkUrl` is a new, separate field. No migration needed.
