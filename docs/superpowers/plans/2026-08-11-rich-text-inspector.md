# Rich Text Inspector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add rich text editing (bold, italic, headings, lists, colors, links) to the website editor via TipTap — floating toolbar on canvas and fixed toolbar in inspector.

**Architecture:** Two TipTap editor instances per active text element (canvas + inspector), synced through HTML string in element data. Only one is editable at a time. Shared extension config ensures consistent behavior.

**Tech Stack:** TipTap (ProseMirror), React 19, Next.js 16, Tailwind CSS v4, TypeScript 5

## Global Constraints

- Next.js 16.3.0 App Router — check `node_modules/next/dist/docs/` before writing any Next.js code
- React 19.2.8 — no legacy APIs
- Tailwind CSS v4 via `@tailwindcss/postcss`
- TypeScript strict mode
- No comments in code unless explicitly requested
- Follow existing code style: functional components, hooks, Tailwind utility classes
- Existing editor uses `useEditor()` hook from `./editor-provider` (not to be confused with TipTap's `useEditor`)
- Existing icon system: `import { Icon } from "./ui/icon-library"` — check available icon names before using
- Package manager: pnpm 10.33.0

---

## File Structure

| File | Purpose |
|------|---------|
| `components/website-editor/lib/tiptap-extensions.ts` | Shared TipTap extension configuration |
| `components/website-editor/rich-text/RichTextEditor.tsx` | Reusable TipTap editor wrapper component |
| `components/website-editor/rich-text/FloatingToolbar.tsx` | Canvas floating toolbar |
| `components/website-editor/rich-text/InspectorToolbar.tsx` | Inspector fixed toolbar |
| `components/website-editor/rich-text/ColorPicker.tsx` | Color/highlight picker popover |
| `components/website-editor/rich-text/rich-text-content.css` | CSS for rendered rich text content |
| `components/website-editor/index.tsx` | Modified: replace InlineText, update RenderElementContent, update inspector |
| `package.json` | Modified: add TipTap dependencies |

---

### Task 1: Install TipTap Dependencies

**Files:**
- Modify: `package.json` (via pnpm install)

**Interfaces:**
- Consumes: none
- Produces: TipTap packages available for import

- [ ] **Step 1: Install all TipTap packages and DOMPurify**

```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight @tiptap/pm dompurify
```

- [ ] **Step 2: Install DOMPurify types**

```bash
pnpm add -D @types/dompurify
```

- [ ] **Step 3: Verify installation**

```bash
pnpm ls @tiptap/react @tiptap/starter-kit dompurify
```

Expected: all packages listed with versions.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add tiptap and dompurify for rich text editing"
```

---

### Task 2: Create Shared TipTap Extension Config

**Files:**
- Create: `components/website-editor/lib/tiptap-extensions.ts`

**Interfaces:**
- Consumes: installed TipTap packages from Task 1
- Produces: `getExtensions(mode: 'inline' | 'block')` — returns array of TipTap extensions
- Produces: `EDITOR_COLORS` — array of preset color hex values for the color picker

- [ ] **Step 1: Create the extensions config file**

```typescript
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

export const EDITOR_COLORS = [
  "#000000", "#434343", "#666666", "#999999",
  "#e11d48", "#ea580c", "#ca8a04", "#16a34a",
  "#2563eb", "#7c3aed", "#db2777", "#0891b2",
];

export function getExtensions(mode: "inline" | "block" = "block") {
  const extensions = [
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
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

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/lib/tiptap-extensions.ts
git commit -m "feat: add shared tiptap extension config"
```

---

### Task 3: Create ColorPicker Component

**Files:**
- Create: `components/website-editor/rich-text/ColorPicker.tsx`

**Interfaces:**
- Consumes: `EDITOR_COLORS` from Task 2
- Produces: `<ColorPicker value={string} onChange={(color) => void} type="text"|"highlight" />`

- [ ] **Step 1: Create the ColorPicker component**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { EDITOR_COLORS } from "../lib/tiptap-extensions";

export function ColorPicker({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (color: string) => void;
  type?: "text" | "highlight";
}) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || "#000000");
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-md border border-slate-200 hover:border-slate-400 flex items-center justify-center transition"
        title={type === "text" ? "Text Color" : "Highlight Color"}
      >
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: type === "highlight" ? value || "#fef08a" : value || "#000000" }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 w-48">
          <div className="grid grid-cols-6 gap-1 mb-2">
            {EDITOR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setOpen(false);
                }}
                className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-slate-100 pt-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 text-[10px] font-mono bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                onChange(customColor);
                setOpen(false);
              }}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-1"
            >
              Set
            </button>
          </div>
          {type === "highlight" && (
            <button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-[10px] text-red-500 hover:text-red-600 mt-1 pt-1 border-t border-slate-100"
            >
              Remove highlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/rich-text/ColorPicker.tsx
git commit -m "feat: add color picker component for rich text"
```

---

### Task 4: Create FloatingToolbar Component

**Files:**
- Create: `components/website-editor/rich-text/FloatingToolbar.tsx`

**Interfaces:**
- Consumes: TipTap `Editor` type from `@tiptap/react`, `ColorPicker` from Task 3, `EDITOR_COLORS` from Task 2
- Produces: `<FloatingToolbar editor={Editor} elementType={ElementType} />`

- [ ] **Step 1: Create the FloatingToolbar component**

```tsx
"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";

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

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/rich-text/FloatingToolbar.tsx
git commit -m "feat: add floating toolbar for canvas rich text editing"
```

---

### Task 5: Create InspectorToolbar Component

**Files:**
- Create: `components/website-editor/rich-text/InspectorToolbar.tsx`

**Interfaces:**
- Consumes: TipTap `Editor` type from `@tiptap/react`, `ColorPicker` from Task 3
- Produces: `<InspectorToolbar editor={Editor} elementType={ElementType} />`

- [ ] **Step 1: Create the InspectorToolbar component**

```tsx
"use client";

import type { Editor } from "@tiptap/react";
import { ColorPicker } from "./ColorPicker";

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

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/rich-text/InspectorToolbar.tsx
git commit -m "feat: add inspector toolbar for rich text editing"
```

---

### Task 6: Create RichTextEditor Wrapper Component

**Files:**
- Create: `components/website-editor/rich-text/RichTextEditor.tsx`

**Interfaces:**
- Consumes: `getExtensions` from Task 2, `FloatingToolbar` from Task 4, `InspectorToolbar` from Task 5
- Produces: `<RichTextEditor content={string} onUpdate={(html) => void} editable={boolean} mode={"canvas"|"inspector"} elementType={string} tagName={string} className={string} style={CSSProperties} />`

- [ ] **Step 1: Create the RichTextEditor component**

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "../lib/tiptap-extensions";
import { FloatingToolbar } from "./FloatingToolbar";
import { InspectorToolbar } from "./InspectorToolbar";

export function RichTextEditor({
  content,
  onUpdate,
  editable = false,
  mode = "canvas",
  elementType = "paragraph",
  tagName = "p",
  className = "",
  style = {},
}: {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
  mode?: "canvas" | "inspector";
  elementType?: string;
  tagName?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isInlineOnly = elementType === "button" || elementType === "badge";
  const tiptapMode = isInlineOnly ? "inline" : "block";

  const editor = useEditor({
    extensions: getExtensions(tiptapMode),
    content: content || "",
    editable,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content focus:outline-none min-h-[1.5em]",
        style: "min-height: 1.5em;",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onUpdate(html);
    },
  });

  const prevContentRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content || "", false);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) return null;

  if (mode === "canvas") {
    return (
      <div className="relative w-full h-full">
        {editable && <FloatingToolbar editor={editor} elementType={elementType} />}
        <EditorContent
          editor={editor}
          className={`w-full h-full ${className}`}
          style={style}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <InspectorToolbar editor={editor} elementType={elementType} />
      <div
        className="border border-slate-200 rounded-xl overflow-hidden bg-white"
        style={{ height: "150px" }}
      >
        <EditorContent
          editor={editor}
          className="h-full overflow-y-auto p-2.5 rich-text-inspector-content"
          style={style}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/rich-text/RichTextEditor.tsx
git commit -m "feat: add RichTextEditor wrapper component"
```

---

### Task 7: Create Rich Text Content CSS

**Files:**
- Create: `components/website-editor/rich-text/rich-text-content.css`

**Interfaces:**
- Consumes: none
- Produces: CSS classes for rich text rendering

- [ ] **Step 1: Create the CSS file**

```css
.rich-text-editor-content h1 {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.2;
  margin: 0.5em 0;
}
.rich-text-editor-content h2 {
  font-size: 1.5em;
  font-weight: 700;
  line-height: 1.3;
  margin: 0.4em 0;
}
.rich-text-editor-content h3 {
  font-size: 1.25em;
  font-weight: 600;
  line-height: 1.3;
  margin: 0.3em 0;
}
.rich-text-editor-content h4,
.rich-text-editor-content h5,
.rich-text-editor-content h6 {
  font-weight: 600;
  margin: 0.3em 0;
}
.rich-text-editor-content p {
  margin: 0.3em 0;
}
.rich-text-editor-content ul,
.rich-text-editor-content ol {
  padding-left: 1.5em;
  margin: 0.3em 0;
}
.rich-text-editor-content blockquote {
  border-left: 3px solid #cbd5e1;
  padding-left: 0.75em;
  margin: 0.5em 0;
  color: #64748b;
}
.rich-text-editor-content code {
  background: #f1f5f9;
  border-radius: 4px;
  padding: 0.1em 0.3em;
  font-size: 0.9em;
}
.rich-text-editor-content pre {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 0.75em 1em;
  margin: 0.5em 0;
  overflow-x: auto;
}
.rich-text-editor-content pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.rich-text-editor-content a.editor-link {
  color: #2563eb;
  text-decoration: underline;
}

.rich-text-inspector-content {
  font-size: 12px;
  line-height: 1.6;
}
.rich-text-inspector-content .ProseMirror {
  min-height: 100%;
}
.rich-text-inspector-content .ProseMirror p.is-editor-empty:first-child::before {
  color: #94a3b8;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/website-editor/rich-text/rich-text-content.css
git commit -m "feat: add rich text content CSS styles"
```

---

### Task 8: Integrate RichTextEditor into Canvas (RenderElementContent)

**Files:**
- Modify: `components/website-editor/index.tsx`

**Interfaces:**
- Consumes: `RichTextEditor` from Task 6
- Modifies: `RenderElementContent` function (lines 12-135), `InlineText` function (lines 137-197)

This task replaces the `InlineText` component usage in `RenderElementContent` with `RichTextEditor`. The `InlineText` function itself is removed since it's no longer needed.

- [ ] **Step 1: Add imports at the top of `index.tsx`**

Add these imports after the existing imports (around line 10):

```typescript
import { RichTextEditor } from "./rich-text/RichTextEditor";
import "./rich-text/rich-text-content.css";
```

- [ ] **Step 2: Replace `RenderElementContent` function**

Replace the entire `RenderElementContent` function (lines 12-135) with:

```tsx
function RenderElementContent({ element, updateProps, isPreviewMode, isSelected }: { element: Element; updateProps: (p: Partial<Element>) => void; isPreviewMode: boolean; isSelected?: boolean }) {
  const textProp = element.type === "card" ? undefined : "text";
  const titleProp = element.type === "card" ? "title" : undefined;
  const subtitleProp = element.type === "card" ? "subtitle" : undefined;

  const sharedStyle: React.CSSProperties = {
    color: element.textColor,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    textAlign: (element.textAlign as any) || "left",
    wordBreak: "break-word",
  };

  if (element.type === "heading") {
    if (isPreviewMode) {
      return (
        <h2
          className="w-full h-full flex items-center"
          style={sharedStyle}
          dangerouslySetInnerHTML={{ __html: element.text || "" }}
        />
      );
    }
    return (
      <RichTextEditor
        content={element.text || ""}
        onUpdate={(html) => updateProps({ text: html })}
        editable={!!isSelected}
        mode="canvas"
        elementType="heading"
        tagName="h2"
        className="w-full h-full flex items-center"
        style={sharedStyle}
      />
    );
  }

  if (element.type === "paragraph") {
    if (isPreviewMode) {
      return (
        <p
          className="w-full h-full flex items-center"
          style={sharedStyle}
          dangerouslySetInnerHTML={{ __html: element.text || "" }}
        />
      );
    }
    return (
      <RichTextEditor
        content={element.text || ""}
        onUpdate={(html) => updateProps({ text: html })}
        editable={!!isSelected}
        mode="canvas"
        elementType="paragraph"
        tagName="p"
        className="w-full h-full flex items-center"
        style={sharedStyle}
      />
    );
  }

  if (element.type === "button") {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: element.borderColor ? `1px solid ${element.borderColor}` : "none",
          fontSize: element.fontSize,
          fontWeight: element.fontWeight,
        }}
        className="w-full h-full flex items-center justify-center shadow-md hover:opacity-90 transition px-4 cursor-pointer"
      >
        {isPreviewMode ? (
          <span dangerouslySetInnerHTML={{ __html: element.text || "" }} />
        ) : (
          <RichTextEditor
            content={element.text || ""}
            onUpdate={(html) => updateProps({ text: html })}
            editable={!!isSelected}
            mode="canvas"
            elementType="button"
            tagName="span"
          />
        )}
      </div>
    );
  }

  if (element.type === "badge") {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`,
          fontSize: element.fontSize,
        }}
        className="w-full h-full flex items-center justify-center font-bold px-3"
      >
        {isPreviewMode ? (
          <span dangerouslySetInnerHTML={{ __html: element.text || "" }} />
        ) : (
          <RichTextEditor
            content={element.text || ""}
            onUpdate={(html) => updateProps({ text: html })}
            editable={!!isSelected}
            mode="canvas"
            elementType="badge"
            tagName="span"
          />
        )}
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <img
        src={element.url}
        alt={element.alt || "Visual"}
        style={{ borderRadius: element.borderRadius, objectFit: (element.objectFit as any) || "cover" }}
        className="w-full h-full shadow-md"
      />
    );
  }

  if (element.type === "card") {
    return (
      <div
        style={{
          backgroundColor: element.bgColor,
          color: element.textColor,
          borderRadius: element.borderRadius,
          border: `1px solid ${element.borderColor}`,
        }}
        className="w-full h-full p-4 flex flex-col justify-between shadow-md box-border overflow-hidden"
      >
        <h3 style={{ color: element.accentColor }} className="font-bold text-base m-0">
          {isPreviewMode ? (
            <span dangerouslySetInnerHTML={{ __html: element.title || "" }} />
          ) : (
            <RichTextEditor
              content={element.title || ""}
              onUpdate={(html) => updateProps({ title: html })}
              editable={!!isSelected}
              mode="canvas"
              elementType="card"
              tagName="span"
            />
          )}
        </h3>
        <p className="text-xs opacity-80 m-0 leading-relaxed">
          {isPreviewMode ? (
            <span dangerouslySetInnerHTML={{ __html: element.subtitle || "" }} />
          ) : (
            <RichTextEditor
              content={element.subtitle || ""}
              onUpdate={(html) => updateProps({ subtitle: html })}
              editable={!!isSelected}
              mode="canvas"
              elementType="paragraph"
              tagName="span"
            />
          )}
        </p>
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 3: Remove the `InlineText` function**

Delete the entire `InlineText` function (lines 137-197 of the original file). It is no longer used.

- [ ] **Step 4: Update the `RenderElementContent` call to pass `isSelected`**

Find the `RenderElementContent` call inside the canvas element rendering (around line 840):

```tsx
<RenderElementContent
  element={el}
  updateProps={(newProps) => updateElementProps(sec.id, el.id, newProps)}
  isPreviewMode={isPreviewMode}
/>
```

Replace with:

```tsx
<RenderElementContent
  element={el}
  updateProps={(newProps) => updateElementProps(sec.id, el.id, newProps)}
  isPreviewMode={isPreviewMode}
  isSelected={isElementSelected}
/>
```

- [ ] **Step 5: Verify the build compiles**

```bash
pnpm run types:check
```

Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat: integrate RichTextEditor into canvas rendering"
```

---

### Task 9: Replace Inspector Textarea with RichTextEditor

**Files:**
- Modify: `components/website-editor/index.tsx` (inspector section, lines 958-993)

**Interfaces:**
- Consumes: `RichTextEditor` from Task 6 (already imported in Task 8)
- Modifies: Inspector's style/content tab — replaces `<textarea>` and `<input>` for text editing with `RichTextEditor` in `mode="inspector"`

- [ ] **Step 1: Replace the text content textarea for heading/paragraph/button/badge**

In the inspector's `style` tab (around lines 960-970), find:

```tsx
{(selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'button' || selectedElement.type === 'badge') && (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-500">Text Content</label>
    <textarea
      rows={3}
      value={selectedElement.text || ''}
      onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { text: e.target.value })}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
    />
  </div>
)}
```

Replace with:

```tsx
{(selectedElement.type === 'heading' || selectedElement.type === 'paragraph' || selectedElement.type === 'button' || selectedElement.type === 'badge') && (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-500">Text Content</label>
    <RichTextEditor
      content={selectedElement.text || ""}
      onUpdate={(html) => updateElementProps(selectedSectionId!, selectedElement.id, { text: html })}
      editable={true}
      mode="inspector"
      elementType={selectedElement.type}
    />
  </div>
)}
```

- [ ] **Step 2: Replace the card title input**

Find the card title section (around lines 972-993):

```tsx
{selectedElement.type === 'card' && (
  <div className="space-y-3">
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500">Card Title</label>
      <input
        type="text"
        value={selectedElement.title || ''}
        onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { title: e.target.value })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-blue-500"
      />
    </div>
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500">Card Description</label>
      <textarea
        rows={3}
        value={selectedElement.subtitle || ''}
        onChange={(e) => updateElementProps(selectedSectionId!, selectedElement.id, { subtitle: e.target.value })}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500"
      />
    </div>
  </div>
)}
```

Replace with:

```tsx
{selectedElement.type === 'card' && (
  <div className="space-y-3">
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500">Card Title</label>
      <RichTextEditor
        content={selectedElement.title || ""}
        onUpdate={(html) => updateElementProps(selectedSectionId!, selectedElement.id, { title: html })}
        editable={true}
        mode="inspector"
        elementType="card"
      />
    </div>
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500">Card Description</label>
      <RichTextEditor
        content={selectedElement.subtitle || ""}
        onUpdate={(html) => updateElementProps(selectedSectionId!, selectedElement.id, { subtitle: html })}
        editable={true}
        mode="inspector"
        elementType="paragraph"
      />
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify the build compiles**

```bash
pnpm run types:check
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat: replace inspector textarea with RichTextEditor"
```

---

### Task 10: Add HTML Sanitization

**Files:**
- Create: `components/website-editor/lib/sanitize-html.ts`
- Modify: `components/website-editor/index.tsx` (save logic)

**Interfaces:**
- Consumes: `dompurify` from Task 1
- Produces: `sanitizeHtml(html: string): string` — strips unsafe tags/attributes

- [ ] **Step 1: Create the sanitization utility**

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

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRS).flat(),
  });

  return clean;
}
```

- [ ] **Step 2: Find where `saveWebsite` is called and add sanitization**

In `editor-provider.tsx`, find the `saveWebsite` function. Before saving, sanitize all text fields in all elements across all pages.

Read `editor-provider.tsx` to find the exact save logic, then add sanitization in the save flow. The sanitize function should be called on every `element.text`, `element.title`, and `element.subtitle` before persisting.

- [ ] **Step 3: Verify the build compiles**

```bash
pnpm run types:check
```

Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add components/website-editor/lib/sanitize-html.ts components/website-editor/editor-provider.tsx
git commit -m "feat: add HTML sanitization on save"
```

---

### Task 11: Final Integration Test & Cleanup

**Files:**
- Modify: `components/website-editor/index.tsx` (if any cleanup needed)

**Interfaces:**
- Consumes: all previous tasks
- Produces: working rich text editor

- [ ] **Step 1: Run full type check**

```bash
pnpm run types:check
```

Expected: no type errors.

- [ ] **Step 2: Run lint**

```bash
pnpm run lint
```

Expected: no lint errors.

- [ ] **Step 3: Run build**

```bash
pnpm run build
```

Expected: build succeeds.

- [ ] **Step 4: Manual verification checklist**

Start the dev server (`pnpm run dev`) and verify:

1. Click a heading element on canvas → floating toolbar appears with B/I/U/S, heading dropdown, alignment, colors
2. Click a paragraph element → full toolbar with lists, blockquote, code block options
3. Click a button/badge element → inline-only toolbar (no heading, no alignment)
4. Edit text on canvas → inspector shows updated HTML
5. Edit text in inspector → canvas shows updated formatting
6. Only one editor is editable at a time (no cursor conflicts)
7. Existing plain text elements still render correctly
8. Bold/italic/underline work and persist across save
9. Text color and highlight color apply correctly
10. Links can be inserted and clicked in preview mode

- [ ] **Step 5: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore: rich text editor integration cleanup"
```
