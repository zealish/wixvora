# Design Specification: Website Editor Page Port

**Date:** 2026-08-09  
**Author:** AI Assistant  
**Status:** Draft - Awaiting User Review

---

## 1. Overview

Port the standalone HTML website editor (`wixvora_website_editor.html`) to a Next.js page at `/website-editor` route. This is a visual block-based website builder with inline text editing, color pickers, layer management, and HTML/JSON export capabilities.

### 1.1 Requirements
- 100% feature parity with source HTML file
- Static only (no database integration)
- Single page implementation without componentization
- Standalone route (no authentication required)
- All functionality must work identically to the original

---

## 2. Technical Architecture

### 2.1 File Structure
```
app/
  website-editor/
    page.tsx          # ~1500 lines single client component
```

### 2.2 Technology Stack
- **Framework:** Next.js 16.3.0 (App Router)
- **React:** 19.2.8 (already in project)
- **Styling:** Tailwind CSS 4 (already configured)
- **Fonts:** next/font/google
  - Plus Jakarta Sans (weights: 400, 500, 600, 700, 800)
  - Poppins (weights: 400, 600, 700)
  - Playfair Display (weights: 400 italic, 600)
  - Fira Code (weights: 400, 500)
- **Runtime:** Client-side only (`'use client'` directive)

### 2.3 Dependencies
No new dependencies required. All existing project dependencies are sufficient.

---

## 3. Component Structure

### 3.1 Single File Architecture
All code resides in `app/website-editor/page.tsx`:

1. **Directives:** `'use client'`
2. **Imports:** React hooks, next/font
3. **Type Definitions:**
   - `Block` interface
   - `BlockProps` types per block type
   - `PageSettings` interface
4. **Constants:**
   - `COLOR_PALETTES` - 20 preset colors
   - `GRADIENT_PRESETS` - 6 gradient options
   - `BLOCK_CATALOG` - Available blocks by category
   - `PRESET_TEMPLATES` - SaaS template starter
5. **Utility Functions:**
   - `createUniqueId()` - Generate unique layer IDs
6. **Inline Function Components:**
   - `Icon` - SVG icon renderer (30+ icons)
   - `InlineText` - Contenteditable text field with focus state
   - `RenderBlockContent` - Switch-based block renderer
   - `BlockInspector` - Right sidebar property editor
7. **Main Component:** `WebsiteEditorPage` (default export)

### 3.2 State Management
All state managed via React useState hooks:
- `blocks` - Array of block objects
- `selectedBlockId` - Currently selected block
- `viewport` - 'desktop' | 'tablet' | 'mobile'
- `activeTab` - Left sidebar tab ('blocks' | 'layers' | 'templates' | 'settings')
- `inspectorTab` - Right sidebar tab ('content' | 'style' | 'advanced')
- `isEditingInline` - Show inline formatting toolbar
- `history` - Undo/redo stack
- `historyIndex` - Current position in history
- `isPreviewMode` - Toggle preview mode
- `showExportModal` - HTML export modal visibility
- `toast` - Toast notification message
- `pageSettings` - Global page config (title, bgColor, fontFamily)

---

## 4. Feature Implementation

### 4.1 Core Features

**Block Management:**
- Add blocks from catalog
- Duplicate blocks
- Delete blocks (min 1 block requirement)
- Move blocks up/down
- Toggle visibility (show/hide)
- Rename layers

**Inline Text Editing:**
- Contenteditable fields on canvas
- Focus state tracking
- Formatting toolbar (bold, italic, underline, alignment)
- Single-line and multi-line support
- Blur to save changes

**Color & Styling:**
- Hex color pickers with visual preview
- 20-color quick palette
- Per-block background, text, accent colors
- Gradient presets (6 options)
- Border radius, padding, alignment controls

**Layer Management:**
- Tree view of all blocks
- Click to select
- Visibility toggle per layer
- Move up/down in hierarchy
- Delete with confirmation

**History:**
- Undo/redo stack
- State capture on every change
- Navigate through history

**Viewport Switcher:**
- Desktop (full width, max 6xl)
- Tablet (768px)
- Mobile (375px)
- Smooth transitions

**Export/Import:**
- Export layout as JSON
- Import JSON layout
- Export full HTML with Tailwind CDN
- Copy HTML to clipboard

**Preview Mode:**
- Hide all editor UI
- Show final result
- Disable inline editing

### 4.2 Block Types

1. **Navbar** - Logo, links array, CTA button
2. **Hero** - Badge, title, subtitle, primary/secondary buttons
3. **Container** - Generic content area with rich styling
4. **Grid Custom** - Dynamic columns (1-4), per-column styling
5. **Heading** - H1-H4 with alignment and font controls
6. **Paragraph** - Multi-line text with alignment
7. **Image** - URL, alt, caption, rounded corners, shadow
8. **Pricing** - Plan name, price, period, features list, badge
9. **Form Contact** - Title, subtitle, email input, CTA button
10. **Footer** - Brand name, copyright text

### 4.3 Inspector Panels

**Content Tab:**
- Layer name
- Block-specific text fields
- Links/columns/features array management
- Add/delete array items

**Style Tab:**
- Background color picker + hex input
- Quick color palette (20 colors)
- Text color picker
- Accent color picker
- Gradient preset selector
- Alignment buttons (left/center/right)

**Advanced Tab (Grid only):**
- Column count selector (1-4)
- Per-column card editor:
  - Title, description
  - Background color
  - Accent color
  - Icon selection
  - Button text/URL
- Add/delete column cards

---

## 5. Styling Details

### 5.1 Custom CSS
Embedded in the component (within `<style jsx global>`):
- Custom scrollbar (6px, slate colors)
- Grid background pattern (28px circles)
- Block outline on hover/select
- Device viewport transitions
- Color picker swatch styling
- Editable text field hover/focus states

### 5.2 Tailwind Classes
Use existing Tailwind configuration. Key patterns:
- Gradient backgrounds via utility classes
- Responsive breakpoints (md:, sm:)
- Shadow variants (shadow-sm, shadow-md, shadow-xl)
- Border radius (rounded-xl, rounded-2xl, rounded-3xl)
- Spacing scale (p-4, py-12, px-6, etc.)

---

## 6. Conversion Notes

### 6.1 HTML → Next.js Mappings

**Attributes:**
- `class` → `className`
- `onclick` → `onClick`
- `onchange` → `onChange`
- `for` → `htmlFor` (if any labels)

**React Patterns:**
- `{/* comments */}` for JSX comments
- Fragments `<>` for grouping without divs
- Conditional rendering: `{condition && <element />}`
- Array mapping: `{array.map((item, i) => <element key={i} />)}`

**Event Handling:**
- All inline handlers → arrow functions
- `e.preventDefault()` for link clicks in edit mode
- `e.stopPropagation()` for nested clickable elements

**Refs:**
- `useRef` for contenteditable elements
- Direct DOM manipulation only for contenteditable sync

### 6.2 CDN → next/font
Replace Google Fonts CDN with next/font/google:
```typescript
import { Plus_Jakarta_Sans, Poppins, Playfair_Display, Fira_Code } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans'
})
// ... similar for others
```

Apply via className on root element or Tailwind theme extension.

### 6.3 Babel/JSX → TypeScript
- Remove Babel script tag references
- Convert inline `<script type="text/babel">` to TypeScript
- Add type annotations where beneficial (optional for initial port)
- Use `React.FC` or direct function components

---

## 7. Testing Strategy

### 7.1 Manual Testing Checklist
After implementation, verify:
- [ ] All 10 block types render correctly
- [ ] Inline text editing works on all text fields
- [ ] Color pickers update block styles in real-time
- [ ] Undo/redo maintains correct state
- [ ] Add/delete/duplicate/move blocks works
- [ ] Layer visibility toggle works
- [ ] Viewport switcher changes canvas width
- [ ] Export JSON downloads valid file
- [ ] Import JSON restores layout
- [ ] Export HTML generates valid HTML
- [ ] Copy HTML to clipboard works
- [ ] Preview mode hides all editor UI
- [ ] Grid custom: add/delete columns works
- [ ] Navbar: add/delete links works
- [ ] Pricing: add/delete features works
- [ ] Inspector tabs switch correctly
- [ ] Toast notifications appear and auto-dismiss
- [ ] Responsive breakpoints work (test on mobile viewport)

### 7.2 Browser Testing
- Chrome/Edge (primary)
- Firefox
- Safari (macOS/iOS)

### 7.3 Known Limitations
- No server-side rendering (client component only)
- No persistence (refresh loses state)
- No collaborative editing
- No image upload (external URLs only)
- No custom font upload
- contenteditable behavior may vary by browser

---

## 8. Implementation Steps

1. Create `app/website-editor/page.tsx`
2. Add `'use client'` directive
3. Configure next/font imports
4. Copy and convert all constants (BLOCK_CATALOG, etc.)
5. Convert Icon component
6. Convert InlineText component
7. Convert RenderBlockContent component
8. Convert BlockInspector component
9. Convert main App component → WebsiteEditorPage
10. Add custom CSS via styled-jsx or globals
11. Test each feature systematically
12. Fix any TypeScript errors
13. Verify build passes (`npm run build`)

---

## 9. Future Improvements (Out of Scope)

These are NOT part of this initial port:
- Database persistence
- User authentication
- Component extraction/refactoring
- Server actions for save/load
- Image upload to CDN
- Custom block types
- Plugin architecture
- Real-time collaboration
- Version control
- Template marketplace
- SEO metadata editor
- Analytics integration

---

## 10. Success Criteria

The implementation is complete when:
1. `/website-editor` route loads without errors
2. All 10 block types render identically to source HTML
3. All inline editing works
4. All inspector controls update blocks correctly
5. Undo/redo works
6. Export HTML matches source quality
7. Import/export JSON preserves full state
8. No console errors or warnings
9. Build completes successfully
10. Manual testing checklist passes 100%

---

## 11. Risks & Mitigations

**Risk:** contenteditable behaves differently in Next.js SSR context  
**Mitigation:** Use `'use client'` directive, test thoroughly

**Risk:** Large single file becomes unmaintainable  
**Mitigation:** Accept this for initial port per requirements, plan refactor later

**Risk:** Tailwind CDN config differs from project Tailwind config  
**Mitigation:** Test all utility classes, add custom config if needed

**Risk:** Font loading causes FOUT (flash of unstyled text)  
**Mitigation:** next/font handles this automatically with font-display: swap

**Risk:** Export HTML uses CDN Tailwind, may differ from editor rendering  
**Mitigation:** Document this limitation, consider inline critical CSS in future

---

## Appendix A: Block Type Reference

### Navbar
Props: logoText, links[], ctaText, ctaUrl, bgColor, textColor, accentColor

### Hero
Props: badge, title, subtitle, buttonText, buttonUrl, secondaryButtonText, secondaryButtonUrl, bgColor, textColor, bgGradient, align

### Container
Props: content, paddingY, paddingX, bgColor, textColor, bgGradient, borderRadius, borderWidth, borderColor

### Grid Custom
Props: title, subtitle, columnsCount, gap, columns[{icon, title, desc, bgColor, textColor, accentColor, btnText, btnUrl}]

### Heading
Props: text, level, align, fontSize, textColor, weight, fontFamily

### Paragraph
Props: text, align, fontSize, textColor, maxWidth

### Image
Props: url, alt, caption, rounded, shadow

### Pricing
Props: badge, planName, price, period, features[], buttonText, buttonUrl, bgColor, textColor, accentColor

### Form Contact
Props: title, subtitle, placeholder, buttonText, bgColor, textColor, accentColor

### Footer
Props: brandName, copyright, bgColor, textColor

---

**End of Specification**
