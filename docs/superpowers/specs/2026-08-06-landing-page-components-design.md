# Landing Page Components Design Specification

**Date:** 2026-08-06  
**Project:** Wixvora  
**Feature:** Landing Page (Navbar + Hero Section)

---

## Overview

Convert the existing HTML landing page (`/home/zealish/Downloads/wixvora_hero_section.html`) into modular Next.js 16 components following best practices. The landing page includes a navigation bar, hero section with marketing copy, an interactive builder preview demo, and a video demo modal.

---

## Goals

1. Maintain 100% visual and functional fidelity to the original HTML
2. Create reusable, maintainable React components
3. Follow Next.js 16 conventions (App Router, Server/Client Components)
4. Preserve all interactivity (device switcher, color picker, spacing slider, editable content)
5. Use Tailwind CSS for styling with custom animations
6. Optimize for responsive design (mobile-first)

---

## Component Architecture

### File Structure

```
components/landing/
├── navbar.tsx              # Navigation header (server component)
├── hero-section.tsx        # Hero content section (server component)
├── builder-preview.tsx     # Interactive builder demo (client component)
├── demo-modal.tsx          # Video modal (client component)
└── landing-styles.css      # Custom animations & styles

app/(guest)/
└── page.tsx                # Main landing page (composes all components)
```

### Component Breakdown

#### 1. **Navbar Component** (`navbar.tsx`)
- **Type:** Server Component
- **Purpose:** Top navigation header
- **Contents:**
  - Wixvora logo (SVG with gradient)
  - Desktop navigation links (Features, Templates, Pricing, Resources with dropdown icon)
  - Auth links (Log in button)
  - Primary CTA button (Get Started Free)
- **Styling:** Tailwind classes, gradient button, hover effects
- **Responsive:** Hidden navigation on mobile (md:flex)

#### 2. **Hero Section Component** (`hero-section.tsx`)
- **Type:** Server Component (wrapper), contains BuilderPreview client component
- **Purpose:** Main hero area with marketing copy and builder preview
- **Contents:**
  - Background ambient glows (animated blur circles)
  - Left column:
    - Pill badge ("AI-POWERED WEBSITE BUILDER")
    - Large headline with gradient text
    - Subtitle description
    - CTA buttons (Start Building, Watch Demo)
    - Feature checkmarks grid (4 features)
  - Right column:
    - BuilderPreview component (interactive demo)
    - Decorative sparkle/star SVG elements
- **Styling:** Grid layout (lg:grid-cols-12), animations, gradient text

#### 3. **Builder Preview Component** (`builder-preview.tsx`)
- **Type:** Client Component ("use client")
- **Purpose:** Interactive website builder demo interface
- **State Management:**
  - `deviceView`: "desktop" | "mobile" (useState)
  - `bgColor`: string (useState, default "#ffffff")
  - `spacing`: number (useState, default 20)
  - Canvas background color control
  - Canvas padding control
- **Contents:**
  - Top toolbar:
    - Mini logo
    - Device switcher (desktop/mobile buttons)
    - Preview/Publish buttons
  - Left sidebar:
    - Tool buttons (Add, Pages, Design, Media, AI Tools, Settings)
  - Center canvas:
    - Editable content (contentEditable heading & paragraph)
    - Selection box with resize handles
    - Sample image card with overlay
  - Right panel:
    - Section/Style tabs
    - Layout selector grid (4 options)
    - Background color picker
    - Spacing range slider
- **Interactivity:**
  - Device view toggle changes canvas max-width
  - Color picker updates canvas background
  - Spacing slider updates canvas padding
  - Editable text fields

#### 4. **Demo Modal Component** (`demo-modal.tsx`)
- **Type:** Client Component ("use client")
- **Purpose:** Video demo modal overlay
- **State Management:**
  - `isOpen`: boolean (useState)
- **Contents:**
  - Backdrop overlay with blur
  - Modal card with close button
  - Video placeholder area with play icon
- **Interactivity:**
  - Opens when "Watch Demo" button clicked
  - Closes when X button clicked or backdrop clicked

---

## Styling Implementation

### Tailwind Configuration Extensions

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)', 'sans-serif'],
    },
    colors: {
      brand: {
        50: '#eef2ff',
        100: '#e0e7ff',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        accent: '#3b82f6',
      }
    },
    boxShadow: {
      'builder': '0 20px 50px -12px rgba(79, 70, 229, 0.12), 0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      'panel': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
    }
  }
}
```

### Custom CSS (`landing-styles.css`)

```css
/* Gradient text utility */
.text-gradient {
  background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animations */
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(3deg); }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

.animate-float {
  animation: floatSlow 6s ease-in-out infinite;
}

.animate-pulse-soft {
  animation: pulseSoft 8s ease-in-out infinite;
}

/* Builder selection box */
.builder-selection-box {
  position: relative;
  outline: 2px solid #6366f1;
  outline-offset: 4px;
}

.builder-handle {
  width: 7px;
  height: 7px;
  background-color: #ffffff;
  border: 2px solid #6366f1;
  border-radius: 2px;
  position: absolute;
}

/* Range slider styling */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4F46E5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
```

### Font Configuration

Use `next/font/google` in `app/layout.tsx`:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
})
```

---

## Component Props & Types

### BuilderPreview Props
```typescript
interface BuilderPreviewProps {
  onDemoClick?: () => void; // Callback to open demo modal
}
```

### DemoModal Props
```typescript
interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

---

## Integration with Existing Code

### Update Guest Layout Page

Modify `app/(guest)/page.tsx`:

```typescript
import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import '@/components/landing/landing-styles.css';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.user.accountType === "CLIENT") {
      redirect("/client");
    } else {
      redirect("/staff");
    }
  }

  return (
    <>
      <Navbar />
      <HeroSection />
    </>
  );
}
```

The existing GuestLayout wrapper already provides the footer, so components only need to render the navbar and hero content.

---

## Technical Considerations

### Server vs Client Components

- **Server Components:** Navbar, HeroSection wrapper (static content, no interactivity)
- **Client Components:** BuilderPreview, DemoModal (interactive state)
- This split optimizes bundle size and leverages RSC benefits

### State Management Strategy

- Local component state using React useState (no global state needed)
- Props drilling for modal control (HeroSection → BuilderPreview → open modal callback)

### Accessibility

- Semantic HTML elements (nav, main, header, button)
- ARIA labels on interactive elements
- Keyboard navigation support for modal (Escape key to close)
- Focus management when modal opens/closes

### Performance

- SVG graphics inlined (small file size, no network requests)
- Image loading with Next.js Image component (optional enhancement)
- CSS animations use GPU-accelerated properties (transform, opacity)
- No external dependencies beyond existing project setup

### Responsive Design

- Mobile-first approach (existing HTML already responsive)
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Hidden elements on mobile (navigation links, decorative elements)
- Adjusted spacing and font sizes per breakpoint

---

## Out of Scope

- Functionality for navigation links (Features, Templates, Pricing, Resources dropdown)
- Authentication flow implementation (Log in, Get Started buttons)
- Actual video content for demo modal
- Backend integration for builder preview
- Mobile hamburger menu (not in original HTML)
- SEO metadata (can be added later)

---

## Success Criteria

1. ✅ Visual output matches original HTML exactly
2. ✅ All interactive features work (device switcher, color picker, spacing, modal)
3. ✅ Components are modular and reusable
4. ✅ Code follows Next.js 16 best practices
5. ✅ Responsive across all breakpoints
6. ✅ No console errors or warnings
7. ✅ Type-safe (TypeScript)
8. ✅ Accessible (keyboard navigation, ARIA labels)

---

## Dependencies

**No new dependencies required.** All features use:
- React 19 (existing)
- Next.js 16 (existing)
- Tailwind CSS (existing)
- TypeScript (existing)
- Lucide React icons (existing, though original uses FontAwesome - we'll convert)

**Note:** Original HTML uses FontAwesome CDN. We'll replace with Lucide React icons from the existing project setup to avoid adding external dependencies.

---

## Icon Mapping (FontAwesome → Lucide)

| FontAwesome Icon | Lucide Replacement |
|------------------|-------------------|
| fa-arrow-right | ArrowRight |
| fa-play | Play |
| fa-check | Check |
| fa-sparkles | Sparkles |
| fa-chevron-down | ChevronDown |
| fa-plus | Plus |
| fa-file | FileText |
| fa-wand-magic-sparkles | Wand2 |
| fa-image | Image |
| fa-gear | Settings |
| fa-desktop | Monitor |
| fa-mobile-screen-button | Smartphone |
| fa-xmark | X |
| fa-circle-play | PlayCircle |

---

## Implementation Notes

1. **Gradient SVG Logo:** Preserve exact SVG path and gradient definition from original
2. **ContentEditable:** Keep contentEditable attributes on heading/paragraph in canvas
3. **Image Fallback:** Use onerror handler for image fallback URL
4. **Color Picker Input:** Use HTML5 color input type with custom styling
5. **Range Slider:** Style webkit-slider-thumb for cross-browser consistency
6. **Modal Backdrop:** Use fixed positioning with backdrop-blur
7. **Animation Performance:** Use will-change CSS property for animated elements (optional)
8. **Z-index Management:** Maintain proper stacking context (modal > preview panel > canvas)

---

## Future Enhancements (Not in Scope)

- Dark mode support
- Internationalization (i18n)
- Analytics tracking
- A/B testing integration
- Progressive Web App (PWA) features
- Actual builder functionality
- Video player integration for demo modal
- Form validation for auth flows
- Cookie consent banner
- Live chat widget
