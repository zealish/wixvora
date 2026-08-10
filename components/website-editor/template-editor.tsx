"use client";

import { useCallback } from "react";
import WebsiteEditor from ".";
import { updateTemplateSectionsAction } from "@/features/templates/actions";
import type { Page, Section, PageSettings } from "./lib/block-types";

interface TemplateEditorWrapperProps {
  templateId: string;
  templateName: string;
  initialSections: Section[];
  initialPageSettings: PageSettings;
}

export default function TemplateEditorWrapper({
  templateId,
  templateName,
  initialSections,
  initialPageSettings,
}: TemplateEditorWrapperProps) {
  const handleSave = useCallback(
    async (pages: Page[], pageSettings: PageSettings) => {
      const result = await updateTemplateSectionsAction(templateId, {
        sections: pages.flatMap(p => p.sections),
        pageSettings,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [templateId]
  );

  return (
    <WebsiteEditor
      initialSections={initialSections}
      initialPageSettings={initialPageSettings}
      onSave={handleSave}
      backUrl="/staff/templates"
      title={`Edit Template: ${templateName}`}
    />
  );
}
