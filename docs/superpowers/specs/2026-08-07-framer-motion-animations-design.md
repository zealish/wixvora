# Framer Motion Landing Page Animations Design

**Date:** 2026-08-07  
**Status:** Approved  
**Scope:** Scroll-triggered animations for all landing page sections

## Overview

Add Framer Motion scroll-triggered animations to the Wixvora landing page to create a premium, engaging experience that showcases the website builder's professionalism.

## Animation Strategy

### Global Approach

- Trigger: `useInView` with `viewport={{ once: true, amount: 0.2 }}` — animate once when 20% visible
- Transitions: Spring-based (`type: "spring"`) for organic feel
- Stagger: 0.15-0.2s delay between children for sequential reveal
- Performance: GPU-accelerated properties only (opacity, transform, scale)

### Per-Section Animations

**HeroSection:**

- Heading: `fade-up` (y: 40→0, opacity: 0→1), duration 0.6s
- Subtext: `fade-up`, delay 0.15s
- Buttons: `scale-in` (scale: 0.9→1, opacity: 0→1), delay 0.3s
- BuilderPreview: `fade-left` (x: 60→0, opacity: 0→1), delay 0.2s

**FeaturesGrid:**

- Badge/Heading: `fade-up`
- Cards: staggered `scale-fade` (scale: 0.95→1, opacity: 0→1), stagger 0.1s
- 6 cards reveal sequentially

**HowItWorks:**

- Badge/Heading: `fade-up`
- Steps: staggered `fade-up`, stagger 0.15s
- Each step slides up with increasing delay

**TemplateShowcase:**

- Left column (text): `fade-right` (x: -40→0, opacity: 0→1)
- Right column (carousel): `fade-left` (x: 40→0, opacity: 0→1)
- No animation on Swiper itself (already has 3D coverflow)

**StatsSection:**

- Stat cards: staggered `fade-up`, stagger 0.1s
- Counter animation: numbers count from 0 to final value using `useMotionValue` + `useTransform`

**CtaSection:**

- Left column (text + button): `fade-right` (x: -40→0)
- Right column (analytics + mockup): `fade-left` (x: 40→0)
- Directional flow draws eye toward CTA

**Footer:**

- Simple `fade-up` for entire footer

## Technical Approach

### Wrapper Component Pattern

Create a reusable `MotionWrapper` component to avoid repeating motion props:

```tsx
"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
```

Each section wraps its content in `motion.div` with appropriate variants.

### Dependencies

- `framer-motion` (latest v11+)

### Files to Modify

| File                                       | Change                         |
| ------------------------------------------ | ------------------------------ |
| `package.json`                             | Add framer-motion              |
| `components/landing/hero-section.tsx`      | Add motion wrappers            |
| `components/landing/features-grid.tsx`     | Add motion wrappers + stagger  |
| `components/landing/how-it-works.tsx`      | Add motion wrappers + stagger  |
| `components/landing/template-showcase.tsx` | Add directional fade           |
| `components/landing/stats-section.tsx`     | Add motion + counter animation |
| `components/landing/cta-section.tsx`       | Add directional fade           |
| `components/landing/footer.tsx`            | Add fade-up                    |

### Counter Animation (StatsSection)

For the "10K+", "50K+", "100+", "99.9%" stats:

- Use `useMotionValue(0)` + `useTransform` to animate numbers
- Parse numeric value, animate from 0 to target
- Format with suffix (K+, %, etc.)
- Trigger on viewport entry

## Success Criteria

1. ✅ All sections animate on scroll (first time only)
2. ✅ Staggered reveals for cards and steps
3. ✅ Counter animation for stats
4. ✅ Directional animations for CTA section
5. ✅ No layout shift (animations use transform/opacity only)
6. ✅ TypeScript clean
7. ✅ No performance regression
