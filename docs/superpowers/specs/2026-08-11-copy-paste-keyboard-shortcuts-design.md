# Copy-Paste Feature with Keyboard Shortcuts

**Date:** 2026-08-11  
**Status:** Approved  
**Approach:** Clipboard State in Context

## Overview

Add copy-paste functionality to the website editor using Ctrl+C and Ctrl+V keyboard shortcuts. Users can copy and paste both Elements and Sections within and across different sections/pages.

## Requirements

- Copy element with Ctrl+C when element is selected
- Copy section with Ctrl+C when section is selected (no element selected)
- Paste with Ctrl+V to appropriate target location
- Support cross-section paste (paste element from one section to another)
- Visual feedback via toast notifications
- Clipboard persists during editor session

## Architecture

### 1. State Management

Add clipboard state to EditorContext:

```typescript
clipboard: {
  type: 'element' | 'section';
  data: Element | Section;
} | null
```

**Properties:**
- `type`: Identifies whether clipboard contains an element or section
- `data`: Deep cloned copy of the element or section data
- `null`: Represents empty clipboard

### 2. Context API Methods

Add four new methods to EditorContextValue:

#### `copyElement(sectionId: string, elementId: string): void`
- Finds element by sectionId and elementId
- Deep clones element data using `JSON.parse(JSON.stringify())`
- Stores in clipboard with type 'element'
- Shows toast: "Element copied"

#### `copySection(sectionId: string): void`
- Finds section by sectionId
- Deep clones section with all nested elements
- Stores in clipboard with type 'section'
- Shows toast: "Section copied"

#### `pasteElement(targetSectionId?: string): void`
- Validates clipboard contains element
- Uses targetSectionId or selectedSectionId as paste destination
- Generates new unique ID for pasted element using `createUniqueId('el')`
- Offsets position by +20px x and +20px y from original
- Clamps position to viewport boundaries (prevents overflow)
- Appends " (Copy)" to element name
- Updates sections via `updateCurrentPageSections`
- Auto-selects newly pasted element
- Shows toast: "Element pasted"

#### `pasteSection(): void`
- Validates clipboard contains section
- Generates new IDs for section and all nested elements
- Inserts below selectedSectionId, or appends to end if none selected
- Appends " (Copy)" to section name
- Updates sections via `updateCurrentPageSections`
- Auto-selects newly pasted section
- Shows toast: "Section pasted"

### 3. Keyboard Event Handler

Add global keyboard listener in EditorProvider or root editor component:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent action in preview mode
    if (isPreviewMode) return;
    
    // Prevent default browser behavior
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v')) {
      e.preventDefault();
    }

    // Copy logic (Ctrl+C or Cmd+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      if (selectedElementId && selectedSectionId) {
        copyElement(selectedSectionId, selectedElementId);
      } else if (selectedSectionId) {
        copySection(selectedSectionId);
      }
    }

    // Paste logic (Ctrl+V or Cmd+V)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      if (!clipboard) return;
      
      if (clipboard.type === 'element') {
        pasteElement(selectedSectionId || undefined);
      } else if (clipboard.type === 'section') {
        pasteSection();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isPreviewMode, selectedElementId, selectedSectionId, clipboard, 
    copyElement, copySection, pasteElement, pasteSection]);
```

**Key behaviors:**
- Support both Ctrl (Windows/Linux) and Cmd (Mac) modifier keys
- `e.preventDefault()` to prevent default browser copy-paste behavior
- Disabled during preview mode

## Data Flow

### Copy Flow

1. User presses Ctrl+C
2. Event handler checks current selection state
3. If element selected → call `copyElement(sectionId, elementId)`
4. If only section selected → call `copySection(sectionId)`
5. Data deep cloned and stored in clipboard state
6. Toast notification displayed

### Paste Flow

1. User presses Ctrl+V
2. Event handler checks clipboard is not null
3. If clipboard.type === 'element' → call `pasteElement()`
4. If clipboard.type === 'section' → call `pasteSection()`
5. New IDs generated, position offset applied
6. Item inserted into current page sections
7. Newly pasted item auto-selected
8. Toast notification displayed

## Position Offset Strategy

**Elements:**
- Offset by +20px x and +20px y from original position
- Check viewport boundaries using `VIEWPORT_WIDTHS[viewport]`
- If offset position + width > viewport width → clamp x to `viewportWidth - width - 10`
- Apply offset to all three viewport layouts (desktop, tablet, mobile)

**Sections:**
- No position offset needed
- Insert at specific index (below selected section)

## Edge Cases & Validation

1. **Preview Mode Protection**
   - Disable copy-paste when `isPreviewMode === true`
   
2. **Empty Clipboard**
   - Paste does nothing if `clipboard === null`
   
3. **No Selection**
   - Ctrl+C with no selection → no action
   - Ctrl+V element with no section selected → paste to first section
   - Ctrl+V section with no section selected → append to end
   
4. **Browser Behavior**
   - Call `e.preventDefault()` to prevent default copy-paste
   
5. **Cross-Page Paste**
   - Elements can be pasted across pages (allowed and expected)
   - Section paste always goes to current page
   
6. **Deep Clone**
   - Use `JSON.parse(JSON.stringify())` to avoid reference issues
   - Prevents mutations to clipboard data

## Translation Keys

Add to `lib/translations.ts`:

```typescript
toast: {
  element_copied: 'Element copied',
  section_copied: 'Section copied',
  element_pasted: 'Element pasted',
  section_pasted: 'Section pasted',
}
```

## Testing Considerations

- Test copy element → paste to same section
- Test copy element → paste to different section
- Test copy element → paste to different page
- Test copy section → paste
- Test multiple paste from single copy
- Test Ctrl+C with no selection (should not crash)
- Test Ctrl+V with empty clipboard (should not crash)
- Test position offset and boundary clamping
- Test ID uniqueness after paste
- Test that original item unchanged after paste

## Future Enhancements (Out of Scope)

- Persist clipboard to localStorage for cross-refresh persistence
- Browser Clipboard API integration for cross-tab copy-paste
- Visual clipboard indicator showing what's currently copied
- Paste with position at mouse cursor
- Multi-select copy-paste

## Files to Modify

1. `components/website-editor/editor-provider.tsx`
   - Add clipboard state
   - Add copyElement, copySection, pasteElement, pasteSection methods
   - Add keyboard event listener
   - Export methods in context value

2. `components/website-editor/lib/translations.ts`
   - Add toast messages for copy/paste actions

## Implementation Notes

- Reuse existing `createUniqueId()` helper for ID generation
- Reuse existing `updateCurrentPageSections()` for state updates
- Reuse existing `showToast()` for notifications
- Follow existing pattern from `duplicateElement()` for position offset logic
- History tracking automatic via `pushHistory()` in update methods
