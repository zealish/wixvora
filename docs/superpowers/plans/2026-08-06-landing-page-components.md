# Landing Page Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the static HTML landing page into modular Next.js 16 React components (Navbar + Hero Section with interactive Builder Preview and Demo Modal) under `/components/landing/`.

**Architecture:** Component-per-section approach with server components for static content and client components for interactive parts. Uses existing Tailwind CSS + Lucide React icons (replacing FontAwesome). Custom CSS animations in `app/globals.css`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, TypeScript, Lucide React, next/font/google (Inter)

## Global Constraints

- Use `--font-inter` CSS variable (already configured in `app/layout.tsx`)
- Use Lucide React icons (existing dependency), NOT FontAwesome
- Tailwind CSS 4 with `@theme inline` syntax (no tailwind.config.ts)
- All colors use inline hex values (not extending theme) since no tailwind.config
- `app/globals.css` already has `floatSlow`, `pulseSoft`, `animate-pulse-soft` keyframes defined
- Components saved to `/components/landing/`
- Must preserve 100% visual fidelity to `/home/zealish/Downloads/wixvora_hero_section.html`

---

## File Structure

```
components/landing/
├── navbar.tsx              # Navigation header (server component)
├── hero-section.tsx        # Hero wrapper with background glows (server component)
├── builder-preview.tsx     # Interactive builder demo ("use client")
├── demo-modal.tsx          # Video demo modal ("use client")
└── index.ts                # Barrel export

app/(guest)/
└── page.tsx                # Updated to render landing components
```

---

### Task 1: Create Custom Styles in globals.css

**Files:**

- Modify: `app/globals.css`

**Purpose:** Add the missing custom CSS classes from the original HTML that aren't already present.

**What's already in globals.css:** `floatSlow`, `pulseSoft`, `animate-pulse-soft` keyframes + animation classes.

**What needs to be added:** `.text-gradient`, `.builder-selection-box`, `.builder-handle`, range slider styling.

- [ ] **Step 1: Add custom landing page styles to globals.css**

Append after the existing `@layer components` block in `app/globals.css`:

```css
/* Landing page gradient text */
.text-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Builder selection box */
.builder-selection-box {
  position: relative;
  outline: 2px solid #6366f1;
  outline-offset: 4px;
}

.builder-handle {
  width: 7px;
  height: 7px;
  background-color: #ffffff;
  border: 2px solid #6366f1;
  border-radius: 2px;
  position: absolute;
}

/* Range slider custom styling */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 2: Verify styles compile**

Run: `pnpm dev` (or check for build errors)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add landing page custom CSS styles"
```

---

### Task 2: Create Demo Modal Component

**Files:**

- Create: `components/landing/demo-modal.tsx`

**Interfaces:**

- Produces: `DemoModal` component with `isOpen: boolean` and `onClose: () => void` props

- [ ] **Step 1: Create demo-modal.tsx**

```tsx
"use client";

import { useEffect, useCallback } from "react";
import { X, PlayCircle } from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Wixvora AI Builder Demo
        </h3>
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white">
          <PlayCircle className="h-16 w-16 cursor-pointer text-indigo-500 transition hover:scale-110" />
          <p className="absolute bottom-4 text-xs text-slate-300">
            Interactive demo video preview
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `pnpm types:check`

- [ ] **Step 3: Commit**

```bash
git add components/landing/demo-modal.tsx
git commit -m "feat: add demo modal component"
```

---

### Task 3: Create Builder Preview Component

**Files:**

- Create: `components/landing/builder-preview.tsx`

**Interfaces:**

- Consumes: `onDemoClick?: () => void` callback prop
- Produces: `BuilderPreview` component with full interactive builder demo

- [ ] **Step 1: Create builder-preview.tsx**

```tsx
"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Plus,
  FileText,
  Wand2,
  Image,
  Sparkles,
  Settings,
  ArrowRight,
  Play,
  Check,
} from "lucide-react";

interface BuilderPreviewProps {
  onDemoClick?: () => void;
}

export function BuilderPreview({ onDemoClick }: BuilderPreviewProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [spacing, setSpacing] = useState(20);

  const canvasStyle = {
    backgroundColor: bgColor,
    maxWidth: deviceView === "mobile" ? "320px" : "100%",
  };

  return (
    <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12),0_10px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8L10 24L16 12L22 24L28 8"
              stroke="url(#mini_logo)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="mini_logo"
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
          <span className="text-sm font-black tracking-tight text-slate-900">
            WIXVORA
          </span>
        </div>

        <div className="flex items-center space-x-1 rounded-lg bg-slate-100/80 p-1 text-slate-500">
          <button
            onClick={() => setDeviceView("desktop")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              deviceView === "desktop"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeviceView("mobile")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              deviceView === "mobile"
                ? "bg-white text-slate-900 shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
            Preview
          </button>
          <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            Publish
          </button>
        </div>
      </div>

      {/* Builder Canvas */}
      <div
        className="relative flex min-h-[420px] overflow-hidden bg-slate-50/50 transition-all duration-300 sm:min-h-[460px]"
        style={canvasStyle}
      >
        {/* Left Sidebar */}
        <div className="w-36 flex-col space-y-1 border-r border-slate-100 bg-white p-3 text-xs font-medium text-slate-600 sm:w-44">
          {[
            { icon: Plus, label: "Add", iconClass: "text-slate-400" },
            { icon: FileText, label: "Pages", iconClass: "text-slate-400" },
            { icon: Wand2, label: "Design", iconClass: "text-slate-400" },
            { icon: Image, label: "Media", iconClass: "text-slate-400" },
            {
              icon: Sparkles,
              label: "AI Tools",
              iconClass: "text-indigo-500",
              active: true,
            },
          ].map(({ icon: Icon, label, iconClass, active }) => (
            <button
              key={label}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition ${
                active
                  ? "bg-indigo-50/70 font-semibold text-indigo-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-3 w-3 ${iconClass}`} />
              <span>{label}</span>
            </button>
          ))}
          <button className="mt-auto flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-slate-700 transition hover:bg-slate-50">
            <Settings className="h-3 w-3 text-slate-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Canvas Workspace */}
        <div
          className="flex flex-1 items-center justify-center p-6 transition-all sm:p-8"
          style={{ padding: `${spacing}px` }}
        >
          <div className="grid w-full max-w-xl grid-cols-1 items-center gap-6 md:grid-cols-12">
            {/* Editable Text Block */}
            <div className="builder-selection-box rounded-xl bg-white/60 p-3 md:col-span-7">
              <div className="builder-handle -top-1.5 -left-1.5" />
              <div className="builder-handle -top-1.5 -right-1.5" />
              <div className="builder-handle -bottom-1.5 -left-1.5" />
              <div className="builder-handle -right-1.5 -bottom-1.5" />
              <h2
                contentEditable
                suppressContentEditableWarning
                className="rounded px-1 text-2xl leading-tight font-black text-slate-900 outline-none focus:ring-1 focus:ring-indigo-300 sm:text-3xl"
              >
                Your Vision, Built with AI
              </h2>
              <p
                contentEditable
                suppressContentEditableWarning
                className="mt-4 rounded px-1 text-xs leading-relaxed text-slate-600 outline-none focus:ring-1 focus:ring-indigo-300 sm:text-sm"
              >
                Bring your ideas to life with beautiful, high-converting
                websites.
              </p>
              <div className="mt-4">
                <button className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700">
                  Get Started
                </button>
              </div>
            </div>

            {/* Image Card */}
            <div className="md:col-span-5">
              <div className="group relative h-44 w-full overflow-hidden rounded-2xl shadow-lg sm:h-52">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                  alt="Mountain Visual"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://placehold.co/400x500/4f46e5/ffffff?text=AI+Generated+Visual";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-indigo-900/30 to-transparent" />
                <div className="absolute right-3 bottom-3 left-3 text-white">
                  <div className="mb-1 h-6 w-6 rounded-full bg-indigo-300/40 backdrop-blur" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="absolute top-6 right-4 bottom-6 z-20 flex w-52 flex-col space-y-4 rounded-2xl border border-slate-100/80 bg-white/95 p-4 text-xs shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.03)] backdrop-blur-md sm:w-56">
          <div className="flex items-center border-b border-slate-100 pb-2">
            <button className="-mb-2 flex-1 border-b-2 border-indigo-600 pb-1.5 text-center font-semibold text-indigo-600">
              Section
            </button>
            <button className="flex-1 pb-1.5 text-center font-medium text-slate-400 hover:text-slate-600">
              Style
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Layout
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="mb-1 h-2 w-full rounded-sm bg-slate-200" />
                <div className="h-2 w-2/3 rounded-sm bg-slate-100" />
              </div>
              <div className="cursor-pointer rounded-lg border-2 border-indigo-600 bg-indigo-50/20 p-2">
                <div className="flex gap-1">
                  <div className="w-1/2 space-y-1">
                    <div className="h-1.5 rounded-sm bg-indigo-200" />
                    <div className="h-1.5 rounded-sm bg-slate-200" />
                  </div>
                  <div className="w-1/2 rounded-sm bg-indigo-200" />
                </div>
              </div>
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="mb-1 h-2 w-1/2 rounded-sm bg-slate-200" />
                <div className="h-2 w-full rounded-sm bg-slate-100" />
              </div>
              <div className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-indigo-400">
                <div className="flex gap-1">
                  <div className="w-1/2 rounded-sm bg-slate-200" />
                  <div className="w-1/2 space-y-1">
                    <div className="h-1.5 rounded-sm bg-slate-200" />
                    <div className="h-1.5 rounded-sm bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500">
              Background
            </span>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                <span className="font-mono text-[11px] font-medium text-slate-700 uppercase">
                  {bgColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-500">Spacing</span>
              <span className="font-medium text-slate-600">{spacing}</span>
            </div>
            <input
              type="range"
              min={8}
              max={40}
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `pnpm types:check`

- [ ] **Step 3: Commit**

```bash
git add components/landing/builder-preview.tsx
git commit -m "feat: add interactive builder preview component"
```

---

### Task 4: Create Navbar Component

**Files:**

- Create: `components/landing/navbar.tsx`

**Interfaces:**

- Produces: `Navbar` server component (no props)

- [ ] **Step 1: Create navbar.tsx**

```tsx
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  return (
    <header className="z-30 mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" className="group flex items-center gap-3">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 8L10 24L16 12L22 24L28 8"
              stroke="url(#logo_grad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="logo_grad"
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
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-900">
          WIXVORA
        </span>
      </Link>

      <nav className="hidden items-center space-x-10 text-[15px] font-medium text-slate-700 md:flex">
        <a href="#features" className="transition-colors hover:text-indigo-600">
          Features
        </a>
        <a
          href="#templates"
          className="transition-colors hover:text-indigo-600"
        >
          Templates
        </a>
        <a href="#pricing" className="transition-colors hover:text-indigo-600">
          Pricing
        </a>
        <div className="group flex cursor-pointer items-center gap-1.5 transition-colors hover:text-indigo-600">
          <span>Resources</span>
          <ChevronDown className="h-3 w-3 text-slate-400 transition-transform group-hover:rotate-180 group-hover:text-indigo-600" />
        </div>
      </nav>

      <div className="flex items-center space-x-6">
        <a
          href="#login"
          className="text-[15px] font-semibold text-slate-800 transition-colors hover:text-indigo-600"
        >
          Log in
        </a>
        <a
          href="#get-started"
          className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]"
        >
          Get Started Free
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `pnpm types:check`

- [ ] **Step 3: Commit**

```bash
git add components/landing/navbar.tsx
git commit -m "feat: add landing page navbar component"
```

---

### Task 5: Create Hero Section Component

**Files:**

- Create: `components/landing/hero-section.tsx`

**Interfaces:**

- Consumes: `DemoModal` from `./demo-modal`, `BuilderPreview` from `./builder-preview`
- Produces: `HeroSection` component (server wrapper with client children)

- [ ] **Step 1: Create hero-section.tsx**

```tsx
"use client";

import { useState } from "react";
import { ArrowRight, Play, Check } from "lucide-react";
import { BuilderPreview } from "./builder-preview";
import { DemoModal } from "./demo-modal";

export function HeroSection() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <main className="relative mx-auto my-auto w-full max-w-[1400px] px-6 py-8 md:px-12 lg:py-16">
        {/* Ambient Glows */}
        <div className="animate-pulse-soft pointer-events-none absolute top-0 -right-20 -z-10 h-[600px] w-[600px] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-[400px] w-[400px] rounded-full bg-blue-50/80 blur-3xl" />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy */}
          <div className="z-10 flex flex-col items-start space-y-7 pr-0 lg:col-span-5 lg:pr-2">
            <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/90 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-600 uppercase shadow-sm">
              AI-POWERED WEBSITE BUILDER
            </div>

            <h1 className="text-5xl leading-[1.08] font-black tracking-tight text-slate-900 sm:text-6xl lg:text-[62px]">
              Build <span className="text-gradient">Smarter.</span>
              <br />
              Launch <span className="text-gradient">Faster.</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed font-normal text-slate-600 sm:text-xl">
              Create professional websites effortlessly with the power of AI.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#build"
                className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45 active:scale-[0.98]"
              >
                <span>Start Building for Free</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <button
                onClick={() => setIsDemoOpen(true)}
                className="group inline-flex items-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-indigo-600 transition-all hover:bg-indigo-50/60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-500/30 bg-white text-indigo-600 shadow-sm transition-all group-hover:scale-110 group-hover:border-indigo-600">
                  <Play className="h-3 w-3 translate-x-[1px]" />
                </span>
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3.5 border-t border-slate-100 pt-6 text-sm font-medium text-slate-700">
              {[
                "No Coding Needed",
                "AI-Powered",
                "Mobile Responsive",
                "SEO Optimized",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Builder Preview */}
          <div className="relative w-full pt-4 lg:col-span-7 lg:pt-0">
            {/* Decorative Sparkle */}
            <div className="animate-float pointer-events-none absolute -top-10 right-28 z-20 hidden sm:block">
              <div className="relative">
                <svg
                  width="120"
                  height="80"
                  viewBox="0 0 120 80"
                  fill="none"
                  className="text-indigo-400"
                >
                  <path
                    d="M10 70 Q 60 10, 110 30"
                    stroke="#818CF8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            </div>

            {/* Decorative Star */}
            <div className="animate-pulse-soft pointer-events-none absolute top-12 -right-6 z-20 hidden text-amber-400 sm:block">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            <BuilderPreview onDemoClick={() => setIsDemoOpen(true)} />
          </div>
        </div>
      </main>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `pnpm types:check`

- [ ] **Step 3: Commit**

```bash
git add components/landing/hero-section.tsx
git commit -m "feat: add landing page hero section component"
```

---

### Task 6: Create Barrel Export

**Files:**

- Create: `components/landing/index.ts`

- [ ] **Step 1: Create index.ts**

```ts
export { Navbar } from "./navbar";
export { HeroSection } from "./hero-section";
export { BuilderPreview } from "./builder-preview";
export { DemoModal } from "./demo-modal";
```

- [ ] **Step 2: Commit**

```bash
git add components/landing/index.ts
git commit -m "feat: add landing components barrel export"
```

---

### Task 7: Update Guest Landing Page

**Files:**

- Modify: `app/(guest)/page.tsx`

**Interfaces:**

- Consumes: `Navbar`, `HeroSection` from `@/components/landing`

- [ ] **Step 1: Update page.tsx**

```tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";

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
    </>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `pnpm types:check && pnpm lint`

- [ ] **Step 3: Commit**

```bash
git add app/\(guest\)/page.tsx
git commit -m "feat: integrate landing page components into guest page"
```

---

### Task 8: Final Verification

- [ ] **Step 1: Run type check**

Run: `pnpm types:check`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors

- [ ] **Step 3: Run dev server and visually verify**

Run: `pnpm dev`
Open `http://localhost:3000` in browser

Verify against original HTML:

- Navbar renders with logo, nav links, auth buttons
- Hero section shows badge, headline, subtitle, CTAs, feature grid
- Builder preview is interactive (device switcher, color picker, spacing slider)
- Demo modal opens/closes correctly
- Responsive layout matches at all breakpoints
- Animations work (float, pulse-soft)
- Gradient text renders correctly

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: visual fidelity adjustments for landing page"
```
