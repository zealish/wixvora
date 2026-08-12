/**
 * FloatingToolbar Integration Tests
 * Run with: pnpm tsx components/website-editor/rich-text/__tests__/FloatingToolbar.test.tsx
 */

export {};

import * as toolbarModule from "../FloatingToolbar";
import * as fontSizePickerModule from "../FontSizePicker";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

let passedTests = 0;

console.log("Running FloatingToolbar Integration Tests...\n");

try {
  console.log("Testing FloatingToolbar structure...");
  
  assert(
    toolbarModule.FloatingToolbar !== undefined,
    "FloatingToolbar should be exported"
  );
  passedTests++;

  assert(
    typeof toolbarModule.FloatingToolbar === "function",
    "FloatingToolbar should be a function component"
  );
  passedTests++;

  console.log("✓ FloatingToolbar structure tests passed\n");

  console.log("Testing FontSizePicker import...");
  
  assert(
    fontSizePickerModule.FontSizePicker !== undefined,
    "FontSizePicker should be importable"
  );
  passedTests++;

  assert(
    typeof fontSizePickerModule.FontSizePicker === "function",
    "FontSizePicker should be a function component"
  );
  passedTests++;

  console.log("✓ FontSizePicker import tests passed\n");

  console.log("\n" + "=".repeat(50));
  console.log("Test Summary");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: 0`);
  console.log(`📊 Total: ${passedTests}`);
  console.log("=".repeat(50));

  console.log("\n🎉 All tests passed!");
  process.exit(0);
} catch (error) {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
}
