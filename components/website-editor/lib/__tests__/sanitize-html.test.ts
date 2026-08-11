/**
 * sanitizeHtml Tests - FONT_SIZE_REGEX Anchoring
 * Run with: pnpm tsx components/website-editor/lib/__tests__/sanitize-html.test.ts
 */

import { sanitizeHtml } from "../sanitize-html";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertContains(haystack: string, needle: string, message: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`${message}: expected to contain "${needle}", got "${haystack}"`);
  }
}

function assertNotContains(haystack: string, needle: string, message: string): void {
  if (haystack.includes(needle)) {
    throw new Error(`${message}: expected NOT to contain "${needle}", but found it in "${haystack}"`);
  }
}

let passedTests = 0;

console.log("Running sanitizeHtml Tests (FONT_SIZE_REGEX Anchoring)...\n");

try {
  // ============================================================================
  // Valid font-size Tests
  // ============================================================================
  console.log("Testing valid font-size extraction...");

  // Test 1: font-size at start of style
  const result1 = sanitizeHtml('<span style="font-size: 16px">text</span>');
  assertContains(result1, 'font-size: 16px', "Should extract font-size at start");
  passedTests++;

  // Test 2: font-size after semicolon
  const result2 = sanitizeHtml('<span style="color: #000000; font-size: 20px">text</span>');
  assertContains(result2, 'font-size: 20px', "Should extract font-size after semicolon");
  passedTests++;

  // Test 3: font-size before semicolon
  const result3 = sanitizeHtml('<span style="font-size: 18px; color: #ff0000">text</span>');
  assertContains(result3, 'font-size: 18px', "Should extract font-size before semicolon");
  passedTests++;

  // Test 4: font-size with whitespace
  const result4 = sanitizeHtml('<span style="font-size:   24px  ">text</span>');
  assertContains(result4, 'font-size: 24px', "Should extract font-size with extra whitespace");
  passedTests++;

  console.log("✓ Valid font-size tests passed\n");

  // ============================================================================
  // Malformed Property Name Tests (The Fix)
  // ============================================================================
  console.log("Testing malformed property name rejection...");

  // Test 5: Should NOT match border-font-size
  const result5 = sanitizeHtml('<span style="border-font-size: 16px">text</span>');
  assertNotContains(result5, 'font-size', "Should NOT match border-font-size");
  passedTests++;

  // Test 6: Should NOT match background-font-size
  const result6 = sanitizeHtml('<span style="background-font-size: 20px">text</span>');
  assertNotContains(result6, 'font-size', "Should NOT match background-font-size");
  passedTests++;

  // Test 7: Should NOT match custom-font-size
  const result7 = sanitizeHtml('<span style="custom-font-size: 14px">text</span>');
  assertNotContains(result7, 'font-size', "Should NOT match custom-font-size");
  passedTests++;

  console.log("✓ Malformed property name tests passed\n");

  // ============================================================================
  // Boundary Tests
  // ============================================================================
  console.log("Testing font-size boundaries...");

  // Test 8: Below minimum (should reject)
  const result8 = sanitizeHtml('<span style="font-size: 5px">text</span>');
  assertNotContains(result8, 'font-size', "Should reject font-size below minimum (5px)");
  passedTests++;

  // Test 9: Above maximum (should reject)
  const result9 = sanitizeHtml('<span style="font-size: 300px">text</span>');
  assertNotContains(result9, 'font-size', "Should reject font-size above maximum (300px)");
  passedTests++;

  // Test 10: At minimum boundary (should accept)
  const result10 = sanitizeHtml('<span style="font-size: 8px">text</span>');
  assertContains(result10, 'font-size: 8px', "Should accept font-size at minimum (8px)");
  passedTests++;

  // Test 11: At maximum boundary (should accept)
  const result11 = sanitizeHtml('<span style="font-size: 200px">text</span>');
  assertContains(result11, 'font-size: 200px', "Should accept font-size at maximum (200px)");
  passedTests++;

  console.log("✓ Boundary tests passed\n");

  // ============================================================================
  // Combined Styles Tests
  // ============================================================================
  console.log("Testing combined valid styles...");

  // Test 12: Multiple valid styles
  const result12 = sanitizeHtml('<span style="font-size: 16px; color: #123456; background-color: #abcdef">text</span>');
  assertContains(result12, 'font-size: 16px', "Should extract font-size from combined styles");
  assertContains(result12, 'color: #123456', "Should extract color from combined styles");
  assertContains(result12, 'background-color: #abcdef', "Should extract background-color from combined styles");
  passedTests++;

  console.log("✓ Combined styles test passed\n");

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("=".repeat(60));
  console.log(`✅ All ${passedTests} tests passed!`);
  console.log("=".repeat(60));
  console.log("\nFont-size regex anchoring is working correctly:");
  console.log("  ✓ Extracts valid font-size properties");
  console.log("  ✓ Rejects malformed property names (e.g., border-font-size)");
  console.log("  ✓ Enforces min/max boundaries");
  console.log("  ✓ Works with combined styles");

} catch (error) {
  console.error("\n❌ Test failed!");
  console.error((error as Error).message);
  console.log(`\nPassed ${passedTests} tests before failure.`);
  process.exit(1);
}
