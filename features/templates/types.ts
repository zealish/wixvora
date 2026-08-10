import type { Section, PageSettings } from "@/components/website-editor/lib/block-types";

export type TemplateStatus = "draft" | "published";

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  categoryId: string | null;
  sections: Section[];
  pageSettings: PageSettings;
  htmlSnapshot: string;
  isFeatured: boolean;
  sortOrder: number;
  status: TemplateStatus;
  usageCount: number;
  lastUsedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  previewImageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryParentName: string | null;
  isFeatured: boolean;
  sortOrder: number;
  status: TemplateStatus;
  usageCount: number;
  lastUsedAt: Date | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateActionResult =
  { success: true; data?: { id: string } } | { success: false; error: string };
