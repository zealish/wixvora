# Live Preview Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public `/preview/[id]` route that renders templates and websites as live, responsive websites with viewport switching and multi-page navigation.

**Architecture:** Server component fetches data and generates HTML using existing generator functions. Client component renders HTML in an iframe with viewport switcher controls.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing html-generator functions

## Global Constraints

- Public route — no authentication
- Reuse existing `generateMultiPageHTML()` and `generateFullHTML()` functions
- Iframe isolation for CSS/JS sandboxing
- Must work with both templates and websites tables
- Tailwind CDN included in generated HTML

---

## File Structure

```
app/preview/[id]/page.tsx                    — Server Component (data fetching + HTML generation)
components/preview/live-preview-renderer.tsx  — Client Component (iframe + viewport switcher)
components/preview/preview-404.tsx            — 404 error component
```

---

## Task 1: Create Preview 404 Component

**Files:**
- Create: `components/preview/preview-404.tsx`

**Interfaces:**
- Consumes: None
- Produces: `<Preview404 />` component

- [ ] **Step 1: Create the 404 component**

```tsx
// components/preview/preview-404.tsx
export function Preview404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-slate-200 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Preview Not Found</h1>
        <p className="text-slate-500">This preview is not available or has been removed.</p>
        <a
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/preview/preview-404.tsx
git commit -m "feat: add preview 404 component"
```

---

## Task 2: Create LivePreviewRenderer Client Component

**Files:**
- Create: `components/preview/live-preview-renderer.tsx`

**Interfaces:**
- Consumes: `html: string`, `name: string`, `pages: Page[]`, `source: "template" | "website"`
- Produces: `<LivePreviewRenderer />` component

- [ ] **Step 1: Create the client component**

```tsx
// components/preview/live-preview-renderer.tsx
"use client";

import { useState, useMemo } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import type { Page } from "@/components/website-editor/lib/block-types";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface LivePreviewRendererProps {
  html: string;
  name: string;
  pages: Page[];
  source: "template" | "website";
}

export function LivePreviewRenderer({
  html,
  name,
  pages,
  source,
}: LivePreviewRendererProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [currentPageSlug, setCurrentPageSlug] = useState<string | null>(null);

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.sortOrder - b.sortOrder),
    [pages]
  );

  const handlePageChange = (slug: string) => {
    setCurrentPageSlug(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("page", slug);
    window.history.pushState({}, "", url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">{name}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {source} preview
              </p>
            </div>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(["desktop", "tablet", "mobile"] as Viewport[]).map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewport === vp
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {vp === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                {vp === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                {vp === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline capitalize">{vp}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Navigation */}
        {sortedPages.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {sortedPages.map((page) => {
                const isActive =
                  currentPageSlug === page.slug ||
                  (!currentPageSlug && page.isHomePage);
                return (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.slug)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {page.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Iframe Container */}
      <div className="flex justify-center p-4">
        <div
          style={{ width: VIEWPORT_WIDTHS[viewport] }}
          className="transition-all duration-300 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200"
        >
          <iframe
            srcDoc={html}
            className="w-full border-0"
            style={{ height: "calc(100vh - 140px)" }}
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/preview/live-preview-renderer.tsx
git commit -m "feat: add LivePreviewRenderer client component"
```

---

## Task 3: Create Preview Server Component

**Files:**
- Create: `app/preview/[id]/page.tsx`

**Interfaces:**
- Consumes: `getTemplateById()` from `features/templates/queries.ts`, `getWebsiteById()` from `features/websites/queries.ts`, `generateMultiPageHTML()` and `generateFullHTML()` from `html-generator.ts`
- Produces: `/preview/[id]` route

- [ ] **Step 1: Create the server component**

```tsx
// app/preview/[id]/page.tsx
import { notFound } from "next/navigation";
import { getTemplateById } from "@/features/templates/queries";
import { getWebsiteById } from "@/features/websites/queries";
import {
  generateMultiPageHTML,
  generateFullHTML,
} from "@/components/website-editor/lib/html-generator";
import { LivePreviewRenderer } from "@/components/preview/live-preview-renderer";
import { Preview404 } from "@/components/preview/preview-404";
import type { Page } from "@/components/website-editor/lib/block-types";

export const metadata = {
  title: "Preview",
};

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageSlug } = await searchParams;

  // Auto-detect: try template first, then website
  const template = await getTemplateById(id);
  const website = template ? null : await getWebsiteById(id);

  if (!template && !website) {
    return <Preview404 />;
  }

  // Extract pages and settings
  let pages: Page[] = [];
  let pageSettings = { title: "", bgColor: "#ffffff", fontFamily: "font-sans" };
  let navigationSettings = undefined;

  if (template) {
    pages = (template.pages as Page[]) || [];
    pageSettings = template.pageSettings || pageSettings;
  } else if (website) {
    pages = (website.pages as Page[]) || [];
    pageSettings = website.pageSettings || pageSettings;
  }

  // Fallback: if pages is empty, create single page from legacy sections
  if (pages.length === 0) {
    const sections = template?.sections || website?.sections || [];
    pages = [
      {
        id: "home",
        title: "Home",
        slug: "/",
        sections: sections,
        pageSettings: pageSettings,
        isHomePage: true,
        sortOrder: 0,
      },
    ];
  }

  // Find target page
  let targetPage: Page | undefined;
  if (pageSlug) {
    targetPage = pages.find((p) => p.slug === pageSlug);
    if (!targetPage) {
      // Fallback to home page
      targetPage = pages.find((p) => p.isHomePage) || pages[0];
    }
  } else {
    targetPage = pages.find((p) => p.isHomePage) || pages[0];
  }

  // Generate HTML
  const hasMultiplePages = pages.length > 1;
  let html: string;

  if (hasMultiplePages && !pageSlug) {
    // Render all pages with navigation
    html = generateMultiPageHTML(pages, navigationSettings);
  } else {
    // Render single page
    const pageSections = targetPage?.sections || [];
    html = generateFullHTML(
      Array.isArray(pageSections) ? pageSections : []
    );
  }

  const name = template?.name || website?.name || "Preview";
  const source = template ? "template" : "website";

  return (
    <LivePreviewRenderer
      html={html}
      name={name}
      pages={pages}
      source={source}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/preview/[id]/page.tsx
git commit -m "feat: add preview server component with auto-detect"
```

---

## Task 4: Test the Preview Route

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working preview route

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test template preview**

Navigate to `/preview/[template-id]` where `[template-id]` is an existing template ID.

Expected:
- Page renders with template content
- Viewport switcher works (Desktop/Tablet/Mobile)
- Page navigation tabs appear (if multi-page)

- [ ] **Step 3: Test website preview**

Navigate to `/preview/[website-id]` where `[website-id]` is an existing website ID.

Expected:
- Page renders with website content
- Same viewport and page navigation behavior

- [ ] **Step 4: Test 404**

Navigate to `/preview/nonexistent-id`

Expected:
- 404 page with "Preview Not Found" message
- "Go Home" link works

- [ ] **Step 5: Test page navigation**

Navigate to `/preview/[id]?page=about`

Expected:
- Renders only the "about" page content
- Page tab is highlighted

- [ ] **Step 6: Run type check**

```bash
pnpm types:check
```

Expected: No type errors

- [ ] **Step 7: Run lint**

```bash
pnpm lint
```

Expected: No lint errors

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: complete live preview route with viewport switcher"
```

---

## Verification Checklist

- [ ] `/preview/[template-id]` renders template as live website
- [ ] `/preview/[website-id]` renders website as live website
- [ ] `/preview/nonexistent` shows 404 page
- [ ] Viewport switcher changes iframe width (100%, 768px, 375px)
- [ ] Page navigation updates URL query param
- [ ] Multi-page templates show navigation tabs
- [ ] Single-page templates render without navigation
- [ ] Legacy sections format works as fallback
- [ ] `pnpm types:check` passes
- [ ] `pnpm lint` passes
