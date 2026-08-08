import "dotenv/config";
import { db } from "@/lib/db";
import { businessCategories } from "@/lib/db/schema";
import fs from "fs";

interface CategoryCSVRow {
  categoryName: string;
  parentSlug: string;
  name: string;
  slug: string;
}

async function seedBusinessCategories() {
  console.log("🌱 Seeding business categories...");

  // Step 1: Clear existing data
  console.log("🗑️  Clearing existing business categories...");
  await db.delete(businessCategories);

  // Step 2: Read CSV file
  const csvPath = "/home/zealish/Downloads/business_sub_categories.csv";
  console.log(`📖 Reading CSV from ${csvPath}...`);
  
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.trim().split("\n");
  
  const rows: CategoryCSVRow[] = lines.slice(1).map((line) => {
    const values = line.split(",");
    return {
      categoryName: values[0]!,
      parentSlug: values[1]!,
      name: values[2]!,
      slug: values[3]!,
    };
  });

  console.log(`📊 Found ${rows.length} rows in CSV`);

  // Step 3: Group by parent categories
  const parentCategories = new Map<string, { name: string; slug: string }>();
  
  rows.forEach((row) => {
    if (!parentCategories.has(row.parentSlug)) {
      parentCategories.set(row.parentSlug, {
        name: row.categoryName,
        slug: row.parentSlug,
      });
    }
  });

  console.log(`👨‍👩‍👧‍👦 Found ${parentCategories.size} parent categories`);

  // Step 4: Insert parent categories first
  console.log("📝 Inserting parent categories...");
  const parentIdMap = new Map<string, string>();
  let displayOrder = 1;

  for (const [slug, { name }] of parentCategories) {
    const [inserted] = await db
      .insert(businessCategories)
      .values({
        name,
        slug,
        displayOrder,
        status: "active",
        parentId: null,
      })
      .returning({ id: businessCategories.id });

    if (inserted) {
      parentIdMap.set(slug, inserted.id);
    }
    displayOrder++;
  }

  console.log(`✅ Inserted ${parentIdMap.size} parent categories`);

  // Step 5: Insert child categories (subcategories)
  console.log("📝 Inserting subcategories...");
  const childOrderMap = new Map<string, number>();
  const insertedSlugs = new Set(parentIdMap.keys());

  for (const row of rows) {
    const parentId = parentIdMap.get(row.parentSlug);
    
    if (!parentId) {
      console.warn(`⚠️  Parent not found for ${row.slug}, skipping...`);
      continue;
    }

    // Skip if slug already exists (duplicate parent/child slug)
    if (insertedSlugs.has(row.slug)) {
      console.warn(`⚠️  Duplicate slug detected: ${row.slug}, skipping...`);
      continue;
    }

    const currentOrder = childOrderMap.get(row.parentSlug) || 1;

    await db.insert(businessCategories).values({
      name: row.name,
      slug: row.slug,
      displayOrder: currentOrder,
      status: "active",
      parentId,
    });

    insertedSlugs.add(row.slug);
    childOrderMap.set(row.parentSlug, currentOrder + 1);
  }

  console.log(`✅ Inserted ${rows.length} subcategories`);

  // Step 6: Verify data
  const totalCategories = await db.select().from(businessCategories);
  console.log(`\n📊 Summary:`);
  console.log(`   Total categories: ${totalCategories.length}`);
  console.log(`   Parent categories: ${parentIdMap.size}`);
  console.log(`   Subcategories: ${rows.length}`);

  console.log("\n✅ Business categories seeded successfully!");
}

seedBusinessCategories()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
