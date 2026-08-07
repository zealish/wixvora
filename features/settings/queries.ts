import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSettingsRow() {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);

  return result[0] ?? null;
}

export async function updateSeoSettingsRow(
  seoSettings: Record<string, unknown>
) {
  await db
    .update(settings)
    .set({
      seoSettings,
      updatedAt: new Date(),
    })
    .where(eq(settings.id, 1));
}
