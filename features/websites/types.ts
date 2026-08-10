import type { Section, PageSettings, Page } from "@/components/website-editor/lib/block-types";

export type WebsiteStatus = "draft" | "published" | "archived";

export interface Website {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  templateId: string | null;
  status: WebsiteStatus;
  isPublished: boolean;
  publishedAt: Date | null;
  sections: Section[]; // Legacy format (homepage only) for backwards compatibility
  pageSettings: PageSettings; // Legacy format (homepage settings)
  pages?: Page[]; // NEW: Full multi-page array structure
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  templateId: string | null;
  status: WebsiteStatus;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WebsiteActionResult =
  | { success: true; data?: { id: string } }
  | { success: false; error: string };
