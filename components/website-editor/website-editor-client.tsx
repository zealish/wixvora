"use client";

import { useCallback } from "react";
import WebsiteEditor from ".";
import { updateWebsiteSectionsAction } from "@/features/websites/actions";
import type { Page, PageSettings } from "./lib/block-types";

interface WebsiteEditorWrapperProps {
  websiteId: string;
  initialPages: Page[];
}

export default function WebsiteEditorWrapper({
  websiteId,
  initialPages,
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
      initialPages={initialPages}
      onSave={handleSave}
    />
  );
}
