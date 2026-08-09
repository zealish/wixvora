# Coordinate Utilities Test Suite

Comprehensive test coverage for the coordinate system utility functions in the website editor.

## Running Tests

```bash
pnpm tsx components/website-editor/lib/__tests__/coordinate-utils.test.ts
```

## Test Coverage

### 1. Screen to Canvas Conversion (9 tests)
Tests `screenToCanvas` function that converts viewport/mouse coordinates to canvas coordinates.

**Test cases include:**
- Basic conversion (no transformation): screenX=100 → canvasX=100 with zoom=1, pan=0
- Zoom division: screenX=200 with zoom=2 → canvasX=100
- Pan subtraction: screenX=150 with panX=50 → canvasX=100
- Combined zoom and pan: screenX=250, panX=50, zoom=2 → canvasX=100
- Canvas bounds offset handling
- Negative values
- Very small zoom (0.25): screenX=100 / 0.25 = 400
- Very large zoom (4.0): screenX=400 / 4.0 = 100
- Tiny zoom edge case (0.001)

### 2. Canvas to Screen Conversion (6 tests)
Tests `canvasToScreen` function that converts canvas coordinates to viewport/screen coordinates.

**Test cases include:**
- Basic conversion (no transformation)
- Zoom multiplication: canvasX=50, zoom=2 → screenX=100
- Pan addition: canvasX=50, panX=50 → screenX=100
- Combined operations
- Canvas bounds inclusion
- Round-trip conversion: screen→canvas→screen preserves original coordinates

### 3. Grid Snapping (9 tests)
Tests `snapToGrid` function that snaps positions to grid cells.

**Test cases include:**
- Rounding down: snapToGrid(25, 20) = 20
- Rounding up: snapToGrid(35, 20) = 40
- Already aligned: snapToGrid(20, 20) = 20
- Zero handling: snapToGrid(0, 20) = 0
- Negative value rounding: snapToGrid(-10, 20) = 0
- Larger negative: snapToGrid(-15, 20) = -20
- Different grid sizes
- Large grid values
- Fractional values: snapToGrid(15.5, 10) = 20

### 4. Edge Snapping (7 tests)
Tests `snapToEdge` function for aligning block edges/centers.

**Test cases include:**
- Left alignment: block1 at x=0 width=100 snapped to block2 at x=150 → target=150
- Right alignment: block1 at x=200 width=100 snapped to block2 at x=0 → target=-100
- Center alignment with same-sized blocks
- Identical positions preserved
- Different widths (right alignment): block1 w=100 to block2 w=50
- Center alignment with different widths
- Invalid alignment defaults to original position

### 5. Get Snapped Position (7 tests)
Tests `getSnappedPosition` function that finds snap candidates from all other blocks.

**Test cases include:**
- Horizontal edge detection within threshold
- Vertical edge detection within threshold
- Multiple blocks scenario (finds best match)
- Outside threshold (no snapping)
- Custom threshold adjustment
- Snap distance calculation
- All snap types detection (left, right, center, top, bottom, middle)

## Test Structure

The test suite follows this pattern:
- Uses simple assertion helpers (`assert()`, `assertEqual()`, `assertApprox()`)
- Groups tests by functionality with clear headers
- Tracks pass/fail counts
- Provides detailed error messages
- Exits with appropriate status codes (0=success, 1=failure)

## Key Features Tested

### Coordinate System Accuracy
- Zoom transformations (both directions)
- Pan offsets
- Canvas bounding box offsets
- Edge cases (zero, negative, very small/large values)

### Grid System
- Proper rounding behavior
- Edge case handling
- Various grid sizes

### Alignment System
- All three alignment modes (left, right, center)
- Cross-size block alignment
- Boundary conditions

### Smart Snapping
- Distance-based threshold detection
- Multi-block scenarios
- Multiple snap type detection
- Customizable thresholds

## Adding New Tests

To add new test cases:

1. Add the test to the appropriate section
2. Use descriptive test names in console.log()
3. Include both positive cases (should work) and negative cases (edge cases)
4. Update the test count in comments if adding/removing tests
5. Run with `pnpm tsx components/website-editor/lib/__tests__/coordinate-utils.test.ts`

## Dependencies

No external testing framework required. Uses native Node.js/TypeScript execution via `tsx`.
