# Design Spec: Section Element Button Opens Catalog Modal

**Date:** 2026-08-11  
**Status:** Approved  
**Author:** AI Assistant

## Overview

Change the section "+ Elemen" button behavior from quick-adding the first preset element to opening the element catalog modal for user selection.

## Current Behavior

When a section is selected in the website editor, a blue "+ Elemen" button appears in the section header (top-left corner, next to the section title badge). Clicking this button immediately adds `ELEMENT_PRESETS[0]` (the first preset element) to that section without showing any UI or allowing the user to choose which element to add.

**Location:** `components/website-editor/index.tsx` lines 783-786

```typescript
onClick={() => addElement(ELEMENT_PRESETS[0], sec.id)}
```

## Problem

The current quick-add behavior:
- Gives users no choice in which element to add
- Is inconsistent with other element addition flows (floating button, sidebar button) which open the catalog modal
- Always adds the same element type regardless of user intent
- Provides no visual feedback about what's being added

## Proposed Solution

Change the section "+ Elemen" button to open the element catalog modal instead of quick-adding a preset.

### Design Decision

**Selected Approach:** Direct Modal Toggle (Option A)

Change the button's `onClick` handler from calling `addElement(ELEMENT_PRESETS[0], sec.id)` to calling `setIsElementModalOpen(true)`.

**Rationale:**
- Minimal code change (one line)
- Leverages existing modal and state management
- Modal already has context of the selected section via `selectedSectionId`
- When user selects an element in the modal, the existing `addElement(preset)` logic automatically uses the currently selected section
- Consistent UX with other element addition flows (floating button → New Element, sidebar Elements button)

**Alternative Considered:** Pass explicit section ID to modal via new prop

Rejected because:
- Adds unnecessary complexity (prop drilling)
- Modal doesn't need explicit section ID since the section is already selected
- More code changes required with no functional benefit

## Implementation

### File Changes

**File:** `components/website-editor/index.tsx`  
**Line:** 785

**Change:**

```diff
  <button
    className="..."
-   onClick={() => addElement(ELEMENT_PRESETS[0], sec.id)}
+   onClick={() => setIsElementModalOpen(true)}
  >
    <Icon name="plus" className="..." />
    {t('editor.addElement')}
  </button>
```

### Dependencies

No additional changes required. The following existing components already support this flow:

1. **Element Catalog Modal** (`components/website-editor/modals/element-catalog-modal.tsx`)
   - Already manages category/element selection
   - Calls `onSelectElement(preset)` when user chooses an element
   - Already integrated with editor state

2. **addElement Function** (`components/website-editor/editor-provider.tsx` line 284)
   - Already accepts optional `sectionId` parameter
   - Falls back to `selectedSectionId` when `sectionId` not provided
   - Already handles element creation and state updates

3. **Modal State** (`components/website-editor/index.tsx`)
   - `isElementModalOpen` state already exists
   - `setIsElementModalOpen` already used by other buttons
   - Modal already connected to this state

## User Flow

### Before (Current)
1. User selects a section
2. "+ Elemen" button appears
3. User clicks button
4. First preset element immediately added to section
5. No visual feedback, no choice

### After (Proposed)
1. User selects a section
2. "+ Elemen" button appears
3. User clicks button
4. Element catalog modal opens
5. User browses categories
6. User selects desired element
7. Element added to the selected section
8. Modal closes

## UX Consistency

After this change, all three element addition entry points will have consistent behavior:

| Entry Point | Current Behavior | After Change |
|-------------|------------------|--------------|
| Floating "+" → New Element | Opens catalog modal | Opens catalog modal |
| Sidebar "Elements" button | Opens catalog modal | Opens catalog modal |
| Section "+ Elemen" button | Quick-add first preset | **Opens catalog modal** |

## Testing Considerations

### Manual Testing
1. Select a section
2. Click the "+ Elemen" button
3. Verify element catalog modal opens
4. Select a category and element
5. Verify element is added to the correct section
6. Verify modal closes after selection

### Edge Cases
- Multiple sections selected: Should use `selectedSectionId` (single selection)
- No section selected: Button shouldn't be visible (existing behavior)
- Modal already open: setState is idempotent, no issue

## Backward Compatibility

This is a UX change that affects user interaction flow but does not break any APIs or data structures. Existing elements and sections remain unchanged.

## Scope

This change is isolated to a single button's click handler. No changes to:
- Element catalog modal component
- Element addition logic
- State management
- Data structures
- Other UI components

Total lines changed: 1

## Success Criteria

- [ ] Section "+ Elemen" button opens element catalog modal
- [ ] User can browse and select elements from catalog
- [ ] Selected element is added to the correct section
- [ ] Modal closes after element selection
- [ ] Behavior is consistent with other element addition flows
- [ ] No regressions in existing functionality
