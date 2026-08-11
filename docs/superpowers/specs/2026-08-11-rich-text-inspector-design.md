# Rich Text Inspector Design

## Overview

Add rich text editing capabilities to the website editor's text elements. Users can format text (bold, italic, headings, lists, colors, etc.) both on the canvas via a floating toolbar and in the inspector sidebar via a fixed toolbar.

## Goals

- Rich text editing on canvas with floating toolbar (Notion/Google Docs style)
- Rich text editing in inspector sidebar with fixed toolbar
- Support all text elements: heading, paragraph, button, badge, card (title + subtitle)
- Store content as HTML strings (no schema changes)
- Toolbar adapts based on element type (single-line vs multi-line)

## Non-Goals

- Collaborative editing
- Inline images or tables
- Markdown shortcuts
- Undo/redo across canvas ↔ inspector (each has its own history)

## Approach: TipTap with Dual Editor Instances

Two TipTap editor instances per active text element — one on canvas, one in inspector. Only one is editable at a time. Both sync through the element's HTML text field via React state.

### Why TipTap

- ProseMirror-based, excellent React integration
- Lightweight, modular extensions
- Used by Notion, Linear, and other modern editors
- Starter-kit covers most needs out of the box

## Dependencies

| Package | Purpose |
|---------|---------|
| `@tiptap/react` | React bindings |
| `@tiptap/starter-kit` | Bold, italic, strike, headings, lists, blockquote, code, history |
| `@tiptap/extension-underline` | Underline (not in starter-kit) |
| `@tiptap/extension-link` | Hyperlink support |
| `@tiptap/extension-text-align` | Text alignment |
| `@tiptap/extension-color` | Text color |
| `@tiptap/extension-text-style` | Required by color extension |
| `@tiptap/extension-highlight` | Text highlight/mark |
| `dompurify` | HTML sanitization on save |

## File Structure

```
components/website-editor/
  lib/
    tiptap-extensions.ts       # Shared TipTap extension config
  rich-text/
    RichTextEditor.tsx          # Reusable TipTap editor wrapper
    FloatingToolbar.tsx         # Canvas floating toolbar
    InspectorToolbar.tsx        # Inspector fixed toolbar
    ColorPicker.tsx             # Color/highlight picker popover
    rich-text-content.css       # CSS for rendered rich text content
```

## Data Model

No schema changes. Existing `text`, `title`, `subtitle` string fields on `Element` now store HTML.

- Plain text elements render fine in HTML (backward compatible)
- No migration needed — `"Hello"` works as HTML
- New content: `"<p>Hello <strong>World</strong></p>"`

## Canvas Rich Text Editing

### Behavior

- `InlineText` component replaced by `RichTextEditor` in canvas mode
- Click text element → element selected → TipTap activates with `editable: true`
- Floating toolbar appears above element (CSS `position: absolute`)
- Click away → element deselects → TipTap read-only, toolbar hides

### Floating Toolbar

```
┌─────────────────────────────────────────────┐
│ B  I  U  S  ~  🔗  ≡  ≡  ≡  🎨  🖍  </>   │
└─────────────────────────────────────────────┘
```

| Button | Action |
|--------|--------|
| B | Bold |
| I | Italic |
| U | Underline |
| S | Strikethrough |
| ~ | Inline code |
| 🔗 | Link (URL input popover) |
| ≡ ≡ ≡ | Align left/center/right |
| 🎨 | Text color (color picker) |
| 🖍 | Highlight (color picker) |
| </> | Heading level cycle (H1→H2→H3→P) |

### Element-Type Restrictions

| Element | Enter key | Block formatting | Available toolbar |
|---------|-----------|-----------------|-------------------|
| heading | Disabled | Heading levels only | B, I, U, S, color, align, heading |
| paragraph | Enabled | All blocks | Full toolbar |
| button | Disabled | None (inline only) | B, I, U, S, color |
| badge | Disabled | None (inline only) | B, I, U, S, color |
| card title | Disabled | Heading levels only | B, I, U, S, color, align, heading |
| card subtitle | Enabled | All blocks | Full toolbar |

## Inspector Rich Text Editing

### Layout

Replaces the current plain `<textarea>` in the element inspector.

```
┌──────────────────────────────────────────────────┐
│ Paragraph ▾ │ B I U S ~ │ ≡ ≡ ≡ │ 🎨 🖍 │ 🔗  │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│                                                  │
│  [TipTap Editor Area - scrollable, ~150px]       │
│                                                  │
└──────────────────────────────────────────────────┘
```

- **Paragraph ▾** — Dropdown: H1, H2, H3, H4, H5, H6, Paragraph, Blockquote, Code Block
- Toolbar buttons match canvas floating toolbar
- Editor height: fixed ~150px with overflow scroll
- Same element-type restrictions as canvas

## Canvas ↔ Inspector Sync

### Rules

1. Both editors read from `selectedElement.text` / `.title` / `.subtitle`
2. Only one editor is `editable` at a time:
   - Editing on canvas → canvas editable, inspector read-only
   - Editing in inspector → inspector editable, canvas read-only
   - Neither focused → both read-only
3. `onUpdate` writes HTML to element state via `updateElementProps`
4. External HTML changes trigger `editor.commands.setContent()` (guarded against no-op)

### Edge Cases

- Rapid canvas ↔ inspector switching: debounce content sync by 150ms
- Canvas undo/redo: TipTap built-in history per editor instance
- Global undo (Ctrl+Z when no editor focused): existing page-level history stack unchanged

## Rendering

### Canvas (non-editing mode)

- `RenderElementContent` renders `element.text` as HTML via `dangerouslySetInnerHTML`
- Element's existing tag and CSS classes preserved
- When selected, mount TipTap editor with same HTML content

### Public Website

- Render `element.text` as HTML via `dangerouslySetInnerHTML`
- Sanitize HTML on save with DOMPurify (whitelist approach)

### Sanitization

Allowed tags: `p`, `br`, `strong`, `em`, `u`, `s`, `a`, `code`, `pre`, `blockquote`, `h1`-`h6`, `ul`, `ol`, `li`, `span`
Allowed attributes: `href` (on `a`), `style` (limited), `class`
Strip everything else

## Styling

- TipTap content area inherits element's existing CSS (font size, weight, color, family)
- Toolbars styled with Tailwind matching existing editor dark theme
- Color picker: preset palette (12-16 colors) + custom hex input
- `rich-text-content.css`: minimal rules for bullet lists, blockquotes, code blocks, links

## Affected Files

| File | Change |
|------|--------|
| `components/website-editor/index.tsx` | Replace `InlineText` with `RichTextEditor`, update `RenderElementContent`, update inspector textarea |
| `components/website-editor/lib/block-types.ts` | No changes needed |
| `components/website-editor/editor-provider.tsx` | No changes needed |
| `package.json` | Add TipTap dependencies |
| **New:** `components/website-editor/lib/tiptap-extensions.ts` | Extension config |
| **New:** `components/website-editor/rich-text/RichTextEditor.tsx` | Editor wrapper |
| **New:** `components/website-editor/rich-text/FloatingToolbar.tsx` | Canvas toolbar |
| **New:** `components/website-editor/rich-text/InspectorToolbar.tsx` | Inspector toolbar |
| **New:** `components/website-editor/rich-text/ColorPicker.tsx` | Color picker |
| **New:** `components/website-editor/rich-text/rich-text-content.css` | Content CSS |

## Testing

- Verify all element types render rich text correctly on canvas
- Verify floating toolbar appears/disappears on selection
- Verify inspector toolbar shows correct buttons per element type
- Verify sync between canvas and inspector (edit in one, see change in other)
- Verify undo/redo works independently in each editor
- Verify existing plain text elements still render correctly
- Verify public website renders sanitized HTML
- Test XSS prevention (script tags stripped)
