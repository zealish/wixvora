import type { SeoSettings } from "./validation";

export interface SettingsRecord {
  id: number;
  seoSettings: SeoSettings | null;
  generalSettings: Record<string, unknown> | null;
  emailSettings: Record<string, unknown> | null;
  integrationsSettings: Record<string, unknown> | null;
  securitySettings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsActionResult =
  | { success: true }
  | { success: false; error: string };
