# Inter Font for Staff and Client Layouts

**Date:** 2026-08-05  
**Status:** Approved

## Overview

Add Inter font to staff and client layout sections while preserving Geist fonts for guest/auth sections. Landing pages will use various custom fonts (out of scope for this spec).

## Context

The application currently uses Geist and Geist Mono fonts globally via the root layout. Staff and client sections need distinct typography using the Inter font, while guest and auth sections continue using Geist.

Current layout hierarchy:

- `app/layout.tsx` (root) - defines Geist and Geist Mono
- `app/(staff)/layout.tsx` - wrapper for staff routes
- `app/(client)/layout.tsx` - wrapper for client routes
- `app/(guest)/layout.tsx` - wrapper for guest routes
- `app/(auth)/layout.tsx` - wrapper for auth routes

## Requirements

1. Staff routes (`(staff)/*`) must use Inter font
2. Client routes (`(client)/*`) must use Inter font
3. Guest and auth routes continue using existing Geist font
4. No impact on root layout font definitions
5. Follow Next.js font optimization best practices

## Design

### Approach: Font Variable Inheritance

Import Inter from `next/font/google` in both `(staff)/layout.tsx` and `(client)/layout.tsx`. Create a CSS variable and wrap children in a div that applies the font class.

### Implementation Details

**File: `app/(staff)/layout.tsx`**

- Import `Inter` from `next/font/google`
- Configure with latin subset
- Create CSS variable `--font-inter`
- Wrap children in `<div>` with font className applied
- Add `font-sans` Tailwind class to use Inter as the sans-serif font

**File: `app/(client)/layout.tsx`**

- Same implementation as staff layout
- Import and configure Inter independently
- Apply to children via wrapper div

**TypeScript:**

- Both files already have correct `LayoutProps` typing
- No type changes needed

### CSS Variable Strategy

The wrapper div will apply the Inter CSS variable, which cascades to all child components. This leverages Next.js automatic font optimization and Tailwind's font-sans utility.

### Font Loading

Inter will be loaded twice (once per layout), but Next.js optimizes font loading with:

- Automatic subsetting
- Self-hosting via `next/font`
- Preloading
- Zero layout shift

The duplicate load is acceptable because:

1. Different route groups may have different font requirements
2. Next.js deduplicates identical font requests
3. Performance impact is negligible with modern font optimization

## Files Modified

1. `app/(staff)/layout.tsx` - add Inter font import and wrapper
2. `app/(client)/layout.tsx` - add Inter font import and wrapper

## Files Not Modified

- `app/layout.tsx` - Geist fonts remain unchanged
- `app/(guest)/layout.tsx` - uses inherited Geist
- `app/(auth)/layout.tsx` - uses inherited Geist
- `app/globals.css` - no CSS changes needed

## Testing Approach

1. Visual inspection: verify Inter renders in staff routes
2. Visual inspection: verify Inter renders in client routes
3. Visual inspection: verify Geist still renders in guest/auth routes
4. DevTools check: confirm Inter font files are loaded
5. Build verification: ensure no build errors or warnings

## Non-Goals

- Changing fonts for guest or auth sections
- Custom font configurations for landing pages (handled separately)
- Adding font weight variations beyond what Inter provides by default
- Modifying root layout font definitions

## Risks and Mitigations

**Risk:** Duplicate font loading increases page weight  
**Mitigation:** Next.js font optimization minimizes impact; modern browsers cache efficiently

**Risk:** CSS variable inheritance might not cascade properly  
**Mitigation:** Wrapper div ensures font applies to entire subtree; standard CSS cascade rules apply

**Risk:** Font flash during initial load  
**Mitigation:** Next.js font optimization includes preloading and font-display controls

## Success Criteria

- Staff routes display text in Inter font
- Client routes display text in Inter font
- Guest and auth routes continue displaying text in Geist font
- No console errors or build warnings
- No visual regression in existing layouts
