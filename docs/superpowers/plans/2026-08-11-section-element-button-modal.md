# Section Element Button Opens Catalog Modal - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the section "+ Elemen" button to open the element catalog modal instead of quick-adding the first preset element.

**Architecture:** Modify one line in the section button's onClick handler to toggle the element catalog modal state instead of directly calling addElement.

**Tech Stack:** React, TypeScript, Tailwind CSS

## Global Constraints

- Use existing state management and modal components
- Maintain consistency with other element addition flows
- Single line change in existing code

---

### Task 1: Update Section Button onClick Handler

**Files:**
- Modify: `components/website-editor/index.tsx:783-786`

**Interfaces:**
- Consumes: `isElementModalOpen` state, `setIsElementModalOpen` function (already exist)
- Produces: Button now opens element catalog modal instead of quick-adding element

- [ ] **Step 1: Read current implementation**

Read `components/website-editor/index.tsx` lines 780-790 to see current button implementation.

- [ ] **Step 2: Update onClick handler**

Change line 785 from:

```typescript
onClick={() => addElement(ELEMENT_PRESETS[0], sec.id)}
```

To:

```typescript
onClick={() => setIsElementModalOpen(true)}
```

- [ ] **Step 3: Verify the change**

Read the modified lines 780-790 to confirm the change is correct.

- [ ] **Step 4: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add components/website-editor/index.tsx
git commit -m "feat: section element button opens catalog modal

Change section '+ Elemen' button behavior from quick-adding the first
preset element to opening the element catalog modal for user selection.

This provides consistent UX with other element addition flows (floating
button, sidebar button) and gives users choice in which element to add."
```

---

## Testing

### Manual Verification

1. Open the website editor
2. Select a section by clicking on it
3. Verify the "+ Elemen" button appears in the section header
4. Click the "+ Elemen" button
5. Verify the element catalog modal opens
6. Select a category and then an element
7. Verify the element is added to the selected section
8. Verify the modal closes after selection

### Expected Results

- Section button opens element catalog modal (not quick-add)
- User can browse categories and select elements
- Selected element is added to the correct section
- Modal closes after element selection
- Behavior matches floating button and sidebar button flows

---

## Summary

This is a minimal, focused change that improves UX consistency with zero risk. The existing modal and addElement logic already handle everything correctly - we're just changing which button triggers the modal.

**Total lines changed:** 1  
**Risk level:** Minimal  
**Test coverage:** Manual verification sufficient
