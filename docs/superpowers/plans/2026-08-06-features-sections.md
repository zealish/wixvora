# Features Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add FeaturesGrid and HowItWorks sections below the hero on the landing page, converting static HTML to modular Next.js 16 server components.

**Architecture:** Two separate server components (no client interactivity) with responsive grid layouts, Lucide React icons, and CSS hover animations. Both sections use shared visual language (slate-50/60 background, indigo accent colors).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide React

## Global Constraints

- Next.js 16.3.0 with App Router (server components by default)
- Tailwind CSS 4 with `@theme inline` syntax (no tailwind.config.ts)
- Lucide React for all icons (replace FontAwesome)
- Inter font via `next/font/google` (already configured)
- 100% visual fidelity to original HTML
- Mobile-first responsive design
- No new dependencies

---

### Task 1: Create FeaturesGrid Component

**Files:**
- Create: `components/landing/features-grid.tsx`
- Test: Manual visual inspection (server component, no unit tests needed)

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `export function FeaturesGrid(): JSX.Element`

- [ ] **Step 1: Create component file with imports**

```typescript
import { Sparkles, Layers, Smartphone, TrendingUp, Rocket, Send } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="w-full bg-slate-50/60 py-20 border-t border-slate-100/80 relative"
    >
      {/* Content will be added in next steps */}
    </section>
  );
}
```

- [ ] **Step 2: Add section header with pill badge**

```typescript
import { Sparkles, Layers, Smartphone, TrendingUp, Rocket, Send } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="w-full bg-slate-50/60 py-20 border-t border-slate-100/80 relative"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold tracking-widest uppercase">
            AI MADE EASY
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything you need to build
            <br className="hidden sm:inline" />
            amazing websites
          </h2>

          <p className="text-slate-500 text-base sm:text-lg max-w-xl font-normal">
            Powerful features to bring your ideas to life, faster and easier.
          </p>

          {/* Grid will be added in next step */}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add features grid with all 6 cards**

```typescript
import { Sparkles, Layers, Smartphone, TrendingUp, Rocket, Send } from "lucide-react";

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="w-full bg-slate-50/60 py-20 border-t border-slate-100/80 relative"
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold tracking-widest uppercase">
            AI MADE EASY
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything you need to build
            <br className="hidden sm:inline" />
            amazing websites
          </h2>

          <p className="text-slate-500 text-base sm:text-lg max-w-xl font-normal">
            Powerful features to bring your ideas to life, faster and easier.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 w-full text-left">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                AI Website Generation
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Generate a complete website in seconds with AI. Just tell us what you need.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Drag & Drop Builder
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Easily customize every element with our intuitive drag & drop interface.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Responsive Design
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your website will look perfect on any device, automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                SEO Optimized
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Built-in SEO tools to help your website rank higher on search engines.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Smart Content
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                AI helps you write, optimize, and generate content that converts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Publish Instantly
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                One click to publish your website and go live to the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `pnpm types:check`
Expected: No errors

- [ ] **Step 5: Commit FeaturesGrid component**

```bash
git add components/landing/features-grid.tsx
git commit -m "feat(landing): add FeaturesGrid component"
```

---

### Task 2: Create HowItWorks Component

**Files:**
- Create: `components/landing/how-it-works.tsx`
- Test: Manual visual inspection (server component, no unit tests needed)

**Interfaces:**
- Consumes: Nothing (self-contained)
- Produces: `export function HowItWorks(): JSX.Element`

- [ ] **Step 1: Create component file with imports**

```typescript
import { Sparkles, Laptop, Wand2, Globe } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50/60 py-20 relative">
      {/* Content will be added in next steps */}
    </section>
  );
}
```

- [ ] **Step 2: Add section header**

```typescript
import { Sparkles, Laptop, Wand2, Globe } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50/60 py-20 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-12 pt-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Wixvora Works
          </h2>

          {/* Steps grid will be added in next step */}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add 4-step workflow grid with connector lines**

```typescript
import { Sparkles, Laptop, Wand2, Globe } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="w-full bg-slate-50/60 py-20 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 space-y-24">
        <div className="flex flex-col items-center text-center space-y-12 pt-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Wixvora Works
          </h2>

          <div className="w-full relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    1
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Sparkles className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Tell AI Your Idea
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Answer a few questions about your website.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    2
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Laptop className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  AI Builds Your Website
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Our AI generates a complete website tailored for you.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="hidden lg:block absolute top-1/2 left-[50%] right-[-50%] h-[2px] border-t-2 border-dashed border-indigo-200 -translate-y-1/2 -z-10"></div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    3
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Wand2 className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Customize & Edit
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Edit content, images, and design with our easy drag & drop builder.
                </p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="relative w-full flex justify-center items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/30">
                    4
                  </div>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-indigo-50/90 text-indigo-600 flex items-center justify-center text-2xl mb-5 shadow-sm group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Globe className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Publish & Go Live
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[210px]">
                  Publish your website and share it with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `pnpm types:check`
Expected: No errors

- [ ] **Step 5: Commit HowItWorks component**

```bash
git add components/landing/how-it-works.tsx
git commit -m "feat(landing): add HowItWorks component"
```

---

### Task 3: Update Barrel Export

**Files:**
- Modify: `components/landing/index.ts`

**Interfaces:**
- Consumes: `FeaturesGrid` from `./features-grid`, `HowItWorks` from `./how-it-works`
- Produces: Re-exports both components

- [ ] **Step 1: Add exports to barrel file**

```typescript
export { Navbar } from "./navbar";
export { HeroSection } from "./hero-section";
export { BuilderPreview } from "./builder-preview";
export { DemoModal } from "./demo-modal";
export { FeaturesGrid } from "./features-grid";
export { HowItWorks } from "./how-it-works";
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm types:check`
Expected: No errors

- [ ] **Step 3: Commit barrel export update**

```bash
git add components/landing/index.ts
git commit -m "feat(landing): export FeaturesGrid and HowItWorks"
```

---

### Task 4: Integrate Sections into Landing Page

**Files:**
- Modify: `app/(guest)/page.tsx`

**Interfaces:**
- Consumes: `FeaturesGrid` and `HowItWorks` from `@/components/landing`
- Produces: Complete landing page with all sections

- [ ] **Step 1: Add imports for new sections**

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

- [ ] **Step 2: Verify TypeScript compilation**

Run: `pnpm types:check`
Expected: No errors

- [ ] **Step 3: Start dev server and verify visual output**

Run: `pnpm dev`
Expected: Dev server starts successfully

Open browser to `http://localhost:3000` and verify:
- Features section shows below hero with 6 cards in responsive grid
- How It Works section shows 4 steps with connector lines on desktop
- All hover animations work (card shadows, icon scales, icon color changes)
- Responsive layout works on mobile/tablet/desktop viewports
- No console errors

- [ ] **Step 4: Commit landing page integration**

```bash
git add app/(guest)/page.tsx
git commit -m "feat(landing): integrate FeaturesGrid and HowItWorks sections"
```

---

### Task 5: Final Verification

**Files:**
- N/A (verification only)

**Interfaces:**
- Consumes: All components from previous tasks
- Produces: Verified, working feature

- [ ] **Step 1: Run TypeScript type check**

Run: `pnpm types:check`
Expected: No TypeScript errors

- [ ] **Step 2: Verify responsive design**

Test viewports:
- Mobile (375px): Single column, no connector lines
- Tablet (768px): 2-column grid for features, 2-column for steps
- Desktop (1280px+): 3-column features, 4-column steps with connectors

Expected: All layouts render correctly at each breakpoint

- [ ] **Step 3: Verify hover interactions**

Test interactions:
- Feature cards: shadow grows on hover, icon scales up
- Workflow steps: icon box changes to indigo-600 background with white icon
- Smooth transitions on all hover effects

Expected: All hover animations work smoothly

- [ ] **Step 4: Verify visual fidelity to original HTML**

Compare against `/home/zealish/Downloads/new_section.html`:
- Pill badge styling matches
- Typography sizes and weights match
- Spacing and padding match
- Colors match (slate-50/60 background, indigo accents)
- Card shadows match
- Icon sizes match

Expected: 100% visual match to original HTML

- [ ] **Step 5: Create final commit if any adjustments needed**

If any fixes were needed during verification:

```bash
git add .
git commit -m "fix(landing): adjust features sections styling"
```

Otherwise, verification complete.

---

## Success Criteria

- ✅ FeaturesGrid component renders 6 feature cards in responsive grid
- ✅ HowItWorks component renders 4-step flow with connector lines
- ✅ All hover animations work (shadows, scales, color changes)
- ✅ Responsive layouts work across mobile/tablet/desktop
- ✅ TypeScript compiles with no errors
- ✅ Visual output matches original HTML exactly
- ✅ Components exported from barrel file
- ✅ Landing page integrates both sections below hero
- ✅ No console errors or warnings
