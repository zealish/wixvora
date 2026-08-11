# Live Preview Route Design

> **Date:** 2026-08-11
> **Status:** Approved
> **Author:** opencode

## Overview

A public `/preview/[id]` route that renders templates and websites as live, fully responsive websites. Visitors can switch between desktop/tablet/mobile viewports and navigate between pages.

## Goals

1. Public access — no authentication required
2. Auto-detect whether `id` is a template or website
3. Render as a real flowing website (not an editor preview)
4. Viewport switcher for responsive testing
5. Multi-page navigation via query params

## Architecture

### Route Structure

```
app/preview/[id]/page.tsx        — Server Component (data fetching + HTML generation)
components/preview/live-preview-renderer.tsx — Client Component (iframe + viewport switcher)
```

### Data Resolution

```
1. Try templates table by ID → found? → template preview
2. Not found? Try websites table by ID → found? → website preview
3. Neither found? → 404 page
```

### URL Structure

- `/preview/[id]` — renders home page (all pages with navigation)
- `/preview/[id]?page=about` — renders specific page only
- Invalid `?page=` falls back to home page

### Rendering Pipeline

1. Server fetches template/website data
2. Server generates HTML using `generateMultiPageHTML()` from `html-generator.ts`
3. HTML string passed to `<LivePreviewRenderer>` client component
4. Client renders HTML in a sandboxed iframe
5. Viewport switcher resizes iframe container

## Components

### Server Component (`app/preview/[id]/page.tsx`)

**Responsibilities:**
- Auto-detect entity type (template vs website)
- Fetch data using existing queries
- Generate HTML using existing generator functions
- Handle 404, invalid pages, empty sections
- Pass data to client component

**Data flow:**
```typescript
// Auto-detect
const template = await getTemplateById(id);
const website = template ? null : await getWebsiteById(id);
const data = template || website;

// Generate HTML
const html = data.pages?.length > 0
  ? generateMultiPageHTML(data.pages, navigationSettings)
  : generateFullHTML(data.sections);

// Pass to client
<LivePreviewRenderer html={html} name={data.name} pages={data.pages} source={template ? "template" : "website"} />
```

### Client Component (`components/preview/live-preview-renderer.tsx`)

**Props:**
```typescript
interface LivePreviewRendererProps {
  html: string;
  name: string;
  pages: Page[];
  source: "template" | "website";
}
```

**Features:**
1. Viewport switcher (Desktop/Tablet/Mobile buttons)
2. Page navigation tab bar
3. Iframe rendering with dynamic width
4. Smooth transitions on viewport change

**Viewport widths:**
- Desktop: 100%
- Tablet: 768px
- Mobile: 375px

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Template/website not found | 404 page with message |
| Invalid `?page=` value | Fallback to home page |
| Empty sections array | Generator produces empty HTML (acceptable for preview) |
| Empty `pages` array | Fallback to legacy `sections` format |
| `pages` is string (DB) | Parse JSON before use |

## Dependencies

- `features/templates/queries.ts` — `getTemplateById()`
- `features/websites/queries.ts` — `getWebsiteById()`
- `components/website-editor/lib/html-generator.ts` — `generateMultiPageHTML()`, `generateFullHTML()`
- `components/website-editor/lib/block-types.ts` — `Page`, `Section`, `PageSettings`

## Constraints

- Public route — no auth checks
- Uses existing HTML generator (no custom rendering engine)
- Iframe isolation for CSS/JS sandboxing
- Tailwind CDN included in generated HTML
