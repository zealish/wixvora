import { cache } from "react";
import { revalidatePath } from "next/cache";
import { getSettingsRow, updateSeoSettingsRow } from "./queries";
import { seoSettingsSchema, type SeoSettings } from "./validation";

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  googleAnalytics: { enabled: false, measurementId: null },
  searchConsole: { siteUrl: null, verificationToken: null },
};

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  const row = await getSettingsRow();
  if (!row?.seoSettings) return DEFAULT_SEO_SETTINGS;

  try {
    return seoSettingsSchema.parse(row.seoSettings);
  } catch {
    return DEFAULT_SEO_SETTINGS;
  }
});

export async function updateSeoSettings(data: SeoSettings): Promise<void> {
  const validated = seoSettingsSchema.parse(data);
  await updateSeoSettingsRow(validated as unknown as Record<string, unknown>);
  revalidatePath("/staff/settings");
}
