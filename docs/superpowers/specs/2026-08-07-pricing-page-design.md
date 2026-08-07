# Pricing Page Design Specification

**Date:** 2026-08-07  
**Project:** Wixvora (Next.js)  
**Reference:** `/home/zealish/Downloads/wixvora_pricing_page.html`

---

## Overview

Create a dedicated `/pricing` page in the guest layout with highly modular components, React Context for state management, and Framer Motion animations. The page will display 4 pricing tiers (Free, Starter, Pro, Premium) with monthly/yearly billing toggle, feature comparison table, FAQ accordion, and CTA banner.

---

## Architecture

### Route Structure
- **Route:** `app/(guest)/pricing/page.tsx`
- **Layout:** Wrapped by `app/(guest)/layout.tsx` (includes Navbar + Footer)
- **Client Component:** Page uses `'use client'` directive due to React Context and interactivity

### Component Organization

**Directory:** `components/pricing/`

**Components (11 files + barrel export):**

1. `pricing-provider.tsx` - React Context for billing cycle state
2. `pricing-hero.tsx` - Hero section with text + visual cards
3. `hero-visual-cards.tsx` - Animated stacked mockup cards (browser, pill, badge)
4. `billing-toggle.tsx` - Monthly/yearly segmented control
5. `pricing-cards-grid.tsx` - Grid wrapper + data for 4 pricing cards
6. `pricing-card.tsx` - Individual pricing plan card component
7. `comparison-table.tsx` - Feature comparison table
8. `faq-section.tsx` - FAQ list wrapper with state management
9. `faq-item.tsx` - Individual collapsible FAQ accordion item
10. `pricing-cta-banner.tsx` - Bottom CTA banner
11. `index.ts` - Barrel exports

---

## State Management

### PricingContext (`pricing-provider.tsx`)

**Purpose:** Centralized billing cycle state shared across all pricing components.

**Type Definitions:**
```typescript
type BillingCycle = 'monthly' | 'yearly';

interface PricingContextType {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
}
```

**Implementation:**
- React Context + Provider pattern
- Default state: `billingCycle = 'monthly'`
- Single state hook: `useState<BillingCycle>('monthly')`
- Exposes: `billingCycle` value and `setBillingCycle` setter

**Consumers:**
- `billing-toggle.tsx` - Calls `setBillingCycle` on button click
- `pricing-card.tsx` - Reads `billingCycle` to display correct price
- `comparison-table.tsx` - Optional cycle-aware rendering

### FAQ Accordion State (`faq-section.tsx`)

**Purpose:** Single-item accordion behavior (opening one closes others).

**Implementation:**
- Local state: `useState<string | null>(null)` tracking open FAQ ID
- Pass `openId` and `setOpenId` to each `faq-item.tsx`
- Each item checks `isOpen = (openId === item.id)`
- Clicking open item closes it; clicking closed item opens it and closes others

---

## Data Structures

### Pricing Plans Data

**Location:** Inline constant in `pricing-cards-grid.tsx`

**Type:**
```typescript
interface PricingPlan {
  id: 'free' | 'starter' | 'pro' | 'premium';
  name: string;
  description: string;
  prices: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  unavailable?: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'gradient';
  popular: boolean;
}

const PRICING_PLANS: PricingPlan[] = [...]
```

**Data (from reference HTML):**

**Free Plan:**
- Monthly: $0, Yearly: $0
- Description: "Perfect for trying out Wixvora."
- Features: AI Website Builder, 500 MB Storage, 1 Subdomain, Mobile Responsive, Wixvora Branding, Community Support
- Unavailable: Custom Domain, Premium Templates
- Button: "Get Started" (outline)
- Popular: false

**Starter Plan:**
- Monthly: $9, Yearly: $7
- Description: "Great for personal projects and small websites."
- Header: "Everything in Free, plus:"
- Features: 10 GB Storage, Custom Domain, Remove Wixvora Branding, Premium Templates, Basic SEO Tools, Email Support, Advanced Analytics
- Button: "Get Started" (outline)
- Popular: false

**Pro Plan:**
- Monthly: $19, Yearly: $15
- Description: "Ideal for growing businesses and professionals."
- Header: "Everything in Starter, plus:"
- Features: 50 GB Storage, Advanced SEO Tools, AI Content Generator, Form & Popup Builder, Advanced Analytics, Priority Support, Team Collaboration
- Button: "Get Started" (gradient)
- Popular: true
- Badge: "MOST POPULAR"

**Premium Plan:**
- Monthly: $39, Yearly: $31
- Description: "For businesses that need more power."
- Header: "Everything in Pro, plus:"
- Features: Unlimited Storage, Team Collaboration, White Label (Coming Soon), API Access, Dedicated Support, Priority Feature Access
- Button: "Get Started" (outline)
- Popular: false

### Comparison Table Data

**Location:** Inline constant in `comparison-table.tsx`

**Rows (8 features):**
1. AI Website Builder - ✓ ✓ ✓ ✓
2. Storage - 500 MB / 10 GB / 50 GB / Unlimited
3. Custom Domain - ✗ ✓ ✓ ✓
4. Premium Templates - Limited / ✓ ✓ ✓
5. SEO Tools - Basic / Basic / Advanced / Advanced
6. AI Content Generator - ✗ ✗ ✓ ✓
7. Team Collaboration - ✗ ✗ ✗ ✓
8. Support - Community / Email / Priority / Dedicated

**Icons:**
- ✓ = `Check` icon (indigo-600)
- ✗ = `Minus` icon (slate-300)
- Text values = plain text (slate-500/slate-700)

### FAQ Data

**Location:** Inline constant in `faq-section.tsx`

**Type:**
```typescript
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [...]
```

**Data (3 items from HTML):**
1. **Q:** "Can I upgrade or downgrade my plan?"  
   **A:** "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account dashboard. Changes will take effect immediately."

2. **Q:** "Is there a free trial?"  
   **A:** "Yes! Our Free plan allows you to test out the AI Builder and explore template customization completely free with no time limit or credit card required."

3. **Q:** "What payment methods do you accept?"  
   **A:** "We accept all major credit cards including Visa, Mastercard, American Express, PayPal, and Google Pay."

---

## Component Specifications

### 1. pricing-provider.tsx

**Type:** Client component  
**Purpose:** React Context provider for billing cycle state

**Exports:**
- `PricingProvider` component (wraps children)
- `usePricing()` hook for consuming context

**Implementation:**
- Create context with `createContext<PricingContextType>`
- Provider manages `useState<BillingCycle>('monthly')`
- Hook throws error if used outside provider

### 2. pricing-hero.tsx

**Type:** Client component  
**Purpose:** Hero section with heading, description, badges, and visual cards

**Layout:**
- Grid: 2 columns on lg+ (7/5 split), stacked on mobile
- Left: Text content (badge, heading, description, checkmarks)
- Right: Visual cards component

**Content:**
- Badge: "PRICING" (brand-50 bg, brand-600 text)
- Heading: "Simple, Transparent Pricing for **Everything You Need**" (gradient on bold text)
- Description: "Choose the perfect plan to build, manage, and grow your website with AI."
- Checkmarks: "No credit card required" + "Cancel anytime" (with Check icons)

**Animation:**
- Wrap text elements in `MotionWrapper` with `variant="fade-up"`
- Stagger badge → heading → description → checkmarks
- Visual cards have custom animations (see hero-visual-cards.tsx)

### 3. hero-visual-cards.tsx

**Type:** Client component  
**Purpose:** Animated stacked mockup cards

**Visual Elements:**
1. **Golden sparkle** - Absolute positioned top-right, `animate-pulse` (Tailwind)
2. **Browser card** - White rounded card with address bar, `-rotate-2`, shadow-xl
3. **Success pill** - "Your Site is Live!" with progress bar, floating left, continuous bounce animation
4. **AI badge** - Gradient card "AI-Powered / Smarter Websites", bottom-right, `rotate-3`

**Framer Motion Animations:**
- Browser card: `initial={{ opacity: 0, rotate: -2, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`
- Success pill: Continuous bounce with `animate={{ y: [-5, 5, -5] }}`, `transition={{ repeat: Infinity, duration: 3 }}`
- AI badge: Scale on hover, `whileHover={{ scale: 1.05 }}`

**Icons:**
- Lock, Layout, CheckCircle2 (from lucide-react)

### 4. billing-toggle.tsx

**Type:** Client component  
**Purpose:** Monthly/yearly segmented control

**Functionality:**
- Reads `billingCycle` from `usePricing()`
- Calls `setBillingCycle` on button click
- Two buttons: "Monthly" / "Yearly + Save 20% badge"

**Styling:**
- Container: slate-100 background, rounded-2xl, p-1, shadow-inner
- Active button: white bg, shadow-sm, font-bold
- Inactive button: transparent, font-semibold, slate-600
- Badge on yearly: emerald-100 bg, emerald-700 text, "SAVE 20%"

**Animation:**
- Framer Motion `layout` prop on buttons for smooth transition
- Active background slides between buttons

### 5. pricing-cards-grid.tsx

**Type:** Client component  
**Purpose:** Grid container + maps over PRICING_PLANS data

**Layout:**
- Grid: 1 col (mobile) → 2 cols (md) → 4 cols (lg)
- Gap: gap-6
- Items stretch: `items-stretch`

**Animation:**
- Wrap grid in `StaggerContainer`
- Each card wrapped in `StaggerItem`

**Data:**
- Contains `PRICING_PLANS` constant (see Data Structures)
- Maps over plans, passes each to `pricing-card.tsx`

### 6. pricing-card.tsx

**Type:** Client component  
**Props:**
```typescript
interface PricingCardProps {
  plan: PricingPlan;
}
```

**Functionality:**
- Reads `billingCycle` from `usePricing()`
- Displays price based on cycle: `plan.prices[billingCycle]`
- Shows "MOST POPULAR" badge if `plan.popular === true`

**Layout:**
- White rounded-3xl card with border
- Popular card: border-2 border-brand-600, elevated with `lg:-translate-y-2`
- Sections: Header (name, description) / Price / Button / Features list

**Styling:**
- Popular badge: Absolute top, center, brand-600 bg, white text
- Button: Gradient if popular, outline otherwise
- Features: Check icons (indigo-600) for included, X icons (slate-300) for unavailable
- Shadow: `.card-shadow` for normal, `.popular-card-shadow` for popular

**Animation:**
- Hover: `translateY(-4px)` via CSS transition
- Shadow change on hover

### 7. comparison-table.tsx

**Type:** Client component  
**Purpose:** Feature comparison table for all plans

**Structure:**
- Responsive table with horizontal scroll on mobile
- Sticky first column (feature name)
- 5 columns: Feature / Free / Starter / Pro / Premium
- Pro column highlighted with subtle background

**Content:**
- Header row with plan names
- Pro header shows "MOST POPULAR" badge
- 8 data rows (see Data Structures)

**Icons:**
- Check (indigo-600), Minus (slate-300)
- Pro column cells: `bg-indigo-50/20` background

**Animation:**
- Rows fade up on scroll with `MotionWrapper` or stagger

**Accessibility:**
- Semantic `<table>` with `<thead>`, `<tbody>`
- `overflow-x-auto` wrapper

### 8. faq-section.tsx

**Type:** Client component  
**Purpose:** FAQ list with accordion behavior

**State:**
- Local state: `const [openId, setOpenId] = useState<string | null>(null)`
- Only one FAQ open at a time

**Layout:**
- Container: max-w-4xl, centered
- Heading: "Frequently Asked Questions"
- Grid: single column with gap-4

**Data:**
- Contains `FAQ_DATA` constant
- Maps over items, passes to `faq-item.tsx`

**Props passed to items:**
- `item: FAQItem`
- `isOpen: boolean` (openId === item.id)
- `onToggle: () => void` (updates openId)

### 9. faq-item.tsx

**Type:** Client component  
**Props:**
```typescript
interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}
```

**Functionality:**
- Button toggles accordion on click
- Icon rotates 0deg → 45deg when open (plus to X)
- Answer content expands/collapses

**Animation:**
- `AnimatePresence` wraps answer content
- Answer: `initial={{ height: 0, opacity: 0 }}`, `animate={{ height: 'auto', opacity: 1 }}`
- Icon rotation: Framer Motion `animate={{ rotate: isOpen ? 45 : 0 }}`

**Styling:**
- White rounded-2xl card with border
- Button: full width, font-bold, flex justify-between
- Answer: text-slate-600, padded, hidden when closed

**Accessibility:**
- Button has `aria-expanded={isOpen}`
- Answer div has `role="region"`

### 10. pricing-cta-banner.tsx

**Type:** Client component  
**Purpose:** Bottom CTA banner encouraging signup

**Layout:**
- Gradient background: `from-indigo-50 via-purple-50 to-blue-50`
- Flexbox: column on mobile, row on md+
- Icon + text on left, button on right

**Content:**
- Icon: Sparkles (indigo-600, in white rounded box)
- Heading: "Ready to build your dream website?"
- Subtext: "Join thousands of creators and businesses who build faster with Wixvora."
- Button: "Get Started Free" + ArrowRight icon

**Animation:**
- Wrap in `MotionWrapper` with `variant="fade-up"`
- Button hover: scale-105 + shadow-indigo-200

### 11. index.ts

**Purpose:** Barrel exports for clean imports

**Exports:**
```typescript
export { PricingProvider, usePricing } from './pricing-provider';
export { default as PricingHero } from './pricing-hero';
export { default as HeroVisualCards } from './hero-visual-cards';
export { default as BillingToggle } from './billing-toggle';
export { default as PricingCardsGrid } from './pricing-cards-grid';
export { default as PricingCard } from './pricing-card';
export { default as ComparisonTable } from './comparison-table';
export { default as FaqSection } from './faq-section';
export { default as FaqItem } from './faq-item';
export { default as PricingCtaBanner } from './pricing-cta-banner';
```

---

## Page Implementation

### app/(guest)/pricing/page.tsx

**Structure:**
```typescript
'use client';

import {
  PricingProvider,
  PricingHero,
  BillingToggle,
  PricingCardsGrid,
  ComparisonTable,
  FaqSection,
  PricingCtaBanner
} from '@/components/pricing';

export default function PricingPage() {
  return (
    <PricingProvider>
      <PricingHero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

**Metadata:**
- Export metadata object with title and description
- Title: "Pricing - Wixvora"
- Description: "Simple, transparent pricing for everything you need to build your website."

---

## Styling

### Global CSS Updates

**Add to `app/globals.css`:**

```css
.card-shadow {
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05),
              0 2px 6px -1px rgba(15, 23, 42, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08),
              0 10px 10px -5px rgba(15, 23, 42, 0.03);
}

.popular-card-shadow {
  box-shadow: 0 20px 35px -5px rgba(79, 70, 229, 0.15),
              0 10px 15px -5px rgba(79, 70, 229, 0.05);
}
```

**Note:** `.hero-bg` already exists from templates page.

### Brand Colors

**Already defined in globals.css:**
- `--color-brand-50: #EEF2FF`
- `--color-brand-100: #E0E7FF`
- `--color-brand-500: #6366F1`
- `--color-brand-600: #4F46E5`
- `--color-brand-700: #4338CA`

**Usage:**
- `bg-brand-50`, `text-brand-600`, `border-brand-600`, etc.

### Responsive Design

**Breakpoints (Tailwind defaults):**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

**Key responsive patterns:**
- Hero: `lg:col-span-7` / `lg:col-span-5`
- Cards grid: `md:grid-cols-2 lg:grid-cols-4`
- Text sizes: `text-4xl sm:text-5xl lg:text-6xl`
- Padding: `px-4 sm:px-6 lg:px-8`

---

## Navbar Integration

### Update: components/landing/navbar.tsx

**Change:**
- Replace `<a href="/#pricing">` with `<Link href="/pricing">`
- Add active state detection using `usePathname()`

**Implementation:**
```typescript
const pathname = usePathname();
const isPricingActive = pathname === '/pricing';
```

**Active styling (same as Templates):**
- `font-semibold text-indigo-600`
- Bottom border: `border-b-2 border-indigo-600`

**Link structure:**
```tsx
<Link
  href="/pricing"
  className={cn(
    "transition-colors",
    isPricingActive
      ? "font-semibold text-indigo-600 border-b-2 border-indigo-600"
      : "text-slate-600 hover:text-indigo-600"
  )}
>
  Pricing
</Link>
```

---

## Icons

**Library:** `lucide-react`

**Icons used:**
- `Check` - Feature checkmarks, table
- `X` - Unavailable features
- `Minus` - Table not available
- `Plus` - FAQ closed state
- `Lock` - Browser address bar
- `Layout` - Browser placeholder
- `CheckCircle2` - Success pill
- `Sparkles` - CTA banner
- `ArrowRight` - CTA button

**Import:**
```typescript
import { Check, X, Minus, Plus, Lock, Layout, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
```

---

## Animations Summary

### Using MotionWrapper (from landing components)

**Components:**
- Hero text sections: `variant="fade-up"`
- CTA banner: `variant="fade-up"`
- Comparison table sections: `variant="fade-up"`

### Using StaggerContainer/StaggerItem

**Components:**
- Pricing cards grid: Wrap grid in `StaggerContainer`, each card in `StaggerItem`

### Custom Framer Motion

**Components:**
- Hero visual cards: Custom animations (rotate, bounce, scale)
- Billing toggle: `layout` prop for smooth transitions
- FAQ items: `AnimatePresence` + height/opacity animations
- Icon rotations: Plus to X (45deg)

**Animation principles:**
- Subtle and smooth (not distracting)
- Consistent timing: 0.3s - 0.5s durations
- Scroll-triggered with `useInView` (via MotionWrapper)
- `once={true}` for scroll animations (don't repeat)

---

## Accessibility

### Semantic HTML
- `<section>` for major page sections
- `<article>` for pricing cards
- `<table>` for comparison table
- `<button>` for interactive elements (not divs)

### ARIA Attributes
- FAQ buttons: `aria-expanded={isOpen}`
- FAQ answers: `role="region"`, `aria-labelledby`
- Icon-only elements: `aria-label` or `aria-hidden="true"` if decorative

### Keyboard Navigation
- All interactive elements focusable
- Visible focus states: `focus:outline-none focus:ring-4 focus:ring-brand-500/10`
- FAQ accordion navigable with Tab + Enter/Space

### Color Contrast
- Text: slate-900 on white (AAA)
- Secondary text: slate-600 on white (AA)
- Links/interactive: brand-600 with hover states

---

## Testing Checklist

### Functionality
- [ ] Billing toggle switches monthly/yearly prices correctly
- [ ] Prices update in all pricing cards simultaneously
- [ ] FAQ accordion: opening one closes others
- [ ] FAQ icons rotate correctly
- [ ] Navbar shows active state on /pricing
- [ ] All buttons are clickable (placeholder behavior OK)

### Responsive Design
- [ ] Hero stacks correctly on mobile
- [ ] Pricing cards: 1 → 2 → 4 column layout works
- [ ] Comparison table scrolls horizontally on mobile
- [ ] All text is readable at mobile sizes
- [ ] Visual cards don't overflow on small screens

### Animations
- [ ] Hero elements fade up on load
- [ ] Pricing cards stagger in sequence
- [ ] Billing toggle transitions smoothly
- [ ] FAQ items expand/collapse with AnimatePresence
- [ ] Visual cards animate (rotate, bounce, scale)
- [ ] Hover effects work on cards and buttons

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] Screen reader: FAQ accordion announces state
- [ ] Color contrast passes WCAG AA
- [ ] No console errors with Lighthouse accessibility audit

### Build
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] Page renders as static or dynamic correctly
- [ ] No hydration errors

---

## Dependencies

**Existing (already in project):**
- `next` (16.3.0)
- `react`, `react-dom`
- `framer-motion` (v13)
- `lucide-react`
- `tailwindcss` (v4)

**No new dependencies required.**

---

## Future Enhancements (Out of Scope)

- Currency switcher (USD, EUR, GBP)
- Annual billing discount calculator
- Plan feature comparison filters
- Custom plan contact form
- Integration with payment API
- User testimonials section
- Live pricing calculator with add-ons
- Promo code input field

---

## Summary

This design creates a fully functional, animated, and accessible pricing page using React Context for state management, highly modular components for maintainability, and Framer Motion for smooth animations. The page matches the reference HTML exactly in terms of content, layout, and styling while following Next.js and React best practices.

**Key architectural decisions:**
1. **React Context** - Centralized billing state shared across components
2. **Modular components** - 11 focused components with single responsibilities
3. **FAQ accordion** - Only one item open at a time for better UX
4. **Framer Motion** - Consistent with existing landing/templates pages
5. **Responsive design** - Mobile-first with Tailwind breakpoints
6. **Accessibility** - Semantic HTML, ARIA, keyboard navigation

The implementation will follow the existing codebase patterns (TypeScript, Tailwind v4, component structure) and integrate seamlessly with the guest layout and navbar.
