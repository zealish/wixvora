# Pricing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a fully functional `/pricing` page with billing toggle, 4 plan cards, comparison table, FAQ accordion, and CTA banner — all with Framer Motion animations.

**Architecture:** React Context manages billing cycle state across modular components. Each section is a separate client component. The page component is server-renderable but wraps children in `PricingProvider`. All components live in `components/pricing/` with barrel exports.

**Tech Stack:** Next.js 16.3.0, React 19, Tailwind CSS v4, Framer Motion v13, Lucide React

## Global Constraints

- Brand colors: `brand-50: #EEF2FF`, `brand-100: #E0E7FF`, `brand-500: #6366F1`, `brand-600: #4F46E5`, `brand-700: #4338CA` (defined in `app/globals.css:42-46`)
- Path alias: `@/*` → `./*`
- Font: Plus Jakarta Sans / Inter
- Motion utilities: import from `@/components/landing/motion-wrapper` (`MotionWrapper`, `StaggerContainer`, `StaggerItem`)
- Lucide icons: import from `lucide-react`
- No new dependencies — all imports already installed
- Match reference HTML exactly for copy, layout, and styling

---

## File Map

**Create:**

- `components/pricing/pricing-provider.tsx` — React Context + Provider + usePricing hook
- `components/pricing/pricing-hero.tsx` — Hero section
- `components/pricing/hero-visual-cards.tsx` — Animated visual cards in hero
- `components/pricing/billing-toggle.tsx` — Monthly/yearly segmented control
- `components/pricing/pricing-cards-grid.tsx` — Grid + data constant
- `components/pricing/pricing-card.tsx` — Individual plan card
- `components/pricing/comparison-table.tsx` — Feature comparison table
- `components/pricing/faq-section.tsx` — FAQ list + data + accordion state
- `components/pricing/faq-item.tsx` — Individual FAQ item
- `components/pricing/pricing-cta-banner.tsx` — Bottom CTA
- `components/pricing/index.ts` — Barrel exports
- `app/(guest)/pricing/page.tsx` — Page route

**Modify:**

- `components/landing/navbar.tsx` — Change Pricing link from anchor to Next.js Link with active state
- `app/globals.css` — Add `.card-shadow` and `.popular-card-shadow` classes

---

### Task 1: Global CSS — Add card shadow utilities

**Files:**

- Modify: `app/globals.css`

**Interfaces:**

- Consumes: nothing
- Produces: `.card-shadow` and `.popular-card-shadow` CSS classes used by `pricing-card.tsx`

- [ ] **Step 1: Add shadow classes to globals.css**

Open `app/globals.css` and append the following inside the `@layer components` block (after the `.builder-handle` rule, before the closing `}` of `@layer components`):

```css
/* Pricing page card shadows */
.card-shadow {
  box-shadow:
    0 4px 20px -2px rgba(15, 23, 42, 0.05),
    0 2px 6px -1px rgba(15, 23, 42, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-shadow:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(15, 23, 42, 0.08),
    0 10px 10px -5px rgba(15, 23, 42, 0.03);
}

.popular-card-shadow {
  box-shadow:
    0 20px 35px -5px rgba(79, 70, 229, 0.15),
    0 10px 15px -5px rgba(79, 70, 229, 0.05);
}
```

- [ ] **Step 2: Verify no build errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx next build --turbopack 2>&1 | tail -20`
Expected: Build succeeds, no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add card-shadow and popular-card-shadow utilities for pricing page"
```

---

### Task 2: Pricing Provider — React Context for billing state

**Files:**

- Create: `components/pricing/pricing-provider.tsx`

**Interfaces:**

- Consumes: nothing
- Produces: `PricingProvider` component, `usePricing()` hook returning `{ billingCycle: 'monthly' | 'yearly', setBillingCycle: (cycle) => void }`

- [ ] **Step 1: Create the pricing context provider**

Create `components/pricing/pricing-provider.tsx`:

```tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type BillingCycle = "monthly" | "yearly";

interface PricingContextType {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}

const PricingContext = createContext<PricingContextType | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <PricingContext.Provider value={{ billingCycle, setBillingCycle }}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing-provider" || echo "No errors in pricing-provider"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/pricing-provider.tsx
git commit -m "feat(pricing): add PricingProvider context for billing cycle state"
```

---

### Task 3: Hero Visual Cards — Animated mockup component

**Files:**

- Create: `components/pricing/hero-visual-cards.tsx`

**Interfaces:**

- Consumes: nothing
- Produces: `HeroVisualCards` default export, used by `pricing-hero.tsx`

- [ ] **Step 1: Create the hero visual cards component**

Create `components/pricing/hero-visual-cards.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Lock, Layout, CheckCircle2 } from "lucide-react";

export default function HeroVisualCards() {
  return (
    <div className="relative flex min-h-[320px] items-center justify-center">
      {/* Golden Sparkle */}
      <div className="absolute -top-6 right-6 animate-pulse text-amber-400">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Browser Card */}
        <motion.div
          initial={{ opacity: 0, rotate: -2, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="-rotate-2 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl"
        >
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            <span>yourdomain.com</span>
          </div>
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-300">
            <Layout className="h-8 w-8" />
          </div>
        </motion.div>

        {/* Success Pill */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-12 left-2 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Your Site is Live!
            </p>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-emerald-500/20">
              <div className="h-full w-3/4 rounded-full bg-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="absolute right-2 -bottom-6 w-56 rotate-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4 text-white shadow-xl shadow-indigo-300"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider">
              AI-Powered
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug font-bold">
            Smarter Websites,
            <br />
            Better Results.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "hero-visual" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/hero-visual-cards.tsx
git commit -m "feat(pricing): add hero visual cards with Framer Motion animations"
```

---

### Task 4: Pricing Hero — Hero section component

**Files:**

- Create: `components/pricing/pricing-hero.tsx`

**Interfaces:**

- Consumes: `HeroVisualCards` from `./hero-visual-cards`
- Produces: `PricingHero` named export, used by `app/(guest)/pricing/page.tsx`

- [ ] **Step 1: Create the pricing hero component**

Create `components/pricing/pricing-hero.tsx`:

```tsx
"use client";

import { Check } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";
import HeroVisualCards from "./hero-visual-cards";

export function PricingHero() {
  return (
    <section className="hero-bg relative overflow-hidden border-b border-slate-100 pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Text */}
          <div className="space-y-6 lg:col-span-7">
            <MotionWrapper delay={0}>
              <div className="border-brand-100 bg-brand-50 text-brand-600 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tracking-wider uppercase">
                PRICING
              </div>
            </MotionWrapper>

            <MotionWrapper delay={0.1}>
              <h1 className="text-4xl leading-tight font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
                Simple, Transparent Pricing <br />
                for{" "}
                <span className="from-brand-600 bg-gradient-to-r via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Everything You Need
                </span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
                Choose the perfect plan to build, manage, and grow your website
                with AI.
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </MotionWrapper>
          </div>

          {/* Right Visual */}
          <div className="lg:col-span-5">
            <HeroVisualCards />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing-hero" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/pricing-hero.tsx
git commit -m "feat(pricing): add hero section with gradient heading and checkmarks"
```

---

### Task 5: Billing Toggle — Monthly/yearly segmented control

**Files:**

- Create: `components/pricing/billing-toggle.tsx`

**Interfaces:**

- Consumes: `usePricing()` from `./pricing-provider`
- Produces: `BillingToggle` named export, used by page

- [ ] **Step 1: Create the billing toggle component**

Create `components/pricing/billing-toggle.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { usePricing } from "./pricing-provider";

export function BillingToggle() {
  const { billingCycle, setBillingCycle } = usePricing();

  return (
    <div className="mb-12 flex items-center justify-center gap-3">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/60 bg-slate-100 p-1 shadow-inner">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
            billingCycle === "monthly"
              ? "bg-white text-slate-900 shadow-sm"
              : "font-semibold text-slate-600 hover:text-slate-900"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("yearly")}
          className={`relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
            billingCycle === "yearly"
              ? "bg-white text-slate-900 shadow-sm"
              : "font-semibold text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Yearly</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-700 uppercase">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "billing-toggle" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/billing-toggle.tsx
git commit -m "feat(pricing): add billing toggle with monthly/yearly switcher"
```

---

### Task 6: Pricing Card — Individual plan card component

**Files:**

- Create: `components/pricing/pricing-card.tsx`

**Interfaces:**

- Consumes: `usePricing()` from `./pricing-provider`
- Produces: `PricingCard` named export (props: `{ plan: PricingPlan }`)
- Type `PricingPlan` is defined here and re-exported

- [ ] **Step 1: Create the pricing card component**

Create `components/pricing/pricing-card.tsx`:

```tsx
"use client";

import { Check, X } from "lucide-react";
import { usePricing } from "./pricing-provider";

export interface PricingPlan {
  id: "free" | "starter" | "pro" | "premium";
  name: string;
  description: string;
  featuresHeader?: string;
  prices: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  unavailable?: string[];
  buttonText: string;
  buttonVariant: "outline" | "gradient";
  popular: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const { billingCycle } = usePricing();
  const price = plan.prices[billingCycle];

  return (
    <article
      className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 ${
        plan.popular
          ? "border-brand-600 popular-card-shadow lg:-translate-y-2"
          : "card-shadow border-slate-200"
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="bg-brand-600 absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[10px] font-extrabold tracking-wider text-white uppercase shadow-md">
          MOST POPULAR
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
          <p className="mt-1 min-h-[32px] text-xs text-slate-500">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 py-2">
          <span className="text-4xl font-extrabold text-slate-900">
            ${price}
          </span>
          <span className="text-sm font-semibold text-slate-400">/month</span>
        </div>

        {/* Button */}
        <button
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
            plan.buttonVariant === "gradient"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 active:scale-95"
              : "text-brand-600 hover:bg-brand-50 border-2 border-indigo-100 hover:border-indigo-600"
          }`}
        >
          {plan.buttonText}
        </button>

        {/* Features */}
        <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
          {plan.featuresHeader && (
            <p
              className={`text-[11px] font-extrabold tracking-wider uppercase ${
                plan.popular ? "text-brand-600" : "text-slate-900"
              }`}
            >
              {plan.featuresHeader}
            </p>
          )}
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <Check className="h-4 w-4 flex-shrink-0 text-indigo-600" />
              <span>{feature}</span>
            </div>
          ))}
          {plan.unavailable?.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2.5 text-slate-400"
            >
              <X className="h-4 w-4 flex-shrink-0 text-slate-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing-card" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/pricing-card.tsx
git commit -m "feat(pricing): add pricing card component with features list"
```

---

### Task 7: Pricing Cards Grid — Data + grid wrapper

**Files:**

- Create: `components/pricing/pricing-cards-grid.tsx`

**Interfaces:**

- Consumes: `PricingCard` from `./pricing-card`, `PricingPlan` type from `./pricing-card`, `StaggerContainer`/`StaggerItem` from `@/components/landing/motion-wrapper`
- Produces: `PricingCardsGrid` named export

- [ ] **Step 1: Create the pricing cards grid component**

Create `components/pricing/pricing-cards-grid.tsx`:

```tsx
"use client";

import {
  StaggerContainer,
  StaggerItem,
} from "@/components/landing/motion-wrapper";
import { PricingCard, type PricingPlan } from "./pricing-card";

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out Wixvora.",
    prices: { monthly: 0, yearly: 0 },
    features: [
      "AI Website Builder",
      "500 MB Storage",
      "1 Subdomain",
      "Mobile Responsive",
      "Wixvora Branding",
      "Community Support",
    ],
    unavailable: ["Custom Domain", "Premium Templates"],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Great for personal projects and small websites.",
    featuresHeader: "Everything in Free, plus:",
    prices: { monthly: 9, yearly: 7 },
    features: [
      "10 GB Storage",
      "Custom Domain",
      "Remove Wixvora Branding",
      "Premium Templates",
      "Basic SEO Tools",
      "Email Support",
      "Advanced Analytics",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Ideal for growing businesses and professionals.",
    featuresHeader: "Everything in Starter, plus:",
    prices: { monthly: 19, yearly: 15 },
    features: [
      "50 GB Storage",
      "Advanced SEO Tools",
      "AI Content Generator",
      "Form & Popup Builder",
      "Advanced Analytics",
      "Priority Support",
      "Team Collaboration",
    ],
    buttonText: "Get Started",
    buttonVariant: "gradient",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "For businesses that need more power.",
    featuresHeader: "Everything in Pro, plus:",
    prices: { monthly: 39, yearly: 31 },
    features: [
      "Unlimited Storage",
      "Team Collaboration",
      "White Label (Coming Soon)",
      "API Access",
      "Dedicated Support",
      "Priority Feature Access",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
    popular: false,
  },
];

export function PricingCardsGrid() {
  return (
    <StaggerContainer className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PRICING_PLANS.map((plan) => (
        <StaggerItem key={plan.id}>
          <PricingCard plan={plan} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing-cards" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/pricing-cards-grid.tsx
git commit -m "feat(pricing): add pricing cards grid with 4 plan data entries"
```

---

### Task 8: Comparison Table — Feature comparison table

**Files:**

- Create: `components/pricing/comparison-table.tsx`

**Interfaces:**

- Consumes: `Check`, `Minus` from `lucide-react`, `MotionWrapper` from `@/components/landing/motion-wrapper`
- Produces: `ComparisonTable` named export

- [ ] **Step 1: Create the comparison table component**

Create `components/pricing/comparison-table.tsx`:

```tsx
"use client";

import { Check, Minus } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

const FEATURES = [
  {
    name: "AI Website Builder",
    free: "check",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "Storage",
    free: "500 MB",
    starter: "10 GB",
    pro: "50 GB",
    premium: "Unlimited",
  },
  {
    name: "Custom Domain",
    free: "minus",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "Premium Templates",
    free: "Limited",
    starter: "check",
    pro: "check",
    premium: "check",
  },
  {
    name: "SEO Tools",
    free: "Basic",
    starter: "Basic",
    pro: "Advanced",
    premium: "Advanced",
  },
  {
    name: "AI Content Generator",
    free: "minus",
    starter: "minus",
    pro: "check",
    premium: "check",
  },
  {
    name: "Team Collaboration",
    free: "minus",
    starter: "minus",
    pro: "minus",
    premium: "check",
  },
  {
    name: "Support",
    free: "Community",
    starter: "Email",
    pro: "Priority",
    premium: "Dedicated",
  },
] as const;

function CellValue({ value }: { value: string }) {
  if (value === "check") {
    return <Check className="mx-auto h-4 w-4 text-indigo-600" />;
  }
  if (value === "minus") {
    return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  }
  const isHighlighted =
    value === "Advanced" || value === "50 GB" || value === "Priority";
  return (
    <span
      className={`font-semibold ${
        isHighlighted ? "text-indigo-600" : "text-slate-700"
      }`}
    >
      {value}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <MotionWrapper className="mt-20">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs text-slate-700">
                <th className="p-4 text-base font-bold text-slate-900 sm:p-5">
                  Compare All Plans
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Free
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Starter
                </th>
                <th className="text-brand-600 relative w-1/5 p-4 text-center font-bold sm:p-5">
                  Pro
                  <span className="bg-brand-50 text-brand-600 mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold">
                    MOST POPULAR
                  </span>
                </th>
                <th className="w-1/5 p-4 text-center font-bold text-slate-900 sm:p-5">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {FEATURES.map((row) => (
                <tr
                  key={row.name}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="p-4 font-bold text-slate-800 sm:p-5">
                    {row.name}
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.free} />
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.starter} />
                  </td>
                  <td className="bg-indigo-50/20 p-4 text-center sm:p-5">
                    <CellValue value={row.pro} />
                  </td>
                  <td className="p-4 text-center sm:p-5">
                    <CellValue value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MotionWrapper>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "comparison-table" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/comparison-table.tsx
git commit -m "feat(pricing): add feature comparison table with 8 feature rows"
```

---

### Task 9: FAQ Item — Individual collapsible accordion item

**Files:**

- Create: `components/pricing/faq-item.tsx`

**Interfaces:**

- Consumes: `motion`, `AnimatePresence` from `framer-motion`, `Plus` from `lucide-react`
- Produces: `FaqItem` named export (props: `{ question: string; answer: string; isOpen: boolean; onToggle: () => void }`)

- [ ] **Step 1: Create the FAQ item component**

Create `components/pricing/faq-item.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-bold text-slate-900 sm:text-base"
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Plus className="h-5 w-5 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-5 pb-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "faq-item" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/faq-item.tsx
git commit -m "feat(pricing): add FAQ item with accordion animation"
```

---

### Task 10: FAQ Section — FAQ list with accordion state

**Files:**

- Create: `components/pricing/faq-section.tsx`

**Interfaces:**

- Consumes: `FaqItem` from `./faq-item`, `MotionWrapper` from `@/components/landing/motion-wrapper`
- Produces: `FaqSection` named export

- [ ] **Step 1: Create the FAQ section component**

Create `components/pricing/faq-section.tsx`:

```tsx
"use client";

import { useState } from "react";
import { FaqItem } from "./faq-item";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

const FAQ_DATA = [
  {
    id: "faq-1",
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account dashboard. Changes will take effect immediately.",
  },
  {
    id: "faq-2",
    question: "Is there a free trial?",
    answer:
      "Yes! Our Free plan allows you to test out the AI Builder and explore template customization completely free with no time limit or credit card required.",
  },
  {
    id: "faq-3",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards including Visa, Mastercard, American Express, PayPal, and Google Pay.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto mt-20 max-w-4xl space-y-6">
      <MotionWrapper>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>
      </MotionWrapper>

      <div className="grid grid-cols-1 gap-4 pt-4">
        {FAQ_DATA.map((faq) => (
          <FaqItem
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openId === faq.id}
            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "faq-section" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/faq-section.tsx
git commit -m "feat(pricing): add FAQ section with accordion state management"
```

---

### Task 11: Pricing CTA Banner — Bottom call-to-action

**Files:**

- Create: `components/pricing/pricing-cta-banner.tsx`

**Interfaces:**

- Consumes: `Sparkles`, `ArrowRight` from `lucide-react`, `MotionWrapper` from `@/components/landing/motion-wrapper`
- Produces: `PricingCtaBanner` named export

- [ ] **Step 1: Create the CTA banner component**

Create `components/pricing/pricing-cta-banner.tsx`:

```tsx
"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { MotionWrapper } from "@/components/landing/motion-wrapper";

export function PricingCtaBanner() {
  return (
    <MotionWrapper className="mt-16">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-6 shadow-sm sm:p-10 md:flex-row">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Ready to build your dream website?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Join thousands of creators and businesses who build faster with
              Wixvora.
            </p>
          </div>
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:shadow-indigo-200 active:scale-95 md:w-auto">
          <span>Get Started Free</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </MotionWrapper>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing-cta" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/pricing-cta-banner.tsx
git commit -m "feat(pricing): add CTA banner with sparkles icon and gradient button"
```

---

### Task 12: Barrel Exports — index.ts

**Files:**

- Create: `components/pricing/index.ts`

**Interfaces:**

- Consumes: all pricing components
- Produces: single entry point for `@/components/pricing` imports

- [ ] **Step 1: Create the barrel export file**

Create `components/pricing/index.ts`:

```ts
export { PricingProvider, usePricing } from "./pricing-provider";
export { PricingHero } from "./pricing-hero";
export { default as HeroVisualCards } from "./hero-visual-cards";
export { BillingToggle } from "./billing-toggle";
export { PricingCardsGrid } from "./pricing-cards-grid";
export { PricingCard } from "./pricing-card";
export type { PricingPlan } from "./pricing-card";
export { ComparisonTable } from "./comparison-table";
export { FaqSection } from "./faq-section";
export { FaqItem } from "./faq-item";
export { PricingCtaBanner } from "./pricing-cta-banner";
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "components/pricing" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/pricing/index.ts
git commit -m "feat(pricing): add barrel exports for pricing components"
```

---

### Task 13: Page Route — app/(guest)/pricing/page.tsx

**Files:**

- Create: `app/(guest)/pricing/page.tsx`

**Interfaces:**

- Consumes: all pricing components from `@/components/pricing`
- Produces: `/pricing` route

- [ ] **Step 1: Create the pricing page**

Create `app/(guest)/pricing/page.tsx`:

```tsx
import type { Metadata } from "next";
import {
  PricingProvider,
  PricingHero,
  BillingToggle,
  PricingCardsGrid,
  ComparisonTable,
  FaqSection,
  PricingCtaBanner,
} from "@/components/pricing";

export const metadata: Metadata = {
  title: "Pricing - Wixvora",
  description:
    "Simple, transparent pricing for everything you need to build your website.",
};

export default function PricingPage() {
  return (
    <PricingProvider>
      <PricingHero />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <BillingToggle />
        <PricingCardsGrid />
        <ComparisonTable />
        <FaqSection />
        <PricingCtaBanner />
      </main>
    </PricingProvider>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "pricing/page" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/(guest)/pricing/page.tsx
git commit -m "feat(pricing): add pricing page route with all sections"
```

---

### Task 14: Navbar — Update Pricing link to route

**Files:**

- Modify: `components/landing/navbar.tsx`

**Interfaces:**

- Consumes: `Link` from `next/link`, `usePathname` from `next/navigation`
- Produces: Updated Pricing link with active state

- [ ] **Step 1: Update the Pricing link in the navbar**

Open `components/landing/navbar.tsx`. Replace lines 109-114:

```tsx
<a href="/#pricing" className="transition-colors hover:text-indigo-600">
  Pricing
</a>
```

With:

```tsx
<div className="relative py-1">
  <Link
    href="/pricing"
    className={`transition-colors ${
      pathname === "/pricing"
        ? "font-semibold text-indigo-600"
        : "hover:text-indigo-600"
    }`}
  >
    Pricing
  </Link>
  {pathname === "/pricing" && (
    <div className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-indigo-600"></div>
  )}
</div>
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit 2>&1 | grep -i "navbar" || echo "No errors"`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/landing/navbar.tsx
git commit -m "feat(navbar): update Pricing link to /pricing route with active state"
```

---

### Task 15: Build Verification — Final build and type check

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript type check**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run full build**

Run: `cd /home/zealish/Projects/NextJS/wixvora && npx next build --turbopack 2>&1 | tail -30`
Expected: Build succeeds. `/pricing` route appears in build output.

- [ ] **Step 3: Verify route output**

Check build output for `○ /pricing` or `ƒ /pricing` line.

- [ ] **Step 4: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(pricing): address build errors if any"
```
