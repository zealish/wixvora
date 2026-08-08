# CTA Section & Footer Component Design

**Date:** 2026-08-07  
**Status:** Approved  
**Reference:** `/home/zealish/Downloads/CTA&Footer.html`

## Overview

Add two final sections to complete the Wixvora landing page:

1. **CTA Section** — call-to-action with analytics dashboard mockup and mobile phone preview
2. **Footer Component** — comprehensive footer with brand info, link columns, and social media

Additionally, refactor layout structure by moving Navbar to `(guest)/layout.tsx` so it appears consistently across all guest pages.

## Context

**Current State:**

- Landing page: Navbar → HeroSection → FeaturesGrid → HowItWorks → TemplateShowcase → StatsSection
- Minimal footer in `(guest)/layout.tsx` (single copyright line)
- Navbar called from individual page component

**Requirements:**

- Convert HTML sections to modular Next.js components
- Match existing landing page style (Inter font, indigo/blue gradients, Lucide icons)
- Replace FontAwesome with Lucide React icons
- Semi-interactive analytics (hover states, no real data binding)
- SVG-based visuals (no external image dependencies)

## Architecture

### Component Structure

```
components/landing/
├── cta-section.tsx         (client component - hover interactions)
├── footer.tsx              (server component - static links)
└── index.ts                (barrel export)

app/(guest)/
└── layout.tsx              (updated - Navbar + Footer placement)
```

### Approach: Two-Component Split (Option C)

**Rationale:**

- CTA section (analytics + mobile mockup + copy) is one cohesive visual unit (~200 lines)
- Footer is logically separate, reusable across guest pages
- Balance between modularity and simplicity
- Avoids over-engineering (Option B) and overly-large single file (Option A)

## Component 1: CTA Section

### File: `components/landing/cta-section.tsx`

**Type:** Client component (`"use client"`)  
**Reason:** Hover interactions on analytics dropdown, mobile mockup rotation

### Layout

**Grid Structure:**

- Container: `max-w-[1340px]` responsive padding
- Grid: 1 column mobile, 12 columns desktop
- Left content: `lg:col-span-5`
- Right visual: `lg:col-span-7`

### Left Content Column

**Badge:**

- Text: "READY TO GET STARTED?"
- Style: `bg-indigo-50 border-indigo-100 text-indigo-600`, rounded-full, uppercase, xs font, bold, tracking-wider

**Heading:**

- Text: "Ready to build your dream website?"
- Style: `text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]`

**Description:**

- Text: "Join thousands of users who build smarter and launch faster with Wixvora."
- Style: `text-slate-500 text-base sm:text-lg leading-relaxed max-w-md`

**CTA Button:**

- Text: "Start Building for Free" + arrow icon (Lucide `ArrowRight`)
- Style: `bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700`, white text, rounded-xl, shadow-xl with indigo glow
- Hover: `hover:shadow-indigo-500/45 hover:scale-[1.02]`
- Active: `active:scale-[0.98]`
- Gap between text and icon: `gap-3`

**Disclaimer:**

- Text: "No credit card required"
- Style: `text-xs text-slate-400 font-medium mt-3`

### Right Visual Column

**Background Elements:**

1. **Ambient Blob:** absolute positioned, indigo blur, `-z-10`
2. **Yellow Star Badge:** absolute top-right, amber-300, animated pulse (using CSS keyframe from HTML), hidden on mobile

### Analytics Dashboard Card

**Container:**

- Style: `bg-white/90 backdrop-blur border-slate-100/90 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]`
- Padding: `p-6 sm:p-7`
- Z-index: `z-10` (below mobile mockup)

**Header:**

- Title: "Analytics Overview" (bold slate-900)
- Dropdown: "Last 30 days" with chevron-down icon (Lucide `ChevronDown`)
- Dropdown style: `bg-slate-50 border-slate-200/80 rounded-lg hover:bg-slate-100`
- **Interaction:** Hover state only, no functional dropdown

**Stat Boxes (Grid 3 columns):**

1. **Visitors:**
   - Value: 12,984
   - Change: ↑8.5% (emerald-600)

2. **Page Views:**
   - Value: 28,421
   - Change: ↑12.6% (emerald-600)

3. **Conversions:**
   - Value: 3,882
   - Change: ↑16.3% (emerald-600)

**Box Style:**

- Background: `bg-slate-50/70 border-slate-100 rounded-xl`
- Label: `text-[11px] text-slate-400`
- Value: `text-base sm:text-2xl font-bold text-slate-900`
- Change: `text-[10px] sm:text-xs font-semibold text-emerald-600`

**Line Chart:**

**Structure:**

- SVG viewBox: `0 0 400 120`, `preserveAspectRatio="none"`
- Y-axis labels: 20K, 15K, 10K, 5K, 0 (text-[10px] slate-400)
- X-axis labels: May 5, May 12, May 19, May 26, May 30 (text-[10px] slate-400)
- Dashed grid lines: horizontal at 0, 1/4, 1/2, 3/4 (border-dashed border-slate-100)

**SVG Path:**

- Smooth curve: `d="M 0 75 Q 30 60, 60 40 T 120 70 T 180 50 T 240 70 T 300 20 T 360 45 T 400 15"`
- Stroke: `#6366f1` (indigo-500), width 2.5, linecap round
- Fill: `linearGradient` from indigo-500/15% to indigo-500/0% (top to bottom)
- Data points: 8 circles (r=3.5) at key coordinates, white stroke, indigo fill

### Mobile Phone Mockup

**Positioning:**

- Absolute: `-right-2 sm:-right-6 top-10 sm:top-12`
- Width: `w-48 sm:w-56`
- Z-index: `z-20` (overlaps analytics card)
- Hidden on mobile: `hidden sm:block`

**Frame:**

- Background: `bg-slate-900` with rounded-[28px]
- Border: `border-slate-700/50`
- Shadow: `shadow-2xl shadow-slate-900/40`
- Transform: `rotate-1 hover:rotate-0 transition-transform duration-300`

**Screen:**

- Background: `bg-slate-950 rounded-[22px] border-slate-800`
- Height: `h-72`

**Header:**

- Wixvora logo: SVG gradient (blue-500 → indigo-600)
- Logo size: 14x14
- Text: "WIXVORA" (text-[10px] font-extrabold)
- Hamburger icon: Lucide `Menu` (text-xs slate-400)
- Border-bottom: slate-800/80

**Content Area:**

- Background: `bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950`
- Overlay: `bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent`

**SVG Background Pattern:**

- Replace Unsplash image with inline SVG mountain/landscape silhouette
- Style: Abstract geometric mountains using `<path>` elements
- Colors: Gradient from slate-700 to slate-800
- Opacity: 40%
- Position: absolute top, h-28

**Content Text:**

- Heading: "Build your brand online" (text-sm font-extrabold)
- Description: "Create a professional website that helps your business grow and stand out." (text-[10px] slate-400)
- Button: "Get Started" (bg-indigo-600 hover:bg-indigo-500, text-[10px])

### Animations

**CSS Keyframes (in globals.css if not already present):**

```css
@keyframes floatSlow {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(3deg);
  }
}

@keyframes pulseSoft {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}
```

## Component 2: Footer

### File: `components/landing/footer.tsx`

**Type:** Server component (no interactivity, pure static links)

### Layout

**Background:**

- `bg-[#f8f9fc]` with `border-t border-slate-200/60`
- Padding: `pt-16 pb-12`

**Container:**

- Max width: `max-w-[1340px]`
- Responsive padding: `px-6 md:px-12`

**Grid:**

- Mobile: 2 columns
- Desktop: 12 columns
- Gap: `gap-8 lg:gap-12`
- Bottom border: `border-b border-slate-200/80 pb-16`

### Brand Column (col-span-2 md:col-span-4)

**Logo:**

- Wixvora SVG (28x28) with gradient (blue-500 → indigo-600)
- Same SVG as navbar and mobile mockup
- Text: "WIXVORA" (text-xl font-black slate-900)

**Tagline:**

- Text: "AI-powered website builder that helps you build smarter and launch faster."
- Style: `text-slate-500 text-sm leading-relaxed max-w-xs`

**Social Media Icons:**

- Icons: Facebook, Twitter, Instagram, LinkedIn (Lucide icons: `Facebook`, `Twitter`, `Instagram`, `Linkedin`)
- Container: `flex items-center space-x-2.5 pt-2`
- Style: `w-9 h-9 rounded-full bg-slate-200/60 text-slate-600`
- Hover: `hover:bg-indigo-600 hover:text-white transition-all duration-200`
- Links: `href="#"` (placeholder)

### Link Columns (each col-span-1 md:col-span-2)

**Column 1: Product**

- Features (`#features`)
- Templates (`#templates`)
- Pricing (`#pricing`)
- AI Tools (`#`)

**Column 2: Resources**

- Blog (`#`)
- Help Center (`#`)
- Tutorials (`#`)
- Community (`#`)

**Column 3: Company**

- About Us (`#`)
- Careers (`#`)
- Partner Program (`#`)
- Contact Us (`#`)

**Column 4: Legal**

- Privacy Policy (`#`)
- Terms of Service (`#`)
- Cookies Policy (`#`)

**Column Styling:**

- Header: `text-sm font-bold text-slate-900`
- List: `space-y-3`
- Links: `text-xs sm:text-sm text-slate-500 font-medium hover:text-indigo-600 transition-colors`

### Bottom Copyright Bar

- Border-top separator: `pt-8`
- Text: "© 2024 Wixvora. All rights reserved."
- Style: `text-center text-xs font-medium text-slate-500`

## Layout Refactor

### File: `app/(guest)/layout.tsx`

**Changes:**

1. Import `Navbar` from `@/components/landing`
2. Import `Footer` from `@/components/landing`
3. Remove existing minimal footer
4. Structure:
   ```tsx
   <div className="flex min-h-screen flex-col overflow-x-hidden">
     <Navbar />
     <main className="flex-1">{children}</main>
     <Footer />
   </div>
   ```

**Impact:**

- Navbar and Footer now appear on all pages under `(guest)` layout
- Remove `<Navbar />` from `app/(guest)/page.tsx`
- Landing page becomes pure content sections without nav/footer

### File: `app/(guest)/page.tsx`

**Updated Structure:**

```tsx
return (
  <>
    <HeroSection />
    <FeaturesGrid />
    <HowItWorks />
    <TemplateShowcase />
    <StatsSection />
    <CtaSection />
  </>
);
```

**Changes:**

- Remove `<Navbar />` (now in layout)
- Add `<CtaSection />` before closing
- Footer automatically renders from layout

## Icon Mapping

| FontAwesome (HTML)         | Lucide React  |
| -------------------------- | ------------- |
| `fa-arrow-right`           | `ArrowRight`  |
| `fa-chevron-down`          | `ChevronDown` |
| `fa-bars`                  | `Menu`        |
| `fa-brands fa-facebook-f`  | `Facebook`    |
| `fa-brands fa-twitter`     | `Twitter`     |
| `fa-brands fa-instagram`   | `Instagram`   |
| `fa-brands fa-linkedin-in` | `Linkedin`    |

## Responsive Behavior

### CTA Section

**Mobile (<640px):**

- Single column layout
- Mobile mockup hidden (`hidden sm:block`)
- Analytics card full width
- Text sizes reduced (text-4xl → text-base for values)

**Tablet (640px-1024px):**

- Still single column
- Mobile mockup visible, overlaps analytics card
- Stat values: text-base

**Desktop (1024px+):**

- 12-column grid layout
- Mobile mockup positioned absolute right
- Stat values: text-2xl

### Footer

**Mobile (<768px):**

- 2 columns grid
- Brand column spans 2 cols
- Link columns each span 1 col (2x2 layout)
- Text: xs

**Desktop (768px+):**

- 12 columns grid
- Brand: 4 cols
- Each link column: 2 cols
- Text: sm

## Styling Consistency

**Colors:**

- Primary gradient: `from-blue-600 via-indigo-600 to-indigo-700`
- Background: white, slate-50, `#f8f9fc`
- Text: slate-900 (headings), slate-500 (body), slate-400 (muted)
- Accent: indigo-600, blue-600
- Success: emerald-600

**Typography:**

- Font: Inter (via `--font-inter` CSS variable)
- Headings: font-black or font-bold, tracking-tight
- Body: font-normal or font-medium
- Button: font-semibold

**Shadows:**

- Cards: `shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]`
- Buttons: `shadow-xl shadow-indigo-500/30`
- Phone: `shadow-2xl shadow-slate-900/40`

**Transitions:**

- Duration: 200ms (links), 300ms (transforms)
- Easing: default ease
- Hover scales: 1.02 (buttons), 1.1 (small elements)

## Implementation Notes

### SVG Mountain Pattern for Mobile Mockup

Create abstract mountain silhouette using SVG paths:

- Use `<svg>` with viewBox matching container aspect ratio
- Multiple `<path>` elements for layered mountains
- `linearGradient` from slate-700 to slate-800
- Positioned absolute at top of content area
- Overlay gradient ensures text readability

Example structure:

```tsx
<svg className="absolute inset-x-0 top-0 h-28 opacity-40" viewBox="0 0 400 112">
  <defs>
    <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#334155" />
      <stop offset="100%" stopColor="#1e293b" />
    </linearGradient>
  </defs>
  <path
    d="M0,112 L0,80 L50,40 L100,60 L150,20 L200,50 L250,30 L300,55 L350,35 L400,60 L400,112 Z"
    fill="url(#mountain-gradient)"
  />
  <path
    d="M0,112 L0,90 L80,60 L160,80 L240,50 L320,70 L400,55 L400,112 Z"
    fill="url(#mountain-gradient)"
    opacity="0.7"
  />
</svg>
```

### Barrel Export Update

Add to `components/landing/index.ts`:

```ts
export { CtaSection } from "./cta-section";
export { Footer } from "./footer";
```

### TypeScript

All components strongly typed:

- No `any` types
- Explicit return types for React components
- Props interfaces if needed (none required for these components)

## Testing Considerations

**Visual Testing:**

- Verify analytics chart renders correctly across browsers
- Check mobile mockup rotation animation
- Test responsive breakpoints
- Verify icon rendering (Lucide imports)

**Interaction Testing:**

- Analytics dropdown hover state
- Mobile mockup hover rotation
- Footer link hover states
- Social media icon hover transitions
- CTA button hover/active states

**Accessibility:**

- All links have accessible text
- Icons have proper aria-labels where needed
- Color contrast meets WCAG AA
- Keyboard navigation works for all interactive elements

## Success Criteria

1. ✅ CTA section matches HTML reference design
2. ✅ Analytics dashboard semi-interactive (hover states)
3. ✅ Mobile mockup with SVG background (no external images)
4. ✅ Footer with 5 link columns + social media
5. ✅ Navbar moved to layout (appears on all guest pages)
6. ✅ All FontAwesome icons replaced with Lucide React
7. ✅ Responsive behavior matches original HTML
8. ✅ TypeScript compilation passes
9. ✅ Visual consistency with existing landing components
10. ✅ No external dependencies (images, CDN links)

## Files to Create/Modify

**Create:**

- `components/landing/cta-section.tsx`
- `components/landing/footer.tsx`

**Modify:**

- `components/landing/index.ts` (barrel export)
- `app/(guest)/layout.tsx` (add Navbar + Footer)
- `app/(guest)/page.tsx` (remove Navbar, add CtaSection)
- `app/globals.css` (add animation keyframes if not present)

**Total:** 2 new files, 4 modified files
