# Guest Layout Scrollbar Accent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply custom indigo accent scrollbar styling to the guest layout group.

**Architecture:** Add a `.scrollbar-accent` CSS class in `globals.css` with Webkit and Firefox scrollbar pseudo-elements, then apply it to the guest layout wrapper div.

**Tech Stack:** Next.js, Tailwind CSS, CSS custom scrollbar properties

## Global Constraints

- Scrollbar thumb: `#4F46E5` (brand-600 indigo)
- Thumb hover: `#818CF8` (indigo-400)
- Thumb active: `#A5B4FC` (indigo-300)
- Track: `rgba(0, 0, 0, 0.02)`
- Width: `8px`
- Border radius: `4px`
- Placement: `@layer components` in `globals.css`, after existing landing page animations

---

## File Structure

| Action | File                     | Responsibility                                        |
| ------ | ------------------------ | ----------------------------------------------------- |
| Modify | `app/globals.css`        | Add `.scrollbar-accent` styles in `@layer components` |
| Modify | `app/(guest)/layout.tsx` | Add `scrollbar-accent` class to wrapper div           |

---

### Task 1: Add scrollbar accent styles to globals.css

**Files:**

- Modify: `app/globals.css:268` (after the existing `@layer components` closing brace)

**Interfaces:**

- Produces: `.scrollbar-accent` CSS class with Webkit and Firefox scrollbar styles

- [ ] **Step 1: Add scrollbar accent styles**

Add the following CSS block inside the existing `@layer components` section in `app/globals.css`, after the `.builder-handle` rule (line 236) and before the `@layer components` closing brace:

```css
/* Guest layout scrollbar accent styling */
.scrollbar-accent {
  scrollbar-color: #4f46e5 transparent;
  scrollbar-width: thin;
}

.scrollbar-accent::-webkit-scrollbar {
  width: 8px;
}

.scrollbar-accent::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
}

.scrollbar-accent::-webkit-scrollbar-thumb {
  background: #4f46e5;
  border-radius: 4px;
}

.scrollbar-accent::-webkit-scrollbar-thumb:hover {
  background: #818cf8;
}

.scrollbar-accent::-webkit-scrollbar-thumb:active {
  background: #a5b4fc;
}
```

- [ ] **Step 2: Verify CSS syntax**

Run: `npx tailwindcss --input app/globals.css --output /dev/null`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style(scrollbar): add accent scrollbar styles for guest layout"
```

---

### Task 2: Apply scrollbar accent class to guest layout

**Files:**

- Modify: `app/(guest)/layout.tsx:6`

**Interfaces:**

- Consumes: `.scrollbar-accent` CSS class from Task 1

- [ ] **Step 1: Add class to guest layout wrapper**

In `app/(guest)/layout.tsx`, change line 6 from:

```tsx
<div className="flex min-h-screen flex-col">
```

to:

```tsx
<div className="flex min-h-screen flex-col scrollbar-accent">
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify dev server starts**

Run: `pnpm dev`
Expected: Server starts without errors, pages under `/(guest)/` render normally

- [ ] **Step 4: Commit**

```bash
git add app/\(guest\)/layout.tsx
git commit -m "feat(guest): apply scrollbar accent class to guest layout"
```

---

## Self-Review

1. **Spec coverage:** All requirements covered — thumb color, hover, active, track, width, radius, Firefox fallback, scoping to guest layout.
2. **Placeholder scan:** No TBD/TODO/placeholders. All code is complete.
3. **Type consistency:** N/A — CSS-only changes, no types involved.
