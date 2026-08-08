# Features Sections Design Specification

**Date:** 2026-08-06  
**Project:** Wixvora  
**Feature:** Landing Page - Features Grid & How It Works Sections

---

## Overview

Add two new sections below the hero section on the landing page: a features grid showcasing 6 key capabilities, and a 4-step "How Wixvora Works" process flow. Both sections convert from the static HTML file (`/home/zealish/Downloads/new_section.html`) into modular Next.js 16 server components.

---

## Goals

1. Maintain 100% visual fidelity to the original HTML sections
2. Create two separate, reusable server components
3. Follow existing landing page patterns (Tailwind CSS 4, Lucide icons, Inter font)
4. Maintain responsive design (mobile-first)
5. Preserve all hover animations and transitions

---

## Component Architecture

### File Structure

```
components/landing/
├── navbar.tsx              # Navigation header (existing)
├── hero-section.tsx        # Hero content section (existing)
├── builder-preview.tsx     # Interactive builder demo (existing)
├── demo-modal.tsx          # Video modal (existing)
├── features-grid.tsx       # NEW: 6 feature cards grid
├── how-it-works.tsx        # NEW: 4-step process flow
└── index.ts                # Barrel export (update)

app/(guest)/
└── page.tsx                # Main landing page (update to include new sections)
```

### Component Breakdown

#### 1. **Features Grid Component** (`features-grid.tsx`)

- **Type:** Server Component
- **Purpose:** Showcase 6 key platform features in a grid layout
- **Structure:**
  - Section wrapper: `bg-slate-50/60` background, `py-20` padding, top border
  - Container: `max-w-[1280px]` centered with responsive padding
  - Header area (centered):
    - Pill badge: "AI MADE EASY" (indigo-50 background, indigo-600 text, uppercase, bold, tracking-widest)
    - Heading: "Everything you need to build amazing websites" (3xl → 4xl → 42px responsive)
    - Subtitle: "Powerful features to bring your ideas to life, faster and easier."
  - Feature cards grid:
    - Layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    - Gap: `gap-6`
    - 6 cards total

**Feature Cards (each):**

- Background: white with border, rounded-3xl
- Shadow: `shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]` → `hover:shadow-lg`
- Padding: `p-8`
- Icon box:
  - Size: `w-14 h-14`
  - Background: `bg-indigo-50/80`, `text-indigo-600`
  - Rounded: `rounded-2xl`
  - Hover: `group-hover:scale-110 transition-transform`
- Title: `text-lg font-bold text-slate-900`
- Description: `text-slate-500 text-sm leading-relaxed`

**6 Features:**

1. AI Website Generation (Sparkles icon)
2. Drag & Drop Builder (Layers icon)
3. Responsive Design (Smartphone icon)
4. SEO Optimized (TrendingUp icon)
5. Smart Content (Rocket icon)
6. Publish Instantly (Send icon)

#### 2. **How It Works Component** (`how-it-works.tsx`)

- **Type:** Server Component
- **Purpose:** Show 4-step process flow with visual connectors
- **Structure:**
  - Section wrapper: continues `bg-slate-50/60` from features section
  - Container: `max-w-[1280px]` centered, `space-y-12`
  - Header: "How Wixvora Works" (centered, 3xl → 4xl responsive)
  - Steps grid:
    - Layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
    - Gap: `gap-8`
    - 4 steps with connector lines between them

**Step Component (each):**

- Layout: flex column, centered, text-center
- Number badge:
  - Size: `w-8 h-8`
  - Background: `bg-indigo-600`
  - Text: white, bold, xs
  - Shadow: `shadow-md shadow-indigo-500/30`
  - Positioned with connector line container
- Connector line (desktop only):
  - Hidden on mobile/tablet: `hidden lg:block`
  - Absolute positioned: `top-1/2 left-[50%] right-[-50%]`
  - Style: `border-t-2 border-dashed border-indigo-200`
  - Not shown after last step (step 4)
- Icon box:
  - Size: `w-20 h-20`
  - Background: `bg-indigo-50/90`, `text-indigo-600`
  - Rounded: `rounded-2xl`
  - Hover: `group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white`
  - Transition: `transition-all duration-300`
- Title: `text-lg font-bold text-slate-900`
- Description: `text-slate-500 text-sm leading-relaxed max-w-[210px]`

**4 Steps:**

1. Tell AI Your Idea (Sparkles icon) - "Answer a few questions about your website."
2. AI Builds Your Website (Laptop icon) - "Our AI generates a complete website tailored for you."
3. Customize & Edit (Wand2 icon) - "Edit content, images, and design with our easy drag & drop builder."
4. Publish & Go Live (Globe icon) - "Publish your website and share it with the world."

---

## Styling Implementation

### Colors

- Background: `bg-slate-50/60` (60% opacity slate-50)
- Border: `border-slate-100/80` (80% opacity slate-100)
- Text:
  - Headings: `text-slate-900`
  - Body: `text-slate-500`
  - Badge: `text-indigo-600`
- Icon backgrounds:
  - Default: `bg-indigo-50/80` or `bg-indigo-50/90`
  - Hover: `bg-indigo-600` with `text-white`

### Shadows

- Card default: `shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]`
- Card hover: `hover:shadow-lg`
- Number badge: `shadow-md shadow-indigo-500/30`

### Transitions

- All hover effects: `transition-all duration-300`
- Icon scale: `transition-transform`

### Typography

- Badge: `text-[11px] font-bold tracking-widest uppercase`
- Main heading: `text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight leading-tight`
- Subtitle: `text-base sm:text-lg font-normal`
- Card title: `text-lg font-bold`
- Card description: `text-sm leading-relaxed`

---

## Icon Mapping (FontAwesome → Lucide)

| Original FA Icon          | Lucide Replacement | Used In              |
| ------------------------- | ------------------ | -------------------- |
| fa-sparkles               | Sparkles           | Features #1, Step #1 |
| fa-layer-group            | Layers             | Features #2          |
| fa-mobile-screen-button   | Smartphone         | Features #3          |
| fa-magnifying-glass-chart | TrendingUp         | Features #4          |
| fa-rocket                 | Rocket             | Features #5          |
| fa-paper-plane            | Send               | Features #6          |
| fa-laptop-code            | Laptop             | Step #2              |
| fa-wand-magic-sparkles    | Wand2              | Step #3              |
| fa-globe                  | Globe              | Step #4              |

---

## Integration with Existing Code

### Update `app/(guest)/page.tsx`

Add imports and render new sections:

```typescript
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";

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
      <FeaturesGrid />
      <HowItWorks />
    </>
  );
}
```

### Update `components/landing/index.ts`

Add barrel exports:

```typescript
export { Navbar } from "./navbar";
export { HeroSection } from "./hero-section";
export { BuilderPreview } from "./builder-preview";
export { DemoModal } from "./demo-modal";
export { FeaturesGrid } from "./features-grid";
export { HowItWorks } from "./how-it-works";
```

---

## Technical Considerations

### Server Components Only

Both new components are server components (no "use client" directive):

- No interactive state needed
- Pure presentational components
- Hover effects handled via CSS
- Optimal for performance (no JavaScript shipped for these sections)

### Responsive Strategy

**Mobile (< 640px):**

- Single column layout
- No connector lines in How It Works
- Full-width cards

**Tablet (640px - 1023px):**

- Features: 2-column grid
- How It Works: 2-column grid
- Still no connector lines

**Desktop (≥ 1024px):**

- Features: 3-column grid
- How It Works: 4-column grid
- Connector lines visible between steps

### Performance

- No JavaScript required for these sections
- CSS-only animations (GPU-accelerated transform/opacity)
- Inlined SVG icons via Lucide React (no additional requests)
- No additional CSS files needed (all Tailwind classes)

### Accessibility

- Semantic HTML structure (section, h2, h3, p)
- Proper heading hierarchy (h2 for section titles, h3 for card/step titles)
- Icon components include proper aria-hidden or aria-label as needed
- Sufficient color contrast ratios (slate-900 on white, slate-500 on white)

---

## Component Props & Types

Both components have no props (fully self-contained):

```typescript
// features-grid.tsx
export function FeaturesGrid(): JSX.Element;

// how-it-works.tsx
export function HowItWorks(): JSX.Element;
```

Future enhancement could add props for:

- Custom feature data (array of feature objects)
- Custom step data (array of step objects)
- Section IDs for anchor navigation
- Visibility toggles

---

## Out of Scope

- Navigation links to individual feature pages (cards not clickable)
- Animation on scroll (could be added with Intersection Observer later)
- Custom feature/step data from CMS
- A/B testing different feature sets
- Metrics/analytics tracking on feature views

---

## Success Criteria

1. ✅ Visual output matches original HTML exactly
2. ✅ Responsive layout works across all breakpoints
3. ✅ Hover animations smooth and performant
4. ✅ Connector lines show/hide correctly based on viewport
5. ✅ Components are modular and reusable
6. ✅ Type-safe (TypeScript)
7. ✅ No console errors or warnings
8. ✅ Proper semantic HTML structure

---

## Dependencies

**No new dependencies required.** Uses existing:

- React 19
- Next.js 16
- Tailwind CSS 4
- TypeScript
- Lucide React (for icons)

---

## Implementation Notes

1. **Section background continuity:** Both sections share `bg-slate-50/60` to create a unified background block below the hero
2. **Spacing consistency:** Use `py-20` section padding and `space-y-24` between major content blocks (matching existing hero section pattern)
3. **Max width:** Container uses `max-w-[1280px]` to match hero section width
4. **Grid gaps:** `gap-6` for feature cards, `gap-8` for workflow steps
5. **Connector line z-index:** Position connector lines behind number badges using `-z-10`
6. **Group hover:** Use `group` class on parent and `group-hover:` variants for child hover effects
7. **Icon sizing:** Features use `w-14 h-14` icons, workflow steps use `w-20 h-20` icons for visual hierarchy
8. **Text constraints:** Workflow step descriptions have `max-w-[210px]` to prevent text from expanding too wide in desktop grid

---

## Future Enhancements (Not in Scope)

- Animate on scroll (fade in, slide up)
- Feature comparison table
- Video/GIF demos for each feature
- Interactive step-through wizard
- Customer testimonials between sections
- Feature usage analytics
- CMS integration for dynamic content
- Multi-language support
