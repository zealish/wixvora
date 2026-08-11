# Video Player Catalog Element — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Video Player element to the media category in the website editor's element catalog, supporting YouTube and Vimeo embed URLs with smart URL parsing, aspect ratio selection, and a dedicated inspector panel.

**Architecture:** Follow existing catalog element pattern — add type to union, add properties to Element interface, add preset, create URL parser utility, add rendering in RenderElementContent, create inspector component, wire inspector, add HTML export, add translations.

**Tech Stack:** TypeScript, React 19, Next.js 16, Tailwind CSS 4

## Global Constraints

- Follow existing code conventions (no new comments, no new dependencies)
- Flat properties on Element interface (no nested objects)
- if-chain pattern in RenderElementContent (not switch/registry)
- Inspector follows ButtonInspector/BadgeInspector/CardInspector pattern using existing primitives
- HTML export follows existing if-chain pattern in html-generator.ts

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `components/website-editor/lib/block-types.ts` | Modify | Add `'video'` to ElementType, add video properties to Element |
| `components/website-editor/lib/element-presets.ts` | Modify | Add video preset to media category |
| `components/website-editor/lib/video-url-parser.ts` | Create | URL parser for YouTube/Vimeo |
| `components/website-editor/index.tsx` | Modify | Add rendering in RenderElementContent, wire VideoInspector |
| `components/website-editor/inspector/VideoInspector.tsx` | Create | Inspector panel for video element |
| `components/website-editor/lib/html-generator.ts` | Modify | Add HTML export for video element |
| `components/website-editor/lib/translations.ts` | Modify | Add translation keys |

---

### Task 1: Add Video Type and Properties to Block Types

**Files:**
- Modify: `components/website-editor/lib/block-types.ts:1,56-57`

**Interfaces:**
- Consumes: None (foundational task)
- Produces: `'video'` in ElementType union, video properties on Element interface

- [ ] **Step 1: Add `'video'` to ElementType union**

Open `components/website-editor/lib/block-types.ts` and change line 1:

```ts
export type ElementType = 'heading' | 'paragraph' | 'button' | 'badge' | 'image' | 'card' | 'video';
```

- [ ] **Step 2: Add video-specific properties to Element interface**

Add after the Card-specific section (after line 57), before the closing brace:

```ts
  // Video-specific
  videoUrl?: string;
  videoProvider?: 'youtube' | 'vimeo' | null;
  autoplay?: boolean;
  loop?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to block-types.ts

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/lib/block-types.ts
git commit -m "feat(editor): add video type and properties to block types"
```

---

### Task 2: Add Video Preset to Element Presets

**Files:**
- Modify: `components/website-editor/lib/element-presets.ts:115-136`

**Interfaces:**
- Consumes: `'video'` ElementType, video properties from Task 1
- Produces: Video preset in ELEMENT_PRESETS_BY_CATEGORY.media

- [ ] **Step 1: Add video preset to media category**

Open `components/website-editor/lib/element-presets.ts`. In the `media` array (after the image preset at line 135, before the closing `]`), add:

```ts
    {
      type: 'video',
      category: 'media',
      label: 'Video Player',
      icon: 'media',
      labelKey: 'element.video.label',
      descriptionKey: 'element.video.description',
      defaultProps: {
        name: 'Video Player',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoProvider: 'youtube',
        autoplay: false,
        loop: false,
        aspectRatio: '16:9',
        borderRadius: '12px',
      },
      defaultLayouts: {
        desktop: { x: 620, y: 30, width: 400, height: 250, hidden: false },
        tablet: { x: 480, y: 30, width: 320, height: 200, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 210, hidden: false },
      },
    },
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to element-presets.ts

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/element-presets.ts
git commit -m "feat(editor): add video player preset to media category"
```

---

### Task 3: Create Video URL Parser

**Files:**
- Create: `components/website-editor/lib/video-url-parser.ts`

**Interfaces:**
- Consumes: None (standalone utility)
- Produces: `parseVideoUrl(url: string): { provider: 'youtube' | 'vimeo'; embedUrl: string } | null`

- [ ] **Step 1: Create video-url-parser.ts**

Create `components/website-editor/lib/video-url-parser.ts`:

```ts
type VideoProvider = 'youtube' | 'vimeo';

interface ParsedVideo {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null;

  const trimmed = url.trim();

  // YouTube patterns
  const youtubeWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?.*v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeWatchMatch) {
    const videoId = youtubeWatchMatch[1];
    return {
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
    };
  }

  // Vimeo patterns
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
    };
  }

  return null;
}

export function buildEmbedUrl(parsed: ParsedVideo, options: { autoplay?: boolean; loop?: boolean }): string {
  let url = parsed.embedUrl;

  if (options.autoplay) {
    url += url.includes('?') ? '&' : '?';
    url += 'autoplay=1';
  }

  if (options.loop) {
    url += '&loop=1';
    if (parsed.provider === 'youtube') {
      url += `&playlist=${parsed.videoId}`;
    }
  }

  return url;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to video-url-parser.ts

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/video-url-parser.ts
git commit -m "feat(editor): add YouTube/Vimeo URL parser utility"
```

---

### Task 4: Add Video Rendering in RenderElementContent

**Files:**
- Modify: `components/website-editor/index.tsx:1-14,119-156`

**Interfaces:**
- Consumes: `parseVideoUrl`, `buildEmbedUrl` from Task 3
- Produces: Video element rendering in RenderElementContent

- [ ] **Step 1: Add import for video URL parser**

At the top of `components/website-editor/index.tsx`, add after the existing imports (after line 14):

```ts
import { parseVideoUrl, buildEmbedUrl } from './lib/video-url-parser';
```

- [ ] **Step 2: Add video rendering in RenderElementContent**

In `RenderElementContent` function, add before the final `return null;` (before line 156), after the card block:

```tsx
  if (element.type === "video") {
    const parsed = parseVideoUrl(element.videoUrl || '');
    if (!parsed) {
      return (
        <div
          style={{
            backgroundColor: element.bgColor || '#f1f5f9',
            borderRadius: element.borderRadius,
          }}
          className="w-full h-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span className="text-[11px] text-slate-400 font-medium">Paste a YouTube or Vimeo URL</span>
        </div>
      );
    }

    const embedUrl = buildEmbedUrl(parsed, {
      autoplay: element.autoplay,
      loop: element.loop,
    });

    const aspectRatioMap: Record<string, string> = {
      '16:9': '16/9',
      '4:3': '4/3',
      '1:1': '1/1',
    };

    return (
      <div
        style={{
          width: '100%',
          aspectRatio: aspectRatioMap[element.aspectRatio || '16:9'] || '16/9',
          borderRadius: element.borderRadius,
          overflow: 'hidden',
          backgroundColor: element.bgColor || '#000000',
        }}
        className="w-full h-full"
      >
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={element.name || 'Video Player'}
        />
      </div>
    );
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to index.tsx

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat(editor): add video player rendering in RenderElementContent"
```

---

### Task 5: Create Video Inspector Panel

**Files:**
- Create: `components/website-editor/inspector/VideoInspector.tsx`

**Interfaces:**
- Consumes: Element type from block-types, `parseVideoUrl` from video-url-parser
- Produces: VideoInspector component with same signature as ButtonInspector

- [ ] **Step 1: Create VideoInspector.tsx**

Create `components/website-editor/inspector/VideoInspector.tsx`:

```tsx
"use client";

import type { Element } from "../lib/block-types";
import { parseVideoUrl } from "../lib/video-url-parser";

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '1:1', label: '1:1' },
] as const;

export function VideoInspector({
  element,
  sectionId,
  onUpdate,
}: {
  element: Element;
  sectionId: string;
  onUpdate: (sectionId: string, elementId: string, props: Partial<Element>) => void;
}) {
  const update = (props: Partial<Element>) => onUpdate(sectionId, element.id, props);
  const parsed = parseVideoUrl(element.videoUrl || '');

  return (
    <div className="space-y-4">
      {/* Video URL */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Video URL</label>
        <input
          type="text"
          value={element.videoUrl || ''}
          onChange={(e) => {
            const newParsed = parseVideoUrl(e.target.value);
            update({
              videoUrl: e.target.value,
              videoProvider: newParsed?.provider || null,
            });
          }}
          placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
        {parsed && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-slate-100 text-slate-500">
            {parsed.provider === 'youtube' ? 'YouTube' : 'Vimeo'}
          </span>
        )}
        {!parsed && element.videoUrl && (
          <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold rounded-full bg-red-50 text-red-500">
            Invalid URL
          </span>
        )}
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.value}
              onClick={() => update({ aspectRatio: ar.value })}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition ${
                (element.aspectRatio || '16:9') === ar.value
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Autoplay */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Autoplay</label>
        <input
          type="checkbox"
          checked={!!element.autoplay}
          onChange={(e) => update({ autoplay: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>

      {/* Loop */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Loop</label>
        <input
          type="checkbox"
          checked={!!element.loop}
          onChange={(e) => update({ loop: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
        />
      </div>

      {/* Border Radius */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500">Border Radius</label>
        <input
          type="text"
          value={element.borderRadius || '12px'}
          onChange={(e) => update({ borderRadius: e.target.value })}
          placeholder="e.g., 12px, 9999px"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500 font-mono text-[11px]"
        />
      </div>

      {/* Background Color */}
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500">Background</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={element.bgColor || '#000000'}
            onChange={(e) => update({ bgColor: e.target.value })}
            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="font-mono text-[11px] text-slate-600">{element.bgColor}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to VideoInspector.tsx

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/inspector/VideoInspector.tsx
git commit -m "feat(editor): add VideoInspector panel component"
```

---

### Task 6: Wire VideoInspector in Index and Add Translations

**Files:**
- Modify: `components/website-editor/index.tsx:12-14,937-943`
- Modify: `components/website-editor/lib/translations.ts:45-48,159-162`

**Interfaces:**
- Consumes: VideoInspector from Task 5, video type from Task 1
- Produces: Wired inspector in style tab, translation keys

- [ ] **Step 1: Add VideoInspector import**

In `components/website-editor/index.tsx`, add after the CardInspector import (after line 14):

```ts
import { VideoInspector } from "./inspector/VideoInspector";
```

- [ ] **Step 2: Wire VideoInspector in style tab**

In `components/website-editor/index.tsx`, add after the card inspector block (after line 943), before the heading/paragraph block:

```tsx
                  {selectedElement.type === 'video' && (
                    <VideoInspector
                      element={selectedElement}
                      sectionId={selectedSectionId!}
                      onUpdate={updateElementProps}
                    />
                  )}
```

- [ ] **Step 3: Add translation keys to type union**

In `components/website-editor/lib/translations.ts`, add after `element.image.description` (after line 46):

```ts
  | 'element.video.label'
  | 'element.video.description'
```

- [ ] **Step 4: Add translation values**

In `components/website-editor/lib/translations.ts`, add after `'element.image.description'` entry (after line 161):

```ts
  'element.video.label': 'Video Player',
  'element.video.description': 'Embed YouTube or Vimeo videos',
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/index.tsx components/website-editor/lib/translations.ts
git commit -m "feat(editor): wire VideoInspector and add video translations"
```

---

### Task 7: Add Video HTML Export

**Files:**
- Modify: `components/website-editor/lib/html-generator.ts:56-58,221-223`

**Interfaces:**
- Consumes: Video element properties, `parseVideoUrl`/`buildEmbedUrl` from video-url-parser
- Produces: HTML export for video elements in both generateFullHTML and generateMultiPageHTML

- [ ] **Step 1: Add import for video URL parser**

In `components/website-editor/lib/html-generator.ts`, add at the top after line 2:

```ts
import { parseVideoUrl, buildEmbedUrl } from './video-url-parser';
```

- [ ] **Step 2: Add video HTML export in generateFullHTML**

In the `generateFullHTML` function, add after the image block (after line 57), before the card block:

```ts
      if (el.type === 'video') {
        const parsed = parseVideoUrl((el as any).videoUrl || '');
        if (!parsed) {
          return `        <div ${idAttr} style="background-color: ${(el as any).bgColor || '#f1f5f9'}; border-radius: ${(el as any).borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
        }
        const embedUrl = buildEmbedUrl(parsed, { autoplay: (el as any).autoplay, loop: (el as any).loop });
        const aspectRatio = (el as any).aspectRatio || '16:9';
        const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
        return `        <div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'};"><iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
```

- [ ] **Step 3: Add video HTML export in generateMultiPageHTML**

In the `generateMultiPageHTML` function, add the same video block after the image block (after line 222), before the card block:

```ts
      if (el.type === 'video') {
        const parsed = parseVideoUrl((el as any).videoUrl || '');
        if (!parsed) {
          return `        <div ${idAttr} style="background-color: ${(el as any).bgColor || '#f1f5f9'}; border-radius: ${(el as any).borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
        }
        const embedUrl = buildEmbedUrl(parsed, { autoplay: (el as any).autoplay, loop: (el as any).loop });
        const aspectRatio = (el as any).aspectRatio || '16:9';
        const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
        return `        <div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'};"><iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/lib/html-generator.ts
git commit -m "feat(editor): add video player HTML export"
```

---

### Task 8: Final Verification

**Files:**
- All modified files from Tasks 1-7

**Interfaces:**
- Consumes: All tasks completed
- Produces: Working video player element in catalog

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 2: Run dev server and verify**

Run: `pnpm dev`
Expected: Video Player appears in Media category of element catalog, can be added to section, renders YouTube embed, inspector shows all controls

- [ ] **Step 3: Verify element catalog modal**

Open element catalog → Media category → Should show "Image" and "Video Player" cards

- [ ] **Step 4: Verify video rendering**

Click Video Player → Should render YouTube embed with default video

- [ ] **Step 5: Verify inspector controls**

Select video element → Style tab → Should show URL input, aspect ratio buttons, autoplay/loop toggles, border radius, background color

- [ ] **Step 6: Verify HTML export**

Click Publish/Export → Should generate HTML with iframe embed

- [ ] **Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "feat(editor): video player element complete"
```
