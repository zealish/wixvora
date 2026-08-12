import type { Section, Page, PageSettings } from "@/components/website-editor/lib/block-types";

/**
 * Migrates legacy sections/pageSettings format to new pages format
 * Used when loading existing templates/websites that were created before multipage support
 */
export function migrateLegacyToPages(
  sections: Section[] = [],
  pageSettings?: PageSettings,
  templateName?: string
): Page[] {
  // If we already have pages, return them as-is
  if (sections.length === 0 || !Array.isArray(sections)) {
    return [];
  }

  // Create a default home page from legacy sections
  const defaultPage: Page = {
    id: 'home',
    title: templateName || "Home",
    slug: '/',
    sections: sections.map((sec: Section) => ({
      ...sec,
      elements: sec.elements || []
    })),
    pageSettings: pageSettings || {
      title: templateName || "My Website",
      bgColor: '#ffffff',
      fontFamily: 'font-sans'
    },
    isHomePage: true,
    sortOrder: 0
  };

  return [defaultPage];
}

/**
 * Checks if data is in legacy format (sections instead of pages)
 */
export function isLegacyFormat(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  // Legacy format has sections but no pages
  if ('pages' in obj && Array.isArray(obj.pages) && obj.pages.length > 0) {
    return false; // Already using new format
  }

  if ('sections' in obj && Array.isArray(obj.sections)) {
    return true; // Using legacy format
  }

  return false;
}

/**
 * Converts legacy format to pages format
 */
export function convertLegacyToPages(data: Record<string, unknown>): Record<string, unknown> {
  if (!isLegacyFormat(data)) {
    return data;
  }

  const { sections, pageSettings, name } = data;

  return {
    ...data,
    pages: migrateLegacyToPages(sections as Section[], pageSettings as PageSettings, name as string),
    sections: undefined // Clear legacy sections field
  };
}
