# Inter Font for Staff and Client Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Inter font to staff and client layout sections while preserving Geist fonts for guest/auth sections.

**Architecture:** Import Inter font from `next/font/google` in both `(staff)/layout.tsx` and `(client)/layout.tsx`, create CSS variables, and wrap children in divs with font classes for cascading typography.

**Tech Stack:** Next.js 16.3.0, next/font/google, Tailwind CSS, TypeScript

## Global Constraints

- Use Inter font from `next/font/google` only
- Latin subset only
- CSS variable name: `--font-inter`
- No modifications to root layout or globals.css
- Preserve existing Geist fonts for guest/auth sections

---

## File Structure

**Files to Modify:**

- `app/(staff)/layout.tsx` - Add Inter font import and wrapper div
- `app/(client)/layout.tsx` - Add Inter font import and wrapper div

**Files Not Modified:**

- `app/layout.tsx` - Root layout unchanged
- `app/globals.css` - No CSS changes needed

---

### Task 1: Add Inter Font to Staff Layout

**Files:**

- Modify: `app/(staff)/layout.tsx`

**Interfaces:**

- Consumes: `LayoutProps` type (already defined)
- Produces: Staff layout with Inter font applied to all child routes

- [ ] **Step 1: Read current staff layout**

Run: Read the file to understand current structure

```bash
cat app/\(staff\)/layout.tsx
```

Expected: Simple wrapper component with children prop

- [ ] **Step 2: Add Inter font import and configuration**

Add at the top of `app/(staff)/layout.tsx`:

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
```

- [ ] **Step 3: Wrap children with font class**

Replace the return statement:

```typescript
export default function StaffLayoutWrapper({ children }: LayoutProps<'/'>) {
  return (
    <div className={`${inter.variable} font-sans`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: No TypeScript errors

- [ ] **Step 5: Start dev server and verify font loads**

Run: `npm run dev`
Navigate to a staff route (e.g., `/staff`)
Open DevTools → Network → Filter by "font"
Expected: Inter font files loaded (inter-*.woff2)

- [ ] **Step 6: Commit changes**

```bash
git add app/\(staff\)/layout.tsx
git commit -m "feat: add Inter font to staff layout"
```

---

### Task 2: Add Inter Font to Client Layout

**Files:**

- Modify: `app/(client)/layout.tsx`

**Interfaces:**

- Consumes: `LayoutProps` type (already defined)
- Produces: Client layout with Inter font applied to all child routes

- [ ] **Step 1: Read current client layout**

Run: Read the file to understand current structure

```bash
cat app/\(client\)/layout.tsx
```

Expected: Simple wrapper component with children prop

- [ ] **Step 2: Add Inter font import and configuration**

Add at the top of `app/(client)/layout.tsx`:

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
```

- [ ] **Step 3: Wrap children with font class**

Replace the return statement:

```typescript
export default function ClientLayoutWrapper({ children }: LayoutProps<'/'>) {
  return (
    <div className={`${inter.variable} font-sans`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npm run types:check`
Expected: No TypeScript errors

- [ ] **Step 5: Verify font loads in client routes**

With dev server running, navigate to a client route (e.g., `/client`)
Open DevTools → Network → Filter by "font"
Expected: Inter font files loaded (inter-*.woff2)

- [ ] **Step 6: Commit changes**

```bash
git add app/\(client\)/layout.tsx
git commit -m "feat: add Inter font to client layout"
```

---

### Task 3: Visual Verification

**Files:**

- None (verification only)

**Interfaces:**

- Consumes: Completed staff and client layouts with Inter font
- Produces: Verified font rendering across all route groups

- [ ] **Step 1: Verify Inter font in staff routes**

Navigate to: `/staff` or any staff route
Open DevTools → Elements → Computed
Select any text element
Expected: Font family shows "Inter" or "__Inter_xxxxxx"

- [ ] **Step 2: Verify Inter font in client routes**

Navigate to: `/client` or any client route
Open DevTools → Elements → Computed
Select any text element
Expected: Font family shows "Inter" or "__Inter_xxxxxx"

- [ ] **Step 3: Verify Geist font in guest routes**

Navigate to: `/` or any guest route
Open DevTools → Elements → Computed
Select any text element
Expected: Font family shows "Geist" or "__Geist_xxxxxx" (not Inter)

- [ ] **Step 4: Verify Geist font in auth routes**

Navigate to: `/login` or any auth route
Open DevTools → Elements → Computed
Select any text element
Expected: Font family shows "Geist" or "__Geist_xxxxxx" (not Inter)

- [ ] **Step 5: Build verification**

Run: `npm run build`
Expected: No errors or warnings, successful build

- [ ] **Step 6: Final commit (if any fixes were needed)**

If any issues were found and fixed:

```bash
git add .
git commit -m "fix: address font rendering issues"
```

Otherwise, verification complete - no commit needed.

---

## Self-Review Checklist

**Spec coverage:**

- ✅ Staff routes use Inter font (Task 1)
- ✅ Client routes use Inter font (Task 2)
- ✅ Guest/auth routes preserve Geist (Task 3)
- ✅ No root layout modifications (enforced in tasks)
- ✅ Next.js font optimization (automatic via next/font/google)

**Placeholder scan:**

- ✅ No TBD/TODO items
- ✅ All code blocks complete
- ✅ All commands have expected output
- ✅ Exact file paths provided

**Type consistency:**

- ✅ `LayoutProps<'/'>` used consistently
- ✅ `inter` variable name consistent
- ✅ `--font-inter` CSS variable consistent
- ✅ Font configuration structure identical in both layouts
