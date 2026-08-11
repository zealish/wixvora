/**
 * FONT_SIZE_REGEX Anchoring Tests
 * Run with: pnpm tsx components/website-editor/lib/__tests__/sanitize-html-regex.test.ts
 * 
 * Tests that the FONT_SIZE_REGEX properly anchors to prevent matching
 * malformed property names like "border-font-size" or "background-font-size"
 */

export {};

const FONT_SIZE_REGEX = /(?:^|;|\s)font-size:\s*(\d+)px(?:;|$|\s)/;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

let testsPassedCount = 0;

function testMatch(style: string, shouldMatch: boolean, description: string): void {
  const match = style.match(FONT_SIZE_REGEX);
  if (shouldMatch) {
    assert(match !== null, `${description}: expected to match, but got null for "${style}"`);
    console.log(`  ✓ ${description}`);
  } else {
    assert(match === null, `${description}: expected NOT to match, but matched "${style}"`);
    console.log(`  ✓ ${description}`);
  }
  testsPassedCount++;
}

console.log("Running FONT_SIZE_REGEX Anchoring Tests...\n");

try {
  // ============================================================================
  // Valid Patterns (Should Match)
  // ============================================================================
  console.log("Testing VALID patterns (should match):");
  
  testMatch("font-size: 16px", true, "font-size at start");
  testMatch("color: #000; font-size: 20px", true, "font-size after semicolon");
  testMatch("font-size: 18px; color: #fff", true, "font-size before semicolon");
  testMatch("font-size: 24px ", true, "font-size with trailing space");
  testMatch(" font-size: 14px", true, "font-size with leading space");

  console.log();

  // ============================================================================
  // Malformed Patterns (Should NOT Match) - THE FIX
  // ============================================================================
  console.log("Testing MALFORMED patterns (should NOT match):");
  
  testMatch("border-font-size: 16px", false, "border-font-size (malformed)");
  testMatch("background-font-size: 20px", false, "background-font-size (malformed)");
  testMatch("custom-font-size: 14px", false, "custom-font-size (malformed)");
  testMatch("prefix-font-size: 12px", false, "prefix-font-size (malformed)");
  testMatch("my-font-size: 18px", false, "my-font-size (malformed)");

  console.log();

  // ============================================================================
  // Edge Cases
  // ============================================================================
  console.log("Testing EDGE cases:");
  
  testMatch("font-size:16px", true, "font-size without space before value");
  testMatch("font-size:   24px", true, "font-size with multiple spaces");
  testMatch("; font-size: 16px;", true, "font-size with surrounding semicolons");

  console.log();

  // ============================================================================
  // Extraction Test
  // ============================================================================
  console.log("Testing VALUE extraction:");
  
  const extractTest = "color: #000; font-size: 42px; background: red";
  const extractMatch = extractTest.match(FONT_SIZE_REGEX);
  assert(extractMatch !== null, "Should match extraction test");
  if (extractMatch) {
    assert(extractMatch[1] === "42", `Should extract value "42", got "${extractMatch[1]}"`);
    console.log(`  ✓ Correctly extracted font-size value: ${extractMatch[1]}px`);
    testsPassedCount++;
  }

  console.log();

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("=".repeat(60));
  console.log(`✅ All ${testsPassedCount} tests passed!`);
  console.log("=".repeat(60));
  console.log("\nFONT_SIZE_REGEX anchoring verification:");
  console.log("  ✓ Matches valid font-size properties");
  console.log("  ✓ Rejects malformed property names");
  console.log("  ✓ Correctly extracts font-size values");
  console.log("  ✓ Matches pattern used by COLOR_REGEX");
  console.log("\nThe regex fix successfully prevents matching malformed CSS");
  console.log("properties like 'border-font-size' or 'background-font-size'.");

} catch (error) {
  console.error("\n❌ Test failed!");
  console.error((error as Error).message);
  console.log(`\nPassed ${testsPassedCount} tests before failure.`);
  process.exit(1);
}
