import { getTemplateById } from "@/features/templates/queries";
import { getWebsiteById } from "@/features/websites/queries";
import {
  generateMultiPageHTML,
  generateFullHTML,
} from "@/components/website-editor/lib/html-generator";
import { LivePreviewRenderer } from "@/components/preview/live-preview-renderer";
import { Preview404 } from "@/components/preview/preview-404";
import type { Page } from "@/components/website-editor/lib/block-types";

export const metadata = {
  title: "Preview",
};

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const { page: pageSlug } = await searchParams;

  // Auto-detect: try template first, then website
  let template = null;
  let website = null;
  
  try {
    template = await getTemplateById(id);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to fetch template:', error);
    }
  }
  
  if (!template) {
    try {
      website = await getWebsiteById(id);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to fetch website:', error);
      }
    }
  }

  if (!template && !website) {
    return <Preview404 />;
  }

  // Extract pages and settings
  let pages: Page[] = [];
  let pageSettings = { title: "", bgColor: "#ffffff", fontFamily: "font-sans" };

  if (template) {
    pages = (template.pages as Page[]) || [];
    pageSettings = template.pageSettings || pageSettings;
  } else if (website) {
    pages = (website.pages as Page[]) || [];
    pageSettings = website.pageSettings || pageSettings;
  }

  // Fallback: if pages is empty, create single page from legacy sections
  if (pages.length === 0) {
    const sections = template?.sections || website?.sections || [];
    pages = [
      {
        id: "home",
        title: "Home",
        slug: "/",
        sections: sections,
        pageSettings: pageSettings,
        isHomePage: true,
        sortOrder: 0,
      },
    ];
  }

  // Find target page
  let targetPage: Page | undefined;
  if (pageSlug) {
    targetPage = pages.find((p) => p.slug === pageSlug);
    if (!targetPage) {
      // Fallback to home page
      targetPage = pages.find((p) => p.isHomePage) || pages[0];
    }
  } else {
    targetPage = pages.find((p) => p.isHomePage) || pages[0];
  }

  // Generate HTML
  const hasMultiplePages = pages.length > 1;
  let html: string;

  if (hasMultiplePages && !pageSlug) {
    // Render all pages with navigation
    html = generateMultiPageHTML(pages, undefined);
  } else {
    // Render single page
    const pageSections = targetPage?.sections || [];
    html = generateFullHTML(
      Array.isArray(pageSections) ? pageSections : []
    );
  }

  const name = template?.name || website?.name || "Preview";
  const source = template ? "template" : "website";

  return (
    <LivePreviewRenderer
      html={html}
      name={name}
      pages={pages}
      source={source}
    />
  );
}
