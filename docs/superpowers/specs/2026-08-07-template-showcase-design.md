# Template Showcase & Stats Design Specification

**Date:** 2026-08-07  
**Project:** Wixvora  
**Feature:** Landing Page - Template Showcase & Statistics Section

---

## Overview

Add two new sections to the landing page: an interactive 3D template carousel showcasing website templates, and a statistics section displaying social proof metrics. Both sections convert from the static HTML file (`/home/zealish/Downloads/template_showcase_webpage.html`) into modular Next.js 16 components.

---

## Goals

1. Maintain 100% visual fidelity to the original HTML sections
2. Create two separate, reusable components (TemplateShowcase + StatsSection)
3. Follow existing landing page patterns (Tailwind CSS 4, Lucide icons, Inter font)
4. Implement 3D carousel using Swiper React
5. Use Next.js Image placeholders for template mockups
6. Maintain responsive design (mobile-first)
7. Preserve all carousel interactions and transitions

---

## Component Architecture

### File Structure

```
components/landing/
├── navbar.tsx              # Navigation header (existing)
├── hero-section.tsx        # Hero content section (existing)
├── builder-preview.tsx     # Interactive builder demo (existing)
├── demo-modal.tsx          # Video modal (existing)
├── features-grid.tsx       # Features grid (existing)
├── how-it-works.tsx        # Process flow (existing)
├── template-showcase.tsx   # NEW: 3D template carousel
├── stats-section.tsx       # NEW: Statistics grid
└── index.ts                # Barrel export (update)

app/(guest)/
└── page.tsx                # Main landing page (update to include new sections)
```

### Landing Page Flow

```
Navbar
  ↓
HeroSection
  ↓
FeaturesGrid
  ↓
HowItWorks
  ↓
TemplateShowcase  ← NEW
  ↓
StatsSection      ← NEW
```

### Component Breakdown

#### 1. **Template Showcase Component** (`template-showcase.tsx`)

- **Type:** Client Component ("use client")
- **Purpose:** Interactive 3D coverflow carousel showcasing template mockups
- **Dependencies:**
  - `swiper` (npm package - NEW)
  - `swiper/react` (React wrapper)
  - `swiper/css` (base styles)
  - `swiper/css/effect-coverflow` (coverflow effect)
  - `swiper/css/pagination` (pagination dots)
  - Lucide React `ArrowRight` icon (existing)

**Structure:**

- Section wrapper: `py-16 lg:py-24`, `px-4 md:px-12 lg:px-16`, `max-w-[1440px] mx-auto`
- Main grid: `grid-cols-1 lg:grid-cols-12`, `gap-8`, `items-center`
- Two columns:
  - Left (lg:col-span-5): Marketing copy
  - Right (lg:col-span-7): Swiper carousel

**Left Column Content:**

1. **Badge:**
   - Text: "PROFESSIONAL TEMPLATES"
   - Classes: `inline-flex items-center px-3.5 py-1.5 rounded-full`
   - Background: `bg-indigo-50`
   - Border: `border border-indigo-100`
   - Text: `text-indigo-600 text-xs font-semibold tracking-wide uppercase`

2. **Heading:**
   - Text: "Beautiful templates for every business"
   - Classes: `text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.15]`

3. **Subtitle:**
   - Text: "Choose from 100+ professionally designed templates that you can fully customize."
   - Classes: `text-slate-600 text-lg sm:text-xl font-normal leading-relaxed max-w-md`

4. **CTA Button:**
   - Text: "Explore Templates" + ArrowRight icon
   - Classes: `inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl`
   - Background: `bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700`
   - Text: `text-white font-semibold text-base`
   - Shadow: `shadow-lg shadow-indigo-500/25`
   - Hover: `hover:shadow-indigo-500/40 hover:scale-[1.02]`
   - Active: `active:scale-[0.98]`
   - Transition: `transition-all duration-200`

**Right Column - Swiper Carousel:**

**Swiper Configuration:**
```typescript
{
  effect: 'coverflow',
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 'auto',
  loop: true,
  initialSlide: 0,
  coverflowEffect: {
    rotate: 0,
    stretch: 20,
    depth: 120,
    modifier: 1,
    slideShadows: false,
  },
  pagination: {
    clickable: true,
  },
}
```

**Swiper Container Styling:**
- Width: 100%
- Padding: `pt-5 pb-10`
- Overflow: `overflow-visible` (allows 3D effect to show outside bounds)

**Slide Dimensions:**
- Width: `580px` (or `max-w-[90vw]` on mobile)
- Min height: `300px sm:340px`

**Slide States:**
- **Inactive slides:**
  - Opacity: `0.5`
  - Transform: `scale(0.88)`
  - Filter: `blur(1px)`
  - Transition: `all 0.4s ease`
- **Active slide (swiper-slide-active):**
  - Opacity: `1`
  - Transform: `scale(1.05)`
  - Filter: `blur(0px)`
  - Z-index: `10`

**3 Template Slides (Placeholder Data):**

**Slide 1: GreenScape**
- Browser header:
  - Brand: "Green**Scape**" (Scape in emerald-700, italic, serif)
  - Nav links: Home, About, Services, Projects, Contact (text-xs, font-medium)
  - Background: white, border-b
- Body:
  - Background: `bg-slate-50/50`, padding, min-height
  - Heading: "Beautiful spaces, better living."
  - Subtitle: "We design sustainable indoor and outdoor spaces..."
  - Button: "Discover More" (emerald-900 bg)
  - Placeholder image: Right side, emerald gradient fallback

**Slide 2: AURORA**
- Browser header:
  - Brand: "AURORA" (uppercase, bold, tracking-wider)
  - Window controls: minimize/maximize/close icons (FontAwesome replaced with Lucide: Minus, Square, X)
- Body:
  - Background: `bg-slate-100/70`
  - Left text: "Minimal. Modern. Sustainable." (uppercase, mono, tracking-widest)
  - Center: Portrait image placeholder with floating info card
  - Card text: "Fully customizable / Easy to use"

**Slide 3: LUMINA Tech**
- Browser header:
  - Dot indicator: `w-3 h-3 rounded-full bg-indigo-500`
  - Brand: "LUMINA.AI" (bold, tracking-tight)
  - Nav: "Products · API · Pricing" (text-xs, slate-400)
- Body:
  - Background: `bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900`
  - Heading prefix: "# NextGen AI Platform" (indigo-400, font-mono, text-xs)
  - Heading: "Empower your workflow with intelligent code."
  - CTA buttons: "Get Started" (indigo-600 bg) + "Docs" (border)

**Custom Pagination:**
- Container: `flex items-center justify-center gap-3 mt-2.5`
- Prev/Next buttons:
  - Lucide ChevronLeft/ChevronRight icons
  - Color: `text-slate-400`
  - Hover: `hover:text-blue-500`
  - Size: `text-sm`
  - Cursor: pointer
- Pagination dots:
  - Default: `w-2 h-2 bg-slate-300 rounded-full`
  - Active: `w-7 bg-blue-500 rounded-full`
  - Transition: `all 0.3s ease`

**Custom CSS (add to globals.css):**

```css
/* Swiper Template Showcase Overrides */
.template-swiper {
  width: 100%;
  padding-top: 20px;
  padding-bottom: 40px;
  overflow: visible !important;
}

.template-swiper .swiper-slide {
  width: 580px;
  max-width: 90vw;
  border-radius: 16px;
  transition: all 0.4s ease;
  opacity: 0.5;
  transform: scale(0.88);
  filter: blur(1px);
}

.template-swiper .swiper-slide-active {
  opacity: 1;
  transform: scale(1.05);
  filter: blur(0px);
  z-index: 10;
}

.template-swiper .swiper-pagination-bullet {
  width: 8px;
  height: 8px;
  background-color: #cbd5e1;
  opacity: 1;
  border-radius: 9999px;
  transition: all 0.3s ease;
  margin: 0 !important;
}

.template-swiper .swiper-pagination-bullet-active {
  width: 28px;
  background-color: #3b82f6;
}
```

**Image Placeholders:**
- Use Next.js Image component with placeholder gradients
- GreenScape: `from-emerald-100 to-emerald-200` gradient
- Aurora: `from-slate-100 to-slate-200` gradient
- Lumina: Dark gradient (already in design)
- Alt text for each template name
- Width/height attributes for proper aspect ratio

---

#### 2. **Stats Section Component** (`stats-section.tsx`)

- **Type:** Server Component
- **Purpose:** Display social proof statistics in a grid layout

**Structure:**

- Section wrapper: `w-full mt-12 lg:mt-16`
- Container card:
  - Background: `bg-slate-50/80`
  - Border: `border border-slate-100`
  - Rounded: `rounded-3xl`
  - Padding: `p-8 sm:p-10 md:p-12`
  - Shadow: `shadow-sm`
  - Text: `text-center`

**Header Text:**
- Text: "Trusted by creators and businesses worldwide"
- Classes: `text-slate-600 font-medium text-sm sm:text-base mb-8 sm:mb-10 tracking-wide`

**Stats Grid:**
- Layout: `grid grid-cols-2 md:grid-cols-4`
- Gap: `gap-8 md:gap-4`
- Dividers: `divide-y md:divide-y-0 md:divide-x divide-slate-200/60`
  - Mobile: horizontal dividers between rows
  - Desktop: vertical dividers between columns

**4 Statistics:**

1. **Websites Created**
   - Number: "10K+"
   - Label: "Websites Created"
   - Color: `text-blue-600`

2. **Happy Users**
   - Number: "50K+"
   - Label: "Happy Users"
   - Color: `text-blue-600`

3. **Templates**
   - Number: "100+"
   - Label: "Templates"
   - Color: `text-blue-600`

4. **Uptime**
   - Number: "99.9%"
   - Label: "Uptime"
   - Color: `text-indigo-600`

**Stat Item Structure (each):**
- Container: `flex flex-col items-center justify-center pt-4 md:pt-0`
- Number:
  - Classes: `text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight`
  - Color: varies per stat (blue-600 or indigo-600)
- Label:
  - Classes: `text-xs sm:text-sm font-medium text-slate-600 mt-2`

---

## Integration

### Update `components/landing/index.ts`

Add exports:
```typescript
export { TemplateShowcase } from "./template-showcase";
export { StatsSection } from "./stats-section";
```

### Update `app/(guest)/page.tsx`

Import and render new sections:
```typescript
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";

// In JSX:
<Navbar />
<HeroSection />
<FeaturesGrid />
<HowItWorks />
<TemplateShowcase />
<StatsSection />
```

---

## Dependencies

### New Package Installation

```bash
pnpm add swiper
```

**Package:** `swiper@^11.0.0`
- Official Swiper.js library with React support
- Includes TypeScript definitions
- Bundle size: ~40KB gzipped (with coverflow effect)

---

## Responsive Behavior

### TemplateShowcase

**Mobile (< 640px):**
- Single column layout
- Carousel slides at 90vw max-width
- Reduced padding
- Stacked content (copy above carousel)

**Tablet (640px - 1024px):**
- Single column layout
- Larger slides (up to 580px)
- Increased spacing

**Desktop (> 1024px):**
- Two-column grid (5-7 split)
- Full carousel effect visible
- Side-by-side content

### StatsSection

**Mobile (< 768px):**
- 2-column grid (2x2)
- Horizontal dividers between rows
- Smaller text sizes (3xl numbers)
- Reduced padding

**Tablet (768px - 1024px):**
- 4-column grid (1x4)
- Vertical dividers
- Medium text sizes (4xl numbers)

**Desktop (> 1024px):**
- 4-column grid
- Vertical dividers
- Large text sizes (5xl numbers)
- Full padding

---

## Accessibility

### TemplateShowcase
- Carousel navigation buttons have `aria-label` attributes
- Swiper includes keyboard navigation by default
- Focus states on interactive elements
- Alt text on all template placeholder images

### StatsSection
- Semantic HTML structure
- Proper heading hierarchy
- High contrast text (WCAG AA compliant)
- Screen reader friendly number formatting

---

## Performance Considerations

1. **Swiper lazy loading:** Template slides load as needed
2. **Image optimization:** Use Next.js Image component with proper sizing
3. **CSS scoping:** Swiper custom styles scoped to `.template-swiper` class
4. **Client component isolation:** Only TemplateShowcase is client-side
5. **Bundle impact:** Swiper adds ~40KB, tree-shaken to only include coverflow effect

---

## Visual Fidelity Checklist

### TemplateShowcase
- ✓ Badge styling matches original (indigo theme)
- ✓ Heading sizes and weights match
- ✓ Gradient button with proper hover states
- ✓ 3D coverflow effect with exact transform values
- ✓ Active/inactive slide opacity and blur
- ✓ Custom pagination dots (pill-shaped active state)
- ✓ Prev/Next chevron buttons
- ✓ Three template mockups with browser chrome
- ✓ Proper spacing and alignment

### StatsSection
- ✓ Rounded card container with subtle background
- ✓ Centered text alignment
- ✓ Grid layout with dividers
- ✓ Number sizes (3xl → 4xl → 5xl responsive)
- ✓ Color coding (blue-600 for most, indigo-600 for uptime)
- ✓ Proper spacing and padding
- ✓ Clean, minimal aesthetic

---

## Testing Requirements

1. **Carousel functionality:**
   - Swipe/drag works on touch devices
   - Prev/Next buttons navigate correctly
   - Pagination dots update on slide change
   - Loop behavior works seamlessly
   - Active slide scaling/opacity transitions smooth

2. **Responsive layout:**
   - Test all breakpoints (mobile, tablet, desktop)
   - Carousel adapts to screen size
   - Stats grid reflows correctly
   - Text sizes scale appropriately

3. **Visual verification:**
   - Compare side-by-side with original HTML
   - Check all animations and transitions
   - Verify colors, shadows, borders match
   - Confirm typography matches

4. **Accessibility:**
   - Keyboard navigation works in carousel
   - Screen reader announces slides correctly
   - Focus indicators visible
   - Proper semantic HTML

---

## Notes

- Original HTML uses FontAwesome for window control icons; replaced with Lucide (Minus, Square, X)
- Original uses Unsplash URLs; replaced with Next.js Image placeholders (gradients)
- Stats data is static placeholder content (10K+, 50K+, 100+, 99.9%)
- Swiper CSS imported at component level (not globally)
- Custom Swiper overrides added to `globals.css` under scoped class
- Template mockups are simplified versions for MVP (can be enhanced later with real screenshots)

---

## Future Enhancements (Out of Scope)

- Dynamic template data from CMS/database
- Real template screenshots from Wixvora platform
- Filter/category tabs above carousel
- "View Template" buttons on hover
- Template details modal on click
- Live stats from analytics API
- Animated number counters on scroll into view

---

## Success Criteria

1. TemplateShowcase renders 3D carousel with smooth transitions
2. StatsSection displays 4 metrics in responsive grid
3. Both components integrate seamlessly into landing page flow
4. Visual output matches original HTML at 100% fidelity
5. TypeScript compilation passes with no errors
6. No console warnings or errors
7. Carousel works on mobile/desktop touch and mouse
8. All responsive breakpoints render correctly
