# CTA Section & Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CTA section and comprehensive footer to the Wixvora landing page, and refactor Navbar/Footer into the guest layout.

**Architecture:** Two new components (CtaSection client component + Footer server component) plus a layout refactor moving Navbar from page.tsx to layout.tsx. CtaSection contains a semi-interactive analytics dashboard mockup and mobile phone preview. Footer provides a 5-column link grid with social media icons.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Lucide React, TypeScript

**Spec:** `docs/superpowers/specs/2026-08-07-cta-footer-design.md`

**HTML Reference:** `/home/zealish/Downloads/CTA&Footer.html`

## Global Constraints

- Font: Inter via `--font-inter` CSS variable (already configured in `app/layout.tsx`)
- Icons: Lucide React only — no FontAwesome, no CDN links
- Tailwind CSS 4 with `@theme inline` syntax — no `tailwind.config.ts`
- No external image URLs — use SVG patterns and gradients
- All placeholder links: `href="#"`
- Social media icons: `Facebook`, `Twitter`, `Instagram`, `Linkedin` from Lucide React
- Container max-width: `max-w-[1340px]` with `px-6 md:px-12` padding
- Primary gradient: `from-blue-600 via-indigo-600 to-indigo-700`
- TypeScript strict — no `any` types

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `components/landing/cta-section.tsx` | Create | CTA section with analytics dashboard + mobile mockup (client component) |
| `components/landing/footer.tsx` | Create | Comprehensive footer with brand, links, social media (server component) |
| `components/landing/index.ts` | Modify | Add barrel exports for CtaSection and Footer |
| `app/(guest)/layout.tsx` | Modify | Replace minimal footer with Navbar + Footer components |
| `app/(guest)/page.tsx` | Modify | Remove Navbar, add CtaSection |
| `app/globals.css` | Modify | Add animation keyframes (floatSlow, pulseSoft) if not present |

---

### Task 1: Add CSS Animation Keyframes to globals.css

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: CSS animation classes `animate-float` and `animate-pulse-soft` available globally

- [ ] **Step 1: Check existing keyframes**

Read `app/globals.css` and verify whether `@keyframes floatSlow` and `@keyframes pulseSoft` already exist. If they do, skip this task entirely and mark complete.

- [ ] **Step 2: Add animation keyframes if missing**

If the keyframes are not present, append the following to `app/globals.css` after the existing Swiper styles section:

```css
/* Landing page animations */
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add landing page animation keyframes"
```

---

### Task 2: Create Footer Component

**Files:**
- Create: `components/landing/footer.tsx`

**Interfaces:**
- Produces: `Footer` named export — React server component (no `"use client"`)

- [ ] **Step 1: Create the Footer component**

Create `components/landing/footer.tsx` with the following content:

```tsx
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "AI Tools", href: "#" },
];

const resourceLinks = [
  { label: "Blog", href: "#" },
  { label: "Help Center", href: "#" },
  { label: "Tutorials", href: "#" },
  { label: "Community", href: "#" },
];

const companyLinks = [
  { label: "About Us", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Partner Program", href: "#" },
  { label: "Contact Us", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookies Policy", href: "#" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="col-span-1 md:col-span-2 space-y-4">
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-medium">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="hover:text-indigo-600 transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-[#f8f9fc] border-t border-slate-200/60 pt-16 pb-12">
      <div className="max-w-[1340px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 pb-16 border-b border-slate-200/80">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 space-y-5 pr-0 md:pr-6">
            <Link href="/" className="flex items-center gap-2.5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M4 8L10 24L16 12L22 24L28 8"
                  stroke="url(#ft_logo)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="ft_logo"
                    x1="4"
                    y1="8"
                    x2="28"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-black tracking-tight text-slate-900">
                WIXVORA
              </span>
            </Link>

            <p className="text-slate-500 text-sm font-normal leading-relaxed max-w-xs">
              AI-powered website builder that helps you build smarter and
              launch faster.
            </p>

            <div className="flex items-center space-x-2.5 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-slate-200/60 text-slate-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center text-sm transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 text-center text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} Wixvora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/footer.tsx
git commit -m "feat(landing): add Footer component"
```

---

### Task 3: Create CTA Section Component

**Files:**
- Create: `components/landing/cta-section.tsx`

**Interfaces:**
- Produces: `CtaSection` named export — React client component

- [ ] **Step 1: Create the CTA Section component**

Create `components/landing/cta-section.tsx` with the following content:

```tsx
"use client";

import {
  ArrowRight,
  ChevronDown,
  Menu,
} from "lucide-react";

export function CtaSection() {
  return (
    <section className="w-full py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="max-w-[1340px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider uppercase">
              READY TO GET STARTED?
            </div>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Ready to build your dream website?
            </h2>

            {/* Paragraph */}
            <p className="text-slate-500 text-base sm:text-lg font-normal leading-relaxed max-w-md">
              Join thousands of users who build smarter and launch faster
              with Wixvora.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href="#get-started"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-slate-400 font-medium mt-3">
                No credit card required
              </p>
            </div>
          </div>

          {/* Right Visual: Analytics Panel & Mobile Mockup */}
          <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end pt-6 lg:pt-0">
            {/* Ambient Blob */}
            <div className="absolute -left-12 top-10 w-80 h-80 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Yellow Star Badge */}
            <div className="absolute -top-6 right-8 z-30 pointer-events-none text-amber-300 animate-pulse-soft hidden sm:block">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Analytics Dashboard Card */}
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur border border-slate-100/90 rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)] p-6 sm:p-7 z-10">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6 pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Analytics Overview
                </h3>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                  <span>Last 30 days</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Visitors
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    12,984
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>8.5%</span>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Page Views
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    28,421
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>12.6%</span>
                  </div>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 sm:p-4">
                  <span className="text-[11px] font-medium text-slate-400 block mb-1">
                    Conversions
                  </span>
                  <div className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
                    3,882
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <span>&#8593;</span> <span>16.3%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="relative pt-2">
                <div className="flex justify-between h-36 relative">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between text-[10px] font-medium text-slate-400 pr-2 py-1">
                    <span>20K</span>
                    <span>15K</span>
                    <span>10K</span>
                    <span>5K</span>
                    <span>0</span>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="flex-1 relative pl-2 border-l border-b border-slate-100">
                    {/* Dashed Guide Lines */}
                    <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-100" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-100" />

                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 400 120"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chart_gradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6366f1"
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            stopColor="#6366f1"
                            stopOpacity="0.0"
                          />
                        </linearGradient>
                      </defs>

                      <path
                        d="M 0 75 Q 30 60, 60 40 T 120 70 T 180 50 T 240 70 T 300 20 T 360 45 T 400 15 L 400 120 L 0 120 Z"
                        fill="url(#chart_gradient)"
                      />
                      <path
                        d="M 0 75 Q 30 60, 60 40 T 120 70 T 180 50 T 240 70 T 300 20 T 360 45 T 400 15"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      {[
                        [0, 75], [60, 40], [120, 70], [180, 50],
                        [240, 70], [300, 20], [360, 45], [400, 15],
                      ].map(([cx, cy]) => (
                        <circle
                          key={`${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r="3.5"
                          fill="#6366f1"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between pl-8 text-[10px] font-medium text-slate-400 mt-3">
                  <span>May 5</span>
                  <span>May 12</span>
                  <span>May 19</span>
                  <span>May 26</span>
                  <span>May 30</span>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="absolute -right-2 sm:-right-6 top-10 sm:top-12 w-48 sm:w-56 bg-slate-900 rounded-[28px] p-2.5 shadow-2xl shadow-slate-900/40 border border-slate-700/50 z-20 hidden sm:block transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-slate-950 rounded-[22px] overflow-hidden text-white flex flex-col h-72 border border-slate-800">
                {/* Mobile Header */}
                <div className="p-3 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <path
                        d="M4 8L10 24L16 12L22 24L28 8"
                        stroke="url(#mob_logo)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="mob_logo"
                          x1="4"
                          y1="8"
                          x2="28"
                          y2="24"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#3B82F6" />
                          <stop offset="1" stopColor="#4F46E5" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-[10px] font-extrabold tracking-tight">
                      WIXVORA
                    </span>
                  </div>
                  <Menu className="w-3 h-3 text-slate-400" />
                </div>

                {/* Mobile Content */}
                <div className="p-4 flex-1 flex flex-col justify-end bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 relative overflow-hidden">
                  {/* SVG Mountain Pattern */}
                  <svg
                    className="absolute inset-x-0 top-0 h-28 opacity-40 pointer-events-none"
                    viewBox="0 0 400 112"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="mountain-gradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

                  <div className="relative z-10 space-y-2">
                    <h4 className="text-sm font-extrabold leading-snug">
                      Build your brand online
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Create a professional website that helps your business
                      grow and stand out.
                    </p>
                    <button
                      type="button"
                      className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] shadow-md transition mt-1"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/cta-section.tsx
git commit -m "feat(landing): add CtaSection component"
```

---

### Task 4: Update Barrel Exports

**Files:**
- Modify: `components/landing/index.ts`

**Interfaces:**
- Produces: `CtaSection` and `Footer` available from `@/components/landing`

- [ ] **Step 1: Add exports to barrel file**

Append to `components/landing/index.ts`:

```ts
export { CtaSection } from "./cta-section";
export { Footer } from "./footer";
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 3: Commit**

```bash
git add components/landing/index.ts
git commit -m "feat(landing): export CtaSection and Footer"
```

---

### Task 5: Refactor Guest Layout (Navbar + Footer)

**Files:**
- Modify: `app/(guest)/layout.tsx`

**Interfaces:**
- Consumes: `Navbar` from `@/components/landing`
- Consumes: `Footer` from `@/components/landing`

- [ ] **Step 1: Replace layout content**

Replace the entire content of `app/(guest)/layout.tsx` with:

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function GuestLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(guest\)/layout.tsx
git commit -m "refactor(landing): move Navbar and Footer into guest layout"
```

---

### Task 6: Update Landing Page (Remove Navbar, Add CtaSection)

**Files:**
- Modify: `app/(guest)/page.tsx`

**Interfaces:**
- Consumes: `CtaSection` from `@/components/landing`
- Removes: Navbar import and usage (now in layout)

- [ ] **Step 1: Update page.tsx**

Replace the entire content of `app/(guest)/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TemplateShowcase } from "@/components/landing/template-showcase";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";

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
      <HeroSection />
      <FeaturesGrid />
      <HowItWorks />
      <TemplateShowcase />
      <StatsSection />
      <CtaSection />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 3: Commit**

```bash
git add app/\(guest\)/page.tsx
git commit -m "feat(landing): add CtaSection to page, remove Navbar"
```

---

### Task 7: Final Verification

**Files:**
- No files modified — verification only

- [ ] **Step 1: TypeScript check**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 2: Verify file structure exists**

Run: `ls -la components/landing/cta-section.tsx components/landing/footer.tsx`
Expected: Both files exist

- [ ] **Step 3: Verify barrel exports contain new components**

Run: `grep -n "CtaSection\|Footer" components/landing/index.ts`
Expected: Two export lines for CtaSection and Footer

- [ ] **Step 4: Verify layout imports Navbar and Footer**

Run: `grep -n "Navbar\|Footer" app/\(guest\)/layout.tsx`
Expected: Import lines and JSX usage for both

- [ ] **Step 5: Verify page.tsx no longer imports Navbar and includes CtaSection**

Run: `grep -n "Navbar\|CtaSection" app/\(guest\)/page.tsx`
Expected: CtaSection present, Navbar absent

- [ ] **Step 6: Final TypeScript check**

Run: `pnpm types:check`
Expected: Clean — no errors

- [ ] **Step 7: Commit SDD progress update (if applicable)**

If any files in `.superpowers/sdd/` track progress, update them.

---
