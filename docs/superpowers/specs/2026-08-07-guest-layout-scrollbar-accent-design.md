# Guest Layout Scrollbar Accent Design

**Date:** 2026-08-07  
**Status:** Approved  
**Scope:** Guest layout group scrollbar styling

---

## Overview

Apply custom scrollbar styling to the guest layout group (`app/(guest)/layout.tsx`) using the landing page indigo accent color with lighter hover/active states.

## Requirements

- Scrollbar thumb in brand indigo accent (`#4F46E5`)
- Lighter hover state (`#818CF8` indigo-400)
- Even lighter active/pressed state (`#A5B4FC` indigo-300)
- Subtle track background
- Scoped only to guest layout (landing pages)
- Cross-browser support (Webkit + Firefox)

## Design Decisions

### Colors

- **Thumb default:** `#4F46E5` (brand-600) — matches existing landing gradient text, CTA buttons, builder outlines
- **Thumb hover:** `#818CF8` (indigo-400) — ~30% lighter for clear hover feedback
- **Thumb active:** `#A5B4FC` (indigo-300) — ~50% lighter for press state
- **Track:** `rgba(0, 0, 0, 0.02)` — near-transparent, minimal visual weight
- **Dark mode:** Same colors work well against dark backgrounds (brand accent is already high contrast)

### Dimensions

- **Width:** `8px` — thin, modern scrollbar (default browser is ~15-17px)
- **Border radius:** `4px` on thumb — matches project's `--radius-sm` aesthetic
- **Track:** Full-height, no border radius

### Browser Support

- **Webkit (Chrome, Edge, Safari):** `::-webkit-scrollbar` pseudo-elements
- **Firefox:** `scrollbar-color` + `scrollbar-width: thin`
- **Fallback:** Browsers without support will show default scrollbar

### Scoping Strategy

- **Class-based scoping:** `.scrollbar-accent` class applied to the guest layout wrapper div
- **Why not global:** Other layout groups (client, staff, auth) may need different scrollbar treatments
- **Why not `:is(.guest-layout *)`:** Class-based scoping is more explicit and easier to maintain

## Implementation

### File Changes

1. **`app/globals.css`** — Add scrollbar styles in `@layer components` section (after existing landing page styles):

   ```css
   /* Guest layout scrollbar accent styling */
   .scrollbar-accent {
     scrollbar-color: #4f46e5 transparent;
     scrollbar-width: thin;
   }

   .scrollbar-accent::-webkit-scrollbar {
     width: 8px;
   }

   .scrollbar-accent::-webkit-scrollbar-track {
     background: rgba(0, 0, 0, 0.02);
   }

   .scrollbar-accent::-webkit-scrollbar-thumb {
     background: #4f46e5;
     border-radius: 4px;
   }

   .scrollbar-accent::-webkit-scrollbar-thumb:hover {
     background: #818cf8;
   }

   .scrollbar-accent::-webkit-scrollbar-thumb:active {
     background: #a5b4fc;
   }
   ```

2. **`app/(guest)/layout.tsx`** — Add `scrollbar-accent` class to wrapper div:
   ```tsx
   <div className="flex min-h-screen flex-col scrollbar-accent">
   ```

### CSS Placement Rationale

- Placed in `@layer components` (not `@layer utilities`) because it's a semantic component-level style
- Positioned after existing landing page animations to maintain logical grouping of landing-related styles
- Uses hex colors directly (not CSS variables) because these are fixed brand colors that don't change with theme

## Testing

- Verify scrollbar appears with accent color on pages under `app/(guest)/`
- Verify hover/active states work
- Verify other layout groups (client, staff, auth) retain default scrollbars
- Test in Chrome, Firefox, Safari
- Test in dark mode

## Out of Scope

- Scrollbar styling for other layout groups
- Horizontal scrollbar styling (rare in this project)
- Custom scrollbar for specific components (modals, sidebars, etc.)

---

**Next Step:** Create implementation plan
