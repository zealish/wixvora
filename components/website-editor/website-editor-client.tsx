"use client";

import { useCallback } from "react";
import WebsiteEditor from ".";
import { updateWebsiteSectionsAction } from "@/features/websites/actions";
import type { Page, Section, PageSettings } from "./lib/block-types";

interface WebsiteEditorWrapperProps {
  websiteId: string;
  initialSections: Section[];
  initialPageSettings: PageSettings;
}

export default function WebsiteEditorWrapper({
  websiteId,
  initialSections,
  initialPageSettings,
}: WebsiteEditorWrapperProps) {
  const handleSave = useCallback(
    async (pages: Page[], pageSettings: PageSettings) => {
      const result = await updateWebsiteSectionsAction(websiteId, {
        sections: pages.flatMap(p => p.sections),
        pageSettings,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [websiteId]
  );

  return (
    <WebsiteEditor
      initialSections={initialSections}
      initialPageSettings={initialPageSettings}
      onSave={handleSave}
    />
  );
}
