# Font Size Control Design

## Overview

Add font size control to the rich text editor, allowing users to change text size via dropdown in both canvas floating toolbar and inspector sidebar toolbar.

## Goals

- Font size dropdown in both floating toolbar (canvas) and inspector toolbar
- Preset sizes: Small (12px), Normal (14px), Medium (16px), Large (18px), X-Large (24px), XX-Large (32px)
- Support all text elements: heading, paragraph, button, badge, card
- Store as inline HTML style attribute
- Integrate with existing TipTap architecture

## Non-Goals

- Custom font size input (only presets)
- Font family selection
- Line height control
- Relative units (em, rem, %) — only px

## Approach: TipTap FontSize Extension

Add TipTap FontSize extension (official package if available, custom extension otherwise) that stores font size as inline style on text marks.

### Why This Approach

- Integrates cleanly with existing TipTap architecture
- Font size stored as `style="font-size: Xpx"` on `<span>` elements
- Works with existing undo/redo system
- Compatible with current HTML sanitization
- Follows same pattern as Color and Highlight extensions

## Dependencies

**Check if official extension exists:**
- `@tiptap/extension-font-size` (if available)

**If not available:** Create custom FontSize extension in the project.

## File Structure

```
components/website-editor/
  lib/
    tiptap-extensions.ts          # Modified: add FontSize extension
  rich-text/
    FontSizePicker.tsx             # New: font size dropdown component
    FloatingToolbar.tsx            # Modified: add FontSizePicker
    InspectorToolbar.tsx           # Modified: add FontSizePicker
  lib/
    sanitize-html.ts               # Modified: allow font-size in style attribute
```

## Extension Configuration

### FontSize Extension

**If official package exists:**
```typescript
import FontSize from "@tiptap/extension-font-size";

FontSize.configure({
  types: ["textStyle"],
});
```

**If creating custom extension:**
```typescript
import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";

const FontSize = Extension.create({
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

**Modified `tiptap-extensions.ts`:**
- Add FontSize to extensions array in both inline and block modes
- Export `FONT_SIZES` constant for dropdown options

```typescript
export const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "18px" },
  { label: "X-Large", value: "24px" },
  { label: "XX-Large", value: "32px" },
];
```

## UI Components

### FontSizePicker Component

**New file:** `components/website-editor/rich-text/FontSizePicker.tsx`

**Props:**
- `editor: Editor` — TipTap editor instance
- `compact?: boolean` — show icon only (for floating toolbar)

**Features:**
- Dropdown showing 6 preset sizes
- Detects current font size from editor state
- Displays "Normal" as default when no size applied
- Calls `editor.chain().focus().setFontSize('16px').run()` on selection
- Styled with Tailwind, matches existing dropdown styling

**UI structure:**
```
┌──────────────┐
│ Normal ▾     │  ← Dropdown trigger
└──────────────┘

[Opens:]
┌──────────────┐
│ Small (12px) │
│ Normal (14px)│  ← Default
│ Medium (16px)│
│ Large (18px) │
│ X-Large (24px)│
│ XX-Large (32px)│
└──────────────┘
```

### Integration into Toolbars

**FloatingToolbar modifications:**
- Add FontSizePicker after heading buttons (H1/H2/H3/P), before B/I/U/S buttons
- Use `compact` mode with icon (🔤 or "A")
- Position: `[H1 H2 H3 P] [Font Size ▾] | [B I U S ...] | [Colors] | [Link]`

**InspectorToolbar modifications:**
- Add FontSizePicker next to block type dropdown
- Full label display (not compact)
- Position: `[Block Type ▾] [Font Size ▾] | [B I U S ...] | [Align] | [Colors] | [Link]`

## Data Storage & Sanitization

**Storage format:**
- Inline HTML: `<span style="font-size: 16px">text</span>`
- Already supported by existing `<span>` tag in sanitization whitelist
- Style attribute already allowed on span

**Sanitization updates:**
- Modify `sanitize-html.ts` to explicitly allow `font-size` property in style attributes
- Validate only px values: `/font-size:\s*\d+px/`
- Strip any non-px units (em, rem, %, pt, etc.)

**Example DOMPurify config update:**
```typescript
const clean = DOMPurify.sanitize(html, {
  ALLOWED_TAGS,
  ALLOWED_ATTR: [...existingAttrs, "style"],
  ALLOW_DATA_ATTR: false,
  ALLOWED_STYLES: {
    "*": {
      "font-size": [/^\d+px$/], // Only allow Xpx format
    },
  },
});
```

## Rendering

**Preview mode (canvas):**
- `dangerouslySetInnerHTML` renders `<span style="font-size: 16px">` directly
- Font size applies immediately

**Edit mode:**
- TipTap editor preserves font-size in contentEditable
- Editor shows live preview of font size changes

**Element type support:**
- All elements: heading, paragraph, button, badge, card (title + subtitle)
- No restrictions based on element type

## Affected Files

| File | Change |
|------|--------|
| `package.json` | Add `@tiptap/extension-font-size` if official package exists |
| `components/website-editor/lib/tiptap-extensions.ts` | Add FontSize extension, export FONT_SIZES constant |
| `components/website-editor/rich-text/FontSizePicker.tsx` | Create new dropdown component |
| `components/website-editor/rich-text/FloatingToolbar.tsx` | Add FontSizePicker (compact mode) |
| `components/website-editor/rich-text/InspectorToolbar.tsx` | Add FontSizePicker (full mode) |
| `components/website-editor/lib/sanitize-html.ts` | Allow font-size in style attributes with px validation |

## Testing

- Verify font size dropdown shows correct current size
- Verify font size applies to selected text
- Verify font size persists after save/reload
- Verify all 6 preset sizes work correctly
- Verify sanitization allows valid font-size styles
- Verify sanitization strips non-px units
- Verify undo/redo works with font size changes
- Verify font size works in all element types (heading, paragraph, button, badge, card)
- Verify floating toolbar shows font size picker
- Verify inspector toolbar shows font size picker
- Test XSS: verify malicious font-size values are stripped
