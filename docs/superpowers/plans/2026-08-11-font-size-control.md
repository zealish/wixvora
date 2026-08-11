# Font Size Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add font size control to the rich text editor via a dropdown in both canvas floating toolbar and inspector sidebar toolbar.

**Architecture:** Custom TipTap FontSize extension that stores font size as inline `style="font-size: Xpx"` on text marks. A `FontSizePicker` dropdown component integrates into both toolbars. HTML sanitization updated to allow font-size in style attributes.

**Tech Stack:** TipTap (ProseMirror), React 19, Next.js 16, Tailwind CSS v4, TypeScript 5

## Global Constraints

- Next.js 16.3.0 App Router
- React 19.2.8 — no legacy APIs
- Tailwind CSS v4 via `@tailwindcss/postcss`
- TypeScript strict mode
- No comments in code unless explicitly requested
- Package manager: pnpm 10.33.0
- Existing font size preset values: 12px, 14px, 16px, 18px, 24px, 32px

---

## File Structure

| File | Purpose |
|------|---------|
| `components/website-editor/lib/font-size-extension.ts` | Custom TipTap FontSize extension |
| `components/website-editor/rich-text/FontSizePicker.tsx` | Dropdown component for font size selection |
| `components/website-editor/lib/tiptap-extensions.ts` | Modified: add FontSize extension, export FONT_SIZES |
| `components/website-editor/rich-text/FloatingToolbar.tsx` | Modified: add FontSizePicker |
| `components/website-editor/rich-text/InspectorToolbar.tsx` | Modified: add FontSizePicker |
| `components/website-editor/lib/sanitize-html.ts` | Modified: allow font-size in style attributes |

---

### Task 1: Create Custom FontSize TipTap Extension

**Files:**
- Create: `components/website-editor/lib/font-size-extension.ts`

**Interfaces:**
- Consumes: `Extension` from `@tiptap/core`, `TextStyle` from `@tiptap/extension-text-style`
- Produces: `FontSize` TipTap extension with `setFontSize(size)` and `unsetFontSize()` commands

- [ ] **Step 1: Create the FontSize extension file**

```typescript
import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/font-size-extension.ts
git commit -m "feat: create custom FontSize TipTap extension"
```

---

### Task 2: Add FontSize Extension to TipTap Configuration

**Files:**
- Modify: `components/website-editor/lib/tiptap-extensions.ts`

**Interfaces:**
- Consumes: `FontSize` extension from Task 1
- Produces: Updated `getExtensions()` with FontSize included, `FONT_SIZES` constant exported

- [ ] **Step 1: Add FontSize import and FONT_SIZES constant**

Replace the entire content of `components/website-editor/lib/tiptap-extensions.ts`:

```typescript
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontSize } from "./font-size-extension";

export const EDITOR_COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0891b2",
];

export const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "X-Large", value: "24px" },
  { label: "XX-Large", value: "32px" },
];

export function getExtensions(mode: "inline" | "block" = "block") {
  const extensions: any[] = [
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontSize,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "editor-link" },
    }),
  ];

  if (mode === "block") {
    extensions.push(
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      })
    );
  } else {
    extensions.push(
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      })
    );
  }

  return extensions;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/tiptap-extensions.ts
git commit -m "feat: add FontSize extension and FONT_SIZES constant to config"
```

---

### Task 3: Create FontSizePicker Component

**Files:**
- Create: `components/website-editor/rich-text/FontSizePicker.tsx`

**Interfaces:**
- Consumes: `Editor` type from `@tiptap/react`, `FONT_SIZES` from Task 2
- Produces: `<FontSizePicker editor={Editor} compact?: boolean />`

- [ ] **Step 1: Create the FontSizePicker component**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { FONT_SIZES } from "../lib/tiptap-extensions";

export function FontSizePicker({
  editor,
  compact = false,
}: {
  editor: Editor;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!editor) return null;

  const currentFontSize = editor.getAttributes("textStyle").fontSize || null;
  const currentLabel = FONT_SIZES.find((s) => s.value === currentFontSize)?.label || "Normal";

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        className={`h-7 rounded-md border border-slate-200 hover:border-slate-400 flex items-center justify-center transition text-[11px] font-bold cursor-pointer
          ${currentFontSize ? "bg-blue-100 text-blue-700 border-blue-300" : "text-slate-600 hover:bg-slate-100"}
          ${compact ? "w-7" : "px-2 gap-1"}`}
        title="Font Size"
      >
        {compact ? "A" : currentLabel}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 w-32">
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setFontSize(size.value).run();
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-[11px] hover:bg-slate-50 flex items-center justify-between transition
                ${currentFontSize === size.value ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"}`}
            >
              <span>{size.label}</span>
              <span className="text-[9px] text-slate-400 font-mono">{size.value}</span>
            </button>
          ))}
          {currentFontSize && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetFontSize().run();
                  setOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-[11px] text-red-500 hover:bg-red-50 transition"
              >
                Remove size
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/rich-text/FontSizePicker.tsx
git commit -m "feat: add FontSizePicker dropdown component"
```

---

### Task 4: Integrate FontSizePicker into FloatingToolbar

**Files:**
- Modify: `components/website-editor/rich-text/FloatingToolbar.tsx`

**Interfaces:**
- Consumes: `FontSizePicker` from Task 3
- Modifies: FloatingToolbar to include FontSizePicker after heading buttons

- [ ] **Step 1: Add FontSizePicker import and integrate into toolbar**

Replace the entire content of `components/website-editor/rich-text/FloatingToolbar.tsx`:

```tsx
"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";
import { FontSizePicker } from "./FontSizePicker";

const HEADING_LEVELS = [
  { label: "H1", level: 1 },
  { label: "H2", level: 2 },
  { label: "H3", level: 3 },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition
        ${active ? "bg-blue-100 text-blue-700 border border-blue-300" : "text-slate-600 hover:bg-slate-100 border border-transparent"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export function FloatingToolbar({
  editor,
  elementType,
}: {
  editor: Editor;
  elementType: string;
}) {
  if (!editor) return null;

  const isInlineOnly = elementType === "button" || elementType === "badge";
  const supportsHeadings = elementType === "heading" || elementType === "card";

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl px-1.5 py-1 flex items-center gap-0.5"
    >
      {supportsHeadings && (
        <>
          {HEADING_LEVELS.map(({ label, level }) => (
            <ToolbarButton
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              active={editor.isActive("heading", { level })}
              title={`Heading ${level}`}
            >
              {label}
            </ToolbarButton>
          ))}
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
            title="Paragraph"
          >
            P
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
        </>
      )}

      <FontSizePicker editor={editor} compact={true} />

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      {!isInlineOnly && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          {"</>"}
        </ToolbarButton>
      )}

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      {!isInlineOnly && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            ≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            ≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            ≡
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
        </>
      )}

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        title="Insert Link"
      >
        🔗
      </ToolbarButton>

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ColorPicker
        value={editor.getAttributes("textStyle").color || "#000000"}
        onChange={(color) => editor.chain().focus().setColor(color).run()}
        type="text"
      />
      <ColorPicker
        value={editor.getAttributes("highlight").color || "#fef08a"}
        onChange={(color) => {
          if (color) {
            editor.chain().focus().toggleHighlight({ color }).run();
          } else {
            editor.chain().focus().unsetHighlight().run();
          }
        }}
        type="highlight"
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/rich-text/FloatingToolbar.tsx
git commit -m "feat: integrate FontSizePicker into FloatingToolbar"
```

---

### Task 5: Integrate FontSizePicker into InspectorToolbar

**Files:**
- Modify: `components/website-editor/rich-text/InspectorToolbar.tsx`

**Interfaces:**
- Consumes: `FontSizePicker` from Task 3
- Modifies: InspectorToolbar to include FontSizePicker next to block type dropdown

- [ ] **Step 1: Add FontSizePicker import and integrate into toolbar**

Replace the entire content of `components/website-editor/rich-text/InspectorToolbar.tsx`:

```tsx
"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";
import { FontSizePicker } from "./FontSizePicker";

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-md text-[11px] font-bold flex items-center justify-center transition
        ${active ? "bg-blue-100 text-blue-700 border border-blue-300" : "text-slate-600 hover:bg-slate-100 border border-transparent"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

const BLOCK_OPTIONS = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Heading 5", value: "h5" },
  { label: "Heading 6", value: "h6" },
  { label: "Blockquote", value: "blockquote" },
  { label: "Code Block", value: "codeBlock" },
];

export function InspectorToolbar({
  editor,
  elementType,
}: {
  editor: Editor;
  elementType: string;
}) {
  if (!editor) return null;

  const isInlineOnly = elementType === "button" || elementType === "badge";
  const supportsHeadings = elementType === "heading" || elementType === "card";

  const getCurrentBlockLabel = () => {
    if (editor.isActive("heading", { level: 1 })) return "H1";
    if (editor.isActive("heading", { level: 2 })) return "H2";
    if (editor.isActive("heading", { level: 3 })) return "H3";
    if (editor.isActive("heading", { level: 4 })) return "H4";
    if (editor.isActive("heading", { level: 5 })) return "H5";
    if (editor.isActive("heading", { level: 6 })) return "H6";
    if (editor.isActive("blockquote")) return "Blockquote";
    if (editor.isActive("codeBlock")) return "Code Block";
    return "Paragraph";
  };

  const handleBlockChange = (value: string) => {
    const chain = editor.chain().focus();
    if (value === "paragraph") {
      chain.setParagraph().run();
    } else if (value === "blockquote") {
      chain.toggleBlockquote().run();
    } else if (value === "codeBlock") {
      chain.toggleCodeBlock().run();
    } else {
      chain.toggleHeading({ level: parseInt(value.replace("h", "")) as any }).run();
    }
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center gap-1 flex-wrap"
    >
      {supportsHeadings && (
        <select
          value={getCurrentBlockLabel()}
          onChange={(e) => {
            const opt = BLOCK_OPTIONS.find((o) => o.label === e.target.value);
            if (opt) handleBlockChange(opt.value);
          }}
          className="h-7 text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 outline-none focus:border-blue-500 text-slate-700 cursor-pointer"
        >
          {BLOCK_OPTIONS.filter((o) => {
            if (!isInlineOnly) return true;
            return ["paragraph"].includes(o.value);
          }).map((opt) => (
            <option key={opt.value} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <FontSizePicker editor={editor} />

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <span className="line-through">S</span>
      </ToolbarButton>

      {!isInlineOnly && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          {"</>"}
        </ToolbarButton>
      )}

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      {!isInlineOnly && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align Left"
          >
            ≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align Center"
          >
            ≡
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align Right"
          >
            ≡
          </ToolbarButton>
          <div className="w-px h-5 bg-slate-200 mx-0.5" />
        </>
      )}

      <ColorPicker
        value={editor.getAttributes("textStyle").color || "#000000"}
        onChange={(color) => editor.chain().focus().setColor(color).run()}
        type="text"
      />
      <ColorPicker
        value={editor.getAttributes("highlight").color || "#fef08a"}
        onChange={(color) => {
          if (color) {
            editor.chain().focus().toggleHighlight({ color }).run();
          } else {
            editor.chain().focus().unsetHighlight().run();
          }
        }}
        type="highlight"
      />

      <div className="w-px h-5 bg-slate-200 mx-0.5" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        title="Insert Link"
      >
        🔗
      </ToolbarButton>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/rich-text/InspectorToolbar.tsx
git commit -m "feat: integrate FontSizePicker into InspectorToolbar"
```

---

### Task 6: Update HTML Sanitization for Font Size

**Files:**
- Modify: `components/website-editor/lib/sanitize-html.ts`

**Interfaces:**
- Consumes: none
- Modifies: `sanitizeHtml()` to allow `font-size` property in style attributes with px validation

- [ ] **Step 1: Update sanitization to allow font-size styles**

Replace the entire content of `components/website-editor/lib/sanitize-html.ts`:

```typescript
import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "code", "pre",
  "blockquote", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "span",
];

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href"],
  span: ["style"],
};

const FONT_SIZE_REGEX = /font-size:\s*\d+px/g;

function sanitizeStyleAttribute(style: string): string {
  if (!style) return "";

  const matches = style.match(FONT_SIZE_REGEX);
  if (matches) {
    return matches.join("; ");
  }

  return "";
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRS).flat(),
  });

  const div = document.createElement("div");
  div.innerHTML = clean;

  div.querySelectorAll("span[style]").forEach((span) => {
    const originalStyle = span.getAttribute("style") || "";
    const sanitizedStyle = sanitizeStyleAttribute(originalStyle);

    if (sanitizedStyle) {
      span.setAttribute("style", sanitizedStyle);
    } else {
      span.removeAttribute("style");
    }
  });

  return div.innerHTML;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run types:check`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/website-editor/lib/sanitize-html.ts
git commit -m "feat: update HTML sanitization to allow font-size styles"
```

---

### Task 7: Final Integration Test & Verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: all previous tasks
- Produces: working font size control feature

- [ ] **Step 1: Run full type check**

Run: `pnpm run types:check`
Expected: no type errors

- [ ] **Step 2: Run lint**

Run: `pnpm run lint`
Expected: no new lint errors

- [ ] **Step 3: Run build**

Run: `pnpm run build`
Expected: build succeeds

- [ ] **Step 4: Manual verification checklist**

Start dev server (`pnpm run dev`) and verify:

1. Click text element on canvas → floating toolbar shows font size dropdown (compact "A" button)
2. Click font size dropdown → shows 6 preset sizes (Small, Normal, Medium, Large, X-Large, XX-Large)
3. Select a size → text changes to that size
4. Inspector toolbar shows font size dropdown with current label
5. Select size in inspector → canvas text updates
6. Font size persists after save
7. All element types support font size (heading, paragraph, button, badge, card)
8. Undo/redo works with font size changes
9. Existing plain text elements still render correctly
10. Font size styles are sanitized (only px values allowed)

- [ ] **Step 5: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore: font size control integration cleanup"
```
