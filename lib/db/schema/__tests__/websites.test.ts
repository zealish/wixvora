/**
 * Websites Schema Validation Tests
 * Run with: pnpm tsx lib/db/schema/__tests__/websites.test.ts
 */

import { websites, websiteStatusEnum } from "../websites";
import type { InferSelectModel } from "drizzle-orm";

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

let passedTests = 0;
const failedTests = 0;

console.log("Running Websites Schema Tests...\n");

try {
  // ============================================================================
  // Table Definition Tests
  // ============================================================================
  console.log("Testing Table Definition...");
  
  assert(
    websites.id.primary === true,
    "id column should be primary key"
  );
  passedTests++;
  
  assert(
    websites.id.columnType !== undefined,
    "id column should have a column type"
  );
  passedTests++;
  
  console.log("✓ Table definition tests passed\n");

  // ============================================================================
  // Column Existence Tests
  // ============================================================================
  console.log("Testing Column Existence...");
  
  const requiredColumns = [
    "name", "slug", "description", "ownerId", "templateId", 
    "status", "isPublished", "publishedAt", "mainDomain", "subdomain",
    "customDomain", "customDomainVerified", "sslEnabled", "analyticsId", 
    "analyticsEnabled", "sections", "pageSettings",
    "seoTitle", "seoDescription", "seoKeywords", "seoImage", 
    "seoCanonicalUrl", "themeSettings", "layoutSettings",
    "createdAt", "updatedAt", "deletedAt"
  ];
  
  for (const col of requiredColumns) {
    const column = (websites as any)[col];
    assert(column !== undefined, `${col} column should exist`);
    passedTests++;
  }
  console.log(`✓ All ${requiredColumns.length} columns exist\n`);

  // ============================================================================
  // Type & Constraint Tests
  // ============================================================================
  console.log("Testing Column Constraints...");
  
  assert(
    websites.name.notNull === true,
    "name should be notNull"
  );
  passedTests++;
  
  assert(
    websites.slug.notNull === true,
    "slug should be notNull"
  );
  passedTests++;
  
  assert(
    websites.ownerId.notNull === true,
    "ownerId should be notNull"
  );
  passedTests++;
  
  assert(
    websites.status.notNull === true,
    "status should be notNull"
  );
  passedTests++;
  
  assertEqual(
    websites.status.default,
    "draft",
    "status default should be draft"
  );
  passedTests++;
  
  assert(
    websites.isPublished.notNull === true,
    "isPublished should be notNull"
  );
  passedTests++;
  
  assertEqual(
    websites.isPublished.default,
    false,
    "isPublished default should be false"
  );
  passedTests++;
  
  assert(
    websites.customDomainVerified.notNull === true,
    "customDomainVerified should be notNull"
  );
  passedTests++;
  
  assertEqual(
    websites.customDomainVerified.default,
    false,
    "customDomainVerified default should be false"
  );
  passedTests++;
  
  assert(
    websites.sslEnabled.notNull === true,
    "sslEnabled should be notNull"
  );
  passedTests++;
  
  assertEqual(
    websites.sslEnabled.default,
    false,
    "sslEnabled default should be false"
  );
  passedTests++;
  
  assert(
    websites.analyticsEnabled.notNull === true,
    "analyticsEnabled should be notNull"
  );
  passedTests++;
  
  assertEqual(
    websites.analyticsEnabled.default,
    false,
    "analyticsEnabled default should be false"
  );
  passedTests++;
  
  assert(
    websites.createdAt.notNull === true,
    "createdAt should be notNull"
  );
  passedTests++;
  
  assert(
    websites.updatedAt.notNull === true,
    "updatedAt should be notNull"
  );
  passedTests++;
  
  console.log("✓ Column constraint tests passed\n");

  // ============================================================================
  // Default Value Tests
  // ============================================================================
  console.log("Testing Default Values...");
  
  assertEqual(
    websites.status.default,
    "draft",
    "status default"
  );
  passedTests++;
  
  assertEqual(
    websites.isPublished.default,
    false,
    "isPublished default"
  );
  passedTests++;
  
  assertEqual(
    websites.customDomainVerified.default,
    false,
    "customDomainVerified default"
  );
  passedTests++;
  
  assertEqual(
    websites.sslEnabled.default,
    false,
    "sslEnabled default"
  );
  passedTests++;
  
  assertEqual(
    websites.analyticsEnabled.default,
    false,
    "analyticsEnabled default"
  );
  passedTests++;
  
  console.log("✓ Default value tests passed\n");

  // ============================================================================
  // Enum Tests
  // ============================================================================
  console.log("Testing Enum Configuration...");
  
  assert(
    websiteStatusEnum.enumValues.includes("draft"),
    "website_status enum should include 'draft'"
  );
  passedTests++;
  
  assert(
    websiteStatusEnum.enumValues.includes("published"),
    "website_status enum should include 'published'"
  );
  passedTests++;
  
  assert(
    websiteStatusEnum.enumValues.includes("archived"),
    "website_status enum should include 'archived'"
  );
  passedTests++;
  
  console.log("✓ Enum tests passed\n");

  // ============================================================================
  // Type Inference Tests
  // ============================================================================
  console.log("Testing Type Inference...");
  
  // Create a mock website data object matching the inferred type
  const websiteData: Partial<InferSelectModel<typeof websites>> = {
    name: "Test Site",
    slug: "test-site",
    ownerId: "123e4567-e89b-12d3-a456-426614174000",
  };
  
  assertEqual(
    websiteData.name,
    "Test Site",
    "Website name should be settable"
  );
  passedTests++;
  
  console.log("✓ Type inference tests passed\n");

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("\n" + "=".repeat(50));
  console.log("Test Summary");
  console.log("=".repeat(50));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📊 Total: ${passedTests + failedTests}`);
  console.log("=".repeat(50));
  
  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  }
} catch (error) {
  console.error("\n❌ Test failed:", error);
  process.exit(1);
}
