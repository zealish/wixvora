// @ts-nocheck
/**
 * FontSize Extension Tests
 * Run with: pnpm tsx components/website-editor/lib/__tests__/font-size-extension.test.ts
 */

import { FontSize } from "../font-size-extension";

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

let passedTests = 0;

console.log("Running FontSize Extension Tests...\n");

try {
  // ============================================================================
  // Extension Definition Tests
  // ============================================================================
  console.log("Testing Extension Definition...");

  assert(
    FontSize !== undefined,
    "FontSize extension should be defined"
  );
  passedTests++;

  assert(
    typeof FontSize === "object",
    "FontSize should be an extension object"
  );
  passedTests++;

  assertEqual(
    FontSize.name,
    "fontSize",
    "Extension name should be 'fontSize'"
  );
  passedTests++;

  assert(
    FontSize.type === "extension",
    "Extension type should be 'extension'"
  );
  passedTests++;

  console.log("✓ Extension definition tests passed\n");

  // ============================================================================
  // Extension Config Tests
  // ============================================================================
  console.log("Testing Extension Config...");

  assert(
    FontSize.config !== undefined,
    "Extension should have config"
  );
  passedTests++;

  assert(
    FontSize.config.name === "fontSize",
    "Config name should be 'fontSize'"
  );
  passedTests++;

  assert(
    typeof FontSize.config.addOptions === "function",
    "Config should have addOptions method"
  );
  passedTests++;

  assert(
    typeof FontSize.config.addGlobalAttributes === "function",
    "Config should have addGlobalAttributes method"
  );
  passedTests++;

  assert(
    typeof FontSize.config.addCommands === "function",
    "Config should have addCommands method"
  );
  passedTests++;

  console.log("✓ Extension config tests passed\n");

  // ============================================================================
  // Options Tests
  // ============================================================================
  console.log("Testing Extension Options...");

  const options = FontSize.config.addOptions();

  assert(
    options !== undefined,
    "addOptions should return options object"
  );
  passedTests++;

  assert(
    Array.isArray(options.types),
    "Options should have types array"
  );
  passedTests++;

  assert(
    options.types.includes("textStyle"),
    "Options types should include 'textStyle'"
  );
  passedTests++;

  console.log("✓ Extension options tests passed\n");

  // ============================================================================
  // Global Attributes Tests
  // ============================================================================
  console.log("Testing Global Attributes...");

  const globalAttributes = FontSize.config.addGlobalAttributes.call({
    options: options,
  });

  assert(
    Array.isArray(globalAttributes),
    "addGlobalAttributes should return an array"
  );
  passedTests++;

  assert(
    globalAttributes.length > 0,
    "Global attributes should not be empty"
  );
  passedTests++;

  const fontSizeAttr = globalAttributes[0];

  assert(
    Array.isArray(fontSizeAttr.types),
    "Global attribute should have types array"
  );
  passedTests++;

  assert(
    fontSizeAttr.types.includes("textStyle"),
    "Global attribute types should include 'textStyle'"
  );
  passedTests++;

  assert(
    fontSizeAttr.attributes !== undefined,
    "Global attribute should have attributes object"
  );
  passedTests++;

  assert(
    fontSizeAttr.attributes.fontSize !== undefined,
    "Attributes should include fontSize"
  );
  passedTests++;

  assertEqual(
    fontSizeAttr.attributes.fontSize.default,
    null,
    "fontSize default should be null"
  );
  passedTests++;

  console.log("✓ Global attributes tests passed\n");

  // ============================================================================
  // Parse HTML Tests
  // ============================================================================
  console.log("Testing parseHTML...");

  const parseHTML = fontSizeAttr.attributes.fontSize.parseHTML;

  assert(
    typeof parseHTML === "function",
    "parseHTML should be a function"
  );
  passedTests++;

  const mockElement1 = {
    style: { fontSize: "16px" },
  } as any;

  assertEqual(
    parseHTML(mockElement1),
    "16px",
    "parseHTML should extract fontSize from style"
  );
  passedTests++;

  const mockElement2 = {
    style: { fontSize: '"16px"' },
  } as any;

  assertEqual(
    parseHTML(mockElement2),
    "16px",
    "parseHTML should remove quotes from fontSize"
  );
  passedTests++;

  const mockElement3 = {
    style: {},
  } as any;

  assertEqual(
    parseHTML(mockElement3),
    undefined,
    "parseHTML should return undefined when fontSize is missing"
  );
  passedTests++;

  console.log("✓ parseHTML tests passed\n");

  // ============================================================================
  // Render HTML Tests
  // ============================================================================
  console.log("Testing renderHTML...");

  const renderHTML = fontSizeAttr.attributes.fontSize.renderHTML;

  assert(
    typeof renderHTML === "function",
    "renderHTML should be a function"
  );
  passedTests++;

  const rendered1 = renderHTML({ fontSize: "16px" });

  assert(
    rendered1.style !== undefined,
    "renderHTML should return style property when fontSize is set"
  );
  passedTests++;

  assertEqual(
    rendered1.style,
    "font-size: 16px",
    "renderHTML should format style correctly"
  );
  passedTests++;

  const rendered2 = renderHTML({ fontSize: null });

  assertEqual(
    Object.keys(rendered2).length,
    0,
    "renderHTML should return empty object when fontSize is null"
  );
  passedTests++;

  const rendered3 = renderHTML({});

  assertEqual(
    Object.keys(rendered3).length,
    0,
    "renderHTML should return empty object when fontSize is undefined"
  );
  passedTests++;

  console.log("✓ renderHTML tests passed\n");

  // ============================================================================
  // Commands Tests
  // ============================================================================
  console.log("Testing Commands...");

  const commands = FontSize.config.addCommands();

  assert(
    commands !== undefined,
    "addCommands should return commands object"
  );
  passedTests++;

  assert(
    typeof commands.setFontSize === "function",
    "Commands should include setFontSize"
  );
  passedTests++;

  assert(
    typeof commands.unsetFontSize === "function",
    "Commands should include unsetFontSize"
  );
  passedTests++;

  // Test that setFontSize returns a function
  const setFontSizeCmd = commands.setFontSize("16px");
  assert(
    typeof setFontSizeCmd === "function",
    "setFontSize should return a command function"
  );
  passedTests++;

  // Test that unsetFontSize returns a function
  const unsetFontSizeCmd = commands.unsetFontSize();
  assert(
    typeof unsetFontSizeCmd === "function",
    "unsetFontSize should return a command function"
  );
  passedTests++;

  console.log("✓ Commands tests passed\n");

  // ============================================================================
  // Summary
  // ============================================================================
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
