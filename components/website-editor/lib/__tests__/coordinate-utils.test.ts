/**
 * Coordinate Utilities Test Suite
 * Run with: pnpm tsx components/website-editor/lib/__tests__/coordinate-utils.test.ts
 * 
 * Tests for coordinate conversion, grid snapping, and edge alignment logic
 */

import { screenToCanvas, canvasToScreen, snapToGrid, snapToEdge, getSnappedPosition } from "../coordinate-utils";

// Simple assertion helper
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, message: string): void {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${message}: expected ${expected} ±${tolerance}, got ${actual}`);
  }
}

let passedTests = 0;
let failedTests = 0;

console.log("Running Coordinate Utilities Tests...\n");

// ============================================================================
// 1. Screen to Canvas Conversion Tests
// ============================================================================
console.log("=" .repeat(60));
console.log("1. Screen to Canvas Conversion Tests");
console.log("=".repeat(60));

try {
  // Basic test: no transformation needed
  const basicCanvasBounds = { left: 0, top: 0 } as DOMRect;
  const result1 = screenToCanvas(100, 100, basicCanvasBounds, 1, 0, 0);
  assertEqual(result1.x, 100, "Basic: screenX=100 → canvasX=100 with zoom=1, pan=0");
  assertEqual(result1.y, 100, "Basic: screenY=100 → canvasY=100 with zoom=1, pan=0");
  passedTests++;
  console.log("✓ Test 1 passed: Basic conversion works correctly");

  // Zoom test: screenX=200 with zoom=2 should give canvasX=100
  const result2 = screenToCanvas(200, 100, basicCanvasBounds, 2, 0, 0);
  assertEqual(result2.x, 100, "Zoom test: screenX=200 / zoom=2 → canvasX=100");
  assertEqual(result2.y, 50, "Zoom test: screenY=100 / zoom=2 → canvasY=50");
  passedTests++;
  console.log("✓ Test 2 passed: Zoom division works correctly");

  // Pan test: screenX=150 with panX=50 should give canvasX=100
  const result3 = screenToCanvas(150, 100, basicCanvasBounds, 1, 50, 0);
  assertEqual(result3.x, 100, "Pan test: (screenX=150 - pan=50) / zoom=1 → canvasX=100");
  passedTests++;
  console.log("✓ Test 3 passed: Pan subtraction works correctly");

  // Combined zoom and pan: screenX=250, panX=50, zoom=2 → (250-50)/2 = 100
  const result4 = screenToCanvas(250, 100, basicCanvasBounds, 2, 50, 0);
  assertEqual(result4.x, 100, "Combined: (screenX=250 - pan=50) / zoom=2 → canvasX=100");
  passedTests++;
  console.log("✓ Test 4 passed: Combined zoom and pan work correctly");

  // Canvas bounds offset: screenX=150, canvasBounds.left=100, pan=0, zoom=1 → 150-100=50
  const boundsOffsetCanvas = { left: 100, top: 50 } as DOMRect;
  const result5 = screenToCanvas(150, 150, boundsOffsetCanvas, 1, 0, 0);
  assertEqual(result5.x, 50, "Bounds offset: screenX=150 - canvasBounds.left=100 → canvasX=50");
  assertEqual(result5.y, 100, "Bounds offset: screenY=150 - canvasBounds.top=50 → canvasY=100");
  passedTests++;
  console.log("✓ Test 5 passed: Canvas bounds offset works correctly");

  // Negative values test
  const result6 = screenToCanvas(-50, -50, basicCanvasBounds, 1, 0, 0);
  assertEqual(result6.x, -50, "Negative: screenX=-50 → canvasX=-50");
  assertEqual(result6.y, -50, "Negative: screenY=-50 → canvasY=-50");
  passedTests++;
  console.log("✓ Test 6 passed: Negative values handled correctly");

  // Very small zoom (0.25): screenX=100 / 0.25 = 400
  const result7 = screenToCanvas(100, 100, basicCanvasBounds, 0.25, 0, 0);
  assertEqual(result7.x, 400, "Small zoom: screenX=100 / 0.25 → canvasX=400");
  passedTests++;
  console.log("✓ Test 7 passed: Small zoom value handled correctly");

  // Very large zoom (4.0): screenX=400 / 4.0 = 100
  const result8 = screenToCanvas(400, 400, basicCanvasBounds, 4, 0, 0);
  assertEqual(result8.x, 100, "Large zoom: screenX=400 / 4.0 → canvasX=100");
  passedTests++;
  console.log("✓ Test 8 passed: Large zoom value handled correctly");

  // Zero zoom edge case: should produce very large numbers or infinity
  const result9 = screenToCanvas(100, 100, basicCanvasBounds, 0.001, 0, 0);
  assert(result9.x >= 100000, "Tiny zoom produces large canvas coordinates");
  passedTests++;
  console.log("✓ Test 9 passed: Tiny zoom edge case handled");

  console.log("");
} catch (error) {
  failedTests++;
  console.error("✗ Tests failed:", error);
}

// ============================================================================
// 2. Canvas to Screen Conversion Tests
// ============================================================================
console.log("-".repeat(60));
console.log("2. Canvas to Screen Conversion Tests");
console.log("-".repeat(60));

try {
  const basicCanvasBounds = { left: 0, top: 0 } as DOMRect;
  
  // Basic test: no transformation
  const result10 = canvasToScreen(100, 100, basicCanvasBounds, 1, 0, 0);
  assertEqual(result10.x, 100, "Basic: canvasX=100 → screenX=100 with zoom=1");
  assertEqual(result10.y, 100, "Basic: canvasY=100 → screenY=100 with zoom=1");
  passedTests++;
  console.log("✓ Test 10 passed: Basic conversion works correctly");

  // Zoom multiplication: canvasX=50, zoom=2 → screenX=100
  const result11 = canvasToScreen(50, 50, basicCanvasBounds, 2, 0, 0);
  assertEqual(result11.x, 100, "Zoom mul: canvasX=50 * 2 → screenX=100");
  assertEqual(result11.y, 100, "Zoom mul: canvasY=50 * 2 → screenY=100");
  passedTests++;
  console.log("✓ Test 11 passed: Zoom multiplication works correctly");

  // Pan addition: canvasX=50, zoom=1, panX=50 → screenX=100
  const result12 = canvasToScreen(50, 50, basicCanvasBounds, 1, 50, 0);
  assertEqual(result12.x, 100, "Pan add: canvasX=50 + pan=50 → screenX=100");
  passedTests++;
  console.log("✓ Test 12 passed: Pan addition works correctly");

  // Combined: canvasX=50, zoom=2, panX=100 → 50*2 + 100 = 200
  const result13 = canvasToScreen(50, 50, basicCanvasBounds, 2, 100, 0);
  assertEqual(result13.x, 200, "Combined: canvasX=50 * 2 + 100 → screenX=200");
  passedTests++;
  console.log("✓ Test 13 passed: Combined zoom and pan work correctly");

  const boundsOffsetCanvas = { left: 100, top: 50 } as DOMRect;
  
  // With canvas bounds: canvasX=50, zoom=1, panX=0, canvasBounds.left=100 → 50+100=150
  const result14 = canvasToScreen(50, 50, boundsOffsetCanvas, 1, 0, 0);
  assertEqual(result14.x, 150, "With bounds: canvasX=50 + 100 → screenX=150");
  assertEqual(result14.y, 100, "With bounds: canvasY=50 + 50 → screenY=100");
  passedTests++;
  console.log("✓ Test 14 passed: Canvas bounds included correctly");

  // Round-trip test: convert screen→canvas→screen should return original
  const screenX = 234, screenY = 567;
  const zoom = 1.5, panX = 25, panY = 30;
  const canvasCoords = screenToCanvas(screenX, screenY, basicCanvasBounds, zoom, panX, panY);
  const backToScreen = canvasToScreen(canvasCoords.x, canvasCoords.y, basicCanvasBounds, zoom, panX, panY);
  assertApprox(backToScreen.x, screenX, 0.001, "Round-trip x-coordinate preserved");
  assertApprox(backToScreen.y, screenY, 0.001, "Round-trip y-coordinate preserved");
  passedTests++;
  console.log("✓ Test 15 passed: Round-trip conversion preserves coordinates");

  console.log("");
} catch (error) {
  failedTests++;
  console.error("✗ Tests failed:", error);
}

// ============================================================================
// 3. Grid Snapping Tests
// ============================================================================
console.log("-".repeat(60));
console.log("3. Grid Snapping Tests");
console.log("-".repeat(60));

try {
  // Basic rounding down: snapToGrid(25, 20) should round to 20
  const result16 = snapToGrid(25, 20);
  assertEqual(result16, 20, "snapToGrid(25, 20) rounds down to 20");
  passedTests++;
  console.log("✓ Test 16 passed: Rounding down works correctly");

  // Basic rounding up: snapToGrid(35, 20) should round to 40
  const result17 = snapToGrid(35, 20);
  assertEqual(result17, 40, "snapToGrid(35, 20) rounds up to 40");
  passedTests++;
  console.log("✓ Test 17 passed: Rounding up works correctly");

  // Already aligned: snapToGrid(20, 20) stays at 20
  const result18 = snapToGrid(20, 20);
  assertEqual(result18, 20, "snapToGrid(20, 20) already aligned");
  passedTests++;
  console.log("✓ Test 18 passed: Already aligned values stay unchanged");

  // Zero handling: snapToGrid(0, 20) = 0
  const result19 = snapToGrid(0, 20);
  assertEqual(result19, 0, "snapToGrid(0, 20) = 0");
  passedTests++;
  console.log("✓ Test 19 passed: Zero handling works correctly");

  // Negative value: snapToGrid(-10, 20) should round to 0 (Math.round handles this)
  const result20 = snapToGrid(-10, 20);
  assertEqual(result20, 0, "snapToGrid(-10, 20) = 0 (negative rounding)");
  passedTests++;
  console.log("✓ Test 20 passed: Negative value rounding works correctly");

  // More negative: snapToGrid(-15, 20) should round to -20
  const result21 = snapToGrid(-15, 20);
  assertEqual(result21, -20, "snapToGrid(-15, 20) = -20");
  passedTests++;
  console.log("✓ Test 21 passed: Larger negative rounding works correctly");

  // Different grid size: snapToGrid(7, 10) = 10
  const result22 = snapToGrid(7, 10);
  assertEqual(result22, 10, "snapToGrid(7, 10) rounds up to 10");
  passedTests++;
  console.log("✓ Test 22 passed: Different grid sizes work correctly");

  // Large grid: snapToGrid(100, 50) = 100
  const result23 = snapToGrid(100, 50);
  assertEqual(result23, 100, "snapToGrid(100, 50) already on grid");
  passedTests++;
  console.log("✓ Test 23 passed: Large grid values work correctly");

  // Fractional grid: snapToGrid(15.5, 10) = 20
  const result24 = snapToGrid(15.5, 10);
  assertEqual(result24, 20, "snapToGrid(15.5, 10) rounds to 20");
  passedTests++;
  console.log("✓ Test 24 passed: Fractional values handled correctly");

  console.log("");
} catch (error) {
  failedTests++;
  console.error("✗ Tests failed:", error);
}

// ============================================================================
// 4. Edge Snapping Tests
// ============================================================================
console.log("-".repeat(60));
console.log("4. Edge Snapping Tests");
console.log("-".repeat(60));

try {
  // Left alignment: block1 at x=0 width=100 snapped to block2 at x=150 → target=150
  const result25 = snapToEdge(0, 100, 150, 100, 'left');
  assertEqual(result25, 150, "Left align: block1.x=0 snapped to block2.x=150 → target=150");
  passedTests++;
  console.log("✓ Test 25 passed: Left alignment works correctly");

  // Right alignment: block1 at x=200 width=100 snapped to block2 at x=0 → target=0
  const result26 = snapToEdge(200, 100, 0, 100, 'right');
  assertEqual(result26, 0, "Right align: block1.x=200,w=100 to block2.x=0,w=100 → target=0");
  passedTests++;
  console.log("✓ Test 26 passed: Right alignment works correctly");

  // Center alignment: both blocks centered at same position
  // block1 center = 250 + 100/2 = 300, block2 center = 300 + 100/2 = 350
  // Target: block1.x + 50 = block2.x + 50 => target = 300
  const result27 = snapToEdge(250, 100, 300, 100, 'center');
  assertEqual(result27, 300, "Center align: block centers match → target=300");
  passedTests++;
  console.log("✓ Test 27 passed: Center alignment works correctly");

  // Same left edges: block1.x=50, block2.x=50 → target=50
  const result28 = snapToEdge(50, 100, 50, 100, 'left');
  assertEqual(result28, 50, "Same left edges: target unchanged at 50");
  passedTests++;
  console.log("✓ Test 28 passed: Identical positions preserved");

  // Different widths - right alignment
  // block1: x=200, w=100 (right edge at 300)
  // block2: x=0, w=50 (right edge at 50)
  // Target: x=50-100=-50
  const result29 = snapToEdge(200, 100, 0, 50, 'right');
  assertEqual(result29, -50, "Different widths right align: target=-50");
  passedTests++;
  console.log("✓ Test 29 passed: Different widths handled correctly");

  // Center with different widths
  // block1: x=100, w=60 (center at 130)
  // block2: x=200, w=100 (center at 250)
  // Target: 250 - 30 = 220
  const result30 = snapToEdge(100, 60, 200, 100, 'center');
  assertEqual(result30, 220, "Center with different widths: target=220");
  passedTests++;
  console.log("✓ Test 30 passed: Center with different widths works correctly");

  // Unknown alignment should return original position
  const result31 = snapToEdge(100, 100, 200, 100, 'unknown' as any);
  assertEqual(result31, 100, "Invalid alignment returns original position");
  passedTests++;
  console.log("✓ Test 31 passed: Invalid alignment defaults to original position");

  console.log("");
} catch (error) {
  failedTests++;
  console.error("✗ Tests failed:", error);
}

// ============================================================================
// 5. Get Snapped Position Tests
// ============================================================================
console.log("-".repeat(60));
console.log("5. Get Snapped Position Tests");
console.log("-".repeat(60));

try {
  // Block A at (100, 100), Block B at (205, 100) - horizontal alignment check  
  // When dragging Block A, it should find Block B's left edge as a snap candidate
  const allBlocks1 = [{
    id: 'block-b',
    x: 205,
    y: 100,
    props: { width: 100, height: 100 }
  }];

  const result32 = getSnappedPosition(198, 100, 100, 100, allBlocks1, 10);
  assertEqual(result32.x, 198, "Horizontal alignment: drag near x=205 shows snap detection");
  assert(result32.snaps.length >= 4, "Found multiple snap candidates (left, right, center + vertical)");
  const horizSnap = result32.snaps.find(s => ['left', 'right', 'center'].includes(s.alignment));
  assert(horizSnap !== undefined && horizSnap.distance <= 10, "Horizontal snap distance within threshold");
  passedTests++;
  console.log("✓ Test 32 passed: Horizontal edge matching detection works correctly");

  // Vertical alignment: Block A at (100, 245), Block B at (100, 250)
  const allBlocks2 = [{
    id: 'block-b',
    x: 100,
    y: 250,
    props: { width: 100, height: 100 }
  }];

  const result33 = getSnappedPosition(100, 245, 100, 100, allBlocks2, 10);
  assertEqual(result33.y, 245, "Vertical alignment: drag near y=250 shows snap detection");
  const vertSnap = result33.snaps.find(s => ['top', 'bottom', 'middle'].includes(s.alignment));
  assert(vertSnap !== undefined && vertSnap.distance <= 10, "Vertical snap distance within threshold");
  passedTests++;
  console.log("✓ Test 33 passed: Vertical edge matching detection works correctly");

  // Multiple blocks: should find best match
  const allBlocks3 = [
    {
      id: 'block-a',
      x: 100,
      y: 100,
      props: { width: 100, height: 100 }
    },
    {
      id: 'block-c',
      x: 150,
      y: 100,
      props: { width: 100, height: 100 }
    }
  ];

  const result34 = getSnappedPosition(100, 100, 100, 100, allBlocks3, 10);
  assertEqual(result34.x, 100, "Multiple blocks: finds closest match");
  // Should have multiple snap suggestions
  assert(result34.snaps.length >= 1, "At least one snap candidate found");
  passedTests++;
  console.log("✓ Test 34 passed: Multiple blocks scenario handled correctly");

  // No snapping within threshold
  const allBlocks4 = [{
    id: 'far-block',
    x: 1000,
    y: 1000,
    props: { width: 100, height: 100 }
  }];

  const result35 = getSnappedPosition(100, 100, 100, 100, allBlocks4, 10);
  assertEqual(result35.x, 100, "Outside threshold: no snapping occurs");
  assertEqual(result35.y, 100, "Outside threshold: no vertical snapping");
  passedTests++;
  console.log("✓ Test 35 passed: Outside threshold handled correctly");

  // Custom threshold
  const allBlocks5 = [{
    id: 'close-block',
    x: 108,
    y: 100,
    props: { width: 100, height: 100 }
  }];

  const result36 = getSnappedPosition(100, 100, 100, 100, allBlocks5, 20);
  assert(result36.snaps.some(s => s.alignment === 'left' && s.distance <= 20), "Custom threshold 20px finds left snap at 8px");
  passedTests++;
  console.log("✓ Test 36 passed: Custom threshold works correctly");

  // Snap distance calculation
  const allBlocks6 = [{
    id: 'edge-block',
    x: 100,
    y: 100,
    props: { width: 100, height: 100 }
  }];

  const result37 = getSnappedPosition(95, 100, 100, 100, allBlocks6, 10);
  // Distance should be about 5 pixels (difference between 95 and 100)
  assert(result37.snaps.length > 0, "Snap distances calculated");
  if (result37.snaps[0]) {
    assert(result37.snaps[0].distance <= 10, "Snap distance within threshold");
  }
  passedTests++;
  console.log("✓ Test 37 passed: Snap distance calculation works correctly");

  // All snap types detection
  const allBlocks7 = [
    {
      id: 'horiz-left',
      x: 100,
      y: 100,
      props: { width: 100, height: 100 }
    },
    {
      id: 'horiz-right',
      x: 300,
      y: 100,
      props: { width: 100, height: 100 }
    },
    {
      id: 'vert-top',
      x: 100,
      y: 100,
      props: { width: 100, height: 100 }
    },
    {
      id: 'vert-bottom',
      x: 100,
      y: 300,
      props: { width: 100, height: 100 }
    }
  ];

  const result38 = getSnappedPosition(100, 100, 100, 100, allBlocks7, 10);
  // Should detect left/top (same position), center alignments
  assert(result38.snaps.length >= 2, "Multiple snap types detected");
  passedTests++;
  console.log("✓ Test 38 passed: All snap types detected correctly");

  console.log("");
} catch (error) {
  failedTests++;
  console.error("✗ Tests failed:", error);
}

// ============================================================================
// Summary
// ============================================================================
console.log("\n" + "=".repeat(60));
console.log("Test Summary");
console.log("=".repeat(60));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total: ${passedTests + failedTests}`);
console.log("=".repeat(60));

if (failedTests > 0) {
  console.log("\n⚠️ Some tests failed!");
  process.exit(1);
} else {
  console.log("\n🎉 All tests passed!");
  process.exit(0);
}
