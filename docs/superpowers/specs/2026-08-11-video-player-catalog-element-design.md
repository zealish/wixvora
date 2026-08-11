# Video Player Catalog Element — Design Spec

## Overview

Add a **Video Player** element to the **media** category in the website editor's element catalog. The element supports YouTube and Vimeo embed URLs with smart URL parsing, aspect ratio selection, and a dedicated inspector panel.

## Approach

**Smart URL Parser** — User pastes a YouTube or Vimeo URL. The app parses it, extracts the video ID, and constructs a clean embed URL. Aspect ratio is configurable via inspector.

## Data Model

### Element Type

Add `'video'` to the `ElementType` union in `block-types.ts`.

### Properties (flat on Element interface)

| Property | Type | Default | Description |
|---|---|---|---|
| `videoUrl` | `string` | `'https://www.youtube.com/watch?v=dQw4w9WgXcQ'` | YouTube or Vimeo URL |
| `videoProvider` | `'youtube' \| 'vimeo' \| null` | `'youtube'` | Auto-detected from URL |
| `autoplay` | `boolean` | `false` | Autoplay on load |
| `loop` | `boolean` | `false` | Loop video |
| `aspectRatio` | `'16:9' \| '4:3' \| '1:1'` | `'16:9'` | Container aspect ratio |
| `borderRadius` | `string` | `'12px'` | Border radius |

### Preset

```ts
{
  type: 'video',
  category: 'media',
  label: 'Video Player',
  icon: 'media',
  labelKey: 'element.video.label',
  descriptionKey: 'element.video.description',
  defaultProps: {
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoProvider: 'youtube',
    autoplay: false,
    loop: false,
    aspectRatio: '16:9',
    borderRadius: '12px',
  },
  defaultLayouts: {
    desktop: { x: 620, y: 30, width: 400, height: 250, hidden: false },
    tablet:  { x: 480, y: 30, width: 320, height: 200, hidden: false },
    mobile:  { x: 20, y: 280, width: 335, height: 210, hidden: false },
  },
}
```

## URL Parser

New file: `components/website-editor/lib/video-url-parser.ts`

```ts
function parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; embedUrl: string } | null
```

### Supported Patterns

| Provider | Input Patterns | Embed URL |
|---|---|---|
| YouTube | `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/embed/ID` | `https://www.youtube.com/embed/ID?rel=0` |
| Vimeo | `vimeo.com/ID`, `player.vimeo.com/video/ID` | `https://player.vimeo.com/video/ID` |

### Query Parameters

| Feature | YouTube | Vimeo |
|---|---|---|
| Autoplay | `?autoplay=1` | `?autoplay=1` |
| Loop | `&loop=1&playlist=VIDEO_ID` | `&loop=1` |

## Rendering

In `RenderElementContent` (`index.tsx`), add:

```tsx
if (element.type === 'video') {
  const parsed = parseVideoUrl(element.videoUrl || '');
  if (!parsed) {
    // Render placeholder with icon and "Paste a YouTube or Vimeo URL" text
  } else {
    // Construct embed URL with autoplay/loop params
    // Render container div with aspect-ratio CSS
    // Render iframe with embed URL
  }
}
```

### Aspect Ratio CSS

- `16:9` → `aspect-ratio: 16/9`
- `4:3` → `aspect-ratio: 4/3`
- `1:1` → `aspect-ratio: 1/1`

## Inspector Panel

New file: `components/website-editor/inspector/VideoInspector.tsx`

Following the pattern of `ButtonInspector`/`CardInspector` using existing inspector primitives (`ControlGroup`, `ControlRow`, `Label`, `Input`, `Select`).

### Fields

| Field | Control | Description |
|---|---|---|
| Video URL | `Input` (text) | Paste YouTube/Vimeo URL |
| Aspect Ratio | `Select` (16:9, 4:3, 1:1) | Container aspect ratio |
| Autoplay | `Switch` | Toggle autoplay |
| Loop | `Switch` | Toggle loop |
| Border Radius | `Input` (text) | Border radius value |
| Background Color | Color picker (existing) | Container background |

### Behavior

- URL change → auto-detect provider via `parseVideoUrl()`
- Invalid URL → show placeholder "Paste a YouTube or Vimeo URL"
- Provider badge below input ("YouTube" / "Vimeo")

## HTML Export

In `html-generator.ts`, add video element rendering:

```html
<div style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID?rel=0"
    style="width: 100%; height: 100%; border: none;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  />
</div>
```

## Translations

Add to `translations.ts`:

```ts
'element.video.label': 'Video Player',
'element.video.description': 'Embed YouTube or Vimeo videos',
```

## Files to Modify

1. `components/website-editor/lib/block-types.ts` — Add `'video'` to `ElementType`, add video properties to `Element`
2. `components/website-editor/lib/element-presets.ts` — Add video preset to `media` category
3. `components/website-editor/lib/video-url-parser.ts` — New file: URL parser
4. `components/website-editor/index.tsx` — Add rendering in `RenderElementContent`, wire inspector
5. `components/website-editor/lib/html-generator.ts` — Add HTML export
6. `components/website-editor/lib/translations.ts` — Add translation keys
7. `components/website-editor/inspector/VideoInspector.tsx` — New file: inspector panel

## Scope

- YouTube and Vimeo embed support only
- No direct video file (MP4/WebM) support in this iteration
- Default browser/iframe controls (no custom controls)
- Inspector panel with URL, aspect ratio, autoplay, loop, border radius, background color
