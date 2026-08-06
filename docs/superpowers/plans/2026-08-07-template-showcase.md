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
    <section className="w-full mt-12 lg:mt-16 px-4 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
      <div className="bg-slate-50/80 border border-slate-100 rounded-3xl p-8 sm:p-10 md:p-12 text-center shadow-sm">
        <p className="text-slate-600 font-medium text-sm sm:text-base mb-8 sm:mb-10 tracking-wide">
          Trusted by creators and businesses worldwide
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center pt-4 md:pt-0"
            >
              <div
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${stat.color}`}
              >
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-600 mt-2">
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
import { ArrowRight, ChevronLeft, ChevronRight, Minus, Square, X } from "lucide-react";
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
      subtitle: "We design sustainable indoor and outdoor spaces that inspire and rejuvenate.",
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
    <section className="py-16 lg:py-24 px-4 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Marketing Copy */}
        <div className="lg:col-span-5 flex flex-col items-start space-y-6 z-20 pr-0 lg:pr-4">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-wide uppercase">
            PROFESSIONAL TEMPLATES
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Beautiful templates for every business
          </h2>

          <p className="text-slate-600 text-lg sm:text-xl font-normal leading-relaxed max-w-md">
            Choose from 100+ professionally designed templates that you can fully customize.
          </p>

          <a
            href="#explore"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Explore Templates
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Right Column: Swiper Carousel */}
        <div className="lg:col-span-7 relative w-full overflow-hidden lg:overflow-visible">
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
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Browser Header */}
                    <div className={`${template.theme.headerBg} border-b border-slate-100 px-6 py-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                          {template.brandName}
                          <span className={`${template.theme.accentColor} font-serif italic`}>
                            {template.brandAccent}
                          </span>
                        </span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-6 text-xs font-medium text-slate-600">
                        {template.navLinks?.map((link, idx) => (
                          <span
                            key={idx}
                            className={idx === 0 ? "text-slate-900 font-semibold cursor-pointer" : "hover:text-slate-900 cursor-pointer"}
                          >
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-6 sm:p-8 min-h-[300px] sm:min-h-[340px] flex items-center relative overflow-hidden`}>
                      <div className="max-w-[240px] sm:max-w-[280px] z-10 space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                          {template.heading}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {template.subtitle}
                        </p>
                        <button className={`mt-2 px-4 py-2 rounded-lg ${template.theme.buttonBg} text-white text-xs font-medium transition`}>
                          {template.ctaText}
                        </button>
                      </div>

                      {/* Placeholder Image */}
                      <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-end justify-end p-2 pointer-events-none">
                        <div className={`h-full w-full ${template.theme.imageBg} rounded-xl shadow-md`} />
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Aurora" && (
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Browser Header */}
                    <div className={`${template.theme.headerBg} border-b border-slate-100 px-6 py-4 flex items-center justify-between`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-slate-900 tracking-wider uppercase">
                          {template.brandName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 text-xs">
                        <Minus className="w-3 h-3" />
                        <Square className="w-2.5 h-2.5" />
                        <X className="w-3 h-3" />
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-6 sm:p-8 min-h-[300px] sm:min-h-[340px] flex items-center justify-between relative overflow-hidden`}>
                      <div className="space-y-1 text-slate-500 text-xs tracking-widest uppercase font-mono">
                        <div>Minimal.</div>
                        <div>Modern.</div>
                        <div>Sustainable.</div>
                      </div>

                      {/* Portrait Placeholder */}
                      <div className="relative h-[260px] w-[180px] sm:w-[210px] rounded-lg overflow-hidden shadow-lg border border-white">
                        <div className={`h-full w-full ${template.theme.imageBg}`} />

                        {/* Floating Tag */}
                        <div className="absolute bottom-3 -left-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-md shadow-md border border-slate-100 text-[10px] space-y-0.5">
                          <div className="font-bold text-slate-800">Fully customizable</div>
                          <div className="text-slate-500">Easy to use</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {template.name === "Lumina" && (
                  <div className={`${template.theme.headerBg} text-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden`}>
                    {/* Browser Header */}
                    <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        <span className="text-base font-bold tracking-tight">{template.brandName}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {template.navLinks?.join(" • ")}
                      </div>
                    </div>

                    {/* Mockup Body */}
                    <div className={`${template.theme.bodyBg} p-8 min-h-[300px] sm:min-h-[340px] flex flex-col justify-center`}>
                      <span className={`${template.theme.accentColor} text-xs font-mono mb-2`}>
                        {template.subtitle}
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                        {template.heading}
                      </h2>
                      <div className="mt-6 flex gap-3">
                        <span className="px-4 py-2 bg-indigo-600 rounded-lg text-xs font-semibold">
                          Get Started
                        </span>
                        <span className="px-4 py-2 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300">
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
          <div className="flex items-center justify-center gap-3 mt-2.5">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="text-slate-400 hover:text-blue-500 transition-colors text-sm cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="swiper-custom-pagination flex items-center gap-3" />
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="text-slate-400 hover:text-blue-500 transition-colors text-sm cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-3.5 h-3.5" />
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
