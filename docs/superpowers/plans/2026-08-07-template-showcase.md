# Template Showcase & Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive 3D template carousel and statistics section to landing page

**Architecture:** Two new components - TemplateShowcase (client component with Swiper.js carousel) and StatsSection (server component with responsive grid). Both integrate into existing guest landing page below HowItWorks section.

**Tech Stack:** Next.js 16, React 19, Swiper.js 11, Tailwind CSS 4, Lucide React, TypeScript

## Global Constraints

- Next.js 16.3.0 with App Router (server components by default, "use client" where needed)
- React 19 with TypeScript
- Tailwind CSS 4 with @theme inline syntax in globals.css (no tailwind.config.ts)
- Lucide React for all icons (no FontAwesome)
- Inter font already configured via next/font/google
- 100% visual fidelity to original HTML (`/home/zealish/Downloads/template_showcase_webpage.html`)
- Mobile-first responsive design
- No new dependencies except `swiper` package

---

## File Structure

### New Files

- `components/landing/template-showcase.tsx` - 3D carousel component (client)
- `components/landing/stats-section.tsx` - Statistics grid (server)

### Modified Files

- `components/landing/index.ts` - Add new component exports
- `app/(guest)/page.tsx` - Integrate new sections
- `app/globals.css` - Add Swiper custom styles
- `package.json` - Add swiper dependency

---

### Task 1: Install Swiper Dependency

**Files:**

- Modify: `package.json`

**Interfaces:**

- Consumes: None
- Produces: `swiper` package available for import

- [ ] **Step 1: Install swiper package**

```bash
pnpm add swiper
```

Expected output: `swiper` added to dependencies, `pnpm-lock.yaml` updated

- [ ] **Step 2: Verify installation**

```bash
pnpm list swiper
```

Expected: Shows `swiper 11.x.x` installed

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add swiper for template carousel"
```

---

### Task 2: Create StatsSection Component

**Files:**

- Create: `components/landing/stats-section.tsx`

**Interfaces:**

- Consumes: None
- Produces: `StatsSection` server component export

- [ ] **Step 1: Create StatsSection component file**

```tsx
export function StatsSection() {
  const stats = [
    { number: "10K+", label: "Websites Created", color: "text-blue-600" },
    { number: "50K+", label: "Happy Users", color: "text-blue-600" },
    { number: "100+", label: "Templates", color: "text-blue-600" },
    { number: "99.9%", label: "Uptime", color: "text-indigo-600" },
  ];

  return (
    <section className="mx-auto mt-12 w-full max-w-[1440px] px-4 md:px-12 lg:mt-16 lg:px-16">
      <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-8 text-center shadow-sm sm:p-10 md:p-12">
        <p className="mb-8 text-sm font-medium tracking-wide text-slate-600 sm:mb-10 sm:text-base">
          Trusted by creators and businesses worldwide
        </p>

        <div className="grid grid-cols-2 gap-8 divide-y divide-slate-200/60 md:grid-cols-4 md:gap-4 md:divide-x md:divide-y-0">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center pt-4 md:pt-0"
            >
              <div
                className={`text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${stat.color}`}
              >
                {stat.number}
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm types:check
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/stats-section.tsx
git commit -m "feat(landing): add StatsSection component"
```

---

### Task 3: Add Swiper Custom Styles

**Files:**

- Modify: `app/globals.css`

**Interfaces:**

- Consumes: None
- Produces: `.template-swiper` CSS class with custom Swiper overrides

- [ ] **Step 1: Add Swiper custom styles to globals.css**

Append to end of `app/globals.css`:

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

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "style: add Swiper custom styles for template carousel"
```

---

### Task 4: Create TemplateShowcase Component

**Files:**

- Create: `components/landing/template-showcase.tsx`

**Interfaces:**

- Consumes: `.template-swiper` CSS class from globals.css
- Produces: `TemplateShowcase` client component export

- [ ] **Step 1: Create TemplateShowcase component file**

```tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Square,
  X,
} from "lucide-react";
import type { Swiper as SwiperType } from "swiper";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export function TemplateShowcase() {
  const swiperRef = useRef<SwiperType | null>(null);

  const templates = [
    {
      id: 1,
      name: "GreenScape",
      brandName: "Green",
      brandAccent: "Scape",
      navLinks: ["Home", "About", "Services", "Projects", "Contact"],
      heading: "Beautiful spaces, better living.",
      subtitle:
        "We design sustainable indoor and outdoor spaces that inspire and rejuvenate.",
      ctaText: "Discover More",
      theme: {
        headerBg: "bg-white",
        bodyBg: "bg-slate-50/50",
        accentColor: "text-emerald-700",
        buttonBg: "bg-emerald-900 hover:bg-emerald-800",
        imageBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      },
    },
    {
      id: 2,
      name: "Aurora",
      brandName: "AURORA",
      navLinks: null,
      heading: null,
      subtitle: null,
      ctaText: null,
      theme: {
        headerBg: "bg-white",
        bodyBg: "bg-slate-100/70",
        accentColor: null,
        buttonBg: null,
        imageBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      },
    },
    {
      id: 3,
      name: "Lumina",
      brandName: "LUMINA.AI",
      navLinks: ["Products", "API", "Pricing"],
      heading: "Empower your workflow with intelligent code.",
      subtitle: "# NextGen AI Platform",
      ctaText: null,
      theme: {
        headerBg: "bg-slate-900",
        bodyBg: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
        accentColor: "text-indigo-400",
        buttonBg: null,
        imageBg: null,
      },
    },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-12 lg:px-16 lg:py-24">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left Column: Marketing Copy */}
        <div className="z-20 flex flex-col items-start space-y-6 pr-0 lg:col-span-5 lg:pr-4">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
            PROFESSIONAL TEMPLATES
          </div>

          <h2 className="text-4xl leading-[1.15] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
            Beautiful templates for every business
          </h2>

          <p className="max-w-md text-lg leading-relaxed font-normal text-slate-600 sm:text-xl">
            Choose from 100+ professionally designed templates that you can
            fully customize.
          </p>

          <a
            href="#explore"
            className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-indigo-500/40 active:scale-[0.98]"
          >
            Explore Templates
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Right Column: Swiper Carousel */}
        <div className="relative w-full overflow-hidden lg:col-span-7 lg:overflow-visible">
          <Swiper
            modules={[EffectCoverflow, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            initialSlide={0}
            coverflowEffect={{
              rotate: 0,
              stretch: 20,
              depth: 120,
              modifier: 1,
              slideShadows: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-custom-pagination",
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="template-swiper"
          >
            {templates.map((template) => (
              <SwiperSlide key={template.id}>
                {template.name === "GreenScape" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                    {/* Browser Header */}
                    <div
                      className={`${template.theme.headerBg} flex items-center justify-between border-b border-slate-100 px-6 py-4`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-slate-900">
                          {template.brandName}
                          <span
                            className={`${template.theme.accentColor} font-serif italic`}
                          >
                            {template.brandAccent}
                          </span>
                        </span>
                      </div>
                      <div className="hidden items-center space-x-6 text-xs font-medium text-slate-600 sm:flex">
                        {template.navLinks?.map((link, idx) => (
                          <span
                            key={idx}
                            className={
                              idx === 0
                                ? "cursor-pointer font-semibold text-slate-900"
                                : "cursor-pointer hover:text-slate-900"
                            }
                          >
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} relative flex min-h-[300px] items-center overflow-hidden p-6 sm:min-h-[340px] sm:p-8`}
                    >
                      <div className="z-10 max-w-[240px] space-y-3 sm:max-w-[280px]">
                        <h2 className="text-2xl leading-tight font-extrabold text-slate-900 sm:text-3xl">
                          {template.heading}
                        </h2>
                        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
                          {template.subtitle}
                        </p>
                        <button
                          className={`mt-2 rounded-lg px-4 py-2 ${template.theme.buttonBg} text-xs font-medium text-white transition`}
                        >
                          {template.ctaText}
                        </button>
                      </div>

                      {/* Placeholder Image */}
                      <div className="pointer-events-none absolute top-0 right-0 bottom-0 flex w-1/2 items-end justify-end p-2">
                        <div
                          className={`h-full w-full ${template.theme.imageBg} rounded-xl shadow-md`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Aurora" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                    {/* Browser Header */}
                    <div
                      className={`${template.theme.headerBg} flex items-center justify-between border-b border-slate-100 px-6 py-4`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold tracking-wider text-slate-900 uppercase">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400">
                        <Minus className="h-3 w-3" />
                        <Square className="h-2.5 w-2.5" />
                        <X className="h-3 w-3" />
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} relative flex min-h-[300px] items-center justify-between overflow-hidden p-6 sm:min-h-[340px] sm:p-8`}
                    >
                      <div className="space-y-1 font-mono text-xs tracking-widest text-slate-500 uppercase">
                        <div>Minimal.</div>
                        <div>Modern.</div>
                        <div>Sustainable.</div>
                      </div>

                      {/* Portrait Placeholder */}
                      <div className="relative h-[260px] w-[180px] overflow-hidden rounded-lg border border-white shadow-lg sm:w-[210px]">
                        <div
                          className={`h-full w-full ${template.theme.imageBg}`}
                        />

                        {/* Floating Tag */}
                        <div className="absolute bottom-3 -left-6 space-y-0.5 rounded-md border border-slate-100 bg-white/95 px-3 py-1.5 text-[10px] shadow-md backdrop-blur">
                          <div className="font-bold text-slate-800">
                            Fully customizable
                          </div>
                          <div className="text-slate-500">Easy to use</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Lumina" && (
                  <div
                    className={`${template.theme.headerBg} overflow-hidden rounded-2xl border border-slate-800 text-white shadow-2xl`}
                  >
                    {/* Browser Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span className="text-base font-bold tracking-tight">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {template.navLinks?.join(" • ")}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div
                      className={`${template.theme.bodyBg} flex min-h-[300px] flex-col justify-center p-8 sm:min-h-[340px]`}
                    >
                      <span
                        className={`${template.theme.accentColor} mb-2 font-mono text-xs`}
                      >
                        {template.subtitle}
                      </span>
                      <h2 className="text-2xl leading-tight font-bold sm:text-3xl">
                        {template.heading}
                      </h2>
                      <div className="mt-6 flex gap-3">
                        <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold">
                          Get Started
                        </span>
                        <span className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300">
                          Docs
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Pagination Controls */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-blue-500"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="swiper-custom-pagination flex items-center gap-3" />
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-blue-500"
              aria-label="Next slide"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm types:check
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/template-showcase.tsx
git commit -m "feat(landing): add TemplateShowcase component with Swiper carousel"
```

---

### Task 5: Update Barrel Export

**Files:**

- Modify: `components/landing/index.ts`

**Interfaces:**

- Consumes: `TemplateShowcase` from `./template-showcase.tsx`, `StatsSection` from `./stats-section.tsx`
- Produces: Exports for new components

- [ ] **Step 1: Add exports to index.ts**

Append to end of `components/landing/index.ts`:

```typescript
export { TemplateShowcase } from "./template-showcase";
export { StatsSection } from "./stats-section";
```

- [ ] **Step 2: Run TypeScript check**

```bash
pnpm types:check
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/index.ts
git commit -m "feat(landing): export TemplateShowcase and StatsSection"
```

---

### Task 6: Integrate Sections into Landing Page

**Files:**

- Modify: `app/(guest)/page.tsx`

**Interfaces:**

- Consumes: `TemplateShowcase` and `StatsSection` from `@/components/landing`
- Produces: Complete landing page with all sections

- [ ] **Step 1: Add imports to page.tsx**

Add after existing landing component imports:

```typescript
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";
```

- [ ] **Step 2: Add components to JSX**

Add after `<HowItWorks />`:

```tsx
<TemplateShowcase />
<StatsSection />
```

Full return statement should now be:

```tsx
return (
  <>
    <Navbar />
    <HeroSection />
    <FeaturesGrid />
    <HowItWorks />
    <TemplateShowcase />
    <StatsSection />
  </>
);
```

- [ ] **Step 3: Run TypeScript check**

```bash
pnpm types:check
```

Expected: No TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add app/(guest)/page.tsx
git commit -m "feat(landing): integrate TemplateShowcase and StatsSection into page"
```

---

### Task 7: Final Verification

**Files:**

- All created/modified files

**Interfaces:**

- Consumes: All previous tasks
- Produces: Verified working implementation

- [ ] **Step 1: Run TypeScript compilation**

```bash
pnpm types:check
```

Expected: No errors, clean compilation

- [ ] **Step 2: Start dev server**

```bash
pnpm dev
```

Expected: Server starts on http://localhost:3000

- [ ] **Step 3: Visual verification checklist**

Open http://localhost:3000 in browser and verify:

- [ ] Template carousel renders with 3 slides
- [ ] Carousel has 3D coverflow effect (active slide scaled up, inactive blurred)
- [ ] Prev/Next chevron buttons navigate slides
- [ ] Pagination dots show correct active state (pill shape when active)
- [ ] Carousel is draggable/swipeable
- [ ] Stats section renders below carousel
- [ ] Stats grid shows 4 metrics in correct layout
- [ ] Responsive: mobile shows 2x2 grid, desktop shows 1x4 grid
- [ ] All text, colors, spacing match original HTML
- [ ] No console errors

- [ ] **Step 4: Test responsive breakpoints**

Resize browser window and verify:

- Mobile (< 640px): Single column, stacked layout
- Tablet (640px - 1024px): Proper spacing
- Desktop (> 1024px): Two-column layout for carousel section

- [ ] **Step 5: Test carousel interactions**

- Click prev/next buttons - slides navigate correctly
- Click pagination dots - jumps to correct slide
- Drag carousel - swipe gesture works
- Wait for loop - carousel loops seamlessly

- [ ] **Step 6: Final commit message**

If all verifications pass, no additional commit needed. Implementation complete.

---

## Post-Implementation Review

After completing all tasks, review the implementation:

1. **Functionality:** All carousel interactions work (navigation, pagination, drag, loop)
2. **Visual fidelity:** Compare side-by-side with `/home/zealish/Downloads/template_showcase_webpage.html`
3. **Responsive design:** Test all breakpoints (mobile, tablet, desktop)
4. **TypeScript:** No compilation errors
5. **Performance:** No console warnings, smooth animations
6. **Accessibility:** Keyboard navigation works, ARIA labels present

If any issues found, create fix commits before marking complete.
